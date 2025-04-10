import React from 'react';

const RecentProducts = () => {
    return (
        <section id="recentes" className="py-16 bg-gray-100">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 relative">
                    <span className="inline-block relative">
                        Produtos Recentes
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 transform translate-y-2"></span>
                    </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="recent-products">
                    {/* Os produtos serão carregados dinamicamente via JavaScript */}
                    <div className="animate-pulse skeleton-card">
                        <div className="bg-gray-200 rounded-lg h-80 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="animate-pulse skeleton-card">
                        <div className="bg-gray-200 rounded-lg h-80 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="animate-pulse skeleton-card">
                        <div className="bg-gray-200 rounded-lg h-80 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RecentProducts;