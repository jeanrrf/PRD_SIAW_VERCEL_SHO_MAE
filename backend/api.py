import sys
import os

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.shopee_affiliate_auth import graphql_query, GraphQLRequest
from flask import Flask, request, jsonify
import werkzeug
from typing import Optional, Dict, Any, List

# Patch para compatibilidade com Werkzeug
try:
    import werkzeug.urls
    if not hasattr(werkzeug.urls, 'url_quote'):
        if hasattr(werkzeug.urls, 'quote'):
            werkzeug.urls.url_quote = werkzeug.urls.quote
        else:
            from urllib.parse import quote
            werkzeug.urls.url_quote = quote
    print("API: Werkzeug url_quote patched successfully")
except ImportError:
    print("API: Failed to patch werkzeug.urls")

import json
import logging
import math
from datetime import datetime, timedelta
from backend.utils.database import save_product, get_products, get_db_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Cache para armazenar resultados temporariamente
cache = {
    "products": None,
    "last_fetch": 0
}

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

@app.route('/api/products')
def get_all_products():
    """Get all products from the database"""
    try:
        products = get_products()
        return jsonify(products)
    except Exception as e:
        logger.error(f"Error in get_all_products: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/search')
def search_products():
    """Search products in database with filters"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        sortType = request.args.get('sortType', 2, type=int)
        keyword = request.args.get('keyword', '')
        
        filters = {}
        if keyword:
            filters['name'] = keyword
        
        sort_by = 'created_at' if sortType == 2 else 'price'
        
        products = get_products(filters=filters, sort_by=sort_by, limit=limit)
        
        return jsonify({
            "products": products,
            "page": page,
            "limit": limit,
            "total": len(products),
            "hasNextPage": False  # Simplified pagination
        })
    except Exception as e:
        logger.error(f"Error in search_products: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/update-categories', methods=['POST'])
def update_categories():
    """Endpoint para atualizar categorias no banco de dados"""
    try:
        data = request.get_json()
        
        if not data or 'products' not in data:
            return jsonify({'success': False, 'message': 'Dados inválidos. A requisição deve conter uma lista de produtos.'}), 400
            
        products = data['products']
        if not isinstance(products, list):
            return jsonify({'success': False, 'message': 'O campo products deve ser uma lista.'}), 400
            
        db_connector = get_db_connection()
        
        updated_count = 0
        failed_count = 0
        
        for product in products:
            try:
                if 'itemId' not in product or 'categoryId' not in product or 'categoryName' not in product:
                    failed_count += 1
                    continue
                    
                # Verificar se o produto já existe no banco
                cursor = db_connector.cursor()
                cursor.execute(
                    "SELECT id FROM products WHERE item_id = %s", 
                    (product['itemId'],)
                )
                
                result = cursor.fetchone()
                
                if result:
                    # Atualizar categoria do produto existente
                    cursor.execute(
                        """
                        UPDATE products 
                        SET category_id = %s, category_name = %s
                        WHERE item_id = %s
                        """,
                        (product['categoryId'], product['categoryName'], product['itemId'])
                    )
                    updated_count += 1
                else:
                    # Este produto ainda não existe no banco, então não pode ser atualizado
                    failed_count += 1
                    
                db_connector.commit()
                
            except Exception as e:
                failed_count += 1
                logger.error(f"Erro ao atualizar categoria do produto {product.get('itemId')}: {str(e)}")
                
        return jsonify({
            'success': True,
            'message': f'Processamento concluído. {updated_count} produtos atualizados com sucesso. {failed_count} falhas.',
            'updated_count': updated_count,
            'failed_count': failed_count
        })
    
    except Exception as e:
        logger.error(f"Erro ao processar requisição de atualização de categorias: {str(e)}")
        return jsonify({'success': False, 'message': f'Erro ao processar requisição: {str(e)}'}), 500

@app.route('/api/categories')
def get_categories():
    """Endpoint para obter as categorias do arquivo CATEGORIA.json"""
    try:
        categories_path = os.path.join(os.path.dirname(__file__), 'CATEGORIA.json')
        
        if not os.path.exists(categories_path):
            return jsonify({'success': False, 'message': 'Arquivo de categorias não encontrado.'}), 404
            
        with open(categories_path, 'r', encoding='utf-8') as f:
            categories = json.load(f)
            
        return jsonify(categories)
    
    except Exception as e:
        logger.error(f"Erro ao carregar categorias: {str(e)}")
        return jsonify({'success': False, 'message': f'Erro ao carregar categorias: {str(e)}'}), 500

@app.route('/api/search', methods=['POST'])
def search_shopee_products():
    """Search products in Shopee Affiliate API with keyword"""
    try:
        data = request.get_json()
        keyword = data.get('keyword', '')
        sort_type = data.get('sortType', 2)  # Default: Sales
        limit = data.get('limit', 20)
        min_price = data.get('minPrice')
        max_price = data.get('maxPrice')
        min_commission = data.get('minCommission')
        include_recommendations = data.get('includeRecommendations', False)
        
        if not keyword:
            return jsonify({'error': 'Keyword is required'}), 400
            
        # Preparar a consulta para a API Shopee
        query = GraphQLRequest().search_products(
            keyword=keyword, 
            sort_type=sort_type, 
            limit=limit
        )
        
        # Executar a consulta na API Shopee
        result = graphql_query(query)
        
        if not result or 'data' not in result:
            return jsonify({'error': 'Failed to fetch data from Shopee API'}), 500
            
        # Processar os resultados
        products = []
        if 'data' in result and 'searchProducts' in result['data']:
            products = result['data']['searchProducts']['products']
            
            # Aplicar filtros de preço e comissão se especificados
            if min_price is not None or max_price is not None or min_commission is not None:
                filtered_products = []
                for product in products:
                    price = float(product.get('priceMin', 0))
                    commission = float(product.get('commissionRate', 0))
                    
                    price_min_ok = min_price is None or price >= min_price
                    price_max_ok = max_price is None or price <= max_price
                    commission_ok = min_commission is None or commission >= min_commission
                    
                    if price_min_ok and price_max_ok and commission_ok:
                        filtered_products.append(product)
                products = filtered_products
        
        # Verificar quais produtos já existem no banco de dados
        db_connector = get_db_connection()
        cursor = db_connector.cursor()
        
        # Extrair os item_ids dos produtos retornados pela API
        item_ids = [str(product.get('itemId')) for product in products]
        
        # Verificar quais desses IDs já existem no banco de dados
        if item_ids:
            placeholders = ', '.join(['%s'] * len(item_ids))
            query = f"SELECT item_id FROM products WHERE item_id IN ({placeholders})"
            cursor.execute(query, item_ids)
            existing_ids = [str(row[0]) for row in cursor.fetchall()]
            
            # Marcar produtos que já existem no banco
            for product in products:
                product['existsInDatabase'] = str(product.get('itemId')) in existing_ids
        else:
            # Se não houver produtos, não há nada para verificar
            for product in products:
                product['existsInDatabase'] = False
        
        cursor.close()
        
        # Buscar recomendações se solicitado
        recommendations = []
        if include_recommendations and products:
            # Usar o primeiro produto para gerar recomendações
            first_product = products[0]
            rec_query = GraphQLRequest().get_similar_products(first_product.get('itemId'))
            rec_result = graphql_query(rec_query)
            
            if rec_result and 'data' in rec_result and 'similarProducts' in rec_result['data']:
                recommendations = rec_result['data']['similarProducts'].get('products', [])
        
        # Identificar produtos em alta
        hot_products = identify_hot_products(products)
        
        return jsonify({
            "products": products,
            "recommendations": recommendations,
            "hotProducts": hot_products
        })
    except Exception as e:
        logger.error(f"Error in search_shopee_products: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)