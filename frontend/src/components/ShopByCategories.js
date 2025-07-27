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
    <div className="shop-categories-container hide-horizontal-scrollbar" style={{background: 'linear-gradient(135deg, #f6fdff 70%, #e3f0ff 100%)', boxShadow: '0 4px 24px rgba(25,118,210,0.07)', minHeight: 600}}>
      <div className="sidebar" style={{position: 'relative', paddingBottom: hasMore ? 0 : undefined, background: 'linear-gradient(135deg, #eaf8fd 80%, #d0e7f7 100%)', boxShadow: '0 2px 16px rgba(25,118,210,0.06)', width: 270}}>
        {visibleCategories.map((cat, idx) => (
          <React.Fragment key={cat._id}>
            <div
              className={`sidebar-category${selectedCategory === cat._id ? ' active' : ''}`}
              onClick={() => setSelectedCategory(cat._id)}
              style={{
                transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.18s',
                marginBottom: 0,
                border: selectedCategory === cat._id ? '2px solid #1976d2' : '2px solid transparent',
                boxShadow: selectedCategory === cat._id ? '0 4px 16px rgba(25, 118, 210, 0.13)' : undefined,
                background: selectedCategory === cat._id ? '#fff' : 'transparent',
                color: selectedCategory === cat._id ? '#1976d2' : '#222',
                fontWeight: selectedCategory === cat._id ? 700 : 500,
                transform: selectedCategory === cat._id ? 'scale(1.04)' : 'scale(1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minHeight: 32,
                padding: '5px 10px',
                borderRadius: 8,
                position: 'relative',
              }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.10)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = selectedCategory === cat._id ? '0 4px 16px rgba(25, 118, 210, 0.13)' : 'none'}
            >
              <span style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: stringToColor(cat.name),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                boxShadow: '0 1px 4px rgba(25,118,210,0.08)',
                marginRight: 8,
                letterSpacing: 1,
                flexShrink: 0
              }}>{cat.name?.[0]?.toUpperCase() || '?'}</span>
              <span style={{
                flex: 1,
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: selectedCategory === cat._id ? 700 : 500,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                minHeight: 24,
                paddingLeft: 2,
                justifyContent: 'flex-start',
              }}>{cat.name}</span>
            </div>
            {idx === MAX_VISIBLE - 1 && !showAll && hasMore && (
              <div className="divider" style={{margin: '12px 0'}}></div>
            )}
          </React.Fragment>
        ))}
        {hasMore && !showAll && (
          <button
            className="view-all-link"
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              margin: '12px auto 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: '#e3f0ff',
              color: '#1976d2',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '1rem',
              padding: '7px 0',
              width: '90%',
              boxShadow: '0 1px 4px rgba(25,118,210,0.06)',
              transition: 'background 0.18s, color 0.18s',
              animation: 'fadeIn 0.4s',
            }}
            onClick={() => setShowAll(true)}
            onMouseOver={e => e.currentTarget.style.background = '#d0e7f7'}
            onMouseOut={e => e.currentTarget.style.background = '#e3f0ff'}
          >
            View All <ExpandMoreIcon style={{marginLeft: 6}} fontSize="small" />
          </button>
        )}
        {hasMore && showAll && (
          <button
            className="view-all-link"
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              margin: '12px auto 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: '#e3f0ff',
              color: '#1976d2',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '1rem',
              padding: '7px 0',
              width: '90%',
              boxShadow: '0 1px 4px rgba(25,118,210,0.06)',
              transition: 'background 0.18s, color 0.18s',
              animation: 'fadeIn 0.4s',
            }}
            onClick={() => setShowAll(false)}
            onMouseOver={e => e.currentTarget.style.background = '#d0e7f7'}
            onMouseOut={e => e.currentTarget.style.background = '#e3f0ff'}
          >
            Show Less <ExpandLessIcon style={{marginLeft: 6}} fontSize="small" />
          </button>
        )}
      </div>
      <div className="main-content">
        <div className="header-row">
          <h2>Shop by categories</h2>
        </div>
        {subcategories.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, marginTop: 4 }}>
            <button
              style={{
                padding: '7px 18px',
                borderRadius: 8,
                border: 'none',
                background: selectedSubcategory === null ? '#1976d2' : '#e3f0ff',
                color: selectedSubcategory === null ? '#fff' : '#1976d2',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: selectedSubcategory === null ? '0 2px 8px rgba(25,118,210,0.08)' : 'none',
                transition: 'background 0.18s',
              }}
              onClick={() => setSelectedSubcategory(null)}
            >
              All
            </button>
            {subcategories.map((subcat, idx) => (
              <button
                key={idx}
                style={{
                  padding: '7px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: selectedSubcategory === subcat ? '#1976d2' : '#e3f0ff',
                  color: selectedSubcategory === subcat ? '#fff' : '#1976d2',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: selectedSubcategory === subcat ? '0 2px 8px rgba(25,118,210,0.08)' : 'none',
                  transition: 'background 0.18s',
                }}
                onClick={() => setSelectedSubcategory(subcat)}
              >
                {subcat}
              </button>
            ))}
          </div>
        )}
        {isLoading ? (
          <div>Loading...</div>
        ) : locationError ? (
          <div style={{ color: '#e53935', marginBottom: 16 }}>{locationError}</div>
        ) : errorNearby ? (
          <div style={{ color: '#e53935', marginBottom: 16 }}>{errorNearby}</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#666' }}>No products available from online pharmacists in your area.</div>
        ) : (
          <>
            <h3 style={{marginBottom: '18px'}}>
              All products in "{categories.find(c => c._id === selectedCategory)?.name || ''}"
            </h3>
            <div className="products-grid">
              {getShuffledItems(filteredProducts, 10).map(product => (
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