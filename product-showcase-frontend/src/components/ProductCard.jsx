import React, { useState } from 'react';

const ProductCard = ({ product }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // Destructure with defaults for null/undefined values
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

    // Reduzido - Estilos compactados
    const styles = {
        card: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
            height: '100%'
        },
        imageContainer: {
            position: 'relative',
            width: '100%',
            height: '200px',
            overflow: 'hidden'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
        },
        discountBadge: {
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            backgroundColor: 'var(--accent, #f43f5e)',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontWeight: 'bold',
            fontSize: '0.875rem'
        },
        content: {
            padding: '1rem',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
        },
        title: {
            fontSize: '1rem',
            fontWeight: 600,
            color: '#1e293b',
            marginBottom: '0.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3
        },
        shop: {
            fontSize: '0.875rem',
            color: '#64748b',
            marginBottom: '0.5rem'
        },
        price: {
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#f43f5e'
        },
        originalPrice: {
            fontSize: '0.875rem',
            textDecoration: 'line-through',
            color: '#64748b'
        },
        button: {
            width: '100%',
            backgroundColor: '#f43f5e',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontWeight: 500,
            textAlign: 'center',
            transition: 'background-color 0.2s',
            textDecoration: 'none'
        }
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => setImageLoading(false);

    // Simplified star rendering
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span 
                    key={i} 
                    style={{ 
                        color: i < fullStars ? '#f59e0b' : 
                              i === fullStars && hasHalfStar ? '#f59e0b' : '#e2e8f0',
                        opacity: i === fullStars && hasHalfStar ? 0.7 : 1
                    }}
                >
                    ★
                </span>
            );
        }
        
        return <div style={{ display: 'flex', gap: '0.125rem', marginBottom: '0.75rem' }}>{stars}</div>;
    };

    const imageSource = image_url && (image_url.startsWith('http') || image_url.startsWith('https')) 
        ? image_url 
        : 'https://via.placeholder.com/300x300?text=Sem+Imagem';

    return (
        <div 
            style={styles.card}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
        >
            <div style={styles.imageContainer}>
                {imageLoading && (
                    <div style={{
                        position: 'absolute',
                        inset: 0, 
                        backgroundColor: '#e5e7eb', 
                        animation: 'pulse 1.5s infinite'
                    }}></div>
                )}
                <img 
                    src={imageError ? 'https://via.placeholder.com/300x300?text=Imagem+Indisponível' : imageSource} 
                    alt={product_name} 
                    style={styles.image}
                    title={product_name}
                    loading="lazy"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    width="300"
                    height="300"
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'none'}
                />
                {discount_percent > 0 && <div style={styles.discountBadge}>-{discount_percent}%</div>}
            </div>
            
            <div style={styles.content}>
                <h3 style={styles.title} title={product_name}>
                    {product_name.length > 50 ? `${product_name.substring(0, 50)}...` : product_name}
                </h3>
                
                {shop_name && <p style={styles.shop}>Loja: {shop_name}</p>}
                
                {rating_star > 0 && renderStars(rating_star)}
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={styles.price}>
                        {formatted_price || `R$ ${price.toFixed(2)}`.replace('.', ',')}
                    </span>
                    {original_price && original_price > price && (
                        <span style={styles.originalPrice}>
                            R$ {original_price.toFixed(2).replace('.', ',')}
                        </span>
                    )}
                </div>
            </div>
            
            <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <a 
                    href={offer_link} 
                    style={styles.button}
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={`Ver oferta: ${product_name}`}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#e11d48'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f43f5e'}
                >
                    Ver Oferta
                </a>
            </div>
        </div>
    );
};

export default ProductCard;