import React from 'react';

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md" />
            <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
            <p className="text-gray-600">{product.description}</p>
            <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-bold text-primary">{`$${product.price}`}</span>
                <button className="bg-accent text-white py-2 px-4 rounded hover:bg-opacity-90 transition">
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    );
};

export default ProductCard;