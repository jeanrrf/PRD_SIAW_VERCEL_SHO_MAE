import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="modern-footer">
            <div className="footer-waves">
                <div className="wave wave1"></div>
                <div className="wave wave2"></div>
                <div className="wave wave3"></div>
            </div>
            
            <div className="footer-content">
                <div className="footer-section about">
                    <h3 className="footer-title">SALES MARTINS</h3>
                    <p>Descubra produtos de qualidade com as melhores ofertas selecionadas para você.</p>
                    <div className="social-icons">
                        {['facebook', 'instagram', 'twitter', 'linkedin'].map(platform => (
                            <a key={platform} href="#" className="social-icon">
                                <i className={`fab fa-${platform}`}></i>
                            </a>
                        ))}
                    </div>
                </div>
                
                <div className="footer-section links">
                    <h3 className="footer-title">Links Rápidos</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Início</Link></li>
                        <li><Link to="/category/all">Todas Categorias</Link></li>
                        <li><a href="#about">Sobre Nós</a></li>
                        <li><a href="#contact">Contato</a></li>
                    </ul>
                </div>
                
                <div className="footer-section contact">
                    <h3 className="footer-title">Contato</h3>
                    <p><i className="fas fa-map-marker-alt"></i> Brazil</p>
                    <p><i className="fas fa-envelope"></i> contato@salesmartins.com</p>
                    <p><i className="fas fa-phone"></i> +55 (11) 9999-9999</p>
                </div>
                
                <div className="footer-section newsletter">
                    <h3 className="footer-title">Newsletter</h3>
                    <p>Inscreva-se para receber ofertas exclusivas</p>
                    <form className="newsletter-form">
                        <input type="email" placeholder="Seu email" />
                        <button type="submit">Assinar</button>
                    </form>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; {currentYear} SALES MARTINS. Todos os direitos reservados.</p>
                <p className="disclaimer">Esta vitrine utiliza dados do programa de afiliados da Shopee. Shopee é uma marca registrada de seus respectivos proprietários.</p>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .modern-footer {
                    position: relative;
                    background: linear-gradient(to bottom, #111827, #1e293b);
                    color: #fff;
                    padding: 60px 0 20px;
                    overflow: hidden;
                }
                
                .footer-waves {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100px;
                    margin-bottom: -7px;
                    min-height: 100px;
                }
                
                .wave {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-repeat: repeat-x;
                    opacity: 0.8;
                }
                
                .wave1 {
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="%233b82f6" opacity="0.3"></path></svg>');
                    background-size: 1200px 100px;
                    animation: wave-animation 10s linear infinite;
                }
                
                .wave2 {
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="%232563eb" opacity="0.5"></path></svg>');
                    background-size: 1200px 100px;
                    animation: wave-animation 8s linear infinite;
                    top: 10px;
                }
                
                .wave3 {
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="%231d4ed8" opacity="0.7"></path></svg>');
                    background-size: 1200px 100px;
                    animation: wave-animation 6s linear infinite;
                    top: 20px;
                }
                
                @keyframes wave-animation {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-1200px); }
                }
                
                .footer-content {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 40px;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                    position: relative;
                    z-index: 10;
                }
                
                @media (min-width: 768px) {
                    .footer-content {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (min-width: 992px) {
                    .footer-content {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
                
                .footer-section {
                    margin-bottom: 20px;
                }
                
                .footer-title {
                    position: relative;
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #fff;
                    padding-bottom: 10px;
                }
                
                .footer-title::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 50px;
                    height: 2px;
                    background-color: #3b82f6;
                }
                
                .footer-section p {
                    color: #cbd5e1;
                    margin-bottom: 15px;
                    font-size: 14px;
                    line-height: 1.6;
                }
                
                .social-icons {
                    display: flex;
                    gap: 15px;
                    margin-top: 20px;
                }
                
                .social-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    color: #fff;
                    transition: all 0.3s ease;
                }
                
                .social-icon:hover {
                    background-color: #3b82f6;
                    transform: translateY(-3px);
                }
                
                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .footer-links li {
                    margin-bottom: 10px;
                }
                
                .footer-links a {
                    color: #cbd5e1;
                    text-decoration: none;
                    transition: color 0.3s ease;
                    font-size: 14px;
                    display: inline-block;
                }
                
                .footer-links a:hover {
                    color: #3b82f6;
                    transform: translateX(5px);
                }
                
                .contact p {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .newsletter-form {
                    display: flex;
                    margin-top: 15px;
                }
                
                .newsletter-form input {
                    flex-grow: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 4px 0 0 4px;
                    background-color: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    outline: none;
                }
                
                .newsletter-form input::placeholder {
                    color: #94a3b8;
                }
                
                .newsletter-form button {
                    padding: 0 15px;
                    background-color: #3b82f6;
                    border: none;
                    border-radius: 0 4px 4px 0;
                    color: #fff;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                
                .newsletter-form button:hover {
                    background-color: #2563eb;
                }
                
                .footer-bottom {
                    text-align: center;
                    padding-top: 30px;
                    margin-top: 40px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                    font-size: 14px;
                }
                
                .disclaimer {
                    font-size: 12px;
                    margin-top: 10px;
                    color: #64748b;
                }
                
                @media (max-width: 767px) {
                    .footer-waves {
                        height: 50px;
                    }
                    
                    .wave1, .wave2, .wave3 {
                        background-size: 600px 50px;
                    }
                }
            `}} />
        </footer>
    );
};

export default Footer;