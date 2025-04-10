import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import Layout from './components/Layout';

// Add future flags configuration
const routerOptions = {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true
    }
};

const App = () => {
    return (
        <BrowserRouter {...routerOptions}>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/category/:id" element={<CategoryPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;