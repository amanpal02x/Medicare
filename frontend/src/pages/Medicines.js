import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ItemCard from '../components/ItemCard';
import { getAllMedicines, getMedicinesByPharmacist } from '../services/medicines';
import { useNavigate } from 'react-router-dom';
import { getShuffledItems } from '../utils/shuffleUtils';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pharmacists, setPharmacists] = useState([]);
  const [locationError, setLocationError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    setLocationError('');
    // Get user location
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Fetch nearby online pharmacists (within 5km)
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api'}/pharmacist/nearby?lat=${latitude}&lng=${longitude}`);
        if (!res.ok) throw new Error('Failed to fetch nearby pharmacists');
        const pharmacists = await res.json();
        setPharmacists(pharmacists);
        if (pharmacists.length === 0) {
          setMedicines([]);
          setError('No pharmacist is currently online in your area.');
          setLoading(false);
          return;
        }
        // Fetch medicines for all nearby pharmacists
        let allMedicines = [];
        for (const pharmacist of pharmacists) {
          try {
            const meds = await getMedicinesByPharmacist(pharmacist._id, latitude, longitude);
            allMedicines = allMedicines.concat(meds.map(m => ({ ...m, pharmacistName: pharmacist.pharmacyName || pharmacist.user?.name || 'Pharmacist' })));
          } catch {}
        }
        setMedicines(allMedicines);
        setLoading(false);
      } catch (e) {
        setError('Failed to load medicines for your area.');
        setMedicines([]);
        setLoading(false);
      }
    }, (err) => {
      setLocationError('Location permission denied or unavailable.');
      setLoading(false);
    });
  }, []);

  const sectionStyle = {
    maxWidth: 1300,
    margin: '40px auto',
    padding: '0 16px',
  };

  const cardsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 24,
    paddingBottom: 8,
  };

  return (
    <>
      <Header />
      <div style={{ background: 'linear-gradient(120deg, #e3e0ff 0%, #b8d0f6 100%)', minHeight: '100vh', padding: '40px 0' }}>
        <div style={sectionStyle}>
          <h1 style={{ fontWeight: 700, fontSize: 36, marginBottom: 8, color: '#19b6c9' }}>Nearby Pharmacist Medicines</h1>
          <p style={{ fontSize: 18, color: '#555', marginBottom: 32 }}>Medicines available from online pharmacists in your area (5km radius)</p>
          {locationError && <div style={{ color: '#e53935', marginBottom: 16 }}>{locationError}</div>}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#666' }}>Loading medicines...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#e53935' }}>{error}</div>
          ) : medicines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#666' }}>No medicines available from nearby pharmacists.</div>
          ) : (
            <div style={cardsGridStyle}>
              {getShuffledItems(medicines).map((medicine) => (
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