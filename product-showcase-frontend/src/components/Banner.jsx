import React, { useState } from 'react';
import backgroundImage from '../assets/img/pattern.png';

const Banner = () => {
    const [isHovering, setIsHovering] = useState(false);
    
    // Media query para responsividade
    const getResponsiveTitleSize = () => {
        return window.innerWidth >= 768 ? '3.75rem' : '3rem';
    };
    
    // Consolidated styles with reduced properties
    const styles = {
        banner: {
            position: 'relative',
            textAlign: 'center',
            overflow: 'hidden',
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(to bottom, #111827, #000000)'
        },
        backgroundLayer: {
            position: 'absolute',
            inset: 0
        },
        backgroundImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.6,
            transition: 'transform 0.3s ease',
            transform: isHovering ? 'scale(1.05)' : 'scale(1)'
        },
        overlay: {
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.9), rgba(88,28,135,0.8), rgba(49,46,129,0.9))',
            mixBlendMode: 'multiply'
        },
        content: {
            position: 'relative',
            zIndex: 10,
            width: '100%',
            transform: isHovering ? 'scale(1.02)' : 'translateY(0)',
            transition: 'all 0.5s ease'
        },
        container: {
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1.5rem'
        },
        contentWrapper: {
            maxWidth: '48rem',
            margin: '0 auto',
            textAlign: 'center',
            color: 'white'
        },
        badge: {
            display: 'inline-block',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            backgroundColor: isHovering ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.3)',
            color: '#e0e7ff',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1.5rem',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s ease'
        },
        title: {
            fontSize: getResponsiveTitleSize(),
            lineHeight: 1.2,
            fontWeight: 700,
            marginBottom: '1.5rem',
            letterSpacing: '-0.025em'
        },
        highlight: {
            background: 'linear-gradient(to right, #ec4899, #6366f1)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
        },
        description: {
            fontSize: '1.25rem',
            opacity: 0.9,
            marginBottom: '2.5rem',
            lineHeight: 1.75,
            fontWeight: 300,
            maxWidth: '42rem',
            margin: '0 auto 2.5rem'
        }
    };

    return (
        <section 
            style={styles.banner}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Background Layer */}
            <div style={styles.backgroundLayer}>
                <img 
                    src={backgroundImage} 
                    alt="Padrão de fundo do banner"
                    style={styles.backgroundImage}
                />
                <div style={styles.overlay}></div>
            </div>
            
            {/* Content Layer */}
            <div style={styles.content}>
                <div style={styles.container}>
                    <div style={styles.contentWrapper}>
                        <div style={styles.badge}>
                            Ofertas Exclusivas
                        </div>
                        <h1 style={styles.title}>
                            Descubra os Melhores Produtos da{' '}
                            <span style={styles.highlight}>
                                Shopee
                            </span>
                        </h1>
                        <p style={styles.description}>
                            Encontre as melhores ofertas selecionadas automaticamente, com descontos imperdíveis e qualidade garantida.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;