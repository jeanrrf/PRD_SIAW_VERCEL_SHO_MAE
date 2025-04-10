// src/api/connector.js

// Update API_BASE_URL to use port 8001 to match the backend server port
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';

export const fetchProducts = async (categoryId = null, page = 1, limit = 24) => {
    try {
        const categoryParam = categoryId ? `&category=${categoryId}` : '';
        const response = await fetch(
            `${API_BASE_URL}/products?page=${page}&limit=${limit}${categoryParam}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        return data;
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
        const response = await fetch(`${API_BASE_URL}/products`);
        
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
        // Return empty array instead of throwing to prevent UI crashes
        return [];
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