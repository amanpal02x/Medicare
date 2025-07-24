import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProfile, updateProfile } from '../services/auth';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search?format=json&q=';

const Profile = () => {
  const [profile, setProfile] = useState({ name: '', email: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef();
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [reverseLoading, setReverseLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0); // for forcing map rerender

  useEffect(() => {
    getProfile().then(data => {
      setProfile({
        name: data.name || '',
        email: data.email || '',
        address: data.address || ''
      });
      setAddressInput(data.address || '');
      setLoading(false);
    });
  }, []);

  // Fetch address suggestions
  useEffect(() => {
    if (addressInput.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    const controller = new AbortController();
    fetch(NOMINATIM_URL + encodeURIComponent(addressInput), {
      headers: { 'User-Agent': 'MediCareApp/1.0' },
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        setAddressSuggestions(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [addressInput]);

  // Hide suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (name === 'address') {
      setAddressInput(value);
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = suggestion => {
    setProfile(prev => ({ ...prev, address: suggestion.display_name }));
    setAddressInput(suggestion.display_name);
    setShowSuggestions(false);
    // Set lat/lng from suggestion
    if (suggestion.lat && suggestion.lon) {
      setLat(suggestion.lat);
      setLng(suggestion.lon);
      setMapKey(prev => prev + 1); // force map rerender
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await updateProfile(profile);
      if (res && res.user) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    }
    setSaving(false);
  };

  useEffect(() => {
    // Only trigger if both lat and lng are present and valid numbers
    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      let cancelled = false;
      setReverseLoading(true);
      setError('');
      setSuccess('');
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
      fetch(url, { headers: { 'User-Agent': 'MediCareApp/1.0' } })
        .then(res => res.json())
        .then(data => {
          if (!cancelled) {
            if (data && data.address) {
              // Build a short, human-friendly address
              const addr = data.address;
              const locality = addr.village || addr.town || addr.city || addr.hamlet || '';
              const block = addr.suburb || addr.block || addr.county || '';
              const district = addr.state_district || addr.district || addr.state || '';
              // Filter out empty parts and join with commas
              const shortAddress = [locality, block, district].filter(Boolean).join(', ');
              setProfile(prev => ({ ...prev, address: shortAddress }));
              setAddressInput(shortAddress);
              setShowSuggestions(false);
              setSuccess('Address fetched from coordinates!');
              // Set lat/lng in case they were changed by the API
              if (data.lat && data.lon) {
                setLat(data.lat);
                setLng(data.lon);
                setMapKey(prev => prev + 1);
              }
            } else {
              setError('No address found for these coordinates.');
            }
          }
        })
        .catch(() => {
          if (!cancelled) setError('Failed to fetch address from coordinates.');
        })
        .finally(() => {
          if (!cancelled) setReverseLoading(false);
        });
      return () => { cancelled = true; };
    }
    // eslint-disable-next-line
  }, [lat, lng]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div style={{ padding: '50px 20px', maxWidth: 500, margin: '0 auto' }}>
        <h1>Profile</h1>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: 20 }}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={addressInput}
              onChange={handleChange}
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
            {showSuggestions && addressSuggestions.length > 0 && (
              <ul ref={suggestionsRef} style={{
                position: 'absolute',
                zIndex: 10,
                background: '#fff',
                border: '1px solid #ccc',
                width: '100%',
                maxHeight: 180,
                overflowY: 'auto',
                listStyle: 'none',
                margin: 0,
                padding: 0
              }}>
                {addressSuggestions.map(suggestion => (
                  <li
                    key={suggestion.place_id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{ padding: 8, cursor: 'pointer', borderBottom: '1px solid #eee' }}
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label>Latitude:</label>
              <input
                type="number"
                value={lat}
                onChange={e => setLat(e.target.value)}
                placeholder="Latitude"
                step="any"
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Longitude:</label>
              <input
                type="number"
                value={lng}
                onChange={e => setLng(e.target.value)}
                placeholder="Longitude"
                step="any"
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
          </div>
          {/* Show map if lat/lng are present */}
          {lat && lng && (
            <div style={{ marginBottom: 20 }}>
              <iframe
                key={mapKey}
                title="Location Map"
                width="100%"
                height="250"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng)-0.005}%2C${parseFloat(lat)-0.003}%2C${parseFloat(lng)+0.005}%2C${parseFloat(lat)+0.003}&layer=mapnik&marker=${lat},${lng}`}
                allowFullScreen
              ></iframe>
              <div style={{ fontSize: 12, color: '#555' }}>
                <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`} target="_blank" rel="noopener noreferrer">View Larger Map</a>
              </div>
            </div>
          )}
          {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
          <button type="submit" disabled={saving} style={{ padding: '10px 30px' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
