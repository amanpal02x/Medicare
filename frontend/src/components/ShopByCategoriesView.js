import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  IconButton,
  Chip,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../services/categories';

const ShopByCategoriesView = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getAllCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategory(cats[0]._id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const popularStores = [
    { name: 'FREEDOM SALE', label: 'Wishlist Now', color: '#4caf50', tag: null },
    { name: 'RAKHI SPECIALS', label: 'Celebrate the bond', color: '#ff9800', tag: 'LIVE' },
    { name: 'AADI THALLAADHABADI SALE', label: 'Mega Deals', color: '#ffc107', tag: 'LIVE' },
    { name: 'Get in 10 MINS', label: 'Flipkart Minutes', color: '#f44336', tag: null },
    { name: 'Flipkart STUDENT\'S CLUB', label: 'Claim Now', color: '#2196f3', tag: null },
    { name: 'Kid\'s Zone', label: 'Kid\'s Zone', color: '#9c27b0', tag: null, icon: '👶' },
  ];

  const recentlyViewedStores = [
    { name: 'Pen Drives', image: '🔴', color: '#f44336' },
    { name: 'Tablets without Call Facility', image: '📱', color: '#4caf50' },
    { name: 'Food S', image: '🥜', color: '#8d6e63' },
  ];

  const haveYouTried = [
    { name: 'Flipkart UPI', icon: '💳', color: '#9c27b0' },
    { name: 'SuperCoin', icon: '⚡', color: '#ff9800' },
    { name: 'Plus Zone', icon: '⭐', color: '#ffc107' },
    { name: '₹', icon: '₹', color: '#2196f3' },
    { name: 'Pay', icon: '💳', color: '#2196f3' },
    { name: '₹10 L', icon: '💰', color: '#2196f3' },
  ];

  if (isMobile) {
    return (
      <Box sx={{ 
        display: 'flex', 
        height: '100vh', 
        bgcolor: '#f5f5f5',
        overflow: 'hidden',
        flexDirection: 'column'
      }}>
        {/* Top Header */}
        <Box sx={{ 
          bgcolor: '#fff', 
          borderBottom: '1px solid #e0e0e0',
          p: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Typography variant="h6" fontWeight={600}>
              All Categories
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small">
                <SearchIcon />
              </IconButton>
              <IconButton size="small">
                <CameraAltIcon />
              </IconButton>
              <IconButton size="small">
                <ShoppingCartIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto',
          display: 'flex'
        }}>
          {/* Left Sidebar - Categories */}
          <Box sx={{ 
            width: '40%', 
            bgcolor: '#fff', 
            borderRight: '1px solid #e0e0e0',
            overflowY: 'auto',
            p: 1
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {categories.map((category) => (
                <Box
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: selectedCategory === category._id ? '#e3f2fd' : 'transparent',
                    border: selectedCategory === category._id ? '1px solid #1976d2' : '1px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {category.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography 
                    variant="caption" 
                    fontWeight={selectedCategory === category._id ? 600 : 400}
                    color={selectedCategory === category._id ? '#1976d2' : 'inherit'}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    {category.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Content Area */}
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            p: 1
          }}>
            {/* Popular Store Section */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: '0.8rem' }}>
              Popular Store
            </Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {popularStores.map((store, index) => (
                <Grid item xs={4} key={index}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}>
                    <CardContent sx={{ p: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: store.color,
                          mx: 'auto',
                          mb: 0.5,
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {store.icon || store.name.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, fontSize: '0.6rem' }}>
                        {store.name}
                      </Typography>
                      {store.tag && (
                        <Chip 
                          label={store.tag} 
                          size="small" 
                          color="error" 
                          sx={{ mb: 0.5, fontSize: '0.5rem', height: '16px' }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                        {store.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 1 }} />

            {/* Recently Viewed Stores */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: '0.8rem' }}>
              Recently Viewed Stores
            </Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {recentlyViewedStores.map((store, index) => (
                <Grid item xs={4} key={index}>
                  <Card sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}>
                    <CardContent sx={{ p: 1, textAlign: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 35, 
                          height: 35, 
                          bgcolor: store.color,
                          mx: 'auto',
                          mb: 0.5,
                          fontSize: '1rem'
                        }}
                      >
                        {store.image}
                      </Avatar>
                      <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.6rem' }}>
                        {store.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 1 }} />

            {/* Have you tried? */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: '0.8rem' }}>
              Have you tried?
            </Typography>
            <Grid container spacing={1}>
              {haveYouTried.map((item, index) => (
                <Grid item xs={4} key={index}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}>
                    <CardContent sx={{ p: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 35, 
                          height: 35, 
                          bgcolor: item.color,
                          mx: 'auto',
                          mb: 0.5,
                          fontSize: '0.8rem'
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.6rem' }}>
                        {item.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    );
  }

  // Desktop version
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      bgcolor: '#f5f5f5',
      overflow: 'hidden'
    }}>
      {/* Left Sidebar - All Categories */}
      <Box sx={{ 
        width: '35%', 
        bgcolor: '#fff', 
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        p: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          pb: 1,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6" fontWeight={600}>
            All Categories
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small">
              <SearchIcon />
            </IconButton>
            <IconButton size="small">
              <CameraAltIcon />
            </IconButton>
            <IconButton size="small">
              <ShoppingCartIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {categories.map((category) => (
            <Box
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: selectedCategory === category._id ? '#e3f2fd' : 'transparent',
                border: selectedCategory === category._id ? '1px solid #1976d2' : '1px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                {category.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography 
                variant="body2" 
                fontWeight={selectedCategory === category._id ? 600 : 400}
                color={selectedCategory === category._id ? '#1976d2' : 'inherit'}
              >
                {category.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Content Area */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        p: 2
      }}>
        {/* Popular Store Section */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Popular Store
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {popularStores.map((store, index) => (
            <Grid item xs={4} key={index}>
              <Card sx={{ 
                textAlign: 'center', 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' }
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      bgcolor: store.color,
                      mx: 'auto',
                      mb: 1,
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {store.icon || store.name.charAt(0)}
                  </Avatar>
                  <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>
                    {store.name}
                  </Typography>
                  {store.tag && (
                    <Chip 
                      label={store.tag} 
                      size="small" 
                      color="error" 
                      sx={{ mb: 0.5, fontSize: '0.6rem' }}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {store.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Recently Viewed Stores */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Recently Viewed Stores
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {recentlyViewedStores.map((store, index) => (
            <Grid item xs={4} key={index}>
              <Card sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' }
              }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 50, 
                      height: 50, 
                      bgcolor: store.color,
                      mx: 'auto',
                      mb: 1,
                      fontSize: '1.5rem'
                    }}
                  >
                    {store.image}
                  </Avatar>
                  <Typography variant="caption" fontWeight={500}>
                    {store.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Have you tried? */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Have you tried?
        </Typography>
        <Grid container spacing={2}>
          {haveYouTried.map((item, index) => (
            <Grid item xs={4} key={index}>
              <Card sx={{ 
                textAlign: 'center', 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' }
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 50, 
                      height: 50, 
                      bgcolor: item.color,
                      mx: 'auto',
                      mb: 1,
                      fontSize: '1.2rem'
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Typography variant="caption" fontWeight={500}>
                    {item.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ShopByCategoriesView; 