import sys
import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Union

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
        products = await get_products()
        return products
    except Exception as e:
        logger.error(f"Error in get_all_products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
    """Endpoint para obter as categorias do arquivo CATEGORIA.json"""
    try:
        categories_path = os.path.join(os.path.dirname(__file__), 'CATEGORIA.json')
        
        if not os.path.exists(categories_path):
            raise HTTPException(status_code=404, detail='Arquivo de categorias não encontrado.')
            
        with open(categories_path, 'r', encoding='utf-8') as f:
            categories = json.load(f)
            
        return categories
    
    except Exception as e:
        logger.error(f"Erro ao carregar categorias: {str(e)}")
        raise HTTPException(status_code=500, detail=f'Erro ao carregar categorias: {str(e)}')

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
    """Endpoint para verificar se a API está funcionando"""
    return {
        "status": "ok", 
        "timestamp": datetime.now().isoformat(),
        "environment": os.environ.get('VERCEL_ENV', 'development')
    }

# Define routes to maintain compatibility with existing shopee_affiliate_auth.py routes
@app.get('/{endpoint:path}')
async def forward_to_shopee_auth(endpoint: str, request: Request):
    """
    Forward requests to shopee_affiliate_auth.py endpoints
    This provides backward compatibility with existing endpoints
    """
    from backend.shopee_affiliate_auth import app as shopee_app
    
    # Only forward known endpoints from shopee_affiliate_auth
    allowed_endpoints = [
        "db/products", "db/offers", "cached/products", "categories", 
        "test-offers", "offers", "product", "db/products-with-category-issues"
    ]
    
    if endpoint in allowed_endpoints or endpoint.startswith("product/"):
        try:
            # Use the router from the shopee_app
            for route in shopee_app.routes:
                if route.path == f"/{endpoint}":
                    return await route.endpoint(request)
            
            raise HTTPException(status_code=404, detail=f"Endpoint /{endpoint} not found")
        except Exception as e:
            logger.error(f"Error forwarding request to /{endpoint}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=404, detail=f"Endpoint /{endpoint} not found")
