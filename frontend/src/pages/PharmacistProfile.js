import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge, Button, Divider, Card, CardContent, CardHeader, TextField, Grid, Chip, Link } from '@mui/material';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import { getPharmacistProfile, updatePharmacistProfile, updatePharmacistLocation } from '../services/pharmacist';

// Add utility to detect coordinates
function isCoordinateInput(str) {
  // Matches "lat, lng" or "lat lng" with optional spaces
  return /^-?\d{1,3}\.\d+[, ]\s*-?\d{1,3}\.\d+$/.test(str.trim());
}

// Add utility to fetch short address from coordinates
async function getShortAddressFromCoords(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'MediCareApp/1.0' } });
  const data = await res.json();
  if (data && data.address) {
    const addr = data.address;
    const locality = addr.village || addr.town || addr.city || addr.hamlet || '';
    const block = addr.suburb || addr.block || addr.county || '';
    const district = addr.state_district || addr.district || addr.state || '';
    return [locality, block, district].filter(Boolean).join(', ');
  }
  return '';
}

const PharmacistProfile = () => {
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [address, setAddress] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState('');
  const [savedCoords, setSavedCoords] = useState(null);
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ pharmacyName: '', contact: '', timings: '' });

  React.useEffect(() => {
    getPharmacistProfile().then(profile => {
      // Debug: Log the profile data received
      console.log('Pharmacist profile received:', profile);
      
      setProfile(profile);
      setSavedAddress(profile.address || '');
      setAddress(profile.address || '');
      setForm({
        pharmacyName: profile.pharmacyName || '',
        contact: profile.contact || '',
        timings: profile.timings || ''
      });
      if (profile.location && Array.isArray(profile.location.coordinates)) {
        setSavedCoords(profile.location.coordinates);
      }
    });
  }, []);

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => { setProfileAnchor(null); logout(); };

  const handleEditChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleProfileSave = async () => {
    try {
      await updatePharmacistProfile(form);
      setEdit(false);
      const updated = await getPharmacistProfile();
      setProfile(updated);
      setForm({
        pharmacyName: updated.pharmacyName || '',
        contact: updated.contact || '',
        timings: updated.timings || ''
      });
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleLocationSave = async () => {
    setLoading(true);
    setLocationStatus('');
    let addressToSave = address;
    // If input looks like coordinates, reverse geocode first
    if (isCoordinateInput(address)) {
      const parts = address.split(/[ ,]+/).map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const shortAddr = await getShortAddressFromCoords(parts[0], parts[1]);
        if (shortAddr) {
          setAddress(shortAddr);
          addressToSave = shortAddr;
        } else {
          setLocationStatus('Could not find address for these coordinates.');
          setLoading(false);
          return;
        }
      }
    }
    try {
      const res = await updatePharmacistLocation(addressToSave);
      setLocationStatus('Location updated successfully!');
      setSavedAddress(res.address || addressToSave);
      if (res.location && Array.isArray(res.location.coordinates)) {
        setSavedCoords(res.location.coordinates);
      }
    } catch (err) {
      setLocationStatus(err.message || 'Failed to update location');
    }
    setLoading(false);
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} mt={2}>
        <div style={{ width: 48 }} />
        <Typography variant="h5" fontWeight={600} color="primary" align="center">
          Hello{user && user.name ? `, ${user.name}` : ''}!
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Tooltip title="Notifications">
            <IconButton color="primary" onClick={handleNotifOpen}>
              <Badge color="error" badgeContent={notifications.filter(n => !n.isRead).length}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={handleNotifClose}>
            {notifications.length === 0 ? (
              <MenuItem disabled>No notifications</MenuItem>
            ) : (
              <>
                <MenuItem disabled>Notifications ({notifications.length})</MenuItem>
                <MenuItem onClick={clearAllNotifications}>Clear All</MenuItem>
                <Divider />
                {notifications.map(n => (
                  <MenuItem key={n._id} onClick={handleNotifClose} style={{ fontWeight: n.isRead ? 400 : 700 }}>
                    {n.message}
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
          <Tooltip title={user?.name || 'Profile'}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, cursor: 'pointer' }} onClick={handleProfileOpen}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Avatar>
          </Tooltip>
          <Popover open={Boolean(profileAnchor)} anchorEl={profileAnchor} onClose={handleProfileClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={1} p={2} minWidth={220}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', color: '#fff' }}>{user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}</Avatar>
              <Typography variant="h6" fontWeight={700} color="primary.main">Profile</Typography>
              <Box width="100%" mt={1}>
                <Box display="flex" alignItems="center" gap={1} mb={1}><PersonIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Name:</b> {user?.name}</Typography></Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}><MailOutlineIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Email:</b> {user?.email}</Typography></Box>
                {profile?.pharmacyName && (
                  <Box display="flex" alignItems="center" gap={1} mb={1}><BusinessIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Pharmacy:</b> {profile.pharmacyName}</Typography></Box>
                )}
                <Box display="flex" alignItems="center" gap={1}><AssignmentIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Role:</b> {user?.role}</Typography></Box>
              </Box>
              <Divider sx={{ my: 1, width: '100%' }} />
              <Button variant="contained" color="primary" fullWidth onClick={handleLogout} startIcon={<LogoutIcon />}>LOGOUT</Button>
            </Box>
          </Popover>
        </Box>
      </Box>
      <Box sx={{ maxWidth: 600, margin: '40px auto' }}>
        <Card>
          <CardHeader title="Pharmacist Profile" sx={{ textAlign: 'center', bgcolor: 'primary.main', color: '#fff' }} />
          <CardContent>
            {profile ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Name" value={profile.name || ''} fullWidth disabled margin="dense" />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Email" value={profile.email || ''} fullWidth disabled margin="dense" />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Pharmacy Name" name="pharmacyName" value={form.pharmacyName} onChange={handleEditChange} fullWidth margin="dense" disabled={!edit} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Contact" name="contact" value={form.contact} onChange={handleEditChange} fullWidth margin="dense" disabled={!edit} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Timings" name="timings" value={form.timings} onChange={handleEditChange} fullWidth margin="dense" disabled={!edit} />
                </Grid>
                <Grid item xs={12}>
                  <Chip label={profile.isVerified ? 'Verified' : 'Not Verified'} color={profile.isVerified ? 'success' : 'warning'} sx={{ mr: 1 }} />
                  <Chip label={profile.status} color={profile.status === 'approved' ? 'success' : profile.status === 'pending' ? 'warning' : 'error'} />
                </Grid>
                <Grid item xs={12}>
                  <b>KYC Docs:</b> {profile.kycDocs && profile.kycDocs.length > 0 ? profile.kycDocs.map((doc, i) => (
                    <Link href={doc} target="_blank" rel="noopener" key={i} sx={{ ml: 1 }}>{`Doc${i+1}`}</Link>
                  )) : 'None'}
                </Grid>
                <Grid item xs={12}>
                  <b>Saved Address:</b> {savedAddress || <span style={{ color: '#888' }}>Not set</span>}
                </Grid>
                <Grid item xs={12}>
                  <b>Coordinates:</b> {savedCoords ? `[Longitude: ${savedCoords[0]}, Latitude: ${savedCoords[1]}]` : <span style={{ color: '#888' }}>Not set</span>}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Update Address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    fullWidth
                    margin="dense"
                    disabled={loading}
                    placeholder="Enter your pharmacy address"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLocationSave}
                    disabled={loading || !address}
                    sx={{ mt: 1 }}
                  >
                    {loading ? 'Saving...' : 'Save Location'}
                  </Button>
                  {locationStatus && (
                    <div style={{ marginTop: 10, color: locationStatus.includes('success') ? 'green' : 'red' }}>
                      {locationStatus}
                    </div>
                  )}
                </Grid>
                <Grid item xs={12} sx={{ textAlign: 'right' }}>
                  {edit ? (
                    <>
                      <Button variant="contained" color="success" onClick={handleProfileSave} sx={{ mr: 1 }}>Save</Button>
                      <Button variant="outlined" color="secondary" onClick={() => setEdit(false)}>Cancel</Button>
                    </>
                  ) : (
                    <Button variant="outlined" onClick={() => setEdit(true)}>Edit Profile</Button>
                  )}
                </Grid>
              </Grid>
            ) : (
              <Typography>Loading...</Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default PharmacistProfile;
