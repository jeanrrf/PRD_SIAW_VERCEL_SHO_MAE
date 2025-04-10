import React from 'react';
import styles from '../styles/components/Banner.module.css';

const Banner = () => {
    return (
        <section className={styles.banner}>
            {/* Background Layer */}
            <div className={styles.backgroundLayer}>
                <img 
                    src="/assets/img/logo.jpg" 
                    alt="Banner Background"
                    className={styles.backgroundImage}
                />
                <div className={styles.overlay}></div>
                <div className={styles.pattern}></div>
            </div>
            
            {/* Content Layer */}
            <div className={styles.content}>
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <div className={styles.badge}>
                            Ofertas Exclusivas
                        </div>
                        <h1 className={styles.title}>
                            Descubra os Melhores Produtos da{' '}
                            <span className={styles.highlight}>
                                Shopee
                            </span>
                        </h1>
                        <p className={styles.description}>
                            Encontre as melhores ofertas selecionadas automaticamente, com descontos imperdíveis e qualidade garantida.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;