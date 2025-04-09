"""
Database utility module.

This module contains functions for creating and managing database sessions,
saving and updating products, and searching for products with filters and sorting.
"""
import os
import sqlite3
import json
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine
from ..models import Base, Product
from datetime import datetime
import logging
from .datetime_utils import safe_fromisoformat

# Configuração de logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Caminho do banco de dados SQLite
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data', 'products.db')

# Verificar se o diretório existe, se não, criar
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# Database engine configuration (SQLite)
engine = create_engine(f'sqlite:///{DB_PATH}')
# Create a local session to interact with the database
SessionLocal = sessionmaker(bind=engine)

def get_db() -> Session:
    """
    Generator function to get a database session.
    Ensures that the session is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally: 
        db.close()

def get_db_connection():
    """Cria uma conexão com o banco de dados SQLite"""
    # Na Vercel, usamos o modo somente leitura, já que o filesystem é read-only
    if os.environ.get('VERCEL_ENV'):
        conn = sqlite3.connect(DB_PATH, uri=True, check_same_thread=False)
    else:
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

async def save_product(product_data, affiliate_data=None):
    """
    Salva ou atualiza um produto no banco de dados.

    Args:
        product_data (dict): Dados do produto da API da Shopee.
        affiliate_data (dict, optional): Dados opcionais do link de afiliado (short_link, sub_ids). Defaults to None.
    """
    db = next(get_db())

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

def get_products(filters=None, sort_by='created_at', limit=None):
    """
    Obtém produtos do banco de dados com filtros opcionais
    
    Args:
        filters: Dicionário de filtros (ex: {'name': 'termo de busca'})
        sort_by: Campo pelo qual ordenar resultados
        limit: Número máximo de resultados
        
    Returns:
        Lista de produtos
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
        print(f"Erro ao buscar produtos: {e}")
        return []
    finally:
        if conn:
            conn.close()
