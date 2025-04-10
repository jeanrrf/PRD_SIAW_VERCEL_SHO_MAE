import React from 'react';

const Banner = () => {
    return (
        <section className="relative text-white overflow-hidden">
            <div className="absolute inset-0 w-full h-full">
                <img 
                    src="/assets/img/logo.jpg" 
                    alt="Banner Background"
                    className="w-full h-full object-cover brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-indigo-800/70 to-purple-900/80"></div>
            </div>
            <div className="relative z-10 py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="w-full text-center">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                                Descubra os Melhores Produtos da <span className="text-accent">Shopee</span>
                            </h1>
                            <p className="text-lg opacity-90 mb-8">
                                Encontre as melhores ofertas selecionadas automaticamente, com descontos imperdíveis e qualidade garantida.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;