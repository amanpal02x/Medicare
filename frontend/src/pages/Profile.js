import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Fade,
  Container,
  Stack
} from '@mui/material';
import {
  Person as PersonIcon,
  MailOutline as MailIcon,
  LocationOn as LocationIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import Header from '../components/Header';
import { getProfile, updateProfile } from '../services/auth';
import useDeviceDetection from '../hooks/useDeviceDetection';
import { useAuth } from '../context/AuthContext';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search?format=json&q=';

const Profile = () => {
  const { isMobile } = useDeviceDetection();
  const { logout } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', address: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const suggestionsRef = useRef();

  useEffect(() => {
    getProfile().then(data => {
      setProfile({
        name: data.name || '',
        email: data.email || '',
        address: data.address || '',
        phone: data.phone || ''
      });
      setAddressInput(data.address || '');
      setLoading(false);
    });
  }, []);

  // Fetch address suggestions
  useEffect(() => {
    if (addressInput.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    const controller = new AbortController();
    fetch(NOMINATIM_URL + encodeURIComponent(addressInput), {
      headers: { 'User-Agent': 'MediCareApp/1.0' },
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        setAddressSuggestions(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [addressInput]);

  // Hide suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (name === 'address') {
      setAddressInput(value);
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = suggestion => {
    setProfile(prev => ({ ...prev, address: suggestion.display_name }));
    setAddressInput(suggestion.display_name);
    setShowSuggestions(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await updateProfile(profile);
      if (res && res.user) {
        setSuccess('Profile updated successfully!');
        setEditMode(false);
      } else {
        setError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    }
    setSaving(false);
  };

  const handleEdit = () => {
    setEditMode(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setError('');
    setSuccess('');
    // Reset to original values
    getProfile().then(data => {
      setProfile({
        name: data.name || '',
        email: data.email || '',
        address: data.address || '',
        phone: data.phone || ''
      });
      setAddressInput(data.address || '');
    });
  };

  const handleLogout = () => {
    logout();
    // The logout function will redirect to login page
  };

  if (loading) {
    return (
      <>
        {!isMobile && <Header />}
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </>
    );
  }

  return (
    <>
      {!isMobile && <Header />}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Fade in timeout={500}>
          <Box>
            {/* Header Section */}
            <Box textAlign="center" mb={4}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  border: '4px solid #1976d2',
                  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                  fontSize: 32,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                }}
              >
                {profile.name ? profile.name.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                My Profile
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your personal information and preferences
              </Typography>
            </Box>

            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            {/* Profile Card */}
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,251,255,0.95) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.1)',
            }}>
              <CardContent sx={{ p: 4 }}>
                {/* Action Buttons - Improved Layout */}
                <Box sx={{ mb: 3 }}>
                  {isMobile ? (
                    // Mobile Layout - Stack buttons vertically with better spacing
                    <Stack spacing={2}>
                      {/* Logout Button */}
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        fullWidth
                        sx={{
                          borderRadius: 3,
                          fontWeight: 600,
                          borderColor: 'error.main',
                          color: 'error.main',
                          py: 1.5,
                          borderWidth: 2,
                          '&:hover': {
                            borderColor: 'error.dark',
                            backgroundColor: 'error.light',
                            color: 'error.dark',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Logout
                      </Button>
                      
                      {/* Edit/Save/Cancel Buttons */}
                      {!editMode ? (
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={handleEdit}
                          fullWidth
                          sx={{
                            borderRadius: 3,
                            fontWeight: 600,
                            py: 1.5,
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Edit Profile
                        </Button>
                      ) : (
                        <Stack direction="row" spacing={2}>
                          <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                            sx={{ 
                              borderRadius: 3, 
                              fontWeight: 600,
                              py: 1.5,
                              flex: 1,
                              borderWidth: 2,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSubmit}
                            disabled={saving}
                            sx={{
                              borderRadius: 3,
                              fontWeight: 600,
                              py: 1.5,
                              flex: 1,
                              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                              },
                              '&:disabled': {
                                background: 'linear-gradient(135deg, #ccc 0%, #ddd 100%)',
                                transform: 'none',
                                boxShadow: 'none',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  ) : (
                    // Desktop Layout - Horizontal arrangement
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          borderColor: 'error.main',
                          color: 'error.main',
                          '&:hover': {
                            borderColor: 'error.dark',
                            backgroundColor: 'error.light',
                            color: 'error.dark',
                          },
                        }}
                      >
                        Logout
                      </Button>
                      
                      <Box display="flex" gap={1}>
                        {!editMode ? (
                          <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={handleEdit}
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                              },
                            }}
                          >
                            Edit Profile
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outlined"
                              startIcon={<CancelIcon />}
                              onClick={handleCancel}
                              sx={{ borderRadius: 2, fontWeight: 600 }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              startIcon={<SaveIcon />}
                              onClick={handleSubmit}
                              disabled={saving}
                              sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                                },
                              }}
                            >
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Name Field */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Full Name"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        required
                        fullWidth
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: <PersonIcon color="primary" sx={{ mr: 1 }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>

                    {/* Email Field */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleChange}
                        required
                        fullWidth
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: <MailIcon color="primary" sx={{ mr: 1 }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>

                    {/* Phone Field */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Phone Number"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        fullWidth
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: <PhoneIcon color="primary" sx={{ mr: 1 }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>

                    {/* Address Field - Fixed container issue */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Address"
                        name="address"
                        value={addressInput}
                        onChange={handleChange}
                        onFocus={() => setShowSuggestions(true)}
                        fullWidth
                        disabled={!editMode}
                        multiline
                        rows={2}
                        InputProps={{
                          startAdornment: <LocationIcon color="primary" sx={{ mr: 1 }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                      {showSuggestions && addressSuggestions.length > 0 && editMode && (
                        <Paper
                          ref={suggestionsRef}
                          sx={{
                            position: 'absolute',
                            zIndex: 10,
                            width: '100%',
                            maxHeight: 200,
                            overflowY: 'auto',
                            mt: 0.5,
                            boxShadow: 3,
                          }}
                        >
                          {addressSuggestions.map(suggestion => (
                            <Box
                              key={suggestion.place_id}
                              onClick={() => handleSuggestionClick(suggestion)}
                              sx={{
                                p: 2,
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                '&:hover': { bgcolor: 'action.hover' },
                                '&:last-child': { borderBottom: 'none' }
                              }}
                            >
                              <Typography variant="body2">
                                {suggestion.display_name}
                              </Typography>
                            </Box>
                          ))}
                        </Paper>
                      )}
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>
    </>
  );
};

export default Profile;
