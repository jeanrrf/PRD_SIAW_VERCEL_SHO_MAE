import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/img/logo.png';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <img src={logo} alt="Logo da Sales Martins" className="h-10" />
                    <span className="text-2xl font-bold text-primary">SALES MARTINS</span>
                </Link>
                <button 
                    className="md:hidden text-dark focus:outline-none" 
                    onClick={toggleMenu}
                    aria-label="Alternar menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
                <nav className={`md:flex space-x-8 ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
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