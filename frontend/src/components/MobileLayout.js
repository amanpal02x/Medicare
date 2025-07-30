import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Badge, 
  Box, 
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
import CategoryIcon from '@mui/icons-material/Category';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationPopup from './NotificationPopup';
import UnifiedBottomNavigation from './UnifiedBottomNavigation';

// Navigation items are now handled by UnifiedBottomNavigation component

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

  // Navigation is now handled by UnifiedBottomNavigation component

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
      {/* Top Header for Mobile */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', color: 'primary.main', borderBottom: '1px solid #e3e7ef' }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56, px: 2 }}>
          {/* Location on the left */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              minWidth: 120, 
              background: 'linear-gradient(135deg, rgba(33,134,235,0.08) 0%, rgba(33,134,235,0.04) 100%)', 
              borderRadius: 3, 
              px: 2.5, 
              py: 1,
              maxWidth: 160,
              border: '1px solid rgba(33,134,235,0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(33,134,235,0.12) 0%, rgba(33,134,235,0.06) 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(33,134,235,0.15)'
              }
            }}
            onClick={() => setLocationDialogOpen(true)}
            title={userAddress ? userAddress : 'Set Location'}
          >
            <LocationOnIcon color="primary" sx={{ mr: 1.5, fontSize: 22 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
              <Typography variant="body2" color="primary" fontWeight={700} sx={{ fontSize: 13 }}>
                {userAddress ? userAddress.split(',')[0] : 'Set Location'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(25,118,210,0.1)'
            }}
            onClick={() => navigate('/')}
          >
            MediCare
          </Typography>

          {/* Cart on the right */}
          <IconButton 
            color="primary" 
            size="large" 
            onClick={() => navigate('/cart')}
            sx={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(33,134,235,0.08) 0%, rgba(33,134,235,0.04) 100%)',
              borderRadius: 3,
              border: '1px solid rgba(33,134,235,0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(33,134,235,0.12) 0%, rgba(33,134,235,0.06) 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(33,134,235,0.15)'
              }
            }}
          >
            <Badge badgeContent={cartCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', fontWeight: 700 } }}>
              <ShoppingCartIcon sx={{ fontSize: 24 }} />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Drawer for mobile navigation - only show for authenticated users */}
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
            },
          }}
          className="mobile-drawer"
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e3e7ef' }}>
            <Typography variant="h6" fontWeight={700} color="primary">
              Menu
            </Typography>
          </Box>
          <List sx={{ pt: 1 }}>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.label}
                selected={location.pathname.startsWith(item.route)}
                onClick={() => handleNavClick(item.route)}
                sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
              >
                <ListItemIcon sx={{ color: location.pathname.startsWith(item.route) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname.startsWith(item.route) ? 600 : 400,
                      color: location.pathname.startsWith(item.route) ? 'primary.main' : 'inherit',
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Drawer>
      )}

      {/* Main Content - with header offset */}
      <Box className="mobile-content" style={{ paddingBottom: '80px' }}>
        {children}
      </Box>

      {/* Unified Bottom Navigation */}
      <UnifiedBottomNavigation isPublic={isPublic} />

      {/* Location Dialog */}
      <Dialog 
        open={locationDialogOpen} 
        onClose={() => setLocationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon color="primary" />
            Set Delivery Location
          </Box>
        </DialogTitle>
        <DialogContent>
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
          />
          {resolvedAddress && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1, color: 'white' }}>
              <Typography variant="body2">
                <strong>Resolved Address:</strong> {resolvedAddress}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleLocationSave} 
            variant="contained" 
            disabled={!resolvedAddress || addressLoading}
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
        <Alert onClose={() => setShowLocationSnackbar(false)} severity="success">
          Location updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileLayout; 