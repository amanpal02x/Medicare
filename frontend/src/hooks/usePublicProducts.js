import { useEffect, useState, useCallback } from 'react';
import { getAllProducts } from '../services/products';

export default function usePublicProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // For public users, we fetch all products without authentication
      // We'll pass null as pharmacistId to get all products
      const allProducts = await getAllProducts(null);
      setProducts(allProducts);
      setLoading(false);
    } catch (e) {
      setError('Failed to load products.');
      setProducts([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refresh: fetchProducts,
  };
} 