import React, { useState, useEffect } from 'react';

const FallbackIndicator = ({ isUsingFallback }) => {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    
    // Only show the indicator after a short delay to avoid flickering
    useEffect(() => {
        if (isUsingFallback && !dismissed) {
            const timer = setTimeout(() => setVisible(true), 500);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [isUsingFallback, dismissed]);
    
    if (!visible) return null;
    
    return (
        <div className="fallback-indicator">
            <div className="fallback-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Exibindo dados armazenados em cache. Tentando reconectar ao servidor...</span>
                <button onClick={() => setDismissed(true)}>×</button>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .fallback-indicator {
                    position: fixed;
                    bottom: 16px;
                    left: 50%;
                    transform: translateX(-50%);
                    max-width: 90%;
                    width: 450px;
                    z-index: 9999;
                    animation: slide-up 0.3s ease-out;
                }
                
                .fallback-content {
                    background-color: #fff8e1;
                    border-left: 4px solid #ffc107;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #664d03;
                    font-size: 14px;
                }
                
                .fallback-content svg {
                    flex-shrink: 0;
                    color: #ffc107;
                }
                
                .fallback-content button {
                    margin-left: auto;
                    background: transparent;
                    border: none;
                    color: #664d03;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                @keyframes slide-up {
                    from {
                        transform: translate(-50%, 100%);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, 0);
                        opacity: 1;
                    }
                }
            `}} />
        </div>
    );
};

export default FallbackIndicator;