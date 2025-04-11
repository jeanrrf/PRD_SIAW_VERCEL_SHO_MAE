import React from 'react';
import Banner from '../components/Banner';
import Categories from '../components/Categories';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import useProducts from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import FallbackIndicator from '../components/FallbackIndicator';

const Home = () => {
    const theme = useTheme();
    // Use o hook otimizado para mostrar produtos em destaque
    const { products, loading, isUsingFallback } = useProducts({ useShowcase: true, limit: 8 });
    
    return (
        <div className="home-page">
            <Banner />
            <Categories />
            
            {/* Seção de produtos em destaque */}
            <section className="featured-products">
                <div className="container">
                    <h2 className="section-title">Produtos em Destaque</h2>
                    
                    <div className="products-grid">
                        {loading ? (
                            Array(4).fill(0).map((_, index) => (
                                <div key={index} className="product-skeleton">
                                    <div className="skeleton-image"></div>
                                    <div className="skeleton-content">
                                        <div className="skeleton-title"></div>
                                        <div className="skeleton-price"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        )}
                    </div>
                </div>
            </section>
            
            <Footer />
            
            {/* Indicador de uso de dados de fallback */}
            <FallbackIndicator isUsingFallback={isUsingFallback} />
            
            <style dangerouslySetInnerHTML={{__html: `
                .home-page {
                    min-height: 100vh;
                    background-color: ${theme.background};
                    color: ${theme.textPrimary};
                    display: flex;
                    flex-direction: column;
                }
                
                .featured-products {
                    padding: 60px 0;
                    background: ${theme.backgroundSecondary};
                }
                
                .container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                
                .section-title {
                    font-size: 28px;
                    font-weight: bold;
                    position: relative;
                    margin-bottom: 40px;
                    color: ${theme.textPrimary};
                }
                
                .section-title::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: -8px;
                    width: 60px;
                    height: 4px;
                    background-color: ${theme.accent};
                }
                
                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 20px;
                }
                
                @media (min-width: 480px) {
                    .products-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (min-width: 768px) {
                    .products-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                
                @media (min-width: 992px) {
                    .products-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
                
                .product-skeleton {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    overflow: hidden;
                    height: 100%;
                }
                
                .skeleton-image {
                    width: 100%;
                    padding-top: 75%;
                    background-color: #f1f5f9;
                    animation: pulse 1.5s infinite;
                }
                
                .skeleton-content {
                    padding: 16px;
                }
                
                .skeleton-title {
                    height: 20px;
                    background-color: #f1f5f9;
                    margin-bottom: 12px;
                    border-radius: 4px;
                    animation: pulse 1.5s infinite;
                }
                
                .skeleton-price {
                    height: 24px;
                    width: 40%;
                    background-color: #f1f5f9;
                    border-radius: 4px;
                    animation: pulse 1.5s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}} />
        </div>
    );
};

export default Home;