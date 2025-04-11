// src/api/connector.js

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Dados de fallback para quando a API não estiver disponível
const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Eletrônicos', product_count: 120 },
  { id: '2', name: 'Moda', product_count: 85 },
  { id: '3', name: 'Casa & Decoração', product_count: 67 },
  { id: '4', name: 'Beleza & Saúde', product_count: 53 },
  { id: '5', name: 'Esportes', product_count: 42 },
  { id: '6', name: 'Livros', product_count: 38 },
  { id: '7', name: 'Brinquedos', product_count: 31 },
  { id: '8', name: 'Alimentos', product_count: 25 },
  { id: 'all', name: 'Todos os Produtos', product_count: 461 }
];

const FALLBACK_PRODUCTS = [
  { 
    id: 'fb1', 
    product_name: 'Smartphone Avançado XYZ', 
    price: 1299.90, 
    image_url: 'https://via.placeholder.com/300x300?text=Smartphone',
    rating_star: 4.5,
    shop_name: 'Tech Store',
    offer_link: 'https://shopee.com.br'
  },
  { 
    id: 'fb2', 
    product_name: 'Fone de Ouvido Sem Fio', 
    price: 199.90, 
    image_url: 'https://via.placeholder.com/300x300?text=Fone',
    rating_star: 4.2,
    shop_name: 'Audio Shop',
    offer_link: 'https://shopee.com.br'
  },
  { 
    id: 'fb3', 
    product_name: 'Notebook Ultrafino 15"', 
    price: 3499.90, 
    image_url: 'https://via.placeholder.com/300x300?text=Notebook',
    rating_star: 4.7,
    shop_name: 'Informática Plus',
    offer_link: 'https://shopee.com.br'
  },
  { 
    id: 'fb4', 
    product_name: 'Câmera Digital Profissional', 
    price: 2199.90, 
    image_url: 'https://via.placeholder.com/300x300?text=Camera',
    rating_star: 4.6,
    shop_name: 'Foto & Vídeo',
    offer_link: 'https://shopee.com.br'
  }
];

// Cache para requisições recentes
const requestCache = new Map();
const CACHE_DURATION = 120 * 1000; // 2 minutos de cache (aumentado para reduzir tentativas frequentes)

// Estado de conectividade
let isConnected = true; // Assume connected initially to avoid immediate fallback
let isDatabaseAvailable = true;
let connectionFailures = 0;
const MAX_FAILURES = 2; // Reduzido para 2 falhas para usar fallback mais rapidamente
let lastConnectionAttempt = 0;
const CONNECTION_ATTEMPT_THRESHOLD = 10000; // 10 segundos entre verificações de conexão

// Função otimizada para verificar conexão
const checkConnection = async () => {
    // Evita verificações excessivas em curto período
    const now = Date.now();
    if (now - lastConnectionAttempt < CONNECTION_ATTEMPT_THRESHOLD) {
        return isConnected;
    }
    
    lastConnectionAttempt = now;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            isConnected = true;
            isDatabaseAvailable = data.database_status === 'connected';
            connectionFailures = 0; // Reseta contador em caso de sucesso
        } else {
            connectionFailures++;
            console.warn(`API Health check failed with status: ${response.status}`);
        }
        
        return isConnected;
    } catch (error) {
        // Não registra erros de timeout ou abort no console para reduzir ruído
        if (error.name !== 'AbortError') {
            console.warn('API Health check failed silently, using fallback data');
        }
        
        connectionFailures++;
        isConnected = false;
        return false;
    }
};

// Verificar se deve usar dados de fallback
const shouldUseFallback = () => {
    return connectionFailures >= MAX_FAILURES || !isConnected;
};

// Cache simplificado
const getCacheKey = (url, options = {}) => {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
};

// Verificar cache com suporte para resposta negativa cacheada
const getFromCache = (cacheKey) => {
    if (requestCache.has(cacheKey)) {
        const { data, timestamp, isFallback } = requestCache.get(cacheKey);
        
        // Se estamos usando dados de fallback, podemos manter o cache por mais tempo
        const cacheDuration = isFallback ? CACHE_DURATION * 3 : CACHE_DURATION;
        
        if (Date.now() - timestamp < cacheDuration) {
            return { data, isFallback };
        }
        
        requestCache.delete(cacheKey);
    }
    return null;
};

// Fetch otimizado com retry e supressão de erro de console
const fetchWithRetry = async (url, options = {}, retries = 1, useCache = true) => {
    const cacheKey = getCacheKey(url, options);
    
    // Tenta recuperar do cache primeiro
    if (useCache) {
        const cachedResult = getFromCache(cacheKey);
        if (cachedResult) {
            return cachedResult.data;
        }
    }
    
    // Verifica conexão se necessário
    if (connectionFailures > 0) {
        await checkConnection();
        
        // Se ainda deve usar fallback após a verificação, lança um erro silencioso
        if (shouldUseFallback()) {
            throw new Error('Using fallback due to connection issues');
        }
    }
    
    let lastError;
    
    for (let i = 0; i <= retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Accept': 'application/json',
                    ...options.headers
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Resetar contador de falhas em caso de sucesso
            connectionFailures = 0;
            
            // Cache do resultado
            if (useCache) {
                requestCache.set(cacheKey, {
                    data,
                    timestamp: Date.now(),
                    isFallback: false
                });
            }
            
            return data;
        } catch (error) {
            lastError = error;
            connectionFailures++;
            
            // Se for o último retry, não espera e sai do loop
            if (i === retries) break;
            
            // Implementa backoff exponencial limitado
            const backoffTime = Math.min(1000 * Math.pow(2, i), 3000);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
    }
    
    // Usar fallback e cache negativo
    return Promise.reject(lastError);
};

// Limpar cache periodicamente para evitar consumo de memória
setInterval(() => {
    const now = Date.now();
    let count = 0;
    
    for (const [key, { timestamp, isFallback }] of requestCache.entries()) {
        // Tempo de expiração dinâmico baseado no tipo de cache
        const expirationTime = isFallback ? CACHE_DURATION * 3 : CACHE_DURATION;
        
        if (now - timestamp > expirationTime) {
            requestCache.delete(key);
            count++;
        }
    }
    
    // Se muitas entradas foram limpas, registra isso (útil para debug)
    if (count > 10) {
        console.debug(`Cache limpeza: ${count} entradas removidas`);
    }
}, CACHE_DURATION);

// API functions
export const fetchProducts = async (categoryId = null, page = 1, filters = {}) => {
    try {
        // Se várias falhas consecutivas, retorna dados de fallback imediatamente
        if (shouldUseFallback()) {
            // Cache negativo para evitar tentativas repetidas
            const cacheKey = getCacheKey(`${API_BASE_URL}/products?fallback=true`);
            requestCache.set(cacheKey, {
                data: {
                    products: FALLBACK_PRODUCTS,
                    total: FALLBACK_PRODUCTS.length,
                    isUsingFallback: true
                },
                timestamp: Date.now(),
                isFallback: true
            });
            
            return {
                products: FALLBACK_PRODUCTS,
                total: FALLBACK_PRODUCTS.length,
                isUsingFallback: true
            };
        }

        const params = new URLSearchParams({
            page: page.toString(),
            limit: '40', // Limitado a 40 por página para melhor desempenho
            ...(categoryId && { category: categoryId }),
            ...(filters.sort && { sort: filters.sort }),
            ...(filters.priceRange && { price_range: filters.priceRange }),
            ...(filters.searchTerm && { search: filters.searchTerm })
        });
        
        const url = `${API_BASE_URL}/products?${params}`;
        const data = await fetchWithRetry(url, {}, 1, true);
        
        return {
            products: data.products || [],
            total: data.total || 0,
            isUsingFallback: false
        };
    } catch (error) {
        // Não loga o erro no console para reduzir ruído
        // Cache negativo para evitar tentativas repetidas
        const cacheKey = getCacheKey(`${API_BASE_URL}/products?fallback=true`);
        requestCache.set(cacheKey, {
            data: {
                products: FALLBACK_PRODUCTS,
                total: FALLBACK_PRODUCTS.length,
                isUsingFallback: true
            },
            timestamp: Date.now(),
            isFallback: true
        });
        
        return {
            products: FALLBACK_PRODUCTS,
            total: FALLBACK_PRODUCTS.length,
            isUsingFallback: true
        };
    }
};

export const fetchCategories = async () => {
    try {
        // Se várias falhas consecutivas, retorna categorias de fallback imediatamente
        if (shouldUseFallback()) {
            // Cache negativo para evitar tentativas repetidas
            const cacheKey = getCacheKey(`${API_BASE_URL}/categories?fallback=true`);
            requestCache.set(cacheKey, {
                data: FALLBACK_CATEGORIES,
                timestamp: Date.now(),
                isFallback: true
            });
            
            return FALLBACK_CATEGORIES;
        }

        const data = await fetchWithRetry(`${API_BASE_URL}/categories`, { method: 'GET' }, 1, true);
        return data || [];
    } catch (error) {
        // Cache negativo para evitar tentativas repetidas
        const cacheKey = getCacheKey(`${API_BASE_URL}/categories?fallback=true`);
        requestCache.set(cacheKey, {
            data: FALLBACK_CATEGORIES,
            timestamp: Date.now(),
            isFallback: true
        });
        
        return FALLBACK_CATEGORIES; // Retorna categorias de fallback em caso de erro
    }
};

export const fetchCategoryCounts = async () => {
    try {
        if (shouldUseFallback()) {
            const counts = {};
            FALLBACK_CATEGORIES.forEach(cat => {
                counts[cat.id] = cat.product_count;
            });
            
            // Cache negativo para evitar tentativas repetidas
            const cacheKey = getCacheKey(`${API_BASE_URL}/categories/counts?fallback=true`);
            requestCache.set(cacheKey, {
                data: counts,
                timestamp: Date.now(),
                isFallback: true
            });
            
            return counts;
        }

        const data = await fetchWithRetry(`${API_BASE_URL}/categories/counts`, {}, 1, true);
        return data.counts || {};
    } catch (error) {
        // Preparar dados de fallback
        const counts = {};
        FALLBACK_CATEGORIES.forEach(cat => {
            counts[cat.id] = cat.product_count;
        });
        
        // Cache negativo para evitar tentativas repetidas
        const cacheKey = getCacheKey(`${API_BASE_URL}/categories/counts?fallback=true`);
        requestCache.set(cacheKey, {
            data: counts,
            timestamp: Date.now(),
            isFallback: true
        });
        
        return counts;
    }
};

export const fetchShowcaseProducts = async (limit = 12) => {
    try {
        if (shouldUseFallback()) {
            // Cache negativo para evitar tentativas repetidas
            const cacheKey = getCacheKey(`${API_BASE_URL}/products/showcase?fallback=true`);
            requestCache.set(cacheKey, {
                data: FALLBACK_PRODUCTS,
                timestamp: Date.now(),
                isFallback: true
            });
            
            return FALLBACK_PRODUCTS;
        }

        const data = await fetchWithRetry(`${API_BASE_URL}/products/showcase?limit=${limit}`, { method: 'GET' }, 1, true);
        return data.products || [];
    } catch (error) {
        // Cache negativo para evitar tentativas repetidas
        const cacheKey = getCacheKey(`${API_BASE_URL}/products/showcase?fallback=true`);
        requestCache.set(cacheKey, {
            data: FALLBACK_PRODUCTS,
            timestamp: Date.now(),
            isFallback: true
        });
        
        return FALLBACK_PRODUCTS;
    }
};