/**
 * Simplified utilities for vitrine.js
 */

// Format currency in Brazilian format
function formatCurrency(value) {
    if (!value) return 'Preço indisponível';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(parseFloat(value));
}

// Calculate discount percentage
function calculateDiscount(originalPrice, currentPrice) {
    if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

// Simple DOM utilities
const dom = {
    show: (element) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.style.display = 'block';
        }
    },

    hide: (element) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.style.display = 'none';
        }
    },

    toggle: (element, show) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }
};

// Simple toast notifications
function showToast(message, type = 'info') {
    alert(message); // Simplified version - just use an alert
}
