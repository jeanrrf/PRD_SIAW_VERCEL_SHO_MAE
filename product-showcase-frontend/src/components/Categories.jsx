import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Import categories directly from the local data
const categoriesData = [
    {
        "id": "100001",
        "name": "Eletrônicos",
        "image_url": "https://cf.shopee.com.br/file/br-11134207-7qukw-lgztplve59sp78",
        "productCount": 120
    },
    {
        "id": "100006",
        "name": "Celulares e Acessórios",
        "image_url": "https://cf.shopee.com.br/file/br-11134207-7qukw-lgztps4xbi9u0c",
        "productCount": 85
    },
    {
        "id": "100018",
        "name": "Moda Feminina",
        "image_url": "https://cf.shopee.com.br/file/sg-11134201-7qvdd-lf90155cqlf1c9",
        "productCount": 93
    },
    {
        "id": "100019",
        "name": "Moda Masculina",
        "image_url": "https://cf.shopee.com.br/file/sg-11134201-7qvf2-lgxalikawrffb4",
        "productCount": 76
    },
    {
        "id": "100039",
        "name": "Casa e Decoração",
        "image_url": "https://cf.shopee.com.br/file/sg-11134201-7qvcu-lf9011gm2rkdd3", 
        "productCount": 68
    },
    {
        "id": "100040",
        "name": "Bebês e Crianças",
        "image_url": "https://cf.shopee.com.br/file/sg-11134201-7qvfg-lf900wwdgkux7c",
        "productCount": 45
    },
    {
        "id": "100041",
        "name": "Beleza e Cuidado Pessoal",
        "image_url": "https://cf.shopee.com.br/file/sg-11134201-7rbm2-los7hhkwcl1o49", 
        "productCount": 77
    },
    {
        "id": "100042",
        "name": "Esporte e Lazer",
        "image_url": "https://cf.shopee.com.br/file/br-11134207-7qvdr-lf8zzr4sjsf69c",
        "productCount": 55
    },
    {
        "id": "100048",
        "name": "Jogos e Hobbies",
        "image_url": "https://cf.shopee.com.br/file/br-11134207-7qvel-lf90000odf9v4e",
        "productCount": 42
    },
    {
        "id": "100049",
        "name": "Automotivo",
        "image_url": "https://cf.shopee.com.br/file/br-11134207-7qve3-lf900065ai0v82",
        "productCount": 38
    },
    {
        "id": "100050",
        "name": "Ferramentas e Construção",
        "image_url": "https://cf.shopee.com.br/file/sg-11134201-7qve0-lf900d7fwhw43f",
        "productCount": 49
    }
];

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setCategories(categoriesData);
            setLoading(false);
        }, 500);
        
        return () => clearTimeout(timer);
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
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" id="categories-list">
                    {loading ? (
                        // Skeleton loading placeholders
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
                        // Display actual categories
                        categories.map(category => (
                            <Link 
                                to={`/category/${category.id}`} 
                                key={category.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                            >
                                <div className="p-4 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-gray-100">
                                        <img 
                                            src={category.image_url} 
                                            alt={category.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://via.placeholder.com/64?text=${category.name.charAt(0)}`;
                                            }}
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                                    <p className="text-sm text-gray-500">{category.productCount} produtos</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default Categories;