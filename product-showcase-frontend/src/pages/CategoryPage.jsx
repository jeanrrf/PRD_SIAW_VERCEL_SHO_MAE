import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../api/connector';
import ProductCard from '../components/ProductCard';
import Layout from '../components/Layout';
import { FaFilter, FaSort, FaSearch, FaChevronLeft } from 'react-icons/fa';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        sort: '',
        priceRange: '',
        searchTerm: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [productCount, setProductCount] = useState(0);

    // Carregar todas as categorias para navegação
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
                
                // Encontrar nome da categoria atual
                const currentCategory = data.find(cat => cat.id === categoryId);
                if (currentCategory) {
                    setCategoryName(currentCategory.name);
                } else if (categoryId === 'all') {
                    setCategoryName('Todos os Produtos');
                }
            } catch (err) {
                console.error('Erro ao carregar categorias:', err);
            }
        };
        
        loadCategories();
    }, [categoryId]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                // Certifique-se de que o categoryId está sendo passado corretamente
                const data = await fetchProducts(categoryId === 'all' ? null : categoryId, 1, filters);
                setProducts(data.products || []);
                setProductCount(data.total || 0);
            } catch (err) {
                console.error('Error loading products:', err);
                setError(err.message || 'Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [categoryId, filters]); // Certifique-se de que o categoryId está no array de dependências

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // A pesquisa já será aplicada pelo useEffect quando filters mudar
    };

    const handleCategoryChange = (categoryId) => {
        navigate(`/category/${categoryId}`);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const resetFilters = () => {
        setFilters({
            sort: '',
            priceRange: '',
            searchTerm: ''
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header com nome da categoria e botão de voltar */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center mb-2">
                        <button 
                            onClick={() => navigate('/')}
                            className="mr-3 hover:bg-blue-700 p-2 rounded-full transition-colors"
                            aria-label="Back to Home"
                        >
                            <FaChevronLeft />
                        </button>
                        <h1 className="text-3xl font-bold">{categoryName || 'Products'}</h1>
                    </div>
                    <p className="text-blue-100">
                        {productCount} {productCount === 1 ? 'product found' : 'products found'}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Menu de categorias */}
                <div className="mb-8 overflow-x-auto">
                    <div className="flex space-x-2 pb-2 min-w-max">
                        <button
                            onClick={() => handleCategoryChange('all')}
                            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                                categoryId === 'all' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Todos os Produtos
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryChange(category.id)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                                    categoryId === category.id 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Barra de filtros e pesquisa */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center">
                            <button 
                                onClick={toggleFilters}
                                className="p-2 mr-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                            >
                                <FaFilter className="mr-2" /> Filtros
                            </button>
                            
                            {Object.values(filters).some(v => v !== '') && (
                                <button 
                                    onClick={resetFilters}
                                    className="p-2 text-sm text-red-600 hover:text-red-800"
                                >
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                        
                        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
                            <input
                                type="text"
                                value={filters.searchTerm}
                                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                                placeholder="Buscar produtos..."
                                className="w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </form>
                    </div>
                    
                    {/* Painel de filtros expansível */}
                    {showFilters && (
                        <div className="p-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                                    Ordenar por
                                </label>
                                <select 
                                    id="sort"
                                    value={filters.sort}
                                    onChange={(e) => setFilters({...filters, sort: e.target.value})}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Relevância</option>
                                    <option value="price_asc">Menor Preço</option>
                                    <option value="price_desc">Maior Preço</option>
                                    <option value="name_asc">A-Z</option>
                                    <option value="name_desc">Z-A</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                                    Faixa de Preço
                                </label>
                                <select
                                    id="priceRange"
                                    value={filters.priceRange}
                                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todas as faixas</option>
                                    <option value="0-50">Até R$ 50</option>
                                    <option value="50-100">R$ 50 - R$ 100</option>
                                    <option value="100-200">R$ 100 - R$ 200</option>
                                    <option value="200+">Acima de R$ 200</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Conteúdo Principal */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {Array(12).fill(0).map((_, index) => (
                            <div key={index} className="animate-pulse bg-white rounded-lg shadow overflow-hidden">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center p-10 bg-white rounded-lg shadow">
                        <div className="text-red-500 text-xl mb-4">{error}</div>
                        <button
                            onClick={loadProducts}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                ) : products.length > 0 ? (
                    <div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id || product.shopee_id} product={product} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-10 bg-white rounded-lg shadow">
                        <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum produto encontrado</h3>
                        <p className="text-gray-500 mb-4">Tente ajustar seus filtros ou buscar em outra categoria.</p>
                        {Object.values(filters).some(v => v !== '') && (
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Limpar Filtros
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;