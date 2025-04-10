"""
Database utility module.

This module contains functions for creating and managing database sessions,
saving and updating products, and searching for products with filters and sorting.
"""
import os
import sqlite3
import json
import time
import functools
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine
from ..models import Base, Product
from datetime import datetime
import logging
from .datetime_utils import safe_fromisoformat

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Caminho do banco de dados SQLite
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'shopee-analytics.db')
logger.info(f"SQLite database path: {DB_PATH}")

# Verificar se o diretório existe, se não, criar
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# Database engine configuration (SQLite)
# Add connection pool settings for better performance on Vercel
engine_args = {
    'pool_pre_ping': True,  # Verify connection before use
    'pool_recycle': 3600,   # Recycle connections after 1 hour
    'connect_args': {
        'timeout': 15,      # Connection timeout
        'check_same_thread': False  # Allow usage across threads for serverless functions
    }
}

if os.environ.get('VERCEL_ENV'):
    # Read-only connection for Vercel with URI mode enabled
    engine = create_engine(f'sqlite:///{DB_PATH}?mode=ro&uri=true', **engine_args)
    logger.info(f"Initialized read-only SQLite engine for Vercel at {DB_PATH}")
else:
    engine = create_engine(f'sqlite:///{DB_PATH}', **engine_args)
    logger.info("Initialized standard SQLite engine for development")

# Create a local session to interact with the database
SessionLocal = sessionmaker(bind=engine)

# Retry decorator for database operations
def retry_on_db_error(max_retries=3, delay=0.5):
    """Decorator to retry database operations on failure"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except sqlite3.OperationalError as e:
                    if "database is locked" in str(e) and retries < max_retries - 1:
                        retries += 1
                        logger.warning(f"Database locked, retrying {retries}/{max_retries}...")
                        time.sleep(delay * retries)  # Exponential backoff
                    else:
                        logger.error(f"Database error after {retries} retries: {e}")
                        raise
        return wrapper
    return decorator

@retry_on_db_error()
def get_db() -> Session:
    """
    Gets a database session.
    Returns the session directly instead of using generator pattern
    which is not compatible with Vercel's serverless functions.
    """
    return SessionLocal()

@retry_on_db_error()
def get_db_connection():
    """Cria uma conexão com o banco de dados SQLite"""
    # Na Vercel, usamos o modo somente leitura, já que o filesystem é read-only
    if os.environ.get('VERCEL_ENV'):
        try:
            # URI mode é necessário para conexões somente leitura
            conn = sqlite3.connect(f'file:{DB_PATH}?mode=ro&cache=shared', uri=True)
            conn.execute("PRAGMA busy_timeout = 5000")  # Set timeout to 5s
            conn.row_factory = sqlite3.Row
            return conn
        except Exception as e:
            logger.error(f"Failed to connect to database in Vercel: {str(e)}")
            raise
    else:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("PRAGMA busy_timeout = 5000")
        conn.row_factory = sqlite3.Row
        return conn

async def save_product(product_data, affiliate_data=None):
    """
    Salva ou atualiza um produto no banco de dados.

    Args:
        product_data (dict): Dados do produto da API da Shopee.
        affiliate_data (dict, optional): Dados opcionais do link de afiliado (short_link, sub_ids). Defaults to None.
    """
    # Vercel environment - read-only mode
    if os.environ.get('VERCEL_ENV'):
        logger.warning("Tentativa de salvar produto em ambiente somente leitura (Vercel)")
        return False
        
    db = get_db()

    try:
        # Verificar se o produto já existe
        product_id = str(product_data.get('itemId'))
        if not product_id:
            raise ValueError("Produto não possui itemId")
            
        product = db.query(Product).filter_by(shopee_id=product_id).first()
        
        # Preparar os dados do produto
        new_product_data = {
            'shopee_id': product_id,
            'name': product_data.get('productName', ''),
            'price': float(product_data.get('priceMin', 0)),
            'original_price': float(product_data.get('priceMax', 0)),
            'category_id': int(product_data.get('productCatIds', [0])[0] if product_data.get('productCatIds') else 0),
            'shop_id': int(product_data.get('shopId', 0)),
            'stock': int(product_data.get('stock', 0)),
            'commission_rate': float(product_data.get('commissionRate', 0)),
            'sales': int(product_data.get('sales', 0)),
            'image_url': product_data.get('imageUrl', ''),
            'shop_name': product_data.get('shopName', ''),
            'offer_link': product_data.get('offerLink', ''),
            'rating_star': float(product_data.get('ratingStar', 0)),
            'price_discount_rate': float(product_data.get('priceDiscountRate', 0)),
            'item_status': product_data.get('itemStatus', ''),
            'discount': product_data.get('discount', ''),
            'product_link': product_data.get('productLink', ''),
            'period_start_time': product_data.get('periodStartTime', None),
            'period_end_time': product_data.get('periodEndTime', None),
            'shop_type': product_data.get('shopType', ''),
            'seller_commission_rate': product_data.get('sellerCommissionRate', 0),
            'shopee_commission_rate': product_data.get('shopeeCommissionRate', 0),
            'affiliate_link': product_data.get('affiliateLink', ''),
            'product_metadata': product_data.get('metadata', {})
        }
        
        # Adicionar dados de afiliado se fornecidos
        if affiliate_data:
            new_product_data.update({
                'short_link': affiliate_data.get('short_link', ''),
                'sub_ids': json.dumps(affiliate_data.get('sub_ids', []))
            })
        
        if not product:
            # Criar novo produto
            product = Product(**new_product_data)
            db.add(product)
        else:
            # Atualizar produto existente
            for key, value in new_product_data.items():
                if hasattr(product, key) and value is not None:
                    setattr(product, key, value)
            product.updated_at = datetime.utcnow()
        
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving product: {str(e)}")
        return False
    finally:
        db.close()

async def get_products(filters=None, sort_by='created_at', limit=None):
    """
    Obtém produtos do banco de dados com filtros opcionais
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM products"
        params = []
        
        # Aplicar filtros se existirem
        if filters:
            where_clauses = []
            
            if 'name' in filters:
                where_clauses.append("name LIKE ?")
                params.append(f"%{filters['name']}%")
                
            if where_clauses:
                query += " WHERE " + " AND ".join(where_clauses)
        
        # Ordenação
        query += f" ORDER BY {sort_by}"
        
        # Limite
        if limit:
            query += f" LIMIT {limit}"
            
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        # Converter para lista de dicionários
        products = []
        for row in rows:
            product_dict = {key: row[key] for key in row.keys()}
            products.append(product_dict)
            
        return products
    
    except Exception as e:
        logger.error(f"Erro ao buscar produtos: {e}")
        return []
    finally:
        if 'conn' in locals() and conn:
            conn.close()
