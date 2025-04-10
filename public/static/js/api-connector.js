/**
 * API Connector
 * Helper utility to connect to backend APIs with fallback functionality
 */

class ApiConnector {
    constructor(config = {}) {
        this.config = {
            primaryApiUrl: '/api',
            fallbackApiUrls: ['', '/db', '/cached'],
            timeout: 5000,
            ...config
        };
        
        this.cache = {
            data: {},
            timestamp: {}
        };
    }
    
    /**
     * Fetch data from API with fallback options
     * @param {string} endpoint - API endpoint to fetch from
     * @param {object} options - Request options
     * @param {boolean} useCache - Whether to use cached data
     * @param {number} cacheDuration - Duration in ms to keep cache
     */
    async fetch(endpoint, options = {}, useCache = true, cacheDuration = 15 * 60 * 1000) {
        const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
        
        // Return cached data if valid
        if (useCache && 
            this.cache.data[cacheKey] && 
            (Date.now() - this.cache.timestamp[cacheKey] < cacheDuration)) {
            console.log(`Using cached data for ${endpoint}`);
            return this.cache.data[cacheKey];
        }
        
        // Try primary API first
        try {
            const response = await this._tryFetch(`${this.config.primaryApiUrl}${endpoint}`, options);
            this._saveToCache(cacheKey, response);
            return response;
        } catch (primaryError) {
            console.warn(`Primary API failed: ${primaryError.message}`);
            
            // Try fallback APIs
            for (const fallbackUrl of this.config.fallbackApiUrls) {
                try {
                    const response = await this._tryFetch(`${fallbackUrl}${endpoint}`, options);
                    this._saveToCache(cacheKey, response);
                    return response;
                } catch (fallbackError) {
                    console.warn(`Fallback API ${fallbackUrl} failed: ${fallbackError.message}`);
                }
            }
            
            // All APIs failed
            throw new Error(`Failed to fetch from ${endpoint} - all API endpoints failed`);
        }
    }
    
    /**
     * Try to fetch from a specific URL with timeout
     */
    async _tryFetch(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            return await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }
    
    /**
     * Save response to cache
     */
    _saveToCache(key, data) {
        this.cache.data[key] = data;
        this.cache.timestamp[key] = Date.now();
    }
    
    /**
     * Clear all cached data
     */
    clearCache() {
        this.cache = {
            data: {},
            timestamp: {}
        };
    }
}

// Create global instance
window.apiConnector = new ApiConnector();
