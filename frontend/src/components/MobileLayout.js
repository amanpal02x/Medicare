import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Badge, 
  Box, 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper, 
  useTheme, 
  Menu, 
  MenuItem, 
  Divider, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import './MobileLayout.css';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import StoreIcon from '@mui/icons-material/Store';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationPopup from './NotificationPopup';

const publicNavItems = [
  { label: 'Home', icon: <HomeIcon />, route: '/' },
  { label: 'Orders', icon: <ListAltIcon />, route: '/orders' },
  { label: 'Prescriptions', icon: <LocalHospitalIcon />, route: '/prescriptions' },
  { label: 'Profile', icon: <PersonIcon />, route: '/profile' },
  { label: 'Support', icon: <SupportAgentIcon />, route: '/help-supports' },
];

const userNavItems = [
  { label: 'Home', icon: <HomeIcon />, route: '/' },
  { label: 'Search', icon: <SearchIcon />, route: '/search' },
  { label: 'Cart', icon: <ShoppingCartIcon />, route: '/cart' },
  { label: 'Orders', icon: <ListAltIcon />, route: '/orders' },
  { label: 'Profile', icon: <PersonIcon />, route: '/profile' },
];

const MobileLayout = ({ children, isPublic = false }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Location state
  const [userAddress, setUserAddress] = useState('');
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [addressField, setAddressField] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [resolvedCoords, setResolvedCoords] = useState(null);
  const [showLocationSnackbar, setShowLocationSnackbar] = useState(false);

  // Determine which nav items to use
  const navItems = isPublic ? publicNavItems : userNavItems;
  
  // Find the current nav index
  const currentNav = navItems.findIndex(item => location.pathname.startsWith(item.route));

  useEffect(() => {
    // Fetch address from localStorage
    const savedAddress = localStorage.getItem('deliveryAddress');
    setUserAddress(savedAddress || '');
    
    // Listen for storage changes
    const handleStorage = () => {
      setUserAddress(localStorage.getItem('deliveryAddress') || '');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Resolve address when addressField changes
  useEffect(() => {
    setResolvedAddress('');
    setResolvedCoords(null);
    setAddressError('');
    if (!addressField) return;
    
    // Check for pincode (6 digits)
    if (/^\d{6}$/.test(addressField.trim())) {
      setAddressLoading(true);
      fetch(`https://api.postalpincode.in/pincode/${addressField.trim()}`)
        .then(res => res.json())
        .then(data => {
          if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const po = data[0].PostOffice[0];
            const fullAddress = `${po.Name}, ${po.District}, ${po.State} - ${po.Pincode}`;
            setResolvedAddress(fullAddress);
            setAddressError('');
          } else {
            setAddressError('Invalid pincode');
          }
        })
        .catch(() => setAddressError('Failed to resolve pincode'))
        .finally(() => setAddressLoading(false));
    } else if (addressField.length > 3) {
      // For non-pincode addresses, just use as is
      setResolvedAddress(addressField);
      setAddressError('');
    }
  }, [addressField]);

  const handleLocationSave = () => {
    if (resolvedAddress) {
      localStorage.setItem('deliveryAddress', resolvedAddress);
      setUserAddress(resolvedAddress);
      setLocationDialogOpen(false);
      setAddressField('');
      setResolvedAddress('');
      setShowLocationSnackbar(true);
    }
  };

  const handleLocationClick = () => {
    setLocationDialogOpen(true);
  };

  // Avatar menu handlers
  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleNotifOpen = (e) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleNavClick = (route) => {
    navigate(route);
    setDrawerOpen(false);
  };

  return (
    <Box className="mobile-layout">
      {/* Enhanced Top Header for Mobile */}
      <AppBar position="sticky" elevation={0} sx={{ 
        bgcolor: '#fff', 
        color: 'primary.main', 
        borderBottom: '1px solid #e3e7ef',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          minHeight: 64, 
          px: 2,
          py: 1
        }}>
          {/* Hamburger Menu Button */}
          <IconButton
            edge="start"
            color="primary"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 1,
              p: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Location on the left */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              minWidth: 120, 
              background: 'rgba(33,134,235,0.08)', 
              borderRadius: 2, 
              px: 2, 
              py: 1,
              maxWidth: 140,
              border: '1px solid rgba(33,134,235,0.15)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(33,134,235,0.12)',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(33,134,235,0.15)'
              }
            }}
            onClick={() => setLocationDialogOpen(true)}
            title={userAddress ? userAddress : 'Set Location'}
          >
            <LocationOnIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
              <Typography variant="body2" color="primary" fontWeight={700} sx={{ fontSize: 12 }}>
                {userAddress ? userAddress.split(',')[0] : 'Set Location'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userAddress ? userAddress.split(',').slice(1).join(',').trim() : 'Choose your area'}
              </Typography>
            </Box>
          </Box>

          {/* Brand in center */}
          <Typography 
            variant="h6" 
            color="primary" 
            fontWeight={700} 
            sx={{ 
              letterSpacing: 1, 
              cursor: 'pointer',
              fontSize: '1.3rem',
              flex: 1,
              textAlign: 'center',
              '&:hover': {
                opacity: 0.8
              }
            }}
            onClick={() => navigate('/')}
          >
            MediCare
          </Typography>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            {user && (
              <IconButton 
                color="primary" 
                size="large" 
                onClick={handleNotifOpen}
                sx={{ 
                  p: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                  }
                }}
              >
                <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}
            
            {/* Cart */}
            <IconButton 
              color="primary" 
              size="large" 
              onClick={() => navigate('/cart')}
              sx={{ 
                position: 'relative',
                p: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                }
              }}
            >
              <Badge badgeContent={cartCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}>
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Enhanced Drawer for mobile navigation - only show for authenticated users */}
      {user && !isPublic && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              bgcolor: '#fff',
              boxShadow: '4px 0 16px rgba(0,0,0,0.1)',
            },
          }}
          className="mobile-drawer"
        >
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid #e3e7ef',
            background: 'linear-gradient(135deg, #f8fbff 0%, #e3f0ff 100%)'
          }}>
            <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 1 }}>
              Welcome back!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.name || user?.email}
            </Typography>
          </Box>
          <List sx={{ pt: 2 }}>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.label}
                selected={location.pathname.startsWith(item.route)}
                onClick={() => handleNavClick(item.route)}
                sx={{ 
                  borderRadius: 2, 
                  mx: 1, 
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname.startsWith(item.route) ? 'primary.main' : 'inherit',
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname.startsWith(item.route) ? 600 : 500,
                      color: location.pathname.startsWith(item.route) ? 'primary.main' : 'inherit',
                      fontSize: '1rem'
                    }
                  }}
                />
              </ListItem>
            ))}
            
            {/* Divider */}
            <Divider sx={{ my: 2, mx: 2 }} />
            
            {/* Logout option */}
            <ListItem
              button
              onClick={handleLogout}
              sx={{ 
                borderRadius: 2, 
                mx: 1, 
                mb: 0.5,
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                }
              }}
            >
              <ListItemIcon sx={{ color: '#d32f2f', minWidth: 40 }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontWeight: 500,
                    color: '#d32f2f',
                    fontSize: '1rem'
                  }
                }}
              />
            </ListItem>
          </List>
        </Drawer>
      )}

      {/* Main Content - with header offset */}
      <Box className="mobile-content" style={{ 
        paddingBottom: '80px',
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #f8fbff 0%, #e3f0ff 100%)'
      }}>
        {children}
      </Box>

      {/* Enhanced Bottom Navigation - Show for all mobile users */}
      <Paper elevation={8} className="mobile-bottom-nav" sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1201,
        borderRadius: '16px 16px 0 0',
        border: '1px solid #e3e7ef',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <BottomNavigation
          showLabels
          value={currentNav === -1 ? 0 : currentNav}
          onChange={(e, newValue) => {
            const selectedItem = navItems[newValue];
            if (selectedItem.route === 'location') {
              handleLocationClick();
            } else {
              navigate(selectedItem.route);
            }
          }}
          sx={{ 
            height: 70, 
            bgcolor: 'transparent', 
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '8px 4px',
              '&.Mui-selected': {
                color: 'primary.main',
                '& .MuiBottomNavigationAction-label': {
                  fontWeight: 600,
                }
              }
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              marginTop: '4px',
              fontWeight: 500,
            }
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={
                item.label === 'Cart' ? (
                  <Badge badgeContent={cartCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}>
                    {item.icon}
                  </Badge>
                ) : item.icon
              }
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>

      {/* Notification Popup */}
      <NotificationPopup
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotifClose}
        onSeeAll={() => { handleNotifClose(); navigate('/notifications'); }}
      />

      {/* Location Dialog */}
      <Dialog 
        open={locationDialogOpen} 
        onClose={() => setLocationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Set Delivery Location
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Enter your address or pincode"
            type="text"
            fullWidth
            variant="outlined"
            value={addressField}
            onChange={(e) => setAddressField(e.target.value)}
            placeholder="e.g., 110001 or your full address"
            error={!!addressError}
            helperText={addressError || (resolvedAddress && 'Address resolved successfully')}
            InputProps={{
              endAdornment: addressLoading && <CircularProgress size={20} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          {resolvedAddress && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'success.light', 
              borderRadius: 2, 
              color: 'white',
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
              <Typography variant="body2">
                <strong>Resolved Address:</strong> {resolvedAddress}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setLocationDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLocationSave} 
            variant="contained" 
            disabled={!resolvedAddress || addressLoading}
            sx={{ borderRadius: 2 }}
          >
            Save Location
          </Button>
        </DialogActions>
      </Dialog>

      {/* Location Snackbar */}
      <Snackbar
        open={showLocationSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowLocationSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowLocationSnackbar(false)} 
          severity="success"
          sx={{ borderRadius: 2 }}
        >
          Location updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileLayout; 