import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Badge, Box, useTheme, Menu, MenuItem, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPopup from './NotificationPopup';
import UnifiedBottomNavigation from './UnifiedBottomNavigation';

const navItems = [
  { label: 'Dashboard', icon: <HomeIcon />, route: '/delivery' },
  { label: 'Orders', icon: <ListAltIcon />, route: '/delivery/orders' },
  { label: 'Location', icon: <LocationOnIcon />, route: '/delivery/location' },
  { label: 'Profile', icon: <PersonIcon />, route: '/delivery/profile' },
];

const DeliveryMobileLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  // Find the current nav index
  const currentNav = navItems.findIndex(item => location.pathname.startsWith(item.route));

  // Avatar menu handlers
  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleProfile = () => {
    handleMenuClose();
    navigate('/delivery/profile');
  };
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleNotifOpen = (e) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fc', pb: 7, display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Top Bar */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', color: 'primary.main', borderBottom: '1px solid #e3e7ef' }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 1, color: 'primary.main' }}>
            MediCare
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
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
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, width: '100vw', maxWidth: '100vw', p: { xs: 1.5, sm: 2 }, pt: 2, pb: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
        {children}
      </Box>

      {/* Unified Bottom Navigation */}
      <UnifiedBottomNavigation />
    </Box>
  );
};

export default DeliveryMobileLayout; 