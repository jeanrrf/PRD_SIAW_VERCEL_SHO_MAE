"""
Vercel serverless handler for FastAPI application - Entry point
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app
from backend.fastapi_app import app
from mangum import Mangum
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Assegurar que o diretório do banco de dados existe
db_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', 'data')
os.makedirs(db_dir, exist_ok=True)

# Print current directory and database location for debugging
logger.info(f"Current working directory: {os.getcwd()}")
db_path = os.path.join(db_dir, 'shopee-analytics.db')
logger.info(f"Database path: {db_path}")
logger.info(f"Database exists: {os.path.exists(db_path)}")

# Se o banco de dados não existe, avise no log
if not os.path.exists(db_path):
    logger.warning(f"Database file not found at {db_path}. Database will be created if your application attempts write operations.")

# Create handler for AWS Lambda / Vercel
handler = Mangum(app)

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
