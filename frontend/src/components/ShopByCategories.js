import React, { useEffect, useState } from 'react';
import { getAllCategories } from '../services/categories';
import './ShopByCategories.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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

  return (
    <div className={`shop-categories-container hide-horizontal-scrollbar ${isMobile ? 'mobile-view' : ''}`} 
         style={{
           background: 'linear-gradient(135deg, #f6fdff 70%, #e3f0ff 100%)', 
           boxShadow: '0 4px 24px rgba(25,118,210,0.07)', 
           minHeight: isMobile ? 400 : 600,
           flexDirection: isMobile ? 'column' : 'row',
           padding: isMobile ? '16px' : '0',
           borderRadius: isMobile ? '12px' : '16px',
           margin: isMobile ? '16px' : '0'
         }}>
      <div className="sidebar" style={{
        position: 'relative', 
        paddingBottom: hasMore ? 0 : undefined, 
        background: 'linear-gradient(135deg, #eaf8fd 80%, #d0e7f7 100%)', 
        boxShadow: '0 2px 16px rgba(25,118,210,0.06)', 
        width: isMobile ? '100%' : 270,
        borderRadius: isMobile ? '12px 12px 0 0' : '16px 0 0 16px',
        padding: isMobile ? '16px' : '18px 0',
        marginBottom: isMobile ? '0' : undefined
      }}>
        {isMobile && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            padding: '16px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            border: '1px solid rgba(25,118,210,0.15)',
            boxShadow: '0 2px 8px rgba(25,118,210,0.08)'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: 700, 
              color: '#1976d2',
              letterSpacing: '0.5px'
            }}>
              Shop by Categories
            </h3>
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '14px',
              color: '#666',
              fontWeight: 500
            }}>
              Choose from our wide range of products
            </p>
          </div>
        )}
        
        <div style={{ 
          display: isMobile ? 'grid' : 'flex', 
          flexDirection: isMobile ? undefined : 'column',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : undefined,
          gap: isMobile ? '12px' : '0'
        }}>
          {visibleCategories.map((cat, idx) => (
            <React.Fragment key={cat._id}>
              <div
                className={`sidebar-category${selectedCategory === cat._id ? ' active' : ''}`}
                onClick={() => setSelectedCategory(cat._id)}
                style={{
                  transition: 'all 0.3s ease',
                  marginBottom: isMobile ? 0 : 0,
                  border: selectedCategory === cat._id ? '2px solid #1976d2' : '2px solid transparent',
                  boxShadow: selectedCategory === cat._id ? '0 4px 16px rgba(25, 118, 210, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                  background: selectedCategory === cat._id ? '#fff' : 'rgba(255,255,255,0.95)',
                  color: selectedCategory === cat._id ? '#1976d2' : '#222',
                  fontWeight: selectedCategory === cat._id ? 700 : 500,
                  transform: selectedCategory === cat._id ? 'scale(1.02)' : 'scale(1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 8 : 8,
                  minHeight: isMobile ? 60 : 32,
                  padding: isMobile ? '16px 12px' : '5px 10px',
                  borderRadius: isMobile ? 12 : 8,
                  position: 'relative',
                  flexDirection: isMobile ? 'column' : 'row',
                  textAlign: isMobile ? 'center' : 'left',
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 16px rgba(25, 118, 210, 0.12)'
                  }
                }}
                onMouseOver={e => {
                  if (selectedCategory !== cat._id) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.12)';
                  }
                }}
                onMouseOut={e => {
                  if (selectedCategory !== cat._id) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  }
                }}
              >
                <span style={{
                  width: isMobile ? 36 : 26,
                  height: isMobile ? 36 : 26,
                  borderRadius: '50%',
                  background: stringToColor(cat.name),
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: isMobile ? 16 : 14,
                  boxShadow: '0 2px 8px rgba(25,118,210,0.15)',
                  marginRight: isMobile ? 0 : 8,
                  marginBottom: isMobile ? 6 : 0,
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
                  fontSize: isMobile ? 13 : 16,
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: isMobile ? 20 : 24,
                  paddingLeft: isMobile ? 0 : 2,
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  lineHeight: 1.2,
                  maxWidth: isMobile ? '100%' : 'auto'
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
      
      <div className="main-content" style={{
        flex: 1,
        padding: isMobile ? '20px 16px' : '32px 32px 32px 32px',
        minWidth: 0
      }}>
        {!isMobile && (
          <div className="header-row">
            <h2>Shop by categories</h2>
          </div>
        )}
        
        {subcategories.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? 8 : 12, 
            marginBottom: isMobile ? 20 : 18, 
            marginTop: isMobile ? 0 : 4,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            overflowX: isMobile ? 'auto' : 'visible',
            padding: isMobile ? '0 4px' : '0'
          }}>
            <button
              style={{
                padding: isMobile ? '10px 16px' : '7px 18px',
                borderRadius: 8,
                border: 'none',
                background: selectedSubcategory === null ? '#1976d2' : '#e3f0ff',
                color: selectedSubcategory === null ? '#fff' : '#1976d2',
                fontWeight: 600,
                fontSize: isMobile ? 14 : 15,
                cursor: 'pointer',
                boxShadow: selectedSubcategory === null ? '0 2px 8px rgba(25,118,210,0.15)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: selectedSubcategory === null ? '0 4px 12px rgba(25,118,210,0.2)' : '0 2px 8px rgba(25,118,210,0.1)'
                }
              }}
              onClick={() => setSelectedSubcategory(null)}
            >
              All
            </button>
            {subcategories.map((subcat, idx) => (
              <button
                key={idx}
                style={{
                  padding: isMobile ? '10px 16px' : '7px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: selectedSubcategory === subcat ? '#1976d2' : '#e3f0ff',
                  color: selectedSubcategory === subcat ? '#fff' : '#1976d2',
                  fontWeight: 600,
                  fontSize: isMobile ? 14 : 15,
                  cursor: 'pointer',
                  boxShadow: selectedSubcategory === subcat ? '0 2px 8px rgba(25,118,210,0.15)' : 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: selectedSubcategory === subcat ? '0 4px 12px rgba(25,118,210,0.2)' : '0 2px 8px rgba(25,118,210,0.1)'
                  }
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
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            margin: '20px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ marginBottom: '12px', fontSize: '24px' }}>🔄</div>
            Loading...
          </div>
        ) : locationError ? (
          <div style={{ 
            color: '#e53935', 
            marginBottom: 16,
            padding: '16px',
            background: 'rgba(229, 57, 53, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(229, 57, 53, 0.2)',
            boxShadow: '0 2px 8px rgba(229, 57, 53, 0.1)'
          }}>{locationError}</div>
        ) : errorNearby ? (
          <div style={{ 
            color: '#e53935', 
            marginBottom: 16,
            padding: '16px',
            background: 'rgba(229, 57, 53, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(229, 57, 53, 0.2)',
            boxShadow: '0 2px 8px rgba(229, 57, 53, 0.1)'
          }}>{errorNearby}</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 40 : 60, 
            fontSize: isMobile ? 16 : 18, 
            color: '#666',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            margin: '20px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ marginBottom: '12px', fontSize: '24px' }}>📦</div>
            No products available from online pharmacists in your area.
          </div>
        ) : (
          <>
            <h3 style={{
              marginBottom: isMobile ? '20px' : '18px',
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 600,
              color: '#1976d2',
              textAlign: isMobile ? 'center' : 'left',
              padding: isMobile ? '0 8px' : '0'
            }}>
              All products in "{categories.find(c => c._id === selectedCategory)?.name || ''}"
            </h3>
            <div className={`products-grid ${isMobile ? 'mobile-grid' : ''}`} style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
              gap: isMobile ? '16px' : '24px',
              width: '100%',
              marginTop: isMobile ? '16px' : '24px',
              padding: isMobile ? '0 4px' : '0'
            }}>
              {getShuffledItems(filteredProducts, isMobile ? 8 : 10).map(product => (
                <ItemCard key={product._id} item={product} type={product.type || 'product'} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopByCategories; 