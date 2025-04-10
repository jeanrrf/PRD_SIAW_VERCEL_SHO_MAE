import sys
import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Union
import traceback  # Add this import

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Request, Response, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from backend.shopee_affiliate_auth import graphql_query, GraphQLRequest
from backend.utils.database import save_product, get_products, get_db_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SENTINNELL Analytics API", 
              description="API for Shopee product analytics and affiliate management")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache para armazenar resultados temporariamente
cache = {
    "products": None,
    "last_fetch": 0
}

class ProductFilterParams(BaseModel):
    page: int = 1
    limit: int = 10
    sortType: int = 2
    keyword: str = ""

class CategoryUpdateItem(BaseModel):
    itemId: str
    categoryId: str
    categoryName: str

class CategoryUpdateRequest(BaseModel):
    products: List[CategoryUpdateItem]

class SearchRequest(BaseModel):
    keyword: str
    sortType: int = 2
    limit: int = 20
    minPrice: Optional[float] = None
    maxPrice: Optional[float] = None
    minCommission: Optional[float] = None
    includeRecommendations: bool = False

def identify_hot_products(products, min_sales=50, recent_weight=0.6, commission_weight=0.2, price_value_weight=0.2):
    """
    Identifica produtos em alta com base em um algoritmo de pontuação.
    
    O algoritmo considera:
    1. Volume de vendas recentes
    2. Taxa de comissão (maior é melhor)
    3. Relação preço/valor (desconto e avaliações)
    """
    if not products:
        return []
    
    scored_products = []
    
    # Encontrar valores máximos para normalização
    max_sales = max((int(p.get('sales', 0)) for p in products), default=1) or 1
    max_commission = max((float(p.get('commissionRate', 0)) for p in products), default=0.01) or 0.01
    max_discount = max((float(p.get('priceDiscountRate', 0)) for p in products), default=1) or 1
    max_rating = max((float(p.get('ratingStar', 0)) for p in products), default=5) or 5
    
    for product in products:
        # Filtrar produtos com poucas vendas
        sales = int(product.get('sales', 0))
        if sales < min_sales:
            continue
            
        # 1. Fator de vendas recentes (normalizado)
        sales_score = sales / max_sales
        
        # 2. Fator de comissão (normalizado)
        commission = float(product.get('commissionRate', 0))
        commission_score = commission / max_commission
        
        # 3. Fator de preço/valor
        discount = float(product.get('priceDiscountRate', 0))
        rating = float(product.get('ratingStar', 0))
        
        # Normalizar desconto e avaliação
        discount_norm = discount / max_discount
        rating_norm = rating / max_rating
        
        # Combinar desconto e avaliação para o fator preço/valor
        price_value_score = (discount_norm * 0.7) + (rating_norm * 0.3)
        
        # Calcular pontuação final com os pesos
        total_score = (
            (sales_score * recent_weight) + 
            (commission_score * commission_weight) + 
            (price_value_score * price_value_weight)
        )
        
        # Adicionar produto com sua pontuação
        product['hotScore'] = round(total_score * 100, 2)  # Converter para percentual de 0-100
        scored_products.append(product)
    
    # Ordenar produtos por pontuação (do maior para o menor)
    hot_products = sorted(scored_products, key=lambda p: p.get('hotScore', 0), reverse=True)
    
    return hot_products

@app.get('/api/products')
async def get_all_products():
    """Get all products from the database"""
    try:
        logger.info("Fetching products for showcase from database")
        
        import sqlite3
        import os
        from datetime import datetime
        
        # Check if database file exists
        db_path = 'shopee-analytics.db'
        if not os.path.exists(db_path):
            logger.error(f"Database file does not exist at: {os.path.abspath(db_path)}")
            return {"products": [], "error": "Database file not found", "db_path": os.path.abspath(db_path)}
        
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get most recent products with valid images
        cursor.execute("""
            SELECT 
                id, shopee_id, name AS product_name, price, original_price,
                image_url, shop_name, shop_id, commission_rate, 
                offer_link, rating_star, price_discount_rate, sales
            FROM products 
            WHERE image_url IS NOT NULL AND image_url != ''
            ORDER BY created_at DESC
            LIMIT 12
        """)
        
        products = [dict(row) for row in cursor.fetchall()]
        logger.info(f"Retrieved {len(products)} products from database")
        
        # Calculate additional fields for each product
        for product in products:
            # Calculate discount percentage
            if product.get('original_price') and product.get('price'):
                discount = round(100 - (product['price'] / product['original_price'] * 100))
                product['discount_percent'] = discount if discount > 0 else 0
            else:
                product['discount_percent'] = 0
                
            # Format price
            if 'price' in product:
                product['formatted_price'] = f"R$ {product['price']:.2f}".replace('.', ',')
                
            # Convert commission to percentage
            if 'commission_rate' in product:
                product['commission_percent'] = round(product['commission_rate'] * 100, 1)
                
        conn.close()
        
        # Return response with diagnostic info
        return {
            "products": products,
            "count": len(products),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in get_all_products: {str(e)}", exc_info=True)
        return {
            "products": [], 
            "error": str(e), 
            "traceback": traceback.format_exc()
        }

@app.get('/api/products/search')
async def search_products(
    page: int = Query(1, description="Page number"),
    limit: int = Query(10, description="Results per page"),
    sortType: int = Query(2, description="Sort type: 1=Price, 2=Recent"),
    keyword: str = Query("", description="Search keyword")
):
    """Search products in database with filters"""
    try:
        filters = {}
        if keyword:
            filters['name'] = keyword
        
        sort_by = 'created_at' if sortType == 2 else 'price'
        
        products = await get_products(filters=filters, sort_by=sort_by, limit=limit)
        
        return {
            "products": products,
            "page": page,
            "limit": limit,
            "total": len(products),
            "hasNextPage": False  # Simplified pagination
        }
    except Exception as e:
        logger.error(f"Error in search_products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/update-categories')
async def update_categories(request: CategoryUpdateRequest):
    """Endpoint para atualizar categorias no banco de dados"""
    try:
        if not request.products:
            raise HTTPException(
                status_code=400, 
                detail='Dados inválidos. A requisição deve conter uma lista de produtos.'
            )
        
        # Vercel doesn't support writes in production
        if os.environ.get('VERCEL_ENV'):
            logger.warning("Category update attempted in read-only Vercel environment")
            return {
                'success': False,
                'message': 'Updates not supported in production environment. Please use development environment.'
            }
            
        conn = get_db_connection()
        
        updated_count = 0
        failed_count = 0
        
        for product in request.products:
            try:
                # Verificar se o produto já existe no banco
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT id FROM products WHERE shopee_id = ?", 
                    (product.itemId,)
                )
                
                result = cursor.fetchone()
                
                if result:
                    # Atualizar categoria do produto existente
                    cursor.execute(
                        """
                        UPDATE products 
                        SET category_id = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE shopee_id = ?
                        """,
                        (product.categoryId, product.itemId)
                    )
                    updated_count += 1
                else:
                    # Este produto ainda não existe no banco, então não pode ser atualizado
                    failed_count += 1
                    
                conn.commit()
                
            except Exception as e:
                failed_count += 1
                logger.error(f"Erro ao atualizar categoria do produto {product.itemId}: {str(e)}")
        
        conn.close()        
        return {
            'success': True,
            'message': f'Processamento concluído. {updated_count} produtos atualizados com sucesso. {failed_count} falhas.',
            'updated_count': updated_count,
            'failed_count': failed_count
        }
    
    except Exception as e:
        logger.error(f"Erro ao processar requisição de atualização de categorias: {str(e)}")
        raise HTTPException(status_code=500, detail=f'Erro ao processar requisição: {str(e)}')

@app.get('/api/categories')
async def get_categories():
    """Get all product categories from the database"""
    try:
        conn = sqlite3.connect('shopee-analytics.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # First try to get categories from the categories table if it exists
        try:
            cursor.execute("""
                SELECT id, name, image_url, parent_id
                FROM categories
                ORDER BY name
            """)
            categories = [dict(row) for row in cursor.fetchall()]
            
            if categories:
                return categories
        except sqlite3.OperationalError:
            # Table likely doesn't exist, continue to fallback method
            pass
            
        # Fallback: Extract unique categories from products table
        cursor.execute("""
            SELECT DISTINCT category_id as id, category_name as name
            FROM products
            WHERE category_id IS NOT NULL AND category_name IS NOT NULL
            ORDER BY category_name
        """)
        categories = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        # Add default icon URLs for each category
        for category in categories:
            if not category.get('image_url'):
                category['image_url'] = f"https://via.placeholder.com/64?text={category['name']}"
                
        return categories
    except Exception as e:
        logger.error(f"Error in get_categories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/categories/counts')
async def get_category_counts():
    """Get product counts for each category from the database"""
    try:
        import sqlite3
        import os
        
        # Check if database file exists
        db_path = 'shopee-analytics.db'
        if not os.path.exists(db_path):
            logger.error(f"Database file does not exist at: {os.path.abspath(db_path)}")
            return {"error": "Database file not found"}
        
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Query to count products in each category
        cursor.execute("""
            SELECT category_id, COUNT(*) as product_count
            FROM products
            WHERE category_id IS NOT NULL
            GROUP BY category_id
        """)
        
        # Convert to a dictionary with category_id as key
        counts = {}
        for row in cursor.fetchall():
            category_id = str(row['category_id'])  # Convert to string to match frontend format
            counts[category_id] = row['product_count']
            
        conn.close()
        
        logger.info(f"Retrieved category counts: {counts}")
        return {"counts": counts}
        
    except Exception as e:
        logger.error(f"Error getting category counts: {str(e)}", exc_info=True)
        return {"error": str(e)}

@app.post('/api/search')
async def search_shopee_products(request: SearchRequest):
    """Search products in Shopee Affiliate API with keyword"""
    try:
        if not request.keyword:
            raise HTTPException(status_code=400, detail='Keyword is required')
            
        # Preparar a consulta para a API Shopee usando o GraphQLRequest
        query = GraphQLRequest(
            query="""
            query SearchProducts($keyword: String!, $sortType: Int!, $limit: Int!) {
                productOfferV2(keyword: $keyword, sortType: $sortType, limit: $limit) {
                    nodes {
                        productName
                        itemId
                        commissionRate
                        sales
                        imageUrl
                        shopName
                        offerLink
                        priceMin
                        priceMax
                        ratingStar
                        priceDiscountRate
                        productCatIds
                    }
                    pageInfo {
                        page
                        limit
                        hasNextPage
                    }
                }
            }
            """,
            variables={
                "keyword": request.keyword,
                "sortType": request.sortType,
                "limit": request.limit
            }
        )
        
        # Executar a consulta na API Shopee
        result = await graphql_query(query)
        
        if not result or 'data' not in result:
            raise HTTPException(status_code=500, detail='Failed to fetch data from Shopee API')
            
        # Processar os resultados
        products = []
        if 'data' in result and 'productOfferV2' in result['data']:
            products = result['data']['productOfferV2'].get('nodes', [])
            
            # Aplicar filtros de preço e comissão se especificados
            if request.minPrice is not None or request.maxPrice is not None or request.minCommission is not None:
                filtered_products = []
                for product in products:
                    price = float(product.get('priceMin', 0))
                    commission = float(product.get('commissionRate', 0))
                    
                    price_min_ok = request.minPrice is None or price >= request.minPrice
                    price_max_ok = request.maxPrice is None or price <= request.maxPrice
                    commission_ok = request.minCommission is None or commission >= request.minCommission
                    
                    if price_min_ok and price_max_ok and commission_ok:
                        filtered_products.append(product)
                products = filtered_products
        
        # Verificar quais produtos já existem no banco de dados
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Extrair os item_ids dos produtos retornados pela API
        item_ids = [str(product.get('itemId')) for product in products]
        
        # Verificar quais desses IDs já existem no banco de dados
        existing_ids = []
        if item_ids:
            placeholders = ', '.join(['?' for _ in item_ids])
            cursor.execute(f"SELECT shopee_id FROM products WHERE shopee_id IN ({placeholders})", item_ids)
            existing_ids = [str(row[0]) for row in cursor.fetchall()]
            
            # Marcar produtos que já existem no banco
            for product in products:
                product['existsInDatabase'] = str(product.get('itemId')) in existing_ids
        else:
            # Se não houver produtos, não há nada para verificar
            for product in products:
                product['existsInDatabase'] = False
        
        cursor.close()
        conn.close()
        
        # Buscar recomendações se solicitado
        recommendations = []
        if request.includeRecommendations and products:
            # Usar o primeiro produto para gerar recomendações
            first_product = products[0]
            
            # Query para obter produtos similares
            rec_query = GraphQLRequest(
                query="""
                query SimilarProducts($itemId: Int!) {
                    similarProducts(itemId: $itemId) {
                        products {
                            productName
                            itemId
                            commissionRate
                            sales
                            imageUrl
                            shopName
                            offerLink
                            priceMin
                            priceMax
                            ratingStar
                            priceDiscountRate
                        }
                    }
                }
                """,
                variables={"itemId": int(first_product.get('itemId', 0))}
            )
            
            rec_result = await graphql_query(rec_query)
            
            if rec_result and 'data' in rec_result and 'similarProducts' in rec_result['data']:
                recommendations = rec_result['data']['similarProducts'].get('products', [])
        
        # Identificar produtos em alta
        hot_products = identify_hot_products(products)
        
        return {
            "products": products,
            "recommendations": recommendations,
            "hotProducts": hot_products
        }
    except Exception as e:
        logger.error(f"Error in search_shopee_products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/health')
async def health_check():
    """Check API and database health"""
    try:
        # Check database connection
        conn = sqlite3.connect('shopee-analytics.db')
        cursor = conn.cursor()
        
        # Verify products table
        cursor.execute("SELECT count(*) FROM products")
        count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "status": "healthy",
            "database": {
                "connected": True,
                "products_count": count
            }
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.get('/api/debug/database')
async def debug_database():
    """
    Endpoint for debugging database connections
    """
    try:
        import sqlite3
        import os
        import traceback  # Add this import
        
        result = {
            "status": "checking",
            "database_exists": False,
            "tables": [],
            "product_count": 0,
            "sample_products": []
        }
        
        # Check if database file exists
        db_path = 'shopee-analytics.db'
        result["database_path"] = os.path.abspath(db_path)
        result["database_exists"] = os.path.exists(db_path)
        
        if result["database_exists"]:
            # Connect to database
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Get list of tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            result["tables"] = tables
            
            # Check if products table exists
            if 'products' in tables:
                # Get count of products
                cursor.execute("SELECT COUNT(*) as count FROM products")
                count = cursor.fetchone()[0]
                result["product_count"] = count
                
                # Get sample products
                if count > 0:
                    cursor.execute("SELECT * FROM products LIMIT 3")
                    sample_products = [dict(row) for row in cursor.fetchall()]
                    result["sample_products"] = sample_products
            
            conn.close()
        
        result["status"] = "complete"
        return result
    except Exception as e:
        logger.error(f"Error in debug_database: {str(e)}", exc_info=True)
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@app.get('/api/products/showcase')
async def get_showcase_products():
    """Get featured products for showcase"""
    try:
        # Get absolute path to database
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shopee-analytics.db')
        logger.info(f"Attempting to connect to database at: {db_path}")

        if not os.path.exists(db_path):
            logger.error(f"Database file not found at: {db_path}")
            raise HTTPException(
                status_code=404,
                detail="Database file not found"
            )

        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Verify products table exists
        cursor.execute("""
            SELECT name 
            FROM sqlite_master 
            WHERE type='table' AND name='products'
        """)
        
        if not cursor.fetchone():
            logger.error("Products table does not exist in database")
            raise HTTPException(
                status_code=500,
                detail="Products table not found in database"
            )

        # Get showcase products
        cursor.execute("""
            SELECT 
                id, shopee_id, name, price, original_price,
                category_id, image_url, shop_name,
                commission_rate, offer_link, rating_star,
                price_discount_rate, sales, created_at
            FROM products 
            WHERE image_url IS NOT NULL 
                AND price > 0 
                AND name IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 12
        """)

        products = []
        for row in cursor.fetchall():
            product = dict(row)
            
            # Calculate discount
            if product['original_price'] and product['price']:
                discount = round(100 - (product['price'] / product['original_price'] * 100))
                product['discount_percent'] = max(0, discount)
            else:
                product['discount_percent'] = 0

            # Format price
            product['formatted_price'] = f"R$ {product['price']:.2f}".replace('.', ',')
            
            products.append(product)

        conn.close()

        if not products:
            logger.warning("No products found in database")
            return {
                "products": [],
                "message": "No products available"
            }

        return {
            "products": products,
            "count": len(products)
        }

    except sqlite3.Error as e:
        logger.error(f"Database error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error in get_showcase_products: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# Define routes to maintain compatibility with existing shopee_affiliate_auth.py routes
@app.get('/{endpoint:path}')
async def forward_to_shopee_auth(endpoint: str, request: Request):
    """
    Forward requests to shopee_affiliate_auth.py endpoints
    This provides backward compatibility with existing endpoints
    """
    from backend.shopee_affiliate_auth import app as shopee_app
    
    logger.debug(f"Received request for endpoint: /{endpoint}")
    
    # Handle root path
    if endpoint == "":
        # Serve API documentation/welcome page for root path
        return {
            "message": "SENTINNELL Analytics API",
            "status": "online",
            "documentation": "/docs",
            "available_endpoints": {
                "API endpoints": [
                    "/api/health",
                    "/api/products",
                    "/api/products/search",
                    "/api/categories",
                    "/api/search",
                ],
                "Legacy endpoints": [
                    "/health",
                    "/categories",
                    "/db/products",
                    "/db/offers",
                    "/product/{item_id}",
                ]
            }
        }
    
    # Strip 'api/' prefix if it exists to match internal endpoints
    if endpoint.startswith("api/"):
        endpoint = endpoint[4:]
        logger.debug(f"Stripped 'api/' prefix. New endpoint: /{endpoint}")
    
    # Only forward known endpoints from shopee_affiliate_auth
    allowed_endpoints = [
        "db/products", "db/offers", "cached/products", "categories", 
        "test-offers", "offers", "product", "db/products-with-category-issues",
        "health", "products", "products/search", "products/category"
    ]
    
    # Check if the path or its start matches any allowed endpoint
    matches = [allowed for allowed in allowed_endpoints if endpoint == allowed or endpoint.startswith(f"{allowed}/")]
    
    if matches:
        try:
            # Log the matching endpoint for debugging
            logger.debug(f"Matching endpoint found: {matches[0]}")
            
            # Use the router from the shopee_app by reconstructing the path
            for route in shopee_app.routes:
                # Get the route path pattern from the route
                route_path = route.path
                
                # Check if the incoming request matches this route
                if route_path == f"/{endpoint}" or (
                    route_path.endswith("/{item_id}") and 
                    endpoint.startswith(route_path.split("/{")[0].lstrip("/"))
                ):
                    logger.debug(f"Forwarding to route: {route_path}")
                    return await route.endpoint(request)
            
            # If no matching route is found in the shopee_app
            logger.warning(f"No matching route found for endpoint /{endpoint}")
            raise HTTPException(status_code=404, detail=f"Endpoint /{endpoint} not found in the shopee API")
            
        except Exception as e:
            logger.error(f"Error forwarding request to /{endpoint}: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")
    else:
        logger.warning(f"Endpoint not in allowed list: /{endpoint}")
        raise HTTPException(status_code=404, detail=f"Endpoint /{endpoint} not found or not allowed")

@app.get('/api/forward')
async def forward_to_shopee_auth(request: Request):
    try:
        route = app.routes[0] # Get the first route that matches
        return await route.endpoint(request)
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error forwarding request: {str(e)}")
        # Return a more graceful error response
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error processing request"}
        )
