import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchShowcaseProducts } from '../api/connector';
import ProductCard from './ProductCard';
import { FaClock, FaArrowRight } from 'react-icons/fa';

const RecentProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [visibleProducts, setVisibleProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCount, setShowCount] = useState(10);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                // Carregamos mais produtos para ter maior variedade
                const products = await fetchShowcaseProducts(50);
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

    // Controlar quantos produtos mostrar
    useEffect(() => {
        setVisibleProducts(products.slice(0, showCount));
    }, [products, showCount]);

    // Mostrar mais produtos
    const handleShowMore = () => {
        setShowCount(prev => prev + 10);
    };

    // Ir para todos os produtos
    const handleViewAll = () => {
        navigate('/category/all');
    };

    return (
        <section id="recentes" className="py-16 bg-gradient-to-b from-gray-100 to-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold mb-4 md:mb-0 relative">
                        <span className="relative flex items-center">
                            <FaClock className="mr-2 text-blue-600" /> Produtos Recentes
                            <span className="absolute -bottom-2 left-0 w-2/3 h-1 bg-blue-600"></span>
                        </span>
                    </h2>
                    
                    <button 
                        onClick={handleViewAll}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center"
                    >
                        Ver Todos os Produtos
                    </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6" id="recent-products">
                    {loading ? (
                        Array(10).fill(0).map((_, index) => (
                            <div key={index} className="animate-pulse bg-white rounded-lg shadow overflow-hidden">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))
                    ) : error ? (
                        <div className="col-span-full text-center bg-white p-10 rounded-lg shadow">
                            <p className="text-xl mb-2 text-red-600">Erro ao carregar produtos recentes</p>
                            <p className="text-sm text-gray-600 mb-4">{error.toString()}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full text-center bg-white p-10 rounded-lg shadow">
                            <p className="text-xl mb-2 text-gray-700">Nenhum produto encontrado</p>
                            <p className="text-sm text-gray-500">Tente novamente mais tarde.</p>
                        </div>
                    ) : (
                        // Renderizar produtos com animação
                        visibleProducts.map((product, index) => (
                            <motion.div
                                key={product.shopee_id || product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))
                    )}
                </div>
                
                {/* Botões de ação */}
                {!loading && !error && products.length > 0 && (
                    <div className="mt-10 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
                        {showCount < products.length && (
                            <button
                                onClick={handleShowMore}
                                className="px-6 py-2.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            >
                                Mostrar Mais Produtos
                            </button>
                        )}
                        
                        <button
                            onClick={handleViewAll}
                            className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-colors"
                        >
                            Ver Todos os Produtos
                            <FaArrowRight className="ml-2" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default RecentProducts;