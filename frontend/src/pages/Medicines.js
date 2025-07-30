import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ItemCard from '../components/ItemCard';
import { getNearbyMedicines } from '../services/medicines';
import { useAuth } from '../context/AuthContext';
import useDeviceDetection from '../hooks/useDeviceDetection';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const { token } = useAuth();
  const { isMobile } = useDeviceDetection();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNearbyMedicines(token);
      setMedicines(data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Failed to load medicines. Please try again.');
    } finally {
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
            Nearby Pharmacist Medicines
          </h1>
          <p style={{ 
            fontSize: isMobile ? 14 : 18, 
            color: '#555', 
            marginBottom: isMobile ? 20 : 32,
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Medicines available from online pharmacists in your area (5km radius)
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
              No medicines available from nearby pharmacists.
            </div>
          ) : (
            <div style={cardsGridStyle}>
              {medicines.map((medicine) => (
                <ItemCard key={medicine._id} item={medicine} type="medicine" pharmacistName={medicine.pharmacistName} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Medicines; 