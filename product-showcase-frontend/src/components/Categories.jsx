import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FaLaptop, FaMobile, FaTshirt, FaUserTie, FaHome, 
    FaBaby, FaSprayCan, FaRunning, FaGamepad, FaCar, 
    FaTools, FaHeadphones, FaCamera, FaUtensils, FaBookOpen 
} from 'react-icons/fa';
import { fetchCategoryCounts } from '../api/connector';

// Categorias modernizadas com ícones mais apropriados
const categoriesData = [
    { id: '100001', name: 'Eletrônicos', icon: FaLaptop, color: '#4299e1' },
    { id: '100006', name: 'Celulares', icon: FaMobile, color: '#38b2ac' },
    { id: '100018', name: 'Moda Feminina', icon: FaTshirt, color: '#ed64a6' },
    { id: '100019', name: 'Moda Masculina', icon: FaUserTie, color: '#667eea' },
    { id: '100039', name: 'Casa e Decoração', icon: FaHome, color: '#f6ad55' },
    { id: '100040', name: 'Bebês e Crianças', icon: FaBaby, color: '#fc8181' },
    { id: '100041', name: 'Beleza', icon: FaSprayCan, color: '#f687b3' },
    { id: '100042', name: 'Esporte e Lazer', icon: FaRunning, color: '#68d391' },
    { id: '100048', name: 'Games', icon: FaGamepad, color: '#805ad5' },
    { id: '100049', name: 'Automotivo', icon: FaCar, color: '#e53e3e' },
    { id: '100050', name: 'Ferramentas', icon: FaTools, color: '#718096' },
    { id: '100051', name: 'Áudio', icon: FaHeadphones, color: '#d53f8c' },
    { id: '100052', name: 'Fotografia', icon: FaCamera, color: '#2b6cb0' },
    { id: '100053', name: 'Cozinha', icon: FaUtensils, color: '#dd6b20' },
    { id: '100054', name: 'Livros', icon: FaBookOpen, color: '#9f7aea' },
];

const Categories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategoriesWithCounts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const counts = await fetchCategoryCounts();
            
            // Ordenar categorias por contagem de produtos (mais populares primeiro)
            const categoriesWithCounts = categoriesData
                .map(category => ({
                    ...category,
                    productCount: counts[category.id] || 0
                }))
                .filter(category => category.productCount > 0)
                .sort((a, b) => b.productCount - a.productCount);
            
            setCategories(categoriesWithCounts);
        } catch (err) {
            console.error('Erro ao carregar categorias:', err);
            setError('Não foi possível carregar as categorias. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategoriesWithCounts();
    }, [fetchCategoriesWithCounts]);

    const handleCategoryClick = (categoryId) => {
        navigate(`/category/${categoryId}`);
    };
    
    const handleSeeAllClick = () => {
        navigate('/category/all');
    };

    return (
        <section id="categorias" className="py-16 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold mb-4 md:mb-0 relative">
                        <span className="relative">
                            Navegue por Categorias
                            <span className="absolute -bottom-2 left-0 w-2/3 h-1 bg-blue-500"></span>
                        </span>
                    </h2>
                    
                    <button 
                        onClick={handleSeeAllClick}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center"
                    >
                        Ver Todas as Categorias
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
                        <p>{error}</p>
                        <button 
                            onClick={fetchCategoriesWithCounts}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {loading ? (
                        // Esqueletos de carregamento
                        Array(12).fill(0).map((_, index) => (
                            <div key={index} className="animate-pulse bg-white rounded-lg shadow p-6 flex flex-col items-center">
                                <div className="w-16 h-16 mb-4 rounded-full bg-gray-200"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))
                    ) : (
                        // Cartões de categorias com animação
                        categories.map((category, index) => (
                            <motion.div 
                                key={category.id} 
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                                onClick={() => handleCategoryClick(category.id)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ scale: 1.03 }}
                            >
                                <div className="p-6 flex flex-col items-center text-center">
                                    <div 
                                        className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                                        style={{ backgroundColor: `${category.color}15` }}
                                    >
                                        <category.icon size={32} style={{ color: category.color }} />
                                    </div>
                                    <h3 className="font-semibold mb-1 text-gray-800">{category.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {category.productCount} {category.productCount === 1 ? 'produto' : 'produtos'}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default Categories;