import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip, Divider, Skeleton, Alert, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { getProfile, getPerformance, updateProfile } from '../services/deliveryDashboard';
import DeliveryApprovalGuard from '../components/DeliveryApprovalGuard';

const DeliveryProfile = () => {
  const [profile, setProfile] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    phone: '',
    vehicleType: '',
    vehicleNumber: ''
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com').replace(/\/$/, '');
  function joinUrl(base, path) {
    return `${base}/${path.replace(/^\//, '')}`;
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProfile(),
      getPerformance(),
    ])
      .then(([profileRes, perfRes]) => {
        setProfile(profileRes.deliveryBoy);
        setPerformance(perfRes);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load profile.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (profile) {
      setEditData({
        fullName: profile.personalInfo?.fullName || '',
        phone: profile.personalInfo?.phone || '',
        vehicleType: profile.vehicleInfo?.vehicleType || '',
        vehicleNumber: profile.vehicleInfo?.vehicleNumber || ''
      });
    }
  }, [profile]);

  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateProfile({
        personalInfo: { fullName: editData.fullName, phone: editData.phone },
        vehicleInfo: { vehicleType: editData.vehicleType, vehicleNumber: editData.vehicleNumber }
      });
      setProfile((prev) => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, fullName: editData.fullName, phone: editData.phone },
        vehicleInfo: { ...prev.vehicleInfo, vehicleType: editData.vehicleType, vehicleNumber: editData.vehicleNumber }
      }));
      setSuccessMsg('Profile updated successfully!');
      setEditOpen(false);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 1.5, sm: 3 }, pt: 2 }}>
      <Typography variant="h5" fontWeight={700} color="primary" mb={2}>
        My Profile
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {loading ? (
              <Skeleton variant="circular" width={64} height={64} sx={{ mr: 2 }} />
            ) : (
              <Avatar sx={{ width: 64, height: 64, fontSize: 32, bgcolor: 'primary.main', mr: 2 }} src={profile?.profilePhoto || null}>
                {profile?.personalInfo?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {loading ? <Skeleton width={100} /> : profile?.personalInfo?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loading ? <Skeleton width={80} /> : profile?.personalInfo?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loading ? <Skeleton width={80} /> : profile?.personalInfo?.phone}
              </Typography>
              <Chip label={profile?.status || 'Active'} color="success" size="small" sx={{ mt: 1 }} />
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary" mb={1}>
            Vehicle: <b>{loading ? <Skeleton width={60} /> : profile?.vehicleInfo?.vehicleType}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Code: <b>{loading ? <Skeleton width={60} /> : profile?.vehicleInfo?.vehicleNumber}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Orders: <b>{loading ? <Skeleton width={40} /> : `${profile?.workDetails?.currentOrders || 0}/${profile?.workDetails?.maxOrdersPerDay || 20}`}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Rating: <b>{loading ? <Skeleton width={40} /> : `${performance?.averageRating || 0}/5`}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Success Rate: <b>{loading ? <Skeleton width={40} /> : `${performance?.successRate || 0}%`}</b>
          </Typography>
          {/* Optionally, add edit button if editing is allowed */}
          <Button variant="outlined" startIcon={<EditIcon />} sx={{ mt: 2 }} onClick={handleEditOpen}>
            Edit Profile
          </Button>
          {/* Edit Profile Modal */}
          <Dialog open={editOpen} onClose={handleEditClose}>
            <DialogTitle>Edit Profile</DialogTitle>
            <form onSubmit={handleEditSubmit}>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                <TextField label="Full Name" name="fullName" value={editData.fullName} onChange={handleEditChange} fullWidth required />
                <TextField label="Phone" name="phone" value={editData.phone} onChange={handleEditChange} fullWidth required />
                <TextField label="Vehicle Type" name="vehicleType" value={editData.vehicleType} onChange={handleEditChange} fullWidth required />
                <TextField label="Vehicle Number" name="vehicleNumber" value={editData.vehicleNumber} onChange={handleEditChange} fullWidth required />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleEditClose} disabled={saving}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </DialogActions>
            </form>
          </Dialog>
          {successMsg && <Alert severity="success" sx={{ mt: 2 }}>{successMsg}</Alert>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default function WrappedDeliveryProfile(props) {
  return (
    <DeliveryApprovalGuard>
      <DeliveryProfile {...props} />
    </DeliveryApprovalGuard>
  );
}

// Keep the original export for named import if needed
export { DeliveryProfile };
