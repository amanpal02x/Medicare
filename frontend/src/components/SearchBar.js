import React, { useState, useRef } from 'react';
import { searchMedicines } from '../services/medicines';
import { getAllProducts } from '../services/products';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
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
      // Filter products by query (since no search endpoint for products)
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length === 0) return;
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle suggestion click
  const handleSuggestionClick = (item) => {
    if (item.type === 'medicine') {
      navigate(`/medicines/${item._id}`);
    } else if (item.type === 'product') {
      navigate(`/products/${item._id}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        borderRadius: '2em',
        boxShadow: '0 2px 8px rgba(33,134,235,0.08)',
        padding: '0.5em 1em',
        width: '100%',
        maxWidth: 600,
        border: '2px solid #90c6ff',
        position: 'relative',
      }}>
        <input
          value={query}
          onChange={handleInputChange}
          placeholder="Search for medicines or products..."
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
            background: 'none',
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
            backgroundColor: '#2186eb',
          }}
        >
          <svg width="24" height="24" fill="#fff" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99a1 1 0 001.41-1.41l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z"/></svg>
        </button>
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {suggestions.length > 0 && (
        <ul style={{
          width: '100%',
          maxWidth: 600,
          background: '#fff',
          borderRadius: '0 0 1em 1em',
          boxShadow: '0 2px 8px rgba(33,134,235,0.08)',
          margin: 0,
          padding: 0,
          listStyle: 'none',
          position: 'absolute',
          top: 56,
          left: 0,
          zIndex: 10,
        }}>
          {suggestions.map(item => (
            <li
              key={item._id + item.type}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                fontWeight: 500,
                fontSize: 18,
              }}
              onClick={() => handleSuggestionClick(item)}
            >
              <span style={{ color: item.type === 'medicine' ? '#2186eb' : '#19b6c9', marginRight: 12 }}>
                {item.type === 'medicine' ? '💊' : '🛒'}
              </span>
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 