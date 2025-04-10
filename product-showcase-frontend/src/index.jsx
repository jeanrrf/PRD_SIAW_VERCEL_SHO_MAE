import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/theme.css'; // Import theme first
import './styles/global.css';
import 'react-loading-skeleton/dist/skeleton.css';

// Update global API URL to use port 3000 where the backend is running
window.REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

console.log('🔌 Frontend running on port 5000');
console.log(`🌐 Connecting to backend API at: ${window.REACT_APP_API_URL}`);

// Update fetch timeout
const originalFetch = window.fetch;
window.fetch = async (resource, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, options.timeout || 10000); // Reduced timeout to 10 seconds
    
    try {
        const response = await originalFetch(resource, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Timeout: A requisição demorou muito para responder');
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);