import { useEffect, useState } from 'react';
import { fetchProducts } from '../api/connector';

const useProducts = (categoryId = null) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                let data;
                
                // If categoryId is provided, fetch products for that category
                if (categoryId) {
                    const response = await fetch(`http://localhost:8000/api/db/products/category/${categoryId}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    data = await response.json();
                    console.log(`Products loaded for category ${categoryId}:`, data);
                } else {
                    // Otherwise fetch all products
                    data = await fetchProducts();
                }
                
                setProducts(data);
            } catch (err) {
                console.error('Error loading products:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [categoryId]); // Re-run when categoryId changes

    return { products, loading, error };
};

export default useProducts;