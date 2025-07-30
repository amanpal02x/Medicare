import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Badge, Box, BottomNavigation, BottomNavigationAction, Paper, useTheme, Menu, MenuItem, Divider, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationPopup from './NotificationPopup';

const publicNavItems = [
  { label: 'Home', icon: <HomeIcon />, route: '/' },
  { label: 'Categories', icon: <MenuIcon />, route: '/categories' },
  { label: 'Best Sellers', icon: <StarIcon />, route: '/best-sellers' },
  { label: 'Brands', icon: <LocalOfferIcon />, route: '/brands' },
  // About and Stores hidden on mobile as requested
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

  // Determine which nav items to use
  const navItems = isPublic ? publicNavItems : userNavItems;
  
  // Find the current nav index
  const currentNav = navItems.findIndex(item => location.pathname.startsWith(item.route));

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
      {/* Sticky Top Bar */}
      <AppBar position="sticky" elevation={0} className="mobile-header">
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              color="primary" 
              size="large" 
              onClick={handleDrawerToggle}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 1, color: 'primary.main' }}>
              MediCare
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isPublic && (
              <IconButton color="primary" size="large" onClick={() => navigate('/cart')}>
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )}
            
            {user && (
              <>
                <IconButton color="primary" size="large" onClick={handleNotifOpen}>
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <NotificationPopup
                  anchorEl={notifAnchorEl}
                  open={Boolean(notifAnchorEl)}
                  onClose={handleNotifClose}
                  onSeeAll={() => { handleNotifClose(); navigate('/notifications'); }}
                />
                <IconButton onClick={handleAvatarClick} size="large">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontWeight: 700 }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem disabled>{user?.email}</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleProfile}>Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile navigation */}
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

      {/* Main Content */}
      <Box className="mobile-content">
        {children}
      </Box>

      {/* Bottom Navigation - Only show for authenticated users */}
      {user && !isPublic && (
        <Paper elevation={3} className="mobile-bottom-nav">
          <BottomNavigation
            showLabels
            value={currentNav === -1 ? 0 : currentNav}
            onChange={(e, newValue) => navigate(navItems[newValue].route)}
            sx={{ height: 64, bgcolor: '#fff', borderTop: '1px solid #e3e7ef' }}
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={item.icon}
                sx={{
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default MobileLayout; 