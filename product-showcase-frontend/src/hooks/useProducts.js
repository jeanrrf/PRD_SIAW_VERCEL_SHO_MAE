import { useEffect, useState } from 'react';
import { fetchProducts, fetchShowcaseProducts, fetchProductsByCategory } from '../api/connector';

const useProducts = (categoryId = null) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                let productsData;
                if (categoryId) {
                    productsData = await fetchProductsByCategory(categoryId);
                } else {
                    productsData = await fetchShowcaseProducts();
                }
                
                // Check if we received actual data
                if (productsData && (Array.isArray(productsData) || Object.keys(productsData).length > 0)) {
                    setProducts(productsData);
                    setError(null);
                } else {
                    setError(new Error("No products returned from API"));
                }
            } catch (error) {
                console.error('Error loading products:', error);
                setError(error);
                
                // Retry logic for connection errors
                if (retryCount < 3 && error.message.includes('connection')) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, 1000 * (retryCount + 1)); // Exponential backoff
                }
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [categoryId, retryCount]); // Re-run when categoryId changes or when retrying

    return { products, loading, error };
};

export default useProducts;