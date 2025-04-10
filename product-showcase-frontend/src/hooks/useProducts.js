import { useEffect, useState } from 'react';
import { fetchProducts } from '../api/connector';

const useProducts = (categoryId = null) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                setProducts(productsData);
            } catch (error) {
                console.error('Error loading products:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [categoryId]); // Re-run when categoryId changes

    return { products, loading, error };
};

export default useProducts;