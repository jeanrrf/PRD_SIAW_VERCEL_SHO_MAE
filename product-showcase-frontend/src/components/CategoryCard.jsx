import React from 'react';
import PropTypes from 'prop-types';

const CategoryCard = ({ category, onClick }) => {
    const { id, name, image_url, product_count = 0 } = category;
    
    return (
        <div className="category-card" onClick={() => onClick(id)}>
            {image_url && (
                <div className="card-image-container">
                    <img 
                        src={image_url} 
                        alt={name} 
                        className="card-image"
                        loading="lazy"
                    />
                </div>
            )}
            
            <h3 className="card-title">{name}</h3>
            {product_count > 0 && (
                <span className="product-count">{product_count} produtos</span>
            )}
            
            <style jsx>{`
                .category-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    cursor: pointer;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .category-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }
                
                .card-image-container {
                    position: relative;
                    width: 100%;
                    padding-top: 60%;
                    overflow: hidden;
                }
                
                .card-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                
                .category-card:hover .card-image {
                    transform: scale(1.05);
                }
                
                .card-title {
                    padding: 16px;
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                }
                
                .product-count {
                    padding: 0 16px 16px;
                    font-size: 14px;
                    color: #64748b;
                    margin-top: auto;
                }
            `}</style>
        </div>
    );
};

CategoryCard.propTypes = {
    category: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        image_url: PropTypes.string,
        product_count: PropTypes.number
    }).isRequired,
    onClick: PropTypes.func.isRequired
};

export default CategoryCard;