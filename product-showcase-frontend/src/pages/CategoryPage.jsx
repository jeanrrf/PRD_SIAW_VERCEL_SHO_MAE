import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../api/connector';

const CategoryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [categoryName, setCategoryName] = useState('');

    const loadProducts = async (currentPage = 1) => {
        try {
            setLoading(true);
            const data = await fetchProducts(id, currentPage);
            
            if (currentPage === 1) {
                setProducts(data.products);
            } else {
                setProducts(prev => [...prev, ...data.products]);
            }
            
            setHasMore(data.products.length === 24); // Se recebeu menos que o limite, não tem mais
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        loadProducts(1);
    }, [id]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadProducts(nextPage);
    };

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

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-8">
                Produtos em: {categoryName}
            </h2>
            
            {loading && page === 1 ? (
                <div>Carregando...</div>
            ) : error ? (
                <div>Erro: {error.message}</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard 
                                key={`product-${product.id || product.shopee_id}`} 
                                product={product} 
                            />
                        ))}
                    </div>
                    
                    {hasMore && (
                        <div className="text-center mt-8">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                                {loading ? 'Carregando...' : 'Carregar mais'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CategoryPage;