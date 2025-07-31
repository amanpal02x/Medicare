import { useEffect, useState, useCallback } from 'react';
import { getNearbyProductsAndMedicines } from '../services/pharmacist';
import { getAllProducts } from '../services/products';
import { getAllMedicines } from '../services/medicines';

export default function useNearbyProductsAndMedicines(options = {}) {
  const [products, setProducts] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [location, setLocation] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchNearby = useCallback((lat, lng) => {
    setLoading(true);
    setError('');
    setUsingFallback(false);
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
        console.error('Failed to fetch nearby products:', e);
        setError('Failed to load products/medicines for your area.');
        setProducts([]);
        setMedicines([]);
        setLoading(false);
      });
  }, [options.maxDistance]);

  // Fallback function to fetch all products when location is not available
  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    setUsingFallback(true);
    try {
      console.log('Using fallback: fetching all products and medicines');
      const [allProducts, allMedicines] = await Promise.all([
        getAllProducts(),
        getAllMedicines()
      ]);
      console.log('Fallback results:', {
        productsCount: allProducts?.length || 0,
        medicinesCount: allMedicines?.length || 0
      });
      setProducts(allProducts || []);
      setMedicines(allMedicines || []);
      setLoading(false);
    } catch (e) {
      console.error('Failed to fetch all products:', e);
      setError('Failed to load products/medicines.');
      setProducts([]);
      setMedicines([]);
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      fetchAllProducts();
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
        console.log('Location permission denied, using fallback:', err);
        setLocationError('Location permission denied or unavailable. Showing all available products.');
        fetchAllProducts();
      }
    );
  }, [fetchNearby, fetchAllProducts]);

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
    usingFallback,
    refresh,
  };
} 