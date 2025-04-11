import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchShowcaseProducts } from '../api/connector';

// Hook otimizado que pode substituir o ProductContext
const useProducts = (options = {}) => {
    const { 
        categoryId = null, 
        limit = null, 
        useShowcase = false,
        filters = {}
    } = options;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isUsingFallback, setIsUsingFallback] = useState(false);
    
    // Função de carregamento memoizada para evitar re-renders desnecessários
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            let data;
            if (useShowcase) {
                data = await fetchShowcaseProducts(limit || 24);
                setProducts(data || []);
                setTotalProducts(data?.length || 0);
                // Não temos status de fallback diretamente do fetchShowcaseProducts,
                // então precisamos inferir baseado em características conhecidas
                setIsUsingFallback(data && data.length > 0 && data[0]?.id && 
                    typeof data[0].id === 'string' && data[0].id.startsWith('fb'));
            } else {
                data = await fetchProducts(categoryId, 1, filters);
                setProducts(data.products || []);
                setTotalProducts(data.total || 0);
                setIsUsingFallback(!!data.isUsingFallback);
            }
        } catch (err) {
            console.error('Erro ao carregar produtos:', err);
            setError(err.message || 'Falha ao carregar produtos');
            setProducts([]);
            setTotalProducts(0);
            setIsUsingFallback(true); // Se houver erro, provavelmente estamos usando fallback
        } finally {
            setLoading(false);
        }
    }, [categoryId, limit, useShowcase, filters]);

    // Carregar produtos quando as dependências mudarem
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Configurar verificação periódica para tentar recuperar dos dados de fallback
    useEffect(() => {
        // Se estamos usando dados de fallback, tentar reconectar periodicamente
        let reconnectInterval;
        
        if (isUsingFallback) {
            // Tentar reconectar a cada 30 segundos
            reconnectInterval = setInterval(() => {
                loadProducts();
            }, 30000); // 30 segundos
        }
        
        return () => {
            if (reconnectInterval) clearInterval(reconnectInterval);
        };
    }, [isUsingFallback, loadProducts]);

    // Função para forçar recarga de produtos
    const refreshProducts = () => {
        loadProducts();
    };

    return { 
        products, 
        loading, 
        error, 
        totalProducts,
        refreshProducts,
        isUsingFallback
    };
};

export default useProducts;