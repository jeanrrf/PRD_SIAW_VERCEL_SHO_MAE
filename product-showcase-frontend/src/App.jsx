import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

// Import only essential CSS
import 'react-loading-skeleton/dist/skeleton.css';

// Configuração otimizada do roteador
const App = () => {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/category/:categoryId" element={<CategoryPage />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;