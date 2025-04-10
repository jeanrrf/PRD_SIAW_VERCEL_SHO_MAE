// src/api/connector.js

// Update API base URL to use port 5000
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add connection logging
console.log('🔌 Frontend API connector initialized');
console.log(`🌐 API Base URL: ${API_BASE_URL}`);
console.log(`📡 Frontend attempting to connect to backend at: ${API_BASE_URL}`);

// Add connection state tracking
let isConnected = false;
let connectionCheckPromise = null;

const checkConnection = async () => {
    console.log(`🔍 Checking API connection to: ${API_BASE_URL}/health`);
    if (connectionCheckPromise) return connectionCheckPromise;

    connectionCheckPromise = (async () => {
        try {
            console.log('📤 Sending health check request...');
            const response = await fetch(`${API_BASE_URL}/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
            isConnected = response.ok;
            console.log(`✅ API connection ${isConnected ? 'successful' : 'failed'}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📊 API Health Data:', data);
                console.log(`🔌 Backend is running on port: ${new URL(API_BASE_URL).port || '(default)'}`);
            }
            
            return isConnected;
        } catch (error) {
            console.error('❌ API connection check failed:', error);
            console.error(`❗ Failed to connect to ${API_BASE_URL}/health`);
            isConnected = false;
            return false;
        } finally {
            setTimeout(() => { connectionCheckPromise = null; }, 5000);
        }
    })();

    return connectionCheckPromise;
};

// Add database state tracking with improved logging
let isDatabaseAvailable = false;
let dbCheckPromise = null;

const checkDatabaseAvailability = async () => {
    console.log('🔍 Checking database availability...');
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
            console.log(`💾 Database ${isDatabaseAvailable ? 'is' : 'is NOT'} available`);
            if (data.database_path) {
                console.log(`📁 Database path: ${data.database_path}`);
            }
            return isDatabaseAvailable;
        } catch (error) {
            console.error('❌ Database check failed:', error);
            isDatabaseAvailable = false;
            return false;
        } finally {
            setTimeout(() => { dbCheckPromise = null; }, 5000);
        }
    })();

    return dbCheckPromise;
};

// Add retry wrapper with enhanced logging
const fetchWithRetry = async (url, options = {}, retries = 3) => {
    console.log(`🔄 Fetching with retry: ${url}`);
    let lastError;
    
    for (let i = 0; i < retries; i++) {
        try {
            if (i > 0) {
                console.log(`⚠️ Retry attempt ${i+1}/${retries} for: ${url}`);
            }
            
            // Check both API and database connectivity
            if (!isConnected || !isDatabaseAvailable) {
                console.log('🔌 Connection check required before request');
                await Promise.all([checkConnection(), checkDatabaseAvailability()]);
                if (!isConnected) {
                    throw new Error('API indisponível');
                }
                if (!isDatabaseAvailable) {
                    throw new Error('Banco de dados indisponível');
                }
            }

            console.log(`📤 Sending request to: ${url}`);
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

            console.log(`✅ Request successful: ${url}`);
            return response;
        } catch (error) {
            console.error(`❌ Request failed (attempt ${i+1}/${retries}):`, error);
            lastError = error;
            if (i === retries - 1) break;
            
            // Exponential backoff
            const backoffTime = Math.min(1000 * Math.pow(2, i), 5000);
            console.log(`⏱️ Backing off for ${backoffTime}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
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
        const response = await fetchWithRetry(`${API_BASE_URL}/products/showcase`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao carregar produtos em destaque');
        }

        return data.products || [];
    } catch (error) {
        console.error('Error fetching showcase products:', error);
        throw new Error('Falha ao carregar produtos em destaque. Por favor, verifique a conexão.');
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