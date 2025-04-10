import React from 'react';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    // Tratando valores nulos ou indefinidos
    const {
        product_name = 'Produto sem nome',
        image_url,
        price = 0,
        original_price,
        formatted_price,
        discount_percent = 0,
        shop_name = '',
        rating_star = 0,
        offer_link = '#',
    } = product;

    // Fallback para imagem caso a URL seja inválida
    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = 'https://via.placeholder.com/300x300?text=Imagem+Indisponível';
    };

    // Limita o texto a um número específico de caracteres
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    // Renderiza as estrelas de avaliação
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className={styles.starFull}>★</span>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<span key={i} className={styles.starHalf}>★</span>);
            } else {
                stars.push(<span key={i} className={styles.starEmpty}>★</span>);
            }
        }
        
        return <div className={styles.ratingStars}>{stars}</div>;
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img 
                    src={image_url || 'https://via.placeholder.com/300x300?text=Sem+Imagem'} 
                    alt={product_name} 
                    className={styles.image} 
                    title={product_name}
                    loading="lazy"
                    onError={handleImageError}
                />
                {discount_percent > 0 && (
                    <div className={styles.discountBadge}>
                        -{discount_percent}%
                    </div>
                )}
            </div>
            
            <div className={styles.content}>
                <h3 className={styles.title} title={product_name}>
                    {truncateText(product_name, 50)}
                </h3>
                
                {shop_name && (
                    <p className={styles.shop}>Loja: {shop_name}</p>
                )}
                
                {rating_star > 0 && renderStars(rating_star)}
                
                <div className={styles.priceContainer}>
                    <span className={styles.price}>
                        {formatted_price || `R$ ${price.toFixed(2)}`.replace('.', ',')}
                    </span>
                    {original_price && original_price > price && (
                        <span className={styles.originalPrice}>
                            R$ {original_price.toFixed(2).replace('.', ',')}
                        </span>
                    )}
                </div>
            </div>
            
            <div className={styles.footer}>
                <a 
                    href={offer_link} 
                    className={styles.button}
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={`Ver oferta: ${product_name}`}
                >
                    Ver Oferta
                </a>
            </div>
        </div>
    );
};

export default ProductCard;