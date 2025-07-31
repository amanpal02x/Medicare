import React, { useEffect, useState } from 'react';
import { getAllCategories } from '../services/categories';
import './MobileCategoryList.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CompactItemCard from './CompactItemCard';

// Debug import
console.log('CompactItemCard imported:', CompactItemCard);
import useNearbyProductsAndMedicines from '../hooks/useNearbyProductsAndMedicines';
import { getShuffledItems } from '../utils/shuffleUtils';
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Category icons mapping
const categoryIcons = {
  'Personal Care': '🧴',
  'Health and Wellness Supplements': '💊',
  'Baby Care Products': '👶',
  'Medical Devices & Equipment': '🏥',
  'Fitness & Sports': '💪',
  'Home Health Care': '🏠',
  'First Aid': '🩹',
  'Dental Care': '🦷',
  'Eye Care': '👁️',
  'Skin Care': '🧴',
  'Hair Care': '💇',
  'Oral Care': '🦷',
  'Feminine Care': '🌸',
  'Men\'s Care': '🧔',
  'Elderly Care': '👴',
  'Pet Care': '🐕',
  'Ayurvedic': '🌿',
  'Homeopathy': '⚗️',
  'Allopathy': '💊',
  'Herbal': '🌱'
};

// Subcategory order mapping for better organization
const subcategoryOrder = {
  'Personal Care': ['Hair Care', 'Skin Care', 'Oral Care', 'Body Care', 'Feminine Care', 'Men\'s Care'],
  'Health and Wellness Supplements': ['Vitamins', 'Minerals', 'Proteins', 'Omega-3', 'Probiotics', 'Antioxidants'],
  'Baby Care Products': ['Baby Food', 'Baby Hygiene', 'Baby Skincare', 'Baby Healthcare', 'Baby Accessories'],
  'Medical Devices & Equipment': ['Blood Pressure Monitors', 'Glucose Monitors', 'Thermometers', 'Oximeters', 'Mobility Aids']
};

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

const MobileCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingCats, setLoadingCats] = useState(true);
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
      // Auto-select first category if available
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0]._id);
      }
      setLoadingCats(false);
    }
    fetchData();
  }, []);

  // Debug categories
  console.log('Categories:', categories);
  console.log('Selected Category ID:', selectedCategory);

  const selectedCatObj = categories.find(c => c._id === selectedCategory);
  const subcategories = selectedCatObj?.subcategories || [];

  // Sort subcategories based on predefined order
  const sortedSubcategories = subcategories.sort((a, b) => {
    const order = subcategoryOrder[selectedCatObj?.name] || [];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const filteredProducts = selectedCategory
    ? products.filter(p => {
        // Debug each product's category
        console.log('Product:', p.name, 'Category:', p.category, 'Selected:', selectedCategory);
        
        // Check if category exists and matches
        const catMatch = p.category && (
          p.category._id === selectedCategory || 
          p.category === selectedCategory ||
          (typeof p.category === 'object' && p.category._id === selectedCategory)
        );
        
        return catMatch;
      })
    : [];

  // Debug logging
  console.log('Selected Category:', selectedCategory);
  console.log('All Products:', products);
  console.log('Filtered Products:', filteredProducts);
  console.log('Products by Subcategory:', productsBySubcategory);
  
  // Debug first product structure
  if (products.length > 0) {
    console.log('First product structure:', products[0]);
    console.log('First product category:', products[0].category);
  }

  const isLoading = loadingCats || loadingNearby;

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Group products by subcategory
  const productsBySubcategory = {};
  filteredProducts.forEach(product => {
    const subcategory = product.subcategory || 'Other';
    if (!productsBySubcategory[subcategory]) {
      productsBySubcategory[subcategory] = [];
    }
    productsBySubcategory[subcategory].push(product);
  });

  // Debug subcategory grouping
  console.log('Products by subcategory:', productsBySubcategory);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: '#f8f9fa',
      pb: 10, // Space for bottom navigation
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        background: '#fff', 
        p: 2, 
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Typography variant="h6" fontWeight={700} color="#1976d2" textAlign="center">
          All Categories
        </Typography>
      </Box>

      {/* Main Content - Left-Right Layout */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        height: 'calc(100vh - 120px)' // Account for header and bottom nav
      }}>
        {/* Left Side - Categories */}
        <Box className="mobile-category-sidebar">
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {categories.map((category, index) => (
                <React.Fragment key={category._id}>
                  <Box
                    onClick={() => handleCategoryClick(category._id)}
                    className={`mobile-category-item ${selectedCategory === category._id ? 'active' : ''}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      background: selectedCategory === category._id ? '#e3f2fd' : '#fff',
                      cursor: 'pointer',
                      borderLeft: selectedCategory === category._id ? '4px solid #1976d2' : '4px solid transparent'
                    }}
                  >
                    {/* Category Icon */}
                    <Box 
                      className="mobile-category-icon"
                      sx={{
                        background: stringToColor(category.name)
                      }}
                    >
                      {categoryIcons[category.name] || category.name[0]?.toUpperCase() || '?'}
                    </Box>
                    
                    {/* Category Name */}
                    <Typography 
                      variant="body2" 
                      fontWeight={selectedCategory === category._id ? 700 : 500}
                      sx={{ 
                        flex: 1,
                        fontSize: '13px',
                        color: selectedCategory === category._id ? '#1976d2' : '#333'
                      }}
                    >
                      {category.name}
                    </Typography>
                  </Box>
                  
                  {index < categories.length - 1 && (
                    <Divider sx={{ mx: 1 }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          )}
        </Box>

        {/* Right Side - Products by Subcategory */}
        <Box className="mobile-products-content" sx={{ p: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : locationError ? (
            <Alert severity="error" sx={{ mb: 2 }}>{locationError}</Alert>
          ) : errorNearby ? (
            <Alert severity="error" sx={{ mb: 2 }}>{errorNearby}</Alert>
          ) : !selectedCategory ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4, 
              color: '#666' 
            }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                📦
              </Typography>
              <Typography variant="body1">
                Select a category to view products
              </Typography>
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4, 
              background: '#fff', 
              borderRadius: 2 
            }}>
              <Typography variant="h6" color="#666" sx={{ mb: 1 }}>
                📦
              </Typography>
              <Typography variant="body1" color="#666">
                No products available in this category
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Products grouped by subcategory */}
              {Object.keys(productsBySubcategory).map((subcategory) => {
                const subcategoryProducts = productsBySubcategory[subcategory];
                
                                 return (
                   <Box key={subcategory} className="mobile-subcategory-section">
                     {/* Subcategory Header */}
                     <Box className="mobile-subcategory-title">
                       <Typography variant="subtitle1" fontWeight={600} color="#333">
                         {subcategory}
                       </Typography>
                       <Chip 
                         label={subcategoryProducts.length} 
                         size="small" 
                         color="primary" 
                         variant="outlined"
                       />
                     </Box>
                    
                    {/* Subcategory Products */}
                    <Box className="mobile-product-grid">
                      {getShuffledItems(subcategoryProducts, 9).map(product => {
                        console.log('Rendering product:', product);
                        return (
                          <CompactItemCard key={product._id} item={product} type={product.type || 'product'} />
                        );
                      })}
                      {/* Test card with hardcoded data */}
                      <div className="mobile-compact-card" style={{ border: '2px solid green' }}>
                        <div style={{ height: 50, width: '100%', background: '#f0f0f0', marginBottom: 4 }}>Test Image</div>
                        <div className="mobile-product-name">Test Product Name</div>
                        <div className="mobile-product-price">₹99.99</div>
                        <button className="mobile-add-button">ADD</button>
                      </div>
                      {/* Debug: Show count of products */}
                      <div style={{ 
                        gridColumn: '1 / -1', 
                        textAlign: 'center', 
                        padding: '10px',
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        Debug: {subcategoryProducts.length} products in {subcategory}
                      </div>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MobileCategoryList; 