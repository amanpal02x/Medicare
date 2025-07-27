import { useState, useEffect } from 'react';
import { getCurrentLocationPincode } from '../utils/locationUtils';

export const useLocationPincode = () => {
  const [pincode, setPincode] = useState('110002');
  const [loading, setLoading] = useState(true);

  const updatePincode = async () => {
    try {
      setLoading(true);
      const newPincode = await getCurrentLocationPincode();
      setPincode(newPincode);
    } catch (error) {
      console.error('Error updating pincode:', error);
      // Keep current pincode on error
    } finally {
      setLoading(false);
    }
  };

  // Listen for storage changes (when user updates location in Header)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'deliveryPincode' && e.newValue) {
        setPincode(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = (e) => {
      if (e.detail && e.detail.key === 'deliveryPincode') {
        setPincode(e.detail.value);
      }
    };
    
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  // Initial pincode fetch
  useEffect(() => {
    updatePincode();
  }, []);

  return { pincode, loading, updatePincode };
}; 