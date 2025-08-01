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
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowBack as ArrowBackIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Sort as SortIcon
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
  
  // Filter states
  const [filters, setFilters] = useState({
    brands: [],
    priceRange: [0, 5000],
    sortBy: 'name'
  });
  const [availableBrands, setAvailableBrands] = useState([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  
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

  // Extract available brands from products
  useEffect(() => {
    if (products.length > 0) {
      const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
      setAvailableBrands(brands);
    }
  }, [products]);

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
        
        // Apply filters
        const brandMatch = filters.brands.length === 0 || filters.brands.includes(p.brand);
        const priceMatch = p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1];
        
        return catMatch && brandMatch && priceMatch;
      })
    : [];

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const isLoading = loadingCats || loadingNearby;

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Group products by subcategory
  const productsBySubcategory = {};
  sortedProducts.forEach(product => {
    const subcategory = product.subcategory || 'Other';
    if (!productsBySubcategory[subcategory]) {
      productsBySubcategory[subcategory] = [];
    }
    productsBySubcategory[subcategory].push(product);
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const applyFilters = () => {
    setFilters(prev => ({
      ...prev,
      brands: selectedBrands
    }));
    setFilterDialogOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      brands: [],
      priceRange: [0, 5000],
      sortBy: 'name'
    });
    setSelectedBrands([]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.brands.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) count++;
    if (filters.sortBy !== 'name') count++;
    return count;
  };

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
          ) : sortedProducts.length === 0 ? (
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
                No products available with current filters
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Filter Bar */}
              <Box className="mobile-filter-bar" sx={{ 
                display: 'flex', 
                gap: 1, 
                mb: 2,
                overflowX: 'auto',
                pb: 1
              }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={() => setFilterDialogOpen(true)}
                  sx={{ 
                    minWidth: 'auto',
                    px: 2,
                    borderRadius: 2,
                    borderColor: getActiveFiltersCount() > 0 ? '#1976d2' : '#e0e0e0',
                    color: getActiveFiltersCount() > 0 ? '#1976d2' : '#333',
                    fontWeight: getActiveFiltersCount() > 0 ? 600 : 400
                  }}
                >
                  Filter {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                </Button>
                


                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    displayEmpty
                    sx={{ 
                      height: 36,
                      '& .MuiSelect-select': { py: 0.5, px: 1 }
                    }}
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                  </Select>
                </FormControl>

                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    sx={{ 
                      minWidth: 'auto',
                      px: 1,
                      color: '#666'
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Box>

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
                    
                    {/* Subcategory Products - 2 per row */}
                    <Box className="mobile-product-grid-2-columns">
                      {subcategoryProducts.map(product => (
                        <CompactItemCard key={product._id} item={product} type={product.type || 'product'} />
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Filter Dialog */}
      <Dialog 
        open={filterDialogOpen} 
        onClose={() => setFilterDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Filters</Typography>
            <Button onClick={clearFilters} size="small" color="error">
              Clear All
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Price Range */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Price Range
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={5000}
                step={100}
                valueLabelFormat={(value) => `₹${value}`}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ₹{filters.priceRange[0]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ₹{filters.priceRange[1]}
                </Typography>
              </Box>
            </Box>

            {/* Brands */}
            {availableBrands.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Brands
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {availableBrands.map((brand) => (
                    <FormControlLabel
                      key={brand}
                      control={
                        <Checkbox
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                          size="small"
                        />
                      }
                      label={brand}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            )}



            {/* Sort By */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Sort By
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button onClick={applyFilters} variant="contained">Apply Filters</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MobileCategoryList; 