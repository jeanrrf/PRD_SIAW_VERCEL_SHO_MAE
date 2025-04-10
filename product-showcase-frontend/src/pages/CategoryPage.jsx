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

    useEffect(() => {
        loadProducts();
    }, [categoryId, filters]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchProducts(categoryId, 1, filters);
            setProducts(data.products || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                    {loading ? (
                        <div className="col-span-full text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        </div>
                    ) : error ? (
                        <div className="col-span-full text-center text-red-500 py-8">
                            {error}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-8">
                            Nenhum produto encontrado nesta categoria.
                        </div>
                    ) : (
                        products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default CategoryPage;