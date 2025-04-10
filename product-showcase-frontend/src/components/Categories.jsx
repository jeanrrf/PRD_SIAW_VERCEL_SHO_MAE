import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Import React Icons
import { 
    FaLaptop, FaMobile, FaTshirt, FaUserTie, FaHome, 
    FaBaby, FaSprayCan, FaRunning, FaGamepad, FaCar, FaTools 
} from 'react-icons/fa';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const Categories = () => {
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

    return (
        <section id="categorias" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 relative">
                    <span className="inline-block relative">
                        Explore por Categorias
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-accent transform translate-y-2"></span>
                    </span>
                </h2>
                
                {/* Show error message if any */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center text-sm">
                        Não foi possível carregar os contadores de produtos. Exibindo categorias sem contagem.
                    </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" id="categories-list">
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
                                <Link 
                                    to={`/category/${category.id}`} 
                                    key={category.id}
                                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
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
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
};

export default Categories;