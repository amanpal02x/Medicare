import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, Box, Popover, Divider } from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { getPharmacistProfile } from '../services/pharmacist';

const PharmacistHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [pharmacyName, setPharmacyName] = useState('');

  useEffect(() => {
    const fetchPharmacyName = async () => {
      try {
        const profile = await getPharmacistProfile();
        setPharmacyName(profile.pharmacyName || '');
      } catch (error) {
        console.error('Failed to fetch pharmacy name:', error);
      }
    };

    if (user && user.role === 'pharmacist') {
      fetchPharmacyName();
    }
  }, [user]);

  if (!user || user.role !== 'pharmacist') return null;

  const handleProfileClick = (event) => {
    setProfileAnchor(event.currentTarget);
  };
  const handleProfileClose = () => setProfileAnchor(null);
  const handleLogout = () => {
    setProfileAnchor(null);
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ background: '#fff' }}>
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Typography 
          variant="h4" 
          color="primary" 
          fontWeight={700} 
          letterSpacing={2} 
          sx={{ textAlign: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/pharmacist')}
        >
          MediCare
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<MedicationIcon />}
            sx={{ textTransform: 'none', fontWeight: 500, fontSize: 15 }}
            onClick={() => navigate('/pharmacist/medicines')}
          >
            Manage Medicines
          </Button>

          <Button
            startIcon={<LocalOfferIcon />}
            sx={{ textTransform: 'none', fontWeight: 500, fontSize: 15 }}
            onClick={() => navigate('/pharmacist/discounts')}
          >
            Discounts
          </Button>
          <IconButton onClick={handleProfileClick} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
            </Avatar>
          </IconButton>
          <Popover
            open={Boolean(profileAnchor)}
            anchorEl={profileAnchor}
            onClose={handleProfileClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                p: 0,
                minWidth: 240,
                borderRadius: 4,
                boxShadow: 6,
                background: 'linear-gradient(135deg, rgba(227,240,255,0.85) 0%, rgba(248,251,255,0.85) 100%)',
                overflow: 'hidden',
                border: '1.5px solid #e0e7ff',
                backdropFilter: 'blur(8px)',
              }
            }}
          >
            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5} sx={{ p: 1.5 }}>
              <Avatar sx={{
                width: 48,
                height: 48,
                mb: 0.5,
                border: '2px solid #1976d2',
                boxShadow: 2,
                fontSize: 22,
                bgcolor: 'primary.main',
                color: '#fff',
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}
              </Avatar>
              <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom letterSpacing={1}>
                Profile
              </Typography>
              <div style={{color: 'red', fontWeight: 'bold', marginBottom: 8}}>TEST LINK HERE</div>
              {/* Link to profile page below the Profile header */}
              <Typography variant="body2" sx={{ mb: 1 }}>
                <Button
                  component={RouterLink}
                  to="/pharmacist/profile"
                  size="small"
                  sx={{ textTransform: 'none', p: 0, minWidth: 0, fontSize: 13 }}
                  color="primary"
                >
                  View/Edit Full Profile
                </Button>
              </Typography>
              <Box width="100%" sx={{ mt: 1 }}>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <PersonIcon color="primary" fontSize="small" />
                  <Typography variant="body2"><b>Name:</b> {user.name}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <Typography variant="body2"><b>Email:</b> {user.email}</Typography>
                </Box>
                {pharmacyName && (
                  <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                    <BusinessIcon color="primary" fontSize="small" />
                    <Typography variant="body2"><b>Pharmacy:</b> {pharmacyName}</Typography>
                  </Box>
                )}
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2"><b>Role:</b> {user.role}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1, width: '100%' }} />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  py: 0.8,
                  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                  boxShadow: 4,
                  letterSpacing: 0.5,
                  fontSize: 13,
                  minHeight: 0,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                  },
                }}
              >
                LOGOUT
              </Button>
            </Box>
          </Popover>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default PharmacistHeader; 