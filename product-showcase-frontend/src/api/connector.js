// src/api/connector.js

// For Next.js applications, use NEXT_PUBLIC_ prefix instead of REACT_APP_
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

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

export const fetchProductsByCategory = async (categoryId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        throw error;
    }
};