import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Categories.module.css';
// Import React Icons
import { 
    FaLaptop, FaMobile, FaTshirt, FaUserTie, FaHome, 
    FaBaby, FaSprayCan, FaRunning, FaGamepad, FaCar, FaTools 
} from 'react-icons/fa';
// Import API base URL from connector
import { API_BASE_URL } from '../api/connector';

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

    useEffect(() => {
        const fetchCategoriesWithCounts = async () => {
            try {
                // Fetch product counts for each category
                const response = await fetch(`${API_BASE_URL}/categories/counts`);
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                const categoryCounts = data.counts || {};
                
                // Merge counts with category data
                const categoriesWithCounts = categoriesData.map(category => ({
                    ...category,
                    // Use real count from API or 0 if not available
                    productCount: categoryCounts[category.id] || 0
                }));
                
                setCategories(categoriesWithCounts);
            } catch (err) {
                console.error("Error fetching category counts:", err);
                setError(err);
                
                // Fall back to categories without real counts
                setCategories(categoriesData.map(category => ({
                    ...category,
                    productCount: 0
                })));
            } finally {
                setLoading(false);
            }
        };
        
        fetchCategoriesWithCounts();
    }, []);

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
                
                {/* Show error message if any */}
                {error && (
                    <div className={styles.error}>
                        Não foi possível carregar os contadores de produtos. Exibindo categorias sem contagem.
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