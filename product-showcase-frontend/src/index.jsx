import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// API URL configuration
window.REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Timeout wrapper para o fetch global
const originalFetch = window.fetch;
window.fetch = async (resource, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, options.timeout || 8000); // Reduzindo o timeout para 8 segundos
  
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

// Renderização da aplicação
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);