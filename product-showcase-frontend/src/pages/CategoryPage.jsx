import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const { products, loading, error } = useProducts(categoryId);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading products.</div>;

    return (
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Products in Category: {categoryId}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default CategoryPage;