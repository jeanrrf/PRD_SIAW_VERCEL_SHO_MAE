import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Categories.module.css';
// Import React Icons
import { 
    FaLaptop, FaMobile, FaTshirt, FaUserTie, FaHome, 
    FaBaby, FaSprayCan, FaRunning, FaGamepad, FaCar, FaTools 
} from 'react-icons/fa';
// Import API base URL from connector
import { API_BASE_URL, fetchCategoryCounts } from '../api/connector';

// Updated categories data with icons instead of image URLs
const categoriesData = [
    {
        "id": "100001",
        "name": "Eletrônicos",
        "icon": FaLaptop
    },
    {
        "id": "100006",
        "name": "Celulares e Acessórios",
        "icon": FaMobile
    },
    {
        "id": "100018",
        "name": "Moda Feminina",
        "icon": FaTshirt
    },
    {
        "id": "100019",
        "name": "Moda Masculina",
        "icon": FaUserTie
    },
    {
        "id": "100039",
        "name": "Casa e Decoração",
        "icon": FaHome
    },
    {
        "id": "100040",
        "name": "Bebês e Crianças",
        "icon": FaBaby
    },
    {
        "id": "100041",
        "name": "Beleza e Cuidado Pessoal",
        "icon": FaSprayCan
    },
    {
        "id": "100042",
        "name": "Esporte e Lazer",
        "icon": FaRunning
    },
    {
        "id": "100048",
        "name": "Jogos e Hobbies",
        "icon": FaGamepad
    },
    {
        "id": "100049",
        "name": "Automotivo",
        "icon": FaCar
    },
    {
        "id": "100050",
        "name": "Ferramentas e Construção",
        "icon": FaTools
    }
];

const Categories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const fetchCategoriesWithCounts = useCallback(async () => {
        try {
            const cachedData = localStorage.getItem('categoryCounts');
            const cacheTimestamp = localStorage.getItem('categoryCounts_timestamp');
            
            if (cachedData && cacheTimestamp) {
                const isValid = Date.now() - parseInt(cacheTimestamp) < 5 * 60 * 1000;
                if (isValid) {
                    const categoryCounts = JSON.parse(cachedData);
                    setCategories(categoriesData.map(category => ({
                        ...category,
                        productCount: categoryCounts[category.id] || 0
                    })));
                    setLoading(false);
                    return;
                }
            }

            const counts = await fetchCategoryCounts();
            
            // Update cache
            localStorage.setItem('categoryCounts', JSON.stringify(counts));
            localStorage.setItem('categoryCounts_timestamp', Date.now().toString());
            
            const categoriesWithCounts = categoriesData.map(category => ({
                ...category,
                productCount: counts[category.id] || 0
            }));
            
            setCategories(categoriesWithCounts);
            setError(null);
            
        } catch (err) {
            console.error("Error fetching category counts:", err);
            setError(`Falha ao carregar dados: ${err.message}`);
            
            if (retryCount < 3) {
                const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                }, retryDelay);
            } else {
                // Use cached data as fallback if available
                const cachedData = localStorage.getItem('categoryCounts');
                if (cachedData) {
                    const categoryCounts = JSON.parse(cachedData);
                    setCategories(categoriesData.map(category => ({
                        ...category,
                        productCount: categoryCounts[category.id] || 0
                    })));
                } else {
                    // Ultimate fallback
                    setCategories(categoriesData.map(category => ({
                        ...category,
                        productCount: 0
                    })));
                }
            }
        } finally {
            setLoading(false);
        }
    }, [retryCount]);

    useEffect(() => {
        fetchCategoriesWithCounts();
    }, [fetchCategoriesWithCounts]);

    const handleCategoryClick = (categoryId) => {
        navigate(`/category/${categoryId}`, { state: { categoryId } });
    };

    return (
        <section id="categorias" className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>
                    <span className={styles.titleWrapper}>
                        Explore por Categorias
                        <span className={styles.titleUnderline}></span>
                    </span>
                </h2>
                
                {error && (
                    <div className={styles.error}>
                        <p>Erro ao carregar dados: {error}</p>
                        {retryCount < 3 && (
                            <button 
                                onClick={() => setRetryCount(prev => prev + 1)}
                                className={styles.retryButton}
                            >
                                Tentar novamente
                            </button>
                        )}
                    </div>
                )}
                
                <div className={styles.grid} id="categories-list">
                    {loading ? (
                        <>
                            <div className="animate-pulse skeleton-card">
                                <div className="bg-gray-200 rounded-lg h-32 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-gray-300 rounded-full mb-3"></div>
                                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                                    <div className="h-3 bg-gray-300 rounded w-12"></div>
                                </div>
                            </div>
                            {/* Repeat skeleton placeholders */}
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="animate-pulse skeleton-card">
                                    <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center"></div>
                                </div>
                            ))}
                        </>
                    ) : (
                        // Display actual categories with icons
                        categories.map(category => {
                            const IconComponent = category.icon;
                            
                            return (
                                <div 
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.id)}
                                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
                                >
                                    <div className="p-4 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                            <IconComponent size={32} className="text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {category.productCount} {category.productCount === 1 ? 'produto' : 'produtos'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
};

export default Categories;