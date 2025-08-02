import React, { useEffect, useState } from 'react';
import { getAllCategories } from '../services/categories';
import './ShopByCategories.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ItemCard from './ItemCard';
import useNearbyProductsAndMedicines from '../hooks/useNearbyProductsAndMedicines';
import { getShuffledItems } from '../utils/shuffleUtils';
import useDeviceDetection from '../hooks/useDeviceDetection';

const MAX_VISIBLE = 10;

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

const ShopByCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loadingCats, setLoadingCats] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isMobile } = useDeviceDetection();
  const {
    products,
    loading: loadingNearby,
    error: errorNearby,
    locationError,
    refresh,
  } = useNearbyProductsAndMedicines();

  useEffect(() => {
    async function fetchData() {
      setLoadingCats(true);
      const cats = await getAllCategories();
      setCategories(cats);
      setSelectedCategory(cats[0]?._id || null);
      setLoadingCats(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedSubcategory(null);
  }, [selectedCategory]);

  const selectedCatObj = categories.find(c => c._id === selectedCategory);
  const subcategories = selectedCatObj?.subcategories || [];

  const filteredProducts = selectedCategory
    ? products.filter(p => {
        const catMatch = p.category && (p.category._id === selectedCategory || p.category === selectedCategory);
        const subcatMatch = !selectedSubcategory || p.subcategory === selectedSubcategory;
        return catMatch && subcatMatch;
      })
    : products;

  const visibleCategories = showAll ? categories : categories.slice(0, MAX_VISIBLE);
  const hasMore = categories.length > MAX_VISIBLE;

  const isLoading = loadingCats || loadingNearby;

  // Mobile Product Card Component
  const MobileProductCard = ({ product }) => {
    const basePrice = product.price || 0;
    const discountPercent = product.discountPercentage || 0;
    const discountedPrice = product.discountedPrice || (discountPercent > 0
      ? Math.round((basePrice * (1 - discountPercent / 100)) * 100) / 100
      : basePrice);
    
    const savings = Math.round(basePrice - discountedPrice);
    const hasDiscount = discountPercent > 0;

    const handleCardClick = () => {
      if (product.type === 'medicine') {
        navigate(`/medicines/${product._id}`);
      } else {
        navigate(`/products/${product._id}`);
      }
    };

    const handleAddToCart = (e) => {
      e.stopPropagation();
      addToCart(product._id, product.type || 'product', 1);
    };

    return (
      <div 
        className="mobile-product-card"
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          display: 'flex',
          flexDirection: 'column',
          height: 'auto',
          minHeight: 320,
          position: 'relative'
        }}
        onClick={handleCardClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
      >
        {/* Discount Tag - Top Right Corner */}
        {hasDiscount && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: '#e53935',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 12,
            fontSize: 10,
            fontWeight: 700,
            zIndex: 2,
            boxShadow: '0 2px 4px rgba(229, 57, 53, 0.3)'
          }}>
            Save {discountPercent}%
          </div>
        )}

        {/* Product Image */}
        <div style={{ 
          height: 100, 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: 8,
          background: '#f8f9fa',
          borderRadius: 8
        }}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: 6, 
                objectFit: 'contain' 
              }}
              onError={(e) => {
                e.target.src = '/placeholder-medicine.jpg';
              }}
            />
          ) : (
            <div style={{ 
              width: '100%',
              height: '100%',
              borderRadius: 6, 
              background: '#f5f5f5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#999',
              fontSize: 12
            }}>
              No Image
            </div>
          )}
        </div>

        {/* Product Name - Improved for mobile */}
        <div 
          className="product-name"
          style={{ 
            fontWeight: 600, 
            fontSize: 14, 
            marginBottom: 8, 
            minHeight: 40,
            maxHeight: 40,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.2,
            color: '#333',
            textAlign: 'left'
          }}
        >
          {product.name}
        </div>

        {/* Price Section - Improved for mobile */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ 
            fontSize: 16, 
            color: '#1976d2', 
            fontWeight: 700, 
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            ₹{Math.round(discountedPrice)}
            {hasDiscount && (
              <span style={{ 
                textDecoration: 'line-through', 
                color: '#888', 
                fontSize: 12, 
                fontWeight: 400
              }}>
                ₹{Math.round(basePrice)}
              </span>
            )}
          </div>
        </div>

        {/* Pack Size */}
        <div style={{ 
          fontSize: 11, 
          color: '#666', 
          marginBottom: 12 
        }}>
          1 pack ({product.weight || product.quantity || '250 g'})
        </div>

        {/* ADD Button - Improved for mobile */}
        <button
          style={{
            background: '#19b6c9',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 0',
            fontWeight: 600,
            fontSize: 14,
            width: '100%',
            cursor: 'pointer',
            letterSpacing: 0.5,
            boxShadow: '0 2px 4px rgba(25, 182, 201, 0.2)',
            transition: 'background 0.2s',
            marginTop: 'auto'
          }}
          onClick={handleAddToCart}
          onMouseEnter={(e) => e.currentTarget.style.background = '#16a5b7'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#19b6c9'}
        >
          ADD
        </button>
      </div>
    );
  };

  return (
    <div className={`shop-categories-container hide-horizontal-scrollbar ${isMobile ? 'mobile-view' : ''}`} 
         style={{
           background: 'linear-gradient(135deg, #f6fdff 70%, #e3f0ff 100%)', 
           boxShadow: '0 4px 24px rgba(25,118,210,0.07)', 
           minHeight: isMobile ? 'auto' : 600,
           flexDirection: isMobile ? 'column' : 'column',
           overflow: isMobile ? 'visible' : 'visible'
         }}>
      
      {/* Desktop Categories Grid */}
      {!isMobile && (
        <div style={{
          padding: '32px 32px 24px 32px',
          background: 'linear-gradient(135deg, #eaf8fd 80%, #d0e7f7 100%)',
          borderRadius: '16px 16px 0 0',
          borderBottom: '1px solid rgba(25,118,210,0.1)'
        }}>
          <div className="header-row" style={{ marginBottom: '24px' }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '2.1rem', 
              fontWeight: 700, 
              color: '#1976d2', 
              letterSpacing: '-1px',
              textAlign: 'center'
            }}>
              Shop by Categories
            </h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {visibleCategories.map((cat, idx) => (
              <div
                key={cat._id}
                className={`desktop-category-card${selectedCategory === cat._id ? ' active' : ''}`}
                onClick={() => setSelectedCategory(cat._id)}
                style={{
                  background: selectedCategory === cat._id ? '#fff' : 'rgba(255,255,255,0.9)',
                  border: selectedCategory === cat._id ? '2px solid #1976d2' : '1px solid rgba(25,118,210,0.1)',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedCategory === cat._id ? '0 8px 24px rgba(25, 118, 210, 0.15)' : '0 4px 12px rgba(0,0,0,0.08)',
                  transform: selectedCategory === cat._id ? 'translateY(-4px)' : 'translateY(0)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minHeight: '140px',
                  justifyContent: 'center'
                }}
                onMouseOver={e => {
                  if (selectedCategory !== cat._id) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(25, 118, 210, 0.12)';
                  }
                }}
                onMouseOut={e => {
                  if (selectedCategory !== cat._id) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: stringToColor(cat.name),
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '24px',
                  boxShadow: '0 4px 12px rgba(25,118,210,0.2)',
                  marginBottom: '12px',
                  letterSpacing: '1px'
                }}>
                  {cat.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span style={{
                  fontSize: '16px',
                  fontWeight: selectedCategory === cat._id ? 700 : 600,
                  color: selectedCategory === cat._id ? '#1976d2' : '#333',
                  lineHeight: '1.3',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '2px solid #1976d2',
                  color: '#1976d2',
                  cursor: 'pointer',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(25,118,210,0.1)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#1976d2';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                  e.currentTarget.style.color = '#1976d2';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                {showAll ? 'Show Less' : 'Show More'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Sidebar - Keep existing mobile layout */}
      {isMobile && (
        <div className="sidebar" style={{
          position: 'relative', 
          paddingBottom: hasMore ? 0 : undefined, 
          background: 'linear-gradient(135deg, #eaf8fd 80%, #d0e7f7 100%)', 
          boxShadow: '0 2px 16px rgba(25,118,210,0.06)', 
          width: isMobile ? '100%' : 270,
          borderRadius: isMobile ? '12px 12px 0 0' : '16px 0 0 16px',
          padding: isMobile ? '16px 12px' : '18px 0',
          marginBottom: isMobile ? '0' : undefined,
          minWidth: isMobile ? 'auto' : undefined,
          flexShrink: isMobile ? 0 : 0
        }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '16px',
            padding: '8px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '8px',
            border: '1px solid rgba(25,118,210,0.1)'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 700, 
              color: '#1976d2',
              letterSpacing: '0.5px'
            }}>
              Categories
            </h3>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: isMobile ? '6px' : '0'
          }}>
            {visibleCategories.map((cat, idx) => (
              <React.Fragment key={cat._id}>
                <div
                  className={`sidebar-category${selectedCategory === cat._id ? ' active' : ''}`}
                  onClick={() => setSelectedCategory(cat._id)}
                  style={{
                    transition: 'all 0.2s ease',
                    marginBottom: isMobile ? 4 : 0,
                    border: selectedCategory === cat._id ? '2px solid #1976d2' : '1px solid rgba(25,118,210,0.1)',
                    boxShadow: selectedCategory === cat._id ? '0 4px 16px rgba(25, 118, 210, 0.13)' : '0 2px 8px rgba(0,0,0,0.05)',
                    background: selectedCategory === cat._id ? '#fff' : 'rgba(255,255,255,0.9)',
                    color: selectedCategory === cat._id ? '#1976d2' : '#222',
                    fontWeight: selectedCategory === cat._id ? 700 : 500,
                    transform: selectedCategory === cat._id ? 'scale(1.02)' : 'scale(1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 8 : 8,
                    minHeight: isMobile ? 40 : 32,
                    padding: isMobile ? '10px 8px' : '5px 10px',
                    borderRadius: isMobile ? 8 : 8,
                    position: 'relative',
                    flexDirection: 'row',
                    textAlign: 'left',
                    justifyContent: 'flex-start'
                  }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.10)'}
                  onMouseOut={e => e.currentTarget.style.boxShadow = selectedCategory === cat._id ? '0 4px 16px rgba(25, 118, 210, 0.13)' : '0 2px 8px rgba(0,0,0,0.05)'}
                >
                  <span style={{
                    width: isMobile ? 24 : 26,
                    height: isMobile ? 24 : 26,
                    borderRadius: '50%',
                    background: stringToColor(cat.name),
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: isMobile ? 16 : 14,
                    boxShadow: '0 1px 4px rgba(25,118,210,0.08)',
                    marginRight: isMobile ? 0 : 8,
                    marginBottom: isMobile ? 4 : 0,
                    letterSpacing: 1,
                    flexShrink: 0
                  }}>{cat.name?.[0]?.toUpperCase() || '?'}</span>
                  <span style={{
                    flex: 1,
                    textAlign: isMobile ? 'center' : 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: selectedCategory === cat._id ? 700 : 500,
                    fontSize: isMobile ? 14 : 16,
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: isMobile ? 20 : 24,
                    paddingLeft: isMobile ? 0 : 2,
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    lineHeight: 1.2
                  }}>{cat.name}</span>
                </div>
                {idx === MAX_VISIBLE - 1 && !showAll && hasMore && !isMobile && (
                  <div className="divider" style={{margin: '12px 0'}}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {hasMore && !isMobile && (
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1976d2',
                cursor: 'pointer',
                padding: '8px 16px',
                marginTop: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'background 0.2s',
                width: '100%',
                justifyContent: 'center'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(25,118,210,0.08)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {showAll ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              {showAll ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      )}
      
      <div className="main-content" style={{
        flex: 1,
        padding: isMobile ? '16px 12px' : '32px 32px 32px 32px',
        minWidth: 0,
        background: isMobile ? '#fff' : 'transparent',
        borderRadius: isMobile ? '0 0 12px 12px' : '0',
        borderLeft: isMobile ? 'none' : 'none',
        borderTop: isMobile ? '1px solid rgba(25,118,210,0.1)' : 'none',
        minHeight: isMobile ? 'auto' : 'auto',
        overflow: isMobile ? 'visible' : 'visible'
      }}>
        {!isMobile && selectedCategory && (
          <div className="header-row" style={{ marginBottom: '24px' }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.8rem',
              fontWeight: 600,
              color: '#1976d2',
              textAlign: 'center'
            }}>
              {selectedCatObj?.name || 'All Categories'}
            </h3>
          </div>
        )}
        
        {/* Mobile Filter Bar */}
        {isMobile && (
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            overflowX: 'auto',
            paddingBottom: 4
          }}>
            <button style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              background: '#fff',
              color: '#333',
              fontWeight: 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <FilterListIcon style={{ fontSize: 16 }} />
              Filter
            </button>
            <button style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              background: '#fff',
              color: '#333',
              fontWeight: 500,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              Type ▼
            </button>
            <button style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              background: '#fff',
              color: '#333',
              fontWeight: 500,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              Price ▼
            </button>
            <button style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              background: '#fff',
              color: '#333',
              fontWeight: 500,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              Brand ▼
            </button>
            <div style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <img 
                src="/placeholder-medicine.jpg" 
                style={{ width: 16, height: 16, borderRadius: 2 }}
                alt="Brand"
              />
              B
            </div>
          </div>
        )}
        
        {subcategories.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? 8 : 12, 
            marginBottom: isMobile ? 16 : 18, 
            marginTop: isMobile ? 0 : 4,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            overflowX: isMobile ? 'auto' : 'visible',
            justifyContent: isMobile ? 'flex-start' : 'center'
          }}>
            <button
              style={{
                padding: isMobile ? '8px 12px' : '7px 18px',
                borderRadius: 8,
                border: 'none',
                background: selectedSubcategory === null ? '#1976d2' : '#e3f0ff',
                color: selectedSubcategory === null ? '#fff' : '#1976d2',
                fontWeight: 600,
                fontSize: isMobile ? 13 : 15,
                cursor: 'pointer',
                boxShadow: selectedSubcategory === null ? '0 2px 8px rgba(25,118,210,0.08)' : 'none',
                transition: 'background 0.18s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onClick={() => setSelectedSubcategory(null)}
            >
              All
            </button>
            {subcategories.map((subcat, idx) => (
              <button
                key={idx}
                style={{
                  padding: isMobile ? '8px 12px' : '7px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: selectedSubcategory === subcat ? '#1976d2' : '#e3f0ff',
                  color: selectedSubcategory === subcat ? '#fff' : '#1976d2',
                  fontWeight: 600,
                  fontSize: isMobile ? 13 : 15,
                  cursor: 'pointer',
                  boxShadow: selectedSubcategory === subcat ? '0 2px 8px rgba(25,118,210,0.08)' : 'none',
                  transition: 'background 0.18s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                onClick={() => setSelectedSubcategory(subcat)}
              >
                {subcat}
              </button>
            ))}
          </div>
        )}
        
        {isLoading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 40 : 60, 
            fontSize: isMobile ? 16 : 18, 
            color: '#666',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '12px',
            margin: '20px 0'
          }}>
            <div style={{ marginBottom: '12px' }}>🔄</div>
            Loading...
          </div>
        ) : locationError ? (
          <div style={{ 
            color: '#e53935', 
            marginBottom: 16,
            padding: '12px',
            background: 'rgba(229, 57, 53, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(229, 57, 53, 0.2)'
          }}>{locationError}</div>
        ) : errorNearby ? (
          <div style={{ 
            color: '#e53935', 
            marginBottom: 16,
            padding: '12px',
            background: 'rgba(229, 57, 53, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(229, 57, 53, 0.2)'
          }}>{errorNearby}</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 40 : 60, 
            fontSize: isMobile ? 16 : 18, 
            color: '#666',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '12px',
            margin: '20px 0'
          }}>
            <div style={{ marginBottom: '12px', fontSize: '24px' }}>📦</div>
            No products available from online pharmacists in your area.
          </div>
        ) : (
          <>
            <h3 style={{
              marginBottom: isMobile ? '12px' : '18px',
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: 600,
              color: '#1976d2',
              textAlign: isMobile ? 'left' : 'center',
              paddingLeft: isMobile ? '8px' : '0'
            }}>
              {selectedSubcategory ? selectedSubcategory : 'All items'}
            </h3>
            
            <div className={`products-grid ${isMobile ? 'mobile-grid' : ''}`} style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
              gap: isMobile ? '12px' : '24px',
              width: '100%',
              marginTop: isMobile ? '12px' : '24px'
            }}>
              {getShuffledItems(filteredProducts, isMobile ? 20 : 10).map(product => (
                isMobile ? (
                  <MobileProductCard key={product._id} product={product} />
                ) : (
                  <ItemCard key={product._id} item={product} type={product.type || 'product'} />
                )
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopByCategories; 