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
  Container
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
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [reverseLoading, setReverseLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0);

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
    if (suggestion.lat && suggestion.lon) {
      setLat(suggestion.lat);
      setLng(suggestion.lon);
      setMapKey(prev => prev + 1);
    }
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

  useEffect(() => {
    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      let cancelled = false;
      setReverseLoading(true);
      setError('');
      setSuccess('');
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
      fetch(url, { headers: { 'User-Agent': 'MediCareApp/1.0' } })
        .then(res => res.json())
        .then(data => {
          if (!cancelled) {
            if (data && data.address) {
              const addr = data.address;
              const locality = addr.village || addr.town || addr.city || addr.hamlet || '';
              const block = addr.suburb || addr.block || addr.county || '';
              const district = addr.state_district || addr.district || addr.state || '';
              const shortAddress = [locality, block, district].filter(Boolean).join(', ');
              setProfile(prev => ({ ...prev, address: shortAddress }));
              setAddressInput(shortAddress);
              setShowSuggestions(false);
              setSuccess('Address fetched from coordinates!');
              if (data.lat && data.lon) {
                setLat(data.lat);
                setLng(data.lon);
                setMapKey(prev => prev + 1);
              }
            } else {
              setError('No address found for these coordinates.');
            }
          }
        })
        .catch(() => {
          if (!cancelled) setError('Failed to fetch address from coordinates.');
        })
        .finally(() => {
          if (!cancelled) setReverseLoading(false);
        });
      return () => { cancelled = true; };
    }
  }, [lat, lng]);

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
                {/* Action Buttons */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  {/* Logout button for mobile users */}
                  {isMobile && (
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
                  )}
                  
                  {/* Edit/Save buttons */}
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

                    {/* Address Field */}
                    <Grid item xs={12} md={6}>
                      <Box position="relative">
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
                      </Box>
                    </Grid>

                    {/* Coordinates Fields */}
                    {editMode && (
                      <>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Latitude"
                            value={lat}
                            onChange={e => setLat(e.target.value)}
                            placeholder="Enter latitude"
                            fullWidth
                            type="number"
                            step="any"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Longitude"
                            value={lng}
                            onChange={e => setLng(e.target.value)}
                            placeholder="Enter longitude"
                            fullWidth
                            type="number"
                            step="any"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </form>

                {/* Map Section */}
                {lat && lng && (
                  <Box mt={4}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Location Map
                    </Typography>
                    <Paper
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: 2,
                      }}
                    >
                      <iframe
                        key={mapKey}
                        title="Location Map"
                        width="100%"
                        height="300"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng)-0.005}%2C${parseFloat(lat)-0.003}%2C${parseFloat(lng)+0.005}%2C${parseFloat(lat)+0.003}&layer=mapnik&marker=${lat},${lng}`}
                        allowFullScreen
                      />
                      <Box p={2} textAlign="center">
                        <Button
                          variant="outlined"
                          size="small"
                          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Larger Map
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>
    </>
  );
};

export default Profile;
