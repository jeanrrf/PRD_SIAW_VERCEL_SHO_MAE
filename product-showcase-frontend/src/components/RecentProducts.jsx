import React, { useState, useEffect } from 'react';
import { fetchShowcaseProducts } from '../api/connector';

const RecentProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchShowcaseProducts();
                // Apenas mostrar os produtos mais recentes (os primeiros 6)
                setProducts(data.slice(0, 6));
            } catch (err) {
                setError(err);
                console.error('Erro ao carregar produtos recentes:', err);
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="recent-products">
                    {loading ? (
                        <>
                            <div className="animate-pulse skeleton-card">
                                <div className="bg-gray-200 rounded-lg h-80 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="animate-pulse skeleton-card">
                                <div className="bg-gray-200 rounded-lg h-80 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="animate-pulse skeleton-card">
                                <div className="bg-gray-200 rounded-lg h-80 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </>
                    ) : error ? (
                        <p className="text-red-500">Erro ao carregar produtos recentes.</p>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                                <img src={product.image} alt={product.name} className="h-40 w-full object-cover mb-4 rounded-lg" />
                                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                                <p className="text-gray-600 mb-2">{product.description}</p>
                                <p className="text-blue-500 font-bold">{product.price}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default RecentProducts;