// src/api/connector.js

// Update API_BASE_URL to use port 8001 to match the backend server port
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';

export const fetchProducts = async (categoryId = null, page = 1, filters = {}) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '24',
            ...(categoryId && { category: categoryId }),
            ...(filters.sort && { sort: filters.sort }),
            ...(filters.priceRange && { price_range: filters.priceRange }),
            ...(filters.searchTerm && { search: filters.searchTerm })
        });

        const response = await fetch(`${API_BASE_URL}/products?${params}`);
        const data = await response.json();

        if (!response.ok) {
            console.error('API Error Response:', data);
            throw new Error(data.detail || 'Erro ao carregar produtos');
        }

        // Validate response structure
        if (!Array.isArray(data.products)) {
            console.error('Invalid API Response:', data);
            throw new Error('Formato de resposta inválido');
        }

        return {
            products: data.products,
            hasMore: data.products.length === 24,
            total: data.total || 0
        };
    } catch (error) {
        console.error('Error in fetchProducts:', error);
        throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
};

export const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const checkApiHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
            throw new Error('API health check failed');
        }
        return await response.json();
    } catch (error) {
        console.error('API health check error:', error);
        throw error;
    }
};

export const fetchShowcaseProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/showcase`);
        
        // Log response details for debugging
        console.log('Showcase API Response:', {
            status: response.status,
            statusText: response.statusText
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                detail: 'Erro no servidor'
            }));
            
            console.error('Showcase API Error:', {
                status: response.status,
                data: errorData
            });
            
            throw new Error(errorData.detail || 'Erro ao carregar produtos em destaque');
        }

        const data = await response.json();

        // Validate response structure
        if (!data || !Array.isArray(data.products)) {
            console.error('Invalid Showcase API Response:', data);
            throw new Error('Formato de resposta inválido');
        }

        return data.products;
        
    } catch (error) {
        console.error('Error in fetchShowcaseProducts:', error);
        // Provide more descriptive error message
        throw new Error(
            error.message || 
            'Não foi possível carregar os produtos em destaque. Por favor, tente novamente mais tarde.'
        );
    }
};

// Add caching for database checks
let dbCheckCache = null;
let lastCheckTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const checkDatabaseConnection = async () => {
    const now = Date.now();
    if (dbCheckCache && (now - lastCheckTime < CACHE_DURATION)) {
        return dbCheckCache;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/debug/database`);
        const data = await response.json();
        dbCheckCache = data;
        lastCheckTime = now;
        return data;
    } catch (error) {
        console.error('Database check failed:', error);
        throw error;
    }
};