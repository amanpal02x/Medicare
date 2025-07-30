import React from 'react';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper, 
  Badge 
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const UnifiedBottomNavigation = ({ isPublic = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  // Unified navigation items for both public and user roles
  const navItems = [
    { label: 'Home', icon: <HomeIcon />, route: '/' },
    { label: 'Categories', icon: <CategoryIcon />, route: '/categories' },
    { label: 'Orders', icon: <ListAltIcon />, route: '/orders' },
    { label: 'Prescriptions', icon: <LocalHospitalIcon />, route: '/prescriptions' },
    { label: 'Profile', icon: <PersonIcon />, route: '/profile' },
  ];

  // Find the current nav index
  const currentNav = navItems.findIndex(item => location.pathname.startsWith(item.route));

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'fixed', 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 1201, 
        borderRadius: 0,
        borderTop: '1px solid #e3e7ef'
      }}
    >
      <BottomNavigation
        showLabels
        value={currentNav === -1 ? 0 : currentNav}
        onChange={(e, newValue) => {
          const selectedItem = navItems[newValue];
          navigate(selectedItem.route);
        }}
        sx={{ 
          height: 70, 
          bgcolor: '#fff',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 8px',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            marginTop: '2px',
            fontWeight: 500,
          },
          '& .Mui-selected': {
            color: '#1976d2',
            '& .MuiBottomNavigationAction-label': {
              fontWeight: 600,
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
            sx={{
              color: currentNav === navItems.indexOf(item) ? '#1976d2' : '#666',
              '&.Mui-selected': {
                color: '#1976d2',
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default UnifiedBottomNavigation; 