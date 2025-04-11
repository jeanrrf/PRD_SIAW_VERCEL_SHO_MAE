import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/img/logo.png';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Memoized media query handler
    const checkIfMobile = useCallback(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);
    
    // Setup media query
    useEffect(() => {
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, [checkIfMobile]);

    // Styles as object literal
    const styles = {
        header: {
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        container: {
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none'
        },
        logo: { height: '2.5rem' },
        brandName: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#3b82f6'
        },
        menuButton: {
            display: isMobile ? 'block' : 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#1f2937'
        },
        menuIcon: { height: '1.5rem', width: '1.5rem' },
        nav: {
            display: 'flex',
            gap: '2rem',
            ...(isMobile && {
                display: isMenuOpen ? 'flex' : 'none',
                flexDirection: 'column',
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                padding: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                gap: '1rem'
            })
        },
        navLink: {
            color: '#1f2937',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'color 0.2s ease'
        }
    };

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <Link to="/" style={styles.logoContainer}>
                    <img src={logo} alt="Logo da Sales Martins" style={styles.logo} />
                    <span style={styles.brandName}>SALES MARTINS</span>
                </Link>
                
                <button 
                    style={styles.menuButton}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Alternar menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" style={styles.menuIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
                
                <nav style={styles.nav}>
                    {['Início', 'Categorias', 'Ofertas', 'Recentes'].map((item, index) => (
                        <Link 
                            key={index}
                            to={index === 0 ? '/' : `#${item.toLowerCase()}`}
                            style={styles.navLink}
                            onMouseOver={(e) => e.target.style.color = '#3b82f6'}
                            onMouseOut={(e) => e.target.style.color = '#1f2937'}
                        >
                            {item}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;