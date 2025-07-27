import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, InputBase, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Button, Paper, Tooltip, Badge, Menu, MenuItem } from '@mui/material';
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
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

const adminSidebarMenu = [
  { label: 'Dashboard', icon: <DashboardIcon />, route: '/admin' },
  { label: 'Orders', icon: <ListAltIcon />, route: '/admin/orders' },
  { label: 'Medicines', icon: <InventoryIcon />, route: '/admin/medicines' },
  { label: 'Categories', icon: <InventoryIcon />, route: '/admin/categories' },
  { label: 'Users', icon: <PeopleIcon />, route: '/admin/users' },
  { label: 'Manage Pharmacies', icon: <PeopleIcon />, route: '/admin/pharmacies' },
  { label: 'Pharmacist Sales', icon: <BarChartIcon />, route: '/admin/pharmacist-sales' },
  { label: 'Deliveries', icon: <LocalOfferIcon />, route: '/admin/deliveries' },
  { label: 'Payments', icon: <BarChartIcon />, route: '/admin/payments' },
  { label: 'Refunds', icon: <BarChartIcon />, route: '/admin/refunds' },
  { label: 'Analytics', icon: <BarChartIcon />, route: '/admin/analytics' },
  { label: 'Customer Query', icon: <HelpIcon />, route: '/admin/support' },
  { label: 'Settings', icon: <SettingsIcon />, route: '/admin/settings' },
];

const sidebarMenu = [
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
  { label: 'Prescriptions', icon: <AssignmentIcon />, route: '/pharmacist/prescriptions', role: 'pharmacist' },
  // Add support link
  { label: 'Support', icon: <HelpIcon />, route: '/pharmacist/help-support' },
];

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/');
  };

  const hideHeader = user?.role === 'pharmacist';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f3e7fa 0%, #e3eeff 100%)' }}>
      {/* Sidebar */}
      {user?.role !== 'user' && (
        <Drawer
          variant="permanent"
          open={sidebarOpen}
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
          <Box sx={{ px: 2, mb: 2 }}>
            <Typography variant="h5" fontWeight={700} color="primary" sx={{ letterSpacing: 1, mb: 2, cursor: 'pointer' }} onClick={() => navigate('/pharmacist')}>
              MediCare
            </Typography>
          </Box>
          <List>
            {(user?.role === 'admin' ? adminSidebarMenu : sidebarMenu.filter(item => !item.role || user?.role === item.role)).map((item) => (
              <ListItem
                button
                key={item.label}
                selected={item.route !== '#' && location.pathname.startsWith(item.route)}
                sx={{ borderRadius: 2, mb: 0.5 }}
                onClick={() => { if (item.route !== '#') navigate(item.route); }}
              >
                <ListItemIcon sx={{ color: '#1976d2' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
            ))}
          </List>
        </Drawer>
      )}
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 0 }}>
        {/* Top Bar */}
        {user?.role !== 'admin' && !hideHeader && (
          <Header />
        )}
        {/* Page Content */}
        <Box sx={{ p: 0, minHeight: 'calc(100vh - 200px)' }}>{children}</Box>
        {/* Footer */}
        {user?.role !== 'pharmacist' && user?.role !== 'admin' && <Footer />}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 