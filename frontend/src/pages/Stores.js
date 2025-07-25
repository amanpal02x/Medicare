import React, { useEffect, useState, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';

const socket = io('https://medicare-v.vercel.app/');

const Stores = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const mapRef = useRef();

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setUserLocation([19.0760, 72.8777]); // Default to Mumbai
      }
    );
  }, []);

  // Fetch nearby stores from backend
  useEffect(() => {
    if (!userLocation) return;
    fetch(`/api/pharmacist/nearby?lat=${userLocation[0]}&lng=${userLocation[1]}`)
      .then(res => res.json())
      .then(data => setStores(data));
  }, [userLocation]);

  // Real-time updates
  useEffect(() => {
    socket.on('pharmacist-location-update', (data) => {
      setStores((prevStores) => {
        // Update or add the pharmacist in the list
        const idx = prevStores.findIndex(s => s._id === data.pharmacistId);
        if (idx !== -1) {
          const updated = [...prevStores];
          updated[idx] = { ...updated[idx], location: { type: 'Point', coordinates: [data.lng, data.lat] }, online: data.online };
          return updated;
        } else {
          // Optionally, fetch the updated list from backend
          return prevStores;
        }
      });
    });
    return () => socket.off('pharmacist-location-update');
  }, []);

  // Helper to center map on user
  function SetViewOnUser({ coords }) {
    const map = useMap();
    useEffect(() => {
      if (coords) map.setView(coords, 13);
    }, [coords, map]);
    return null;
  }

  // Custom icon for stores
  const storeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' }}>
        <div style={{ background: 'linear-gradient(120deg, #eaf4ff 0%, #f6fbff 100%)', padding: '80px 20px 60px', textAlign: 'center' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#2186eb', marginBottom: '20px' }}>Store Locations</h1>
            <p style={{ fontSize: '1.3rem', color: '#555', maxWidth: 800, margin: '0 auto 30px', lineHeight: 1.6 }}>
              Find MediCare stores near you. Visit our physical locations for personalized service, consultations, and immediate assistance.
            </p>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '20px', padding: '30px', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)', marginBottom: '30px' }}>
            <div style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden', marginBottom: 24 }}>
              {userLocation && (
                <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }} ref={mapRef}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={userLocation}>
                    <Popup>You are here</Popup>
                  </Marker>
                  {stores.map(store => (
                    <Marker
                      key={store._id}
                      position={store.location?.coordinates ? [store.location.coordinates[1], store.location.coordinates[0]] : null}
                      icon={storeIcon}
                      eventHandlers={{ click: () => setSelectedStore(store) }}
                    >
                      <Popup>
                        <b>{store.pharmacyName || 'Pharmacy'}</b><br />
                        {store.address}<br />
                        {store.online ? <span style={{ color: 'green' }}>Online</span> : <span style={{ color: 'red' }}>Offline</span>}
                      </Popup>
                    </Marker>
                  ))}
                  <SetViewOnUser coords={userLocation} />
                </MapContainer>
              )}
            </div>
            {/* Optionally, add search/filter UI here */}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Stores;
