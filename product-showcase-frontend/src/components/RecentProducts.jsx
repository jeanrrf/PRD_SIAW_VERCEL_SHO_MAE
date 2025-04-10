import React, { useState, useEffect } from 'react';
import { fetchShowcaseProducts } from '../api/connector';
import ProductCard from './ProductCard';

const RecentProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const products = await fetchShowcaseProducts();
                setProducts(products || []);
            } catch (err) {
                console.error('Erro ao carregar produtos recentes:', err);
                setError(err.message || 'Não foi possível carregar os produtos recentes');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    return (
        <section id="recentes" className="py-16 bg-gray-100">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 relative">
                    <span className="inline-block relative">
                        Produtos Recentes
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 transform translate-y-2"></span>
                    </span>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="recent-products">
                    {loading ? (
                        Array(4).fill(0).map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="bg-gray-200 rounded-lg h-52 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        ))
                    ) : error ? (
                        <div className="col-span-full text-center text-red-500 py-12">
                            <p className="text-xl mb-2">Erro ao carregar produtos recentes</p>
                            <p className="text-sm">{error.toString()}</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-12">
                            <p className="text-xl mb-2">Nenhum produto encontrado</p>
                            <p className="text-sm">Tente novamente mais tarde.</p>
                        </div>
                    ) : (
                        products.map((product) => (
                            <ProductCard key={product.shopee_id || product.id} product={product} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default RecentProducts;