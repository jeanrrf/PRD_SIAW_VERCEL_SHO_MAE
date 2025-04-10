import React, { useState, useEffect } from 'react';
import { fetchCategoryCounts } from '../api/connector';

const Footer = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const counts = await fetchCategoryCounts();
                const categoriesData = Object.entries(counts).map(([id, count]) => ({ id, count }));
                setCategories(categoriesData);
            } catch (err) {
                console.error('Erro ao carregar categorias no rodapé:', err);
            }
        };

        loadCategories();
    }, []);

    return (
        <footer className="bg-dark text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="text-xl font-bold mb-4">SENTINNELL IA WORKSPACE</h4>
                        <p className="text-gray-400 mb-4">Advanced Work Systems</p>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold mb-4">Navegação</h4>
                        <ul className="space-y-2">
                            <li><a href="/" className="text-gray-400 hover:text-white">Início</a></li>
                            <li><a href="#categorias" className="text-gray-400 hover:text-white">Categorias</a></li>
                            <li><a href="#ofertas" className="text-gray-400 hover:text-white">Ofertas</a></li>
                            <li><a href="#recentes" className="text-gray-400 hover:text-white">Recentes</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold mb-4">Categorias</h4>
                        <ul className="space-y-2" id="footer-categories">
                            {categories.length > 0 ? (
                                categories.map(category => (
                                    <li key={category.id}>
                                        <a href={`/category/${category.id}`} className="text-gray-400 hover:text-white">
                                            Categoria {category.id} ({category.count})
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500">Carregando categorias...</li>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold mb-4">Contato</h4>
                        <ul className="space-y-2">
                            <li><a href="mailto:salesmartins.siaw@gmail.com" className="text-gray-400 hover:text-white">Email</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">Suporte</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
                    <p>&copy; 2025 SALES MARTINS. Todos os direitos reservados.</p>
                    <p className="mt-2 text-xs">Esta vitrine utiliza dados do programa de afiliados da Shopee. Shopee é uma marca registrada de seus respectivos proprietários.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;