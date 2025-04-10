from sqlalchemy import Column, Integer, String, Float, DateTime, create_engine, JSON, func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base = declarative_base()

class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True)
    shopee_id = Column(String, unique=True, nullable=False)
    name = Column(String)
    price = Column(Float)
    original_price = Column(Float)
    category_id = Column(Integer)
    shop_id = Column(Integer)
    stock = Column(Integer)
    commission_rate = Column(Float)
    sales = Column(Integer)
    image_url = Column(String)
    shop_name = Column(String)
    offer_link = Column(String)
    short_link = Column(String, nullable=True)
    rating_star = Column(Float)
    price_discount_rate = Column(Float)
    sub_ids = Column(String, nullable=True)  # JSON string
    product_link = Column(String)
    period_start_time = Column(DateTime, nullable=True)
    period_end_time = Column(DateTime, nullable=True)
    shop_type = Column(String)
    seller_commission_rate = Column(Float)
    shopee_commission_rate = Column(Float)
    affiliate_link = Column(String)
    product_metadata = Column(JSON)  # Para campos adicionais flexíveis
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    item_status = Column(String)
    discount = Column(String)

# Caminho do banco de dados SQLite
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'shopee-analytics.db')
logger.info(f"Models SQLite database path: {DB_PATH}")

# Criar o engine e as tabelas apenas em desenvolvimento
# Na Vercel, não criamos tabelas, pois o banco de dados é somente leitura
if not os.environ.get('VERCEL_ENV'):
    try:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        engine = create_engine(f'sqlite:///{DB_PATH}', pool_pre_ping=True)
        Base.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
else:
    # In Vercel, just define the engine for reading with URI mode enabled
    engine = create_engine(f'sqlite:///{DB_PATH}?mode=ro&uri=true', 
                          pool_pre_ping=True,
                          connect_args={'check_same_thread': False})
    logger.info(f"Vercel read-only database configured at {DB_PATH}")
    
    # Check if database file exists
    if not os.path.exists(DB_PATH):
        logger.error(f"Database file not found at {DB_PATH}. This will cause failures in production.")
    else:
        logger.info(f"Database file verified at {DB_PATH}")