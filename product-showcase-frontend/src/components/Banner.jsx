import React from 'react';

const Banner = () => {
    return (
        <section className="relative text-white overflow-hidden h-[500px] flex items-center">
            {/* Background Layer */}
            <div className="absolute inset-0 w-full h-full">
                <img 
                    src="/assets/img/logo.jpg" 
                    alt="Banner Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-purple-900/70 to-indigo-900/80"></div>
                <div className="absolute inset-0 bg-[url('/assets/img/pattern.png')] opacity-20"></div>
            </div>
            
            {/* Content Layer */}
            <div className="relative z-10 w-full">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium mb-4">
                            Ofertas Exclusivas
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                            Descubra os Melhores Produtos da <span className="text-accent">Shopee</span>
                        </h1>
                        <p className="text-lg opacity-90 mb-8">
                            Encontre as melhores ofertas selecionadas automaticamente, com descontos imperdíveis e qualidade garantida.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;