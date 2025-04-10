import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { fetchProducts } from '../api/connector';
import ProductCard from '../components/ProductCard';
import Layout from '../components/Layout';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        sort: '',
        priceRange: '',
        searchTerm: ''
    });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        // Reset page when filters or category changes
        setPage(1);
        setProducts([]);
        loadProducts(1);
    }, [categoryId, filters]);

    const loadProducts = async (pageNum) => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchProducts(categoryId, pageNum, filters);
            
            if (pageNum === 1) {
                setProducts(data.products || []);
            } else {
                setProducts(prev => [...prev, ...(data.products || [])]);
            }
            
            setHasMore(data.hasMore);
        } catch (err) {
            console.error('Error loading products:', err);
            setError(err.message || 'Erro ao carregar produtos. Tente novamente mais tarde.');
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadProducts(nextPage);
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4">
                        {location.state?.categoryName || 'Produtos da Categoria'}
                    </h1>
                    
                    {/* Filters Section */}
                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        <div className="flex flex-wrap gap-4">
                            <select 
                                value={filters.sort}
                                onChange={(e) => setFilters({...filters, sort: e.target.value})}
                                className="border rounded p-2"
                            >
                                <option value="">Ordenar por</option>
                                <option value="price_asc">Menor Preço</option>
                                <option value="price_desc">Maior Preço</option>
                                <option value="name_asc">A-Z</option>
                                <option value="name_desc">Z-A</option>
                            </select>

                            <select
                                value={filters.priceRange}
                                onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                                className="border rounded p-2"
                            >
                                <option value="">Faixa de Preço</option>
                                <option value="0-50">Até R$ 50</option>
                                <option value="50-100">R$ 50 - R$ 100</option>
                                <option value="100-200">R$ 100 - R$ 200</option>
                                <option value="200+">Acima de R$ 200</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {/* Loading indicator */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="text-center text-red-500 py-8">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        Nenhum produto encontrado nesta categoria.
                    </div>
                )}

                {/* Load more button */}
                {!loading && !error && hasMore && products.length > 0 && (
                    <div className="text-center py-8">
                        <button
                            onClick={loadMore}
                            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Carregar Mais
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CategoryPage;