import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';

const CategoryPage = () => {
    // Use 'id' to match the parameter name in the route defined in App.jsx
    const { id } = useParams();
    const { products, loading, error } = useProducts(id);
    const [categoryName, setCategoryName] = useState('');

    // Add effect to get category name based on ID
    useEffect(() => {
        // Could fetch category name from API or use a mapping
        const categoryNames = {
            '100001': 'Eletrônicos',
            '100006': 'Celulares e Acessórios',
            '100018': 'Moda Feminina',
            '100019': 'Moda Masculina',
            '100039': 'Casa e Decoração',
            '100040': 'Bebês e Crianças',
            '100041': 'Beleza e Cuidado Pessoal',
            '100042': 'Esporte e Lazer',
            '100048': 'Jogos e Hobbies',
            '100049': 'Automotivo',
            '100050': 'Ferramentas e Construção'
        };
        
        setCategoryName(categoryNames[id] || `Categoria ${id}`);
    }, [id]);

    // Debug what's coming from the API
    useEffect(() => {
        if (!loading && products) {
            console.log('Products data:', products);
        }
    }, [products, loading]);

    // Proper loading state
    if (loading) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Error handling
    if (error) return (
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="bg-red-100 p-4 rounded-lg">
                <h2 className="text-xl font-bold text-red-800 mb-2">Erro ao carregar produtos</h2>
                <p className="text-red-600">{error.toString()}</p>
            </div>
        </div>
    );

    // Ensure products is an array before mapping
    // Handle various API response formats that might occur
    const productArray = Array.isArray(products) 
        ? products 
        : (products && products.products && Array.isArray(products.products)) 
            ? products.products 
            : (products && typeof products === 'object') 
                ? Object.values(products).filter(item => typeof item === 'object')
                : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-8">
                Produtos em: {categoryName}
            </h2>
            
            {productArray.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <p className="text-xl">Nenhum produto encontrado nesta categoria.</p>
                    <p className="mt-2">Tente novamente mais tarde ou explore outras categorias.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productArray.map((product, index) => (
                        <ProductCard 
                            key={`product-${product.id || product.shopee_id || index}`} 
                            product={product} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;