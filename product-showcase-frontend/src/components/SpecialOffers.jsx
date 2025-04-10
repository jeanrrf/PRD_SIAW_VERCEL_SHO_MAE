import React, { useState, useEffect } from 'react';
import { fetchShowcaseProducts } from '../api/connector';

const SpecialOffers = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchShowcaseProducts();
                setProducts(data);
            } catch (err) {
                setError(err);
                console.error('Erro ao carregar produtos:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    return (
        <section id="ofertas" className="py-16 bg-gray-100">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 relative">
                    <span className="inline-block relative">
                        Ofertas Especiais
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-accent transform translate-y-2"></span>
                    </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="special-offers">
                    {loading ? (
                        // Esqueleto de carregamento (já existente)
                        Array(3).fill(0).map((_, index) => (
                            <div key={index} className="animate-pulse skeleton-card">
                                <div className="bg-gray-200 rounded-lg h-80 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        ))
                    ) : error ? (
                        <div className="col-span-3 text-center text-red-500">
                            Erro ao carregar produtos. Tente novamente mais tarde.
                        </div>
                    ) : products.length === 0 ? (
                        <div className="col-span-3 text-center text-gray-500">
                            Nenhum produto encontrado.
                        </div>
                    ) : (
                        // Renderizar produtos
                        products.map((product) => (
                            <div key={product.shopee_id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="relative">
                                    <img 
                                        src={product.image_url} 
                                        alt={product.product_name}
                                        className="w-full h-64 object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x300?text=Imagem+Indisponível';
                                        }}
                                    />
                                    {product.discount_percent > 0 && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                                            -{product.discount_percent}%
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2" title={product.product_name}>
                                        {product.product_name}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-500 text-sm">Loja: {product.shop_name}</p>
                                            <p className="text-xl font-bold text-accent">{product.formatted_price}</p>
                                        </div>
                                        <a 
                                            href={product.offer_link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="bg-accent text-white px-4 py-2 rounded hover:bg-accent-dark transition-colors"
                                        >
                                            Ver Oferta
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default SpecialOffers;