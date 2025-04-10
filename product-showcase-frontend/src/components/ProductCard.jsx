import React from 'react';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    return (
        <div className={styles.card}>
            <img 
                src={product.image} 
                alt={product.name || 'Produto'} 
                className={styles.image} 
                title={product.name}
            />
            <h3 className={styles.title}>{product.name}</h3>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.footer}>
                <span className={styles.price}>{`$${product.price}`}</span>
                <button className={styles.button}
                    aria-label={`Adicionar ${product.name || 'produto'} ao carrinho`}>
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    );
};

export default ProductCard;