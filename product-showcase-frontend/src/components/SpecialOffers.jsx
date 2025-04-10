import React, { useState, useEffect, useCallback } from 'react';
import { fetchShowcaseProducts, checkDatabaseConnection } from '../api/connector';
import ProductCard from './ProductCard';

const SpecialOffers = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('default');

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to check database connection first
            await checkDatabaseConnection();
            
            const data = await fetchShowcaseProducts();
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
    }, [products, activeFilter, sortOrder]);

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
        { id: 'rating', label: 'Mais Bem Avaliados' }
    ];

    const sortOptions = [
        { value: 'default', label: 'Destaque' },
        { value: 'price-asc', label: 'Menor Preço' },
        { value: 'price-desc', label: 'Maior Preço' },
        { value: 'discount', label: 'Maior Desconto' }
    ];

    return (
        <section id="ofertas" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 relative">
                    <span className="inline-block relative">
                        Ofertas Especiais
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-accent transform translate-y-2"></span>
                    </span>
                </h2>
                
                {/* Filtros e ordenação */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                        {filterButtons.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-4 py-2 rounded-full transition-colors ${
                                    activeFilter === filter.id
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
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
                            className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Grade de produtos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="special-offers">
                    {loading ? (
                        // Esqueleto de carregamento
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
                            <p className="text-xl mb-2">Erro ao carregar produtos</p>
                            <p className="text-sm">{error.toString()}</p>
                            <button 
                                onClick={() => setRetryCount(prev => prev + 1)}
                                className="mt-4 px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark transition-colors"
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
                        // Renderizar produtos usando o componente ProductCard
                        filteredProducts.map((product) => (
                            <ProductCard key={product.shopee_id || product.id} product={product} />
                        ))
                    )}
                </div>
                
                {/* Botão "Ver mais" se tivermos mais de 12 produtos */}
                {!loading && !error && filteredProducts.length >= 12 && (
                    <div className="text-center mt-10">
                        <button
                            onClick={() => window.location.href = '/category/all'}
                            className="bg-white text-primary border border-primary px-6 py-2.5 rounded-md hover:bg-primary hover:text-white transition-colors inline-flex items-center"
                        >
                            <span>Ver mais ofertas</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SpecialOffers;