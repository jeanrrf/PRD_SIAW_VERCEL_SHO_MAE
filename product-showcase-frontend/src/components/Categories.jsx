import React from 'react';

const Categories = () => {
    return (
        <section id="categorias" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 relative">
                    <span className="inline-block relative">
                        Explore por Categorias
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-accent transform translate-y-2"></span>
                    </span>
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" id="categories-list">
                    {/* As categorias serão carregadas dinamicamente via JavaScript */}
                    <div className="animate-pulse skeleton-card">
                        <div className="bg-gray-200 rounded-lg h-32 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-300 rounded-full mb-3"></div>
                            <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-12"></div>
                        </div>
                    </div>
                    <div className="animate-pulse skeleton-card">
                        <div className="bg-gray-200 rounded-lg h-32 flex flex-col items-center justify-center"></div>
                    </div>
                    <div className="animate-pulse skeleton-card">
                        <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center"></div>
                    </div>
                    <div className="animate-pulse skeleton-card">
                        <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center"></div>
                    </div>
                    <div className="animate-pulse skeleton-card">
                        <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center"></div>
                    </div>
                    <div className="animate-pulse skeleton-card">
                        <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Categories;