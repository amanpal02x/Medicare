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
        
        // If no nearby products found, try to fetch all products as fallback
        if (allProducts.length === 0 && allMedicines.length === 0) {
          console.log('No nearby products found, fetching all products as fallback');
          // You can add a fallback API call here to fetch all products
          // For now, we'll just set empty arrays
        }
        
        setProducts(allProducts);
        setMedicines(allMedicines);
        setLoading(false);
      })
      .catch(e => {
        console.error('Error fetching nearby products:', e);
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
        console.log('Location permission denied, using fallback coordinates');
        setLocationError('Location permission denied or unavailable.');
        // Use fallback coordinates (Delhi, India) if location is not available
        const fallbackLat = 28.7041;
        const fallbackLng = 77.1025;
        setLocation({ lat: fallbackLat, lng: fallbackLng });
        fetchNearby(fallbackLat, fallbackLng);
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