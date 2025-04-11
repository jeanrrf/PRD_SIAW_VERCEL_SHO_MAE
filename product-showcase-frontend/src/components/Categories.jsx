import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../api/connector';
import CategoryCard from './CategoryCard';

const Categories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchCategories();
                // Only take top 8 categories for better performance
                setCategories(data.slice(0, 8));
                setLoading(false);
            } catch (err) {
                console.error('Error loading categories:', err);
                setError(err.message || 'Failed to load categories');
                setLoading(false);
            }
        };
        
        loadCategories();
    }, []);

    const handleCategoryClick = (categoryId) => {
        navigate(`/category/${categoryId}`);
    };

    return (
        <section className="category-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Navegue por Categorias</h2>
                    <button 
                        className="see-all-btn"
                        onClick={() => navigate('/category/all')}
                    >
                        Ver Todas as Categorias
                    </button>
                </div>

                {loading ? (
                    <div className="category-grid">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="skeleton-card">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-title"></div>
                                <div className="skeleton-count"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>
                            Tentar novamente
                        </button>
                    </div>
                ) : (
                    <div className="category-grid">
                        {categories.map((category) => (
                            <CategoryCard 
                                key={category.id}
                                category={category}
                                onClick={handleCategoryClick}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .category-section {
                    padding: 60px 0;
                    background: linear-gradient(to bottom, #ffffff, #f8fafc);
                }
                .container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                }
                .section-title {
                    font-size: 28px;
                    font-weight: bold;
                    position: relative;
                    margin-bottom: 10px;
                }
                .section-title::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: -8px;
                    width: 60px;
                    height: 4px;
                    background-color: #3b82f6;
                }
                .see-all-btn {
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 25px;
                    padding: 10px 20px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .see-all-btn:hover {
                    background-color: #2563eb;
                }
                .category-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 20px;
                }
                @media (min-width: 480px) { .category-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 768px) { .category-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (min-width: 992px) { .category-grid { grid-template-columns: repeat(4, 1fr); } }
                
                .skeleton-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    height: 100%;
                    animation: pulse 1.5s infinite ease-in-out;
                }
                .skeleton-image {
                    width: 100%;
                    padding-top: 60%;
                    background-color: #f1f5f9;
                }
                .skeleton-title {
                    height: 20px;
                    width: 70%;
                    margin: 16px;
                    background-color: #f1f5f9;
                    border-radius: 4px;
                }
                .skeleton-count {
                    height: 14px;
                    width: 40%;
                    margin: 0 16px 16px;
                    background-color: #f1f5f9;
                    border-radius: 4px;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .error-message {
                    text-align: center;
                    padding: 20px;
                    color: #ef4444;
                }
                .error-message button {
                    margin-top: 10px;
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                }
            `}} />
        </section>
    );
};

export default Categories;