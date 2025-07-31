import { useEffect, useState, useCallback } from 'react';
import { getNearbyProductsAndMedicines } from '../services/pharmacist';

export default function usePublicProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');

  const fetchProducts = useCallback(async (lat, lng) => {
    setLoading(true);
    setError('');
    try {
      // For public users, we fetch nearby products using location
      const results = await getNearbyProductsAndMedicines(lat, lng, 5000);
      let allProducts = [];
      for (const entry of results) {
        allProducts = allProducts.concat(entry.products || []);
      }
      setProducts(allProducts);
      setLoading(false);
    } catch (e) {
      setError('Failed to load products for your area.');
      setProducts([]);
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchProducts(latitude, longitude);
      },
      (err) => {
        setLocationError('Location permission denied or unavailable.');
        setLoading(false);
      }
    );
  }, [fetchProducts]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    products,
    loading,
    error,
    locationError,
    refresh,
  };
} 