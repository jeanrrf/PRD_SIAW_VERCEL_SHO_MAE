import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Categories.module.css';
import { 
    FaLaptop, FaMobile, FaTshirt, FaUserTie, FaHome, 
    FaBaby, FaSprayCan, FaRunning, FaGamepad, FaCar, FaTools 
} from 'react-icons/fa';
import { fetchCategoryCounts } from '../api/connector';

const categoriesData = [
    { id: '100001', name: 'Eletrônicos', icon: FaLaptop },
    { id: '100006', name: 'Celulares e Acessórios', icon: FaMobile },
    { id: '100018', name: 'Moda Feminina', icon: FaTshirt },
    { id: '100019', name: 'Moda Masculina', icon: FaUserTie },
    { id: '100039', name: 'Casa e Decoração', icon: FaHome },
    { id: '100040', name: 'Bebês e Crianças', icon: FaBaby },
    { id: '100041', name: 'Beleza e Cuidado Pessoal', icon: FaSprayCan },
    { id: '100042', name: 'Esporte e Lazer', icon: FaRunning },
    { id: '100048', name: 'Jogos e Hobbies', icon: FaGamepad },
    { id: '100049', name: 'Automotivo', icon: FaCar },
    { id: '100050', name: 'Ferramentas e Construção', icon: FaTools }
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
            const categoriesWithCounts = categoriesData.map(category => ({
                ...category,
                productCount: counts[category.id] || 0
            }));

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

    return (
        <section id="categorias" className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>Explore por Categorias</h2>

                {error && (
                    <div className={styles.error}>
                        <p>{error}</p>
                        <button 
                            onClick={fetchCategoriesWithCounts}
                            className={styles.retryButton}
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                <div className={styles.grid}>
                    {loading ? (
                        Array(6).fill(0).map((_, index) => (
                            <div key={index} className={styles.skeleton}>
                                <div className={styles.skeletonIcon}></div>
                                <div className={styles.skeletonText}></div>
                            </div>
                        ))
                    ) : (
                        categories.map(category => {
                            const Icon = category.icon;
                            return (
                                <div 
                                    key={category.id} 
                                    className={styles.card} 
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    <div className={styles.iconWrapper}>
                                        <Icon className={styles.icon} />
                                    </div>
                                    <h3 className={styles.categoryName}>{category.name}</h3>
                                    <p className={styles.productCount}>
                                        {category.productCount} {category.productCount === 1 ? 'produto' : 'produtos'}
                                    </p>
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