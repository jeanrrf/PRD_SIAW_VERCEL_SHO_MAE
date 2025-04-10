import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';

const CategoryPage = () => {
    const { id } = useParams(); // Use 'id' instead of 'categoryId' to match route parameter
    const { products, loading, error } = useProducts(id);

    if (loading) return <div className="container mx-auto px-4 py-8 text-center">Carregando produtos...</div>;
    if (error) return <div className="container mx-auto px-4 py-8 text-center text-red-500">Erro ao carregar produtos: {error.message}</div>;

    // Ensure products is an array before mapping
    const productArray = Array.isArray(products) ? products : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-8">Produtos na Categoria: {id}</h2>
            
            {productArray.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <p className="text-xl">Nenhum produto encontrado nesta categoria.</p>
                    <p className="mt-2">Tente novamente mais tarde ou explore outras categorias.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productArray.map((product, index) => (
                        <ProductCard key={product.id || index} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;