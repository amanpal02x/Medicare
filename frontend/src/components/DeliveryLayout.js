import React, { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Button, 
  Menu, 
  MenuItem, 
  Divider,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  LocalShipping as DeliveryIcon,
  Home as HomeIcon,
  Assignment as OrdersIcon,
  LocationOn as LocationIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationPopup from './NotificationPopup';

const deliveryMenu = [
  { label: 'Dashboard', icon: <HomeIcon />, route: '/delivery' },
  { label: 'Orders', icon: <OrdersIcon />, route: '/delivery/orders' },
  { label: 'Location', icon: <LocationIcon />, route: '/delivery/location' },
  { label: 'Profile', icon: <ProfileIcon />, route: '/delivery/profile' },
];

const DeliveryLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/');
  };
  const handleNotifOpen = (e) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(135deg, #f3e7fa 0%, #e3eeff 100%)' }}>
      {/* Top Bar */}
      <AppBar position="static" color="inherit" elevation={0} sx={{ background: 'transparent', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 3, py: 1 }}>
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeliveryIcon sx={{ color: '#1976d2', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={700} color="primary" sx={{ letterSpacing: 1 }}>
              MediCare Delivery
            </Typography>
          </Box>

          {/* Navigation Menu - Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {deliveryMenu.map((item) => (
              <Button
                key={item.label}
                startIcon={item.icon}
                onClick={() => navigate(item.route)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: location.pathname === item.route ? '#1976d2' : '#666',
                  backgroundColor: location.pathname === item.route ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Notifications">
              <IconButton color="primary" onClick={handleNotifOpen}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <NotificationPopup
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleNotifClose}
              onSeeAll={() => { handleNotifClose(); navigate('/notifications'); }}
            />
            <Button
              startIcon={
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                </Avatar>
              }
              onClick={handleMenuOpen}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                color: '#222', 
                fontSize: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              {user?.name || 'Delivery Partner'}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem disabled>{user?.email}</MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleMenuClose(); navigate('/delivery/profile'); }}>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        {children}
      </Box>
    </Box>
  );
};

export default DeliveryLayout; 