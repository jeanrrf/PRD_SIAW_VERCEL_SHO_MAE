// src/api/connector.js

// Change the port from 8000 to 5000 to match the API_BASE_URL in config.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const fetchProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
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
        console.log(`Fetching products from: ${API_BASE_URL}/products`);
        
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${API_BASE_URL}/products`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${response.status}): ${errorText}`);
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Check if we have data in the expected format
        if (!data || !Array.isArray(data.products)) {
            console.warn('API response missing products array:', data);
            return [];
        }
        
        return data.products || [];
    } catch (error) {
        console.error('Error fetching showcase products:', error);
        
        // Return empty array instead of throwing to prevent component crashes
        return [];
    }
};

// Add a fetch with retry helper function
export const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
    try {
        return await fetch(url, options);
    } catch (err) {
        if (retries === 0) {
            throw err;
        }
        
        console.log(`Retrying fetch to ${url} in ${backoff}ms. Retries left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
};

// Update fetchProductsByCategory to use retry mechanism
export const fetchProductsByCategory = async (categoryId) => {
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/products/category/${categoryId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        return []; // Return empty array instead of throwing
    }
};

// Add a debug function to check database connection
export const checkDatabaseConnection = async () => {
    try {
        console.log(`Checking database connection: ${API_BASE_URL}/debug/database`);
        const response = await fetch(`${API_BASE_URL}/debug/database`);
        
        if (!response.ok) {
            throw new Error(`API Error ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Database check result:', data);
        return data;
    } catch (error) {
        console.error('Error checking database:', error);
        return {
            status: 'error',
            error: error.message
        };
    }
};