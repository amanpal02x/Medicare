import React, { useState, useRef, useEffect } from 'react';
import { searchMedicines } from '../services/medicines';
import { getAllProducts } from '../services/products';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchTerm) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Fetch suggestions for medicines and products
  const fetchSuggestions = async (q) => {
    setLoading(true);
    setError('');
    try {
      const [medicines, products] = await Promise.all([
        searchMedicines(q),
        getAllProducts()
      ]);
      
      let filteredResults = [];
      
      // Add medicines with proper type identification
      if (Array.isArray(medicines)) {
        filteredResults.push(...medicines.map(med => ({ 
          ...med, 
          type: 'medicine',
          _id: med._id 
        })));
      }
      
      // Add products with proper type identification
      if (Array.isArray(products)) {
        const filteredProducts = products.filter(p => 
          p.name && p.name.toLowerCase().includes(q.toLowerCase())
        );
        filteredResults.push(...filteredProducts.map(prod => ({ 
          ...prod, 
          type: 'product',
          _id: prod._id 
        })));
      }

      setSuggestions(filteredResults.slice(0, 8));
    } catch (err) {
      console.error('Search error:', err);
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
    setShowRecent(false);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length === 0) {
      setShowDropdown(false);
      setShowRecent(true);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle suggestion click
  const handleSuggestionClick = (item) => {
    setShowDropdown(false);
    setShowRecent(false);
    saveRecentSearch(item.name);
    
    // Ensure we have the correct type and ID
    if (item.type === 'medicine' && item._id) {
      navigate(`/medicines/${item._id}`);
    } else if (item.type === 'product' && item._id) {
      navigate(`/products/${item._id}`);
    } else if (item._id) {
      // Fallback: try to determine type from the item structure
      if (item.expiryDate) {
        // Medicine has expiry date
        navigate(`/medicines/${item._id}`);
      } else {
        // Product doesn't have expiry date
        navigate(`/products/${item._id}`);
      }
    }
  };

  // Handle recent search click
  const handleRecentClick = (searchTerm) => {
    setQuery(searchTerm);
    setShowRecent(false);
    fetchSuggestions(searchTerm);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      setShowDropdown(false);
      setShowRecent(false);
      // Navigate to search results page or perform search
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Hide dropdown on blur
  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
      setShowRecent(false);
    }, 150);
  };

  // Placeholder image
  const placeholderImg = '/placeholder-medicine.jpg';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px 0', position: 'relative', width: '100%', maxWidth: 700 }}>
      {/* Main Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,251,255,0.95) 100%)',
          borderRadius: '50px',
          boxShadow: '0 8px 32px rgba(33,134,235,0.15), 0 2px 8px rgba(0,0,0,0.1)',
          padding: '4px',
          width: '100%',
          border: '2px solid rgba(33,134,235,0.2)',
          position: 'relative',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(20px)',
        }}>
          <input
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.trim().length === 0) {
                setShowRecent(true);
              } else {
                setShowDropdown(true);
              }
            }}
            onBlur={handleBlur}
            placeholder="Search everything..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 18,
              padding: '16px 20px',
              borderRadius: '50px',
              background: 'transparent',
              fontWeight: 500,
              color: '#222',
            }}
          />

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #2186eb 0%, #19b6c9 100%)',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              width: 48,
              height: 48,
              boxShadow: '0 4px 16px rgba(33,134,235,0.3)',
              color: '#fff',
              fontSize: 20,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(33,134,235,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(33,134,235,0.3)';
            }}
          >
            {loading ? (
              <div style={{
                width: 20,
                height: 20,
                border: '2px solid #fff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <span role="img" aria-label="search">🔍</span>
            )}
          </button>
        </div>
      </form>

      {/* Recent Searches Dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: 0,
          width: '100%',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(33,134,235,0.15)',
          zIndex: 10,
          marginTop: 8,
          overflow: 'hidden',
          border: '1px solid rgba(33,134,235,0.1)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            fontWeight: 600,
            color: '#666',
            fontSize: 14,
          }}>
            Recent Searches
          </div>
          {recentSearches.map((search, idx) => (
            <div
              key={idx}
              onClick={() => handleRecentClick(search)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: 16,
                color: '#222',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(33,134,235,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 16, color: '#666' }}>🕒</span>
              <span>{search}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search Results Dropdown */}
      {showDropdown && query.trim().length > 0 && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: 0,
          width: '100%',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(33,134,235,0.15)',
          zIndex: 10,
          marginTop: 8,
          overflow: 'hidden',
          border: '1px solid rgba(33,134,235,0.1)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{
            maxHeight: 400,
            overflowY: 'auto',
          }}>
            {loading && (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#666', 
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}>
                <div style={{
                  width: 20,
                  height: 20,
                  border: '2px solid #2186eb',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Searching...
              </div>
            )}
            {error && (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#ff4757', 
                fontSize: 16 
              }}>
                {error}
              </div>
            )}
            {!loading && !error && suggestions.length === 0 && (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#666', 
                fontSize: 16 
              }}>
                No results found for "{query}"
              </div>
            )}
            {suggestions.map((item, idx) => (
              <div
                key={item._id || idx}
                onClick={() => handleSuggestionClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  fontSize: 16,
                  color: '#222',
                  transition: 'all 0.2s ease',
                }}
                onMouseDown={e => e.preventDefault()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(33,134,235,0.08)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <img
                  src={item.image || placeholderImg}
                  alt={item.name}
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: 'cover',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(33,134,235,0.15)',
                    background: '#f3f7fd',
                  }}
                  onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 600, 
                    marginBottom: 4,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    lineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.3,
                    wordBreak: 'break-word'
                  }}>{item.name}</div>
                  <div style={{ 
                    fontSize: 14, 
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{ 
                      background: item.type === 'medicine' ? '#e53935' : '#4caf50',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {item.type === 'medicine' ? '💊 Medicine' : '🛍️ Product'}
                    </span>
                    {item.discountPercentage > 0 && (
                      <span style={{ 
                        background: '#ff9800',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {item.discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ 
                  color: '#2186eb', 
                  fontSize: 24,
                  fontWeight: 300,
                  transition: 'transform 0.2s'
                }}>
                  →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 