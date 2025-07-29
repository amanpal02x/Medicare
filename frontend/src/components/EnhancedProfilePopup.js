import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Button,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Tooltip,
  Fade,
  Paper,
  Popover
} from '@mui/material';
import {
  Person as PersonIcon,
  MailOutline as MailIcon,
  Assignment as RoleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Logout as LogoutIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  PhotoCamera as PhotoCameraIcon,
  LocalShipping as DeliveryIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { getProfile, updateProfile } from '../services/auth';
import { getPharmacistProfile, updatePharmacistProfile } from '../services/pharmacist';
import { getProfile as getDeliveryProfile, updateProfile as updateDeliveryProfile } from '../services/deliveryDashboard';
import './EnhancedProfilePopup.css';

const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com').replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}

const EnhancedProfilePopup = ({ 
  user, 
  onLogout, 
  open, 
  anchorEl, 
  onClose,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  transformOrigin = { vertical: 'top', horizontal: 'right' }
}) => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && user) {
      loadProfile();
    }
  }, [open, user]);

  const loadProfile = async () => {
    try {
      let profileData;
      
      // Load profile based on user role
      switch (user.role) {
        case 'pharmacist':
          profileData = await getPharmacistProfile();
          break;
        case 'deliveryBoy':
          profileData = await getDeliveryProfile();
          profileData = profileData.deliveryBoy; // Extract deliveryBoy data
          break;
        default:
          profileData = await getProfile();
          break;
      }
      
      setProfile(profileData);
      
      // Set edit data based on role
      const baseData = {
        name: profileData.name || user.name || '',
        email: profileData.email || user.email || '',
        phone: profileData.phone || profileData.personalInfo?.phone || '',
        address: profileData.address || profileData.personalInfo?.address || ''
      };

      // Add role-specific fields
      if (user.role === 'pharmacist' && profileData.pharmacyName) {
        baseData.pharmacyName = profileData.pharmacyName;
      }
      
      if (user.role === 'deliveryBoy') {
        baseData.fullName = profileData.personalInfo?.fullName || '';
        baseData.vehicleType = profileData.vehicleInfo?.vehicleType || '';
        baseData.vehicleNumber = profileData.vehicleInfo?.vehicleNumber || '';
      }

      setEditData(baseData);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData({
      name: profile?.name || user.name || '',
      email: profile?.email || user.email || '',
      phone: profile?.phone || profile?.personalInfo?.phone || '',
      address: profile?.address || profile?.personalInfo?.address || '',
      pharmacyName: profile?.pharmacyName || '',
      fullName: profile?.personalInfo?.fullName || '',
      vehicleType: profile?.vehicleInfo?.vehicleType || '',
      vehicleNumber: profile?.vehicleInfo?.vehicleNumber || ''
    });
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      let result;
      
      // Update profile based on user role
      switch (user.role) {
        case 'pharmacist':
          if (selectedPhoto) {
            const formData = new FormData();
            formData.append('profilePhoto', selectedPhoto);
            Object.keys(editData).forEach(key => {
              if (editData[key] !== undefined && editData[key] !== '') {
                formData.append(key, editData[key]);
              }
            });
            result = await updatePharmacistProfile(formData);
          } else {
            result = await updatePharmacistProfile(editData);
          }
          break;
          
        case 'deliveryBoy':
          const deliveryData = {
            personalInfo: {
              fullName: editData.fullName,
              phone: editData.phone,
              address: editData.address
            },
            vehicleInfo: {
              vehicleType: editData.vehicleType,
              vehicleNumber: editData.vehicleNumber
            }
          };
          result = await updateDeliveryProfile(deliveryData);
          break;
          
        default:
          if (selectedPhoto) {
            const formData = new FormData();
            formData.append('profilePhoto', selectedPhoto);
            Object.keys(editData).forEach(key => {
              if (editData[key] !== undefined && editData[key] !== '') {
                formData.append(key, editData[key]);
              }
            });
            result = await updateProfile(formData);
          } else {
            result = await updateProfile(editData);
          }
          break;
      }
      
      if (result.user || result.success) {
        setProfile(result.user || result);
        setSuccess('Profile updated successfully!');
        setEditMode(false);
        setSelectedPhoto(null);
        setPhotoPreview(null);
        // Update the user context if needed
        if (window.location.reload) {
          setTimeout(() => window.location.reload(), 1000);
        }
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handlePhotoUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeSelectedPhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'error';
      case 'pharmacist': return 'warning';
      case 'deliveryboy': return 'info';
      default: return 'primary';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '👑';
      case 'pharmacist': return '💊';
      case 'deliveryboy': return '🚚';
      default: return '👤';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'Administrator';
      case 'pharmacist': return 'Pharmacist';
      case 'deliveryboy': return 'Delivery Partner';
      default: return 'User';
    }
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        PaperProps={{
          sx: {
            p: 0,
            minWidth: 280,
            borderRadius: 3,
            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,251,255,0.95) 100%)',
            overflow: 'hidden',
            border: '1px solid rgba(25, 118, 210, 0.1)',
            backdropFilter: 'blur(10px)',
          }
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <Box sx={{ p: 2 }}>
          {/* Header Section */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box position="relative">
                <Avatar
                  className="profile-avatar-hover"
                  sx={{
                    width: 44,
                    height: 44,
                    border: '2px solid #1976d2',
                    boxShadow: '0 3px 8px rgba(25, 118, 210, 0.3)',
                    fontSize: 20,
                    bgcolor: 'primary.main',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  }}
                  src={editMode && photoPreview ? photoPreview : (profile?.profilePhoto || null)}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon fontSize="medium" />}
                </Avatar>
                {editMode && (
                  <Tooltip title="Change Photo">
                    <IconButton
                      onClick={handlePhotoUpload}
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        bgcolor: 'primary.main',
                        color: 'white',
                        width: 24,
                        height: 24,
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                  {editMode ? 'Edit Profile' : 'Profile'}
                </Typography>
                <Chip
                  className="role-chip"
                  icon={<span>{getRoleIcon(user?.role)}</span>}
                  label={getRoleDisplayName(user?.role)}
                  color={getRoleColor(user?.role)}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }}
                />
              </Box>
            </Box>
            {!editMode && (
              <Tooltip title="Edit Profile">
                <IconButton
                  onClick={handleEdit}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    width: 32,
                    height: 32,
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Profile Information */}
          <Box sx={{ mb: 1.5 }}>
            {error && <Alert severity="error" sx={{ mb: 1.5, fontSize: '0.8rem' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 1.5, fontSize: '0.8rem' }}>{success}</Alert>}

            {editMode ? (
              // Edit Mode
              <Box display="flex" flexDirection="column" gap={1.5}>
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                
                {/* Photo preview section */}
                {selectedPhoto && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem', mb: 0.5 }}>
                      New Photo Preview
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        src={photoPreview}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', flex: 1 }}>
                        {selectedPhoto.name}
                      </Typography>
                      <IconButton
                        onClick={removeSelectedPhoto}
                        size="small"
                        sx={{ color: 'error.main' }}
                      >
                        <CancelIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                )}
                
                {/* Common fields for all roles */}
                <TextField
                  label="Name"
                  value={editData.name || editData.fullName || ''}
                  onChange={(e) => handleInputChange(user.role === 'deliveryBoy' ? 'fullName' : 'name', e.target.value)}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <PersonIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />,
                  }}
                />
                <TextField
                  label="Email"
                  value={editData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  fullWidth
                  size="small"
                  type="email"
                  InputProps={{
                    startAdornment: <MailIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />,
                  }}
                />
                <TextField
                  label="Phone"
                  value={editData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <PhoneIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />,
                  }}
                />
                <TextField
                  label="Address"
                  value={editData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: <LocationIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />,
                  }}
                />

                {/* Role-specific fields */}
                {user.role === 'pharmacist' && (
                  <TextField
                    label="Pharmacy Name"
                    value={editData.pharmacyName || ''}
                    onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: <BusinessIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />,
                    }}
                  />
                )}

                {user.role === 'deliveryBoy' && (
                  <>
                    <TextField
                      label="Vehicle Type"
                      value={editData.vehicleType || ''}
                      onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: <DeliveryIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />,
                      }}
                    />
                    <TextField
                      label="Vehicle Number"
                      value={editData.vehicleNumber || ''}
                      onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: <DeliveryIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />,
                      }}
                    />
                  </>
                )}
              </Box>
            ) : (
              // View Mode
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon color="primary" sx={{ fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                      Name
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                      {profile?.name || profile?.personalInfo?.fullName || user?.name || 'Not set'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <MailIcon color="primary" sx={{ fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                      Email
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                      {profile?.email || user?.email || 'Not set'}
                    </Typography>
                  </Box>
                </Box>

                {(profile?.phone || profile?.personalInfo?.phone) && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon color="primary" sx={{ fontSize: 18 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                        Phone
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                        {profile.phone || profile.personalInfo?.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {(profile?.address || profile?.personalInfo?.address) && (
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <LocationIcon color="primary" sx={{ fontSize: 18, mt: 0.25 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                        Address
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                        {profile.address || profile.personalInfo?.address}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {profile?.pharmacyName && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <BusinessIcon color="primary" sx={{ fontSize: 18 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                        Pharmacy
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                        {profile.pharmacyName}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {profile?.vehicleInfo && (
                  <>
                    <Box display="flex" alignItems="center" gap={1}>
                      <DeliveryIcon color="primary" sx={{ fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                          Vehicle Type
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                          {profile.vehicleInfo.vehicleType || 'Not set'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <DeliveryIcon color="primary" sx={{ fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                          Vehicle Number
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                          {profile.vehicleInfo.vehicleNumber || 'Not set'}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Divider sx={{ my: 1.5 }} />
          
          {editMode ? (
            <Box display="flex" gap={1}>
              <Button
                className="profile-button"
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                fullWidth
                size="small"
                sx={{ borderRadius: 2, fontWeight: 600, py: 0.8 }}
              >
                Cancel
              </Button>
              <Button
                className="profile-button"
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveIcon />}
                disabled={loading}
                fullWidth
                size="small"
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  py: 0.8,
                  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                  },
                }}
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          ) : (
            <Button
              className="profile-button"
              variant="contained"
              color="primary"
              fullWidth
              onClick={onLogout}
              startIcon={<LogoutIcon />}
              size="small"
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                py: 1,
                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                boxShadow: '0 3px 8px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                },
              }}
            >
              LOGOUT
            </Button>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default EnhancedProfilePopup; 