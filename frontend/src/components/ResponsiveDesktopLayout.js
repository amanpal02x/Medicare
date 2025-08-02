import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Button, 
  Avatar, 
  Badge, 
  Menu, 
  MenuItem, 
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import EnhancedProfilePopup from './EnhancedProfilePopup';
import Header from './Header';

const adminSidebarMenu = [
  { label: 'Dashboard', icon: <DashboardIcon />, route: '/admin' },
  { label: 'Orders', icon: <ListAltIcon />, route: '/admin/orders' },
  { label: 'Medicines', icon: <InventoryIcon />, route: '/admin/medicines' },
  { label: 'Categories', icon: <InventoryIcon />, route: '/admin/categories' },
  { label: 'Users', icon: <PeopleIcon />, route: '/admin/users' },
  { label: 'Manage Pharmacies', icon: <PeopleIcon />, route: '/admin/pharmacies' },
  { label: 'Deliveries', icon: <LocalOfferIcon />, route: '/admin/deliveries' },
  { label: 'Payments', icon: <BarChartIcon />, route: '/admin/payments' },
  { label: 'Refunds', icon: <BarChartIcon />, route: '/admin/refunds' },
  { label: 'Analytics', icon: <BarChartIcon />, route: '/admin/analytics' },
  { label: 'Customer Query', icon: <HelpIcon />, route: '/admin/support' },
  { label: 'Settings', icon: <SettingsIcon />, route: '/admin/settings' },
];

const pharmacistSidebarMenu = [
  { label: 'Dashboard', icon: <DashboardIcon />, route: '/pharmacist' },
  { label: 'Sale', icon: <LocalOfferIcon />, route: '/pharmacist/sale' },
  { label: 'Product', icon: <InventoryIcon />, route: '/pharmacist/products' },
  { label: 'Suppliers', icon: <PeopleIcon />, route: '/pharmacist/suppliers' },
  { label: 'Customer', icon: <PeopleIcon />, route: '/pharmacist/customers' },
  { label: 'Medicine', icon: <InventoryIcon />, route: '/pharmacist/medicines' },
  { label: 'Deals of the Day', icon: <CardGiftcardIcon />, route: '/pharmacist/deals' },
  { label: 'Invoice', icon: <AssignmentIcon />, route: '/pharmacist/invoices' },
  { label: 'Order Management', icon: <AssignmentIcon />, route: '/pharmacist/order-management' },
  { label: 'Sales Report', icon: <BarChartIcon />, route: '/pharmacist/sales-report' },
  { label: 'Prescriptions', icon: <AssignmentIcon />, route: '/pharmacist/prescriptions' },
  { label: 'Support', icon: <HelpIcon />, route: '/pharmacist/help-support' },
];

const userSidebarMenu = [
  { label: 'Home', icon: <DashboardIcon />, route: '/' },
  { label: 'Orders', icon: <ListAltIcon />, route: '/orders' },
  { label: 'Prescriptions', icon: <AssignmentIcon />, route: '/prescriptions' },
  { label: 'Cart', icon: <ShoppingCartIcon />, route: '/cart' },
  { label: 'Profile', icon: <PersonIcon />, route: '/profile' },
];

const ResponsiveDesktopLayout = ({ 
  children, 
  isPublic = false, 
  isUserPage = false,
  toggleDarkMode, 
  darkMode,
  screenWidth 
}) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePopoverAnchor, setProfilePopoverAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [userAddress, setUserAddress] = useState('');

  // Get appropriate menu based on user role
  const getSidebarMenu = () => {
    if (user?.role === 'admin') return adminSidebarMenu;
    if (user?.role === 'pharmacist') return pharmacistSidebarMenu;
    return userSidebarMenu;
  };

  const sidebarMenu = getSidebarMenu();

  useEffect(() => {
    // Fetch address from localStorage
    const savedAddress = localStorage.getItem('deliveryAddress');
    setUserAddress(savedAddress || '');
    
    const handleStorage = () => {
      setUserAddress(localStorage.getItem('deliveryAddress') || '');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleProfilePopoverOpen = (event) => {
    setProfilePopoverAnchor(event.currentTarget);
  };

  const handleProfilePopoverClose = () => {
    setProfilePopoverAnchor(null);
  };

  const handleNotifOpen = (e) => {
    setNotifAnchor(e.currentTarget);
  };

  const handleNotifClose = () => setNotifAnchor(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuClick = (route) => {
    navigate(route);
    handleSidebarClose();
  };

  const isProfilePopoverOpen = Boolean(profilePopoverAnchor);

  // For public pages, render children directly
  if (isPublic) {
    return children;
  }

  // For admin/pharmacist pages, use sidebar layout
  if (user?.role === 'admin' || user?.role === 'pharmacist') {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f3e7fa 0%, #e3eeff 100%)' }}>
        {/* Responsive Sidebar */}
        <Drawer
          variant={isSmallScreen ? "temporary" : "permanent"}
          open={sidebarOpen}
          onClose={handleSidebarClose}
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              background: '#fff',
              borderRight: '1.5px solid #e0e7ff',
              pt: 2,
            },
          }}
        >
          <Box sx={{ px: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight={700} color="primary" sx={{ letterSpacing: 1, cursor: 'pointer' }} onClick={() => navigate('/pharmacist')}>
              MediCare
            </Typography>
            {isSmallScreen && (
              <IconButton onClick={handleSidebarClose}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
          <List>
            {sidebarMenu.map((item) => (
              <ListItem
                button
                key={item.label}
                selected={item.route !== '#' && location.pathname.startsWith(item.route)}
                sx={{ borderRadius: 2, mb: 0.5 }}
                onClick={() => handleMenuClick(item.route)}
              >
                <ListItemIcon sx={{ color: '#1976d2' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 0 }}>
          {/* Top Bar */}
          <AppBar position="fixed" color="default" elevation={1} sx={{ background: '#fff', zIndex: theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
              {/* Left side - Menu button and title */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleSidebarToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  {user?.role === 'admin' ? 'Admin Dashboard' : 'Pharmacist Dashboard'}
                </Typography>
              </Box>

              {/* Right side - User actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Notifications">
                  <IconButton color="primary" onClick={handleNotifOpen}>
                    <Badge badgeContent={notifications?.filter(n => !n.isRead).length || 0} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={user?.name || 'Account'}>
                  <IconButton onClick={handleProfilePopoverOpen}>
                    <Avatar sx={{ width: 32, height: 32 }} src={user?.profilePhoto || null}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Notifications Menu */}
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={handleNotifClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                maxWidth: 400,
                maxHeight: 500,
                overflow: 'auto'
              }
            }}
          >
            {notifications?.length === 0 ? (
              <MenuItem disabled>No notifications</MenuItem>
            ) : (
              notifications?.map(n => (
                <MenuItem 
                  key={n._id} 
                  onClick={() => {
                    setNotifAnchor(null);
                    navigate('/notifications');
                  }}
                  sx={{ 
                    whiteSpace: 'normal', 
                    maxWidth: 400,
                    borderBottom: '1px solid #f0f0f0',
                    py: 2,
                    backgroundColor: !n.isRead ? '#f0f8ff' : 'transparent',
                    borderLeft: !n.isRead ? '4px solid #1976d2' : '4px solid transparent',
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>

          {/* Profile Popover */}
          <EnhancedProfilePopup
            user={user}
            onLogout={handleLogout}
            open={isProfilePopoverOpen}
            anchorEl={profilePopoverAnchor}
            onClose={handleProfilePopoverClose}
          />

          {/* Page Content */}
          <Box sx={{ 
            p: 3, 
            minHeight: 'calc(100vh - 64px)', 
            mt: '64px',
            ml: isSmallScreen ? 0 : '240px'
          }}>
            {children}
          </Box>
        </Box>
      </Box>
    );
  }

  // For user pages, use header-based layout
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Responsive Header */}
      <AppBar position="fixed" color="default" elevation={1} sx={{ background: '#fff' }}>
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Left side - Menu button and brand */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleSidebarToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h5" 
              color="primary" 
              fontWeight={700} 
              letterSpacing={2} 
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              MediCare
            </Typography>
          </Box>

          {/* Center - Location */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer', 
            minWidth: 120, 
            maxWidth: 160,
            background: 'transparent', 
            borderRadius: 2, 
            px: 1.5, 
            py: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'rgba(33,134,235,0.04)',
              transform: 'translateY(-1px)'
            }
          }}
            title={userAddress ? userAddress : 'Set Location'}
          >
            <LocationOnIcon color="primary" sx={{ mr: 0.8, fontSize: 18 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
              <Typography variant="body2" color="primary" fontWeight={600} sx={{ fontSize: 13 }}>
                {userAddress ? userAddress.split(',')[0] : 'Set Location'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: 10, whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userAddress ? userAddress.split(',').slice(1).join(',').trim() : 'Choose your area'}
              </Typography>
            </Box>
          </Box>

          {/* Right side - User actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton color="primary" onClick={handleNotifOpen}>
                <Badge badgeContent={notifications?.filter(n => !n.isRead).length || 0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <IconButton 
              color="primary" 
              onClick={() => navigate('/cart')}
              sx={{
                background: 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'rgba(33,134,235,0.04)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            
            <Tooltip title={user?.name || 'Account'}>
              <IconButton onClick={handleProfilePopoverOpen}>
                <Avatar sx={{ width: 32, height: 32 }} src={user?.profilePhoto || null}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Responsive Sidebar for Users */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={handleSidebarClose}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            background: '#fff',
            borderRight: '1.5px solid #e0e7ff',
            pt: 2,
          },
        }}
      >
        <Box sx={{ px: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight={700} color="primary" sx={{ letterSpacing: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            MediCare
          </Typography>
          <IconButton onClick={handleSidebarClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {sidebarMenu.map((item) => (
            <ListItem
              button
              key={item.label}
              selected={item.route !== '#' && location.pathname.startsWith(item.route)}
              sx={{ borderRadius: 2, mb: 0.5 }}
              onClick={() => handleMenuClick(item.route)}
            >
              <ListItemIcon sx={{ color: '#1976d2' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={handleNotifClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            maxWidth: 400,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
      >
        {notifications?.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          notifications?.map(n => (
            <MenuItem 
              key={n._id} 
              onClick={() => {
                setNotifAnchor(null);
                navigate('/notifications');
              }}
              sx={{ 
                whiteSpace: 'normal', 
                maxWidth: 400,
                borderBottom: '1px solid #f0f0f0',
                py: 2,
                backgroundColor: !n.isRead ? '#f0f8ff' : 'transparent',
                borderLeft: !n.isRead ? '4px solid #1976d2' : '4px solid transparent',
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {n.message}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Profile Popover */}
      <EnhancedProfilePopup
        user={user}
        onLogout={handleLogout}
        open={isProfilePopoverOpen}
        anchorEl={profilePopoverAnchor}
        onClose={handleProfilePopoverClose}
      />

      {/* Page Content */}
      <Box sx={{ 
        flexGrow: 1, 
        p: 3, 
        minHeight: 'calc(100vh - 64px)', 
        mt: '64px'
      }}>
        {children}
      </Box>
    </Box>
  );
};

export default ResponsiveDesktopLayout; 