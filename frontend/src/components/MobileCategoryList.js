import React, { useEffect, useState } from 'react';
import { getAllCategories } from '../services/categories';
import './MobileCategoryList.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CompactItemCard from './CompactItemCard';
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
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loadingCats, setLoadingCats] = useState(true);
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
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
      setLoadingCats(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedSubcategory(null);
    setExpandedSubcategories({});
  }, [selectedCategory]);

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
        const catMatch = p.category && (p.category._id === selectedCategory || p.category === selectedCategory);
        const subcatMatch = !selectedSubcategory || p.subcategory === selectedSubcategory;
        return catMatch && subcatMatch;
      })
    : [];

  const isLoading = loadingCats || loadingNearby;

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const toggleSubcategoryExpansion = (subcategory) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategory]: !prev[subcategory]
    }));
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setExpandedSubcategories({});
  };

  // If no category is selected, show the category list
  if (!selectedCategory) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: '#f8f9fa',
        pb: 10 // Space for bottom navigation
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

        {/* Category List */}
        <Box sx={{ p: 2 }} className="mobile-category-list">
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {categories.map((category, index) => (
                <React.Fragment key={category._id}>
                  <Box
                    onClick={() => handleCategoryClick(category._id)}
                    className="mobile-category-item"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      background: '#fff',
                      cursor: 'pointer'
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
                      variant="body1" 
                      fontWeight={600}
                      sx={{ flex: 1 }}
                    >
                      {category.name}
                    </Typography>
                    
                    {/* Arrow indicator */}
                    <Box sx={{ color: '#666' }}>
                      <ExpandMoreIcon />
                    </Box>
                  </Box>
                  
                  {index < categories.length - 1 && (
                    <Divider sx={{ mx: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // If category is selected, show subcategories and products
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: '#f8f9fa',
      pb: 10 // Space for bottom navigation
    }}>
      {/* Header with back button */}
      <Box sx={{ 
        background: '#fff', 
        p: 2, 
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={handleBackToCategories}
            sx={{ color: '#1976d2' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} color="#1976d2">
            {selectedCatObj?.name}
          </Typography>
        </Box>
      </Box>

      {/* Subcategories and Products */}
      <Box sx={{ p: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : locationError ? (
          <Alert severity="error" sx={{ mb: 2 }}>{locationError}</Alert>
        ) : errorNearby ? (
          <Alert severity="error" sx={{ mb: 2 }}>{errorNearby}</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sortedSubcategories.map((subcategory) => {
              const subcategoryProducts = filteredProducts.filter(p => p.subcategory === subcategory);
              const isExpanded = expandedSubcategories[subcategory];
              
              return (
                <Box key={subcategory} sx={{ background: '#fff', borderRadius: 2, overflow: 'hidden' }}>
                                     {/* Subcategory Header */}
                   <Box
                     onClick={() => toggleSubcategoryExpansion(subcategory)}
                     className="mobile-subcategory-header"
                     sx={{
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'space-between',
                       p: 2,
                       cursor: 'pointer',
                       background: selectedSubcategory === subcategory ? '#e3f2fd' : '#fff',
                       borderBottom: isExpanded ? '1px solid #e0e0e0' : 'none'
                     }}
                   >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {subcategory}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={subcategoryProducts.length} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                  </Box>
                  
                  {/* Subcategory Products */}
                  <Collapse in={isExpanded}>
                                         {subcategoryProducts.length > 0 ? (
                       <Box className="mobile-product-grid">
                         {getShuffledItems(subcategoryProducts, 9).map(product => (
                           <CompactItemCard key={product._id} item={product} type={product.type || 'product'} />
                         ))}
                       </Box>
                    ) : (
                      <Box sx={{ p: 2, textAlign: 'center', color: '#666' }}>
                        <Typography variant="body2">
                          No products available in this subcategory
                        </Typography>
                      </Box>
                    )}
                  </Collapse>
                </Box>
              );
            })}
            
            {/* Show all products if no subcategory is selected */}
            {selectedSubcategory === null && filteredProducts.length > 0 && (
              <Box sx={{ background: '#fff', borderRadius: 2, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  All Products ({filteredProducts.length})
                </Typography>
                                 <Box className="mobile-product-grid">
                   {getShuffledItems(filteredProducts, 12).map(product => (
                     <CompactItemCard key={product._id} item={product} type={product.type || 'product'} />
                   ))}
                 </Box>
              </Box>
            )}
            
            {filteredProducts.length === 0 && (
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
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MobileCategoryList; 