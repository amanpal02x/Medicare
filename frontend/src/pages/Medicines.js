import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ItemCard from '../components/ItemCard';
import { getAllMedicines, getNearbyMedicines } from '../services/medicines';
import { useAuth } from '../context/AuthContext';
import useDeviceDetection from '../hooks/useDeviceDetection';
import { getShuffledItems } from '../utils/shuffleUtils';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const { user, token } = useAuth();
  const { isMobile } = useDeviceDetection();

  useEffect(() => {
    fetchMedicines();
  }, [user]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      setLocationError(null);

      // If user is a pharmacist, get their own medicines
      if (user && user.role === 'pharmacist' && token) {
        const data = await getAllMedicines();
        setMedicines(data);
        setLoading(false);
        return;
      }

      // For public users, get medicines from nearby pharmacists
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser. Please enable location access to find nearby medicines.');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const data = await getNearbyMedicines(latitude, longitude);
          setMedicines(data);
          if (data.length === 0) {
            setError('No medicines available from pharmacists in your area. Please try expanding your search area or contact support.');
          }
        } catch (err) {
          console.error('Error fetching nearby medicines:', err);
          setError('Failed to load medicines for your area. Please try again or contact support.');
        } finally {
          setLoading(false);
        }
      }, (err) => {
        setLocationError('Location permission denied or unavailable. Please enable location access to find nearby medicines.');
        setLoading(false);
      });

    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Failed to load medicines. Please try again.');
      setLoading(false);
    }
  };

  const sectionStyle = {
    maxWidth: 1300,
    margin: isMobile ? '24px auto' : '40px auto',
    padding: isMobile ? '0 12px' : '0 16px',
  };

  const cardsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: isMobile ? 12 : 24,
    paddingBottom: 8,
  };

  return (
    <>
      <Header />
      <div style={{ background: 'linear-gradient(120deg, #e3e0ff 0%, #b8d0f6 100%)', minHeight: '100vh', padding: isMobile ? '20px 0' : '40px 0' }}>
        <div style={sectionStyle}>
          <h1 style={{ 
            fontWeight: 700, 
            fontSize: isMobile ? 24 : 36, 
            marginBottom: isMobile ? 6 : 8, 
            color: '#19b6c9',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Available Medicines
          </h1>
          <p style={{ 
            fontSize: isMobile ? 14 : 18, 
            color: '#555', 
            marginBottom: isMobile ? 20 : 32,
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Browse medicines available from our network of pharmacists
          </p>
          {locationError && <div style={{ color: '#e53935', marginBottom: 16 }}>{locationError}</div>}
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? 40 : 60, 
              fontSize: isMobile ? 16 : 18, 
              color: '#666' 
            }}>
              Loading medicines...
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? 40 : 60, 
              fontSize: isMobile ? 16 : 18, 
              color: '#e53935' 
            }}>
              {error}
            </div>
          ) : medicines.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? 40 : 60, 
              fontSize: isMobile ? 16 : 18, 
              color: '#666' 
            }}>
              No medicines available at the moment.
            </div>
          ) : (
            <div style={cardsGridStyle}>
              {getShuffledItems(medicines).map((medicine) => (
                <ItemCard key={medicine._id} item={medicine} type="medicine" />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Medicines; 