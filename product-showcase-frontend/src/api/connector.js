// src/api/connector.js

// Update API base URL to use port 5000
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add connection state tracking
let isConnected = false;
let connectionCheckPromise = null;

const checkConnection = async () => {
    if (connectionCheckPromise) return connectionCheckPromise;

    connectionCheckPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
            isConnected = response.ok;
            return isConnected;
        } catch (error) {
            console.error('API connection check failed:', error);
            isConnected = false;
            return false;
        } finally {
            setTimeout(() => { connectionCheckPromise = null; }, 5000);
        }
    })();

    return connectionCheckPromise;
};

// Add database state tracking
let isDatabaseAvailable = false;
let dbCheckPromise = null;

const checkDatabaseAvailability = async () => {
    if (dbCheckPromise) return dbCheckPromise;

    dbCheckPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                timeout: 5000
            });
            
            const data = await response.json();
            isDatabaseAvailable = data.database_status === 'connected';
            return isDatabaseAvailable;
        } catch (error) {
            console.error('Database check failed:', error);
            isDatabaseAvailable = false;
            return false;
        } finally {
            setTimeout(() => { dbCheckPromise = null; }, 5000);
        }
    })();

    return dbCheckPromise;
};

// Add retry wrapper
const fetchWithRetry = async (url, options = {}, retries = 3) => {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
        try {
            // Check both API and database connectivity
            if (!isConnected || !isDatabaseAvailable) {
                await Promise.all([checkConnection(), checkDatabaseAvailability()]);
                if (!isConnected) {
                    throw new Error('API indisponível');
                }
                if (!isDatabaseAvailable) {
                    throw new Error('Banco de dados indisponível');
                }
            }

            const response = await fetch(url, {
                ...options,
                headers: {
                    'Accept': 'application/json',
                    ...options.headers
                },
                timeout: 5000
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
        } catch (error) {
            lastError = error;
            if (i === retries - 1) break;
            
            // Exponential backoff
            await new Promise(resolve => 
                setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 5000))
            );
        }
    }
    
    throw lastError;
};

// Update existing fetch functions to use retry wrapper
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
    return fetchWithRetry(`${API_BASE_URL}/categories`).then(res => res.json());
};

// Update fetchCategoryCounts to use new fetch wrapper
export const fetchCategoryCounts = async () => {
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/categories/counts`);
        const data = await response.json();
        return data.counts || {};
    } catch (error) {
        console.error('Error fetching category counts:', error);
        throw new Error('Falha ao conectar com o servidor. Verifique sua conexão e tente novamente.');
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

// Update checkDatabaseConnection
export const checkDatabaseConnection = async () => {
    if (!await checkDatabaseAvailability()) {
        throw new Error('Banco de dados indisponível');
    }
    
    const now = Date.now();
    if (dbCheckCache && (now - lastCheckTime < CACHE_DURATION)) {
        return dbCheckCache;
    }

    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/debug/database`);
        const data = await response.json();
        
        if (!data.database_exists) {
            throw new Error('Banco de dados não encontrado');
        }
        
        dbCheckCache = data;
        lastCheckTime = now;
        return data;
    } catch (error) {
        console.error('Database check failed:', error);
        throw new Error('Não foi possível verificar a conexão com o banco de dados.');
    }
};