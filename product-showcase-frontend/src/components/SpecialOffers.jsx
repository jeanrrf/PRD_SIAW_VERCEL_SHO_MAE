import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchShowcaseProducts, checkDatabaseConnection } from '../api/connector';
import ProductCard from './ProductCard';
import { FaArrowRight } from 'react-icons/fa';

const SpecialOffers = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [visibleProducts, setVisibleProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('default');
    const [showCount, setShowCount] = useState(12);

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to check database connection first
            await checkDatabaseConnection();
            
            // Agora carregamos 100 produtos para ter bastante variedade
            const data = await fetchShowcaseProducts(100);
            setProducts(data);
            setFilteredProducts(data);
        } catch (err) {
            console.error('Error loading products:', err);
            setError(err.message || 'Erro ao carregar produtos');
            
            if (retryCount < 3) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                }, 1000 * Math.pow(2, retryCount));
            }
        } finally {
            setLoading(false);
        }
    }, [retryCount]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Filter and sort products when filter or sort criteria change
    useEffect(() => {
        if (products.length === 0) return;

        let result = [...products];

        // Apply filters
        if (activeFilter === 'discount') {
            result = result.filter(product => (product.discount_percent || 0) > 0);
        } else if (activeFilter === 'rating') {
            result = result.filter(product => (product.rating_star || 0) >= 4);
        } else if (activeFilter === 'trending') {
            result = result.filter(product => (product.sales || 0) > 100);
        }

        // Apply sorting
        if (sortOrder === 'price-asc') {
            result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortOrder === 'price-desc') {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortOrder === 'discount') {
            result.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
        }

        setFilteredProducts(result);
        setShowCount(12); // Reset ao trocar filtros
    }, [products, activeFilter, sortOrder]);

    // Controlar quantos produtos mostrar
    useEffect(() => {
        setVisibleProducts(filteredProducts.slice(0, showCount));
    }, [filteredProducts, showCount]);

    // Mostrar mais produtos
    const handleShowMore = () => {
        setShowCount(prev => prev + 12);
    };

    // Ir para todos os produtos
    const handleViewAll = () => {
        navigate('/category/all');
    };

    // Add fallback content when database is unavailable
    if (error && error.includes('banco de dados')) {
        return (
            <div className="text-center p-4">
                <p className="text-gray-600">
                    Sistema temporariamente indisponível. 
                    Tente novamente mais tarde.
                </p>
                {retryCount < 3 && (
                    <button
                        onClick={() => setRetryCount(prev => prev + 1)}
                        className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                    >
                        Tentar novamente
                    </button>
                )}
            </div>
        );
    }

    const filterButtons = [
        { id: 'all', label: 'Todos' },
        { id: 'discount', label: 'Em Promoção' },
        { id: 'rating', label: 'Mais Bem Avaliados' },
        { id: 'trending', label: 'Mais Vendidos' }
    ];

    const sortOptions = [
        { value: 'default', label: 'Destaque' },
        { value: 'price-asc', label: 'Menor Preço' },
        { value: 'price-desc', label: 'Maior Preço' },
        { value: 'discount', label: 'Maior Desconto' }
    ];

    return (
        <section id="ofertas" className="py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold mb-4 md:mb-0 relative">
                        <span className="relative">
                            Ofertas Especiais
                            <span className="absolute -bottom-2 left-0 w-2/3 h-1 bg-red-500"></span>
                        </span>
                    </h2>
                    
                    <button 
                        onClick={handleViewAll}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors flex items-center"
                    >
                        Ver Todas as Ofertas
                    </button>
                </div>
                
                {/* Filtros e ordenação */}
                <div className="bg-white shadow-sm rounded-xl p-4 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                            {filterButtons.map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={`px-4 py-2 rounded-full transition-colors ${
                                        activeFilter === filter.id
                                            ? 'bg-red-600 text-white shadow-md'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="sort-order" className="mr-2 text-gray-700">Ordenar por:</label>
                            <select
                                id="sort-order"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* Grade de produtos */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6" id="special-offers">
                    {loading ? (
                        // Esqueleto de carregamento
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
                        <div className="col-span-full text-center text-red-500 py-12">
                            <p className="text-xl mb-2">Erro ao carregar produtos</p>
                            <p className="text-sm">{error.toString()}</p>
                            <button 
                                onClick={() => setRetryCount(prev => prev + 1)}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-12">
                            <p className="text-xl mb-2">Nenhum produto encontrado</p>
                            <p className="text-sm">Tente ajustar os filtros ou verificar a conexão com o banco de dados.</p>
                            <button 
                                onClick={() => setActiveFilter('all')}
                                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                            >
                                Remover filtros
                            </button>
                        </div>
                    ) : (
                        // Renderizar produtos usando o componente ProductCard com animação
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
                {!loading && !error && filteredProducts.length > 0 && (
                    <div className="mt-10 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
                        {showCount < filteredProducts.length && (
                            <button
                                onClick={handleShowMore}
                                className="px-6 py-2.5 bg-white border border-red-600 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            >
                                Mostrar Mais Produtos
                            </button>
                        )}
                        
                        <button
                            onClick={handleViewAll}
                            className="inline-flex items-center px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-full transition-colors"
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

export default SpecialOffers;