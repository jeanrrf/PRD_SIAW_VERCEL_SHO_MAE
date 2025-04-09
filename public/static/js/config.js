/**
 * Configuração da aplicação
 * Detecta o ambiente automaticamente e fornece as URLs corretas
 */

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const config = {
    // Em desenvolvimento, poderia usar localhost:port específico, em produção usa caminhos relativos
    apiBaseUrl: isDevelopment ? 'http://localhost:8001' : '',
    apiEndpoints: {
        products: '/api/products',
        categories: '/api/categories',
        search: '/api/search',
        trending: '/api/trending',
    },
    // Outras configurações gerais da aplicação
    maxProductsPerPage: 20,
    defaultSortOrder: 'recent'
};

export default config;
