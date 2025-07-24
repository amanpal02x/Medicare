import { useEffect, useState, useCallback } from 'react';
import { getNearbyProductsAndMedicines } from '../services/pharmacist';

export default function useNearbyProductsAndMedicines(options = {}) {
  const [products, setProducts] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [location, setLocation] = useState(null);

  const fetchNearby = useCallback((lat, lng) => {
    setLoading(true);
    setError('');
    getNearbyProductsAndMedicines(lat, lng, options.maxDistance || 5000)
      .then(results => {
        let allProducts = [];
        let allMedicines = [];
        for (const entry of results) {
          allProducts = allProducts.concat(entry.products || []);
          allMedicines = allMedicines.concat(entry.medicines || []);
        }
        setProducts(allProducts);
        setMedicines(allMedicines);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to load products/medicines for your area.');
        setProducts([]);
        setMedicines([]);
        setLoading(false);
      });
  }, [options.maxDistance]);

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
        setLocation({ lat: latitude, lng: longitude });
        fetchNearby(latitude, longitude);
      },
      (err) => {
        setLocationError('Location permission denied or unavailable.');
        setLoading(false);
      }
    );
  }, [fetchNearby]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    products,
    medicines,
    loading,
    error,
    locationError,
    location,
    refresh,
  };
} 