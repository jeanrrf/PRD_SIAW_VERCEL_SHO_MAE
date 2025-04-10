import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <img src="/assets/img/logo.jpg" alt="Logo" className="h-10" />
                    <span className="text-2xl font-bold text-primary">SALES MARTINS</span>
                </Link>
                <nav className="hidden md:flex space-x-8">
                    <Link to="/" className="text-dark hover:text-primary font-medium transition-colors">Início</Link>
                    <Link to="#categorias" className="text-dark hover:text-primary font-medium transition-colors">Categorias</Link>
                    <Link to="#ofertas" className="text-dark hover:text-primary font-medium transition-colors">Ofertas</Link>
                    <Link to="#recentes" className="text-dark hover:text-primary font-medium transition-colors">Recentes</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;