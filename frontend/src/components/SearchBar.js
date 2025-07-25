import React, { useState, useRef } from 'react';
import { searchMedicines } from '../services/medicines';
import { getAllProducts } from '../services/products';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const debounceRef = useRef();

  // Fetch suggestions for medicines and products
  const fetchSuggestions = async (q) => {
    setLoading(true);
    setError('');
    try {
      const [medicines, products] = await Promise.all([
        searchMedicines(q),
        getAllProducts()
      ]);
      const filteredProducts = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
      setSuggestions([
        ...medicines.map(med => ({ ...med, type: 'medicine' })),
        ...filteredProducts.map(prod => ({ ...prod, type: 'product' }))
      ]);
    } catch (err) {
      setError('Search failed');
      setSuggestions([]);
    }
    setLoading(false);
  };

  // Debounced input handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSuggestions([]);
    setError('');
    setShowDropdown(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length === 0) {
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle suggestion click
  const handleSuggestionClick = (item) => {
    setShowDropdown(false);
    if (item.type === 'medicine' || item._id) {
      navigate(`/medicines/${item._id}`);
    } else if (item.type === 'product') {
      navigate(`/products/${item._id}`);
    }
  };

  // Hide dropdown on blur
  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  // Placeholder image
  const placeholderImg = '/placeholder-medicine.jpg';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px 0', position: 'relative' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(90deg, #e3f0ff 0%, #f8fbff 100%)',
        borderRadius: '2em',
        boxShadow: '0 4px 24px rgba(33,134,235,0.10)',
        padding: '0.5em 1.5em',
        width: '100%',
        maxWidth: 600,
        border: '2px solid #90c6ff',
        position: 'relative',
        transition: 'box-shadow 0.2s',
      }}>
        <input
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim().length > 0 && setShowDropdown(true)}
          onBlur={handleBlur}
          placeholder="Search for medicines/healthcare products"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 20,
            padding: '0.7em 0.5em',
            borderRadius: '2em',
            background: 'transparent',
            fontWeight: 500,
            color: '#222',
          }}
        />
        <button
          type="button"
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #2186eb 0%, #19b6c9 100%)',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            marginLeft: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            width: 40,
            height: 40,
            boxShadow: '0 2px 8px rgba(33,134,235,0.15)',
            color: '#fff',
            fontSize: 22,
            transition: 'background 0.2s',
          }}
        >
          <span role="img" aria-label="search">🔍</span>
        </button>
      </div>
      {showDropdown && query.trim().length > 0 && (
        <div style={{
          position: 'absolute',
          top: 56,
          left: 0,
          width: '100%',
          maxWidth: 600,
          background: '#fff',
          borderRadius: '1em',
          boxShadow: '0 8px 32px rgba(33,134,235,0.16)',
          zIndex: 10,
          marginTop: 4,
          overflow: 'hidden',
          border: '1.5px solid #e3eaf2',
        }}>
          <div style={{
            maxHeight: 340,
            overflowY: 'auto',
          }}>
            {loading && <div style={{ padding: '1.2em 1.5em', color: '#888', fontSize: 16 }}>Loading...</div>}
            {error && <div style={{ padding: '1.2em 1.5em', color: 'red', fontSize: 16 }}>{error}</div>}
            {!loading && !error && suggestions.length === 0 && (
              <div style={{ padding: '1.2em 1.5em', color: '#888', fontSize: 16 }}>No results found.</div>
            )}
            {suggestions.map((item, idx) => (
              <div
                key={item._id || idx}
                onClick={() => handleSuggestionClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '1em 1.5em',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: 17,
                  color: '#222',
                  background: 'linear-gradient(90deg, #f8fbff 0%, #e3f0ff 100%)',
                  transition: 'background 0.2s',
                }}
                onMouseDown={e => e.preventDefault()}
                onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(90deg, #e3f0ff 0%, #d0e6ff 100%)'}
                onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(90deg, #f8fbff 0%, #e3f0ff 100%)'}
              >
                <img
                  src={item.image || placeholderImg}
                  alt={item.name}
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: 'cover',
                    borderRadius: '0.7em',
                    boxShadow: '0 2px 8px rgba(33,134,235,0.10)',
                    background: '#f3f7fd',
                  }}
                  onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                />
                <div style={{ flex: 1, fontWeight: 500 }}>{item.name}</div>
                <span style={{ color: '#bbb', fontSize: 20 }}>&#8250;</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 