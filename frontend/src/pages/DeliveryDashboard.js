import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip, Divider, Skeleton, Alert, Tabs, Tab, List, IconButton, InputAdornment, TextField, MenuItem, Select, FormControl, InputLabel, Button, Snackbar, Switch, CircularProgress } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import { getProfile, getOrders, getAvailableOrders, getEarnings, getPerformance, updateOnlineStatus } from '../services/deliveryDashboard';
import { acceptOrder, rejectOrder } from '../services/delivery';
import axios from 'axios';
import { useNotifications } from '../context/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import notificationSound from '../utils/notificationSound';
import DeliveryApprovalGuard from '../components/DeliveryApprovalGuard';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io('https://medicare-ydw4.onrender.com');

const ORDER_STATUSES = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
];

const DeliveryDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [availableOrders, setAvailableOrders] = useState(null);
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  // My Orders tab state
  const [orderStatus, setOrderStatus] = useState('active');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  // Accept/Ignore loading and feedback
  const [actionLoading, setActionLoading] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const { notifications, clearAllNotifications } = useNotifications();
  const [notifAnchor, setNotifAnchor] = useState(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isApproved, setIsApproved] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProfile(),
      getPerformance(),
      getEarnings('today'),
      getAvailableOrders(),
      getOrders(orderStatus),
    ])
      .then(([profileRes, perfRes, earningsRes, availableOrdersRes, ordersRes]) => {
        setProfile(profileRes.data.deliveryBoy);
        setPerformance(perfRes.data);
        setEarnings(earningsRes.data);
        
        // Check if delivery boy is approved - fix the status check
        const deliveryBoyStatus = profileRes.data?.deliveryBoy?.status;
        setIsApproved(deliveryBoyStatus === 'active');
        
        // Handle response format from getAvailableOrders
        if (availableOrdersRes.data && availableOrdersRes.data.data) {
          setAvailableOrders(availableOrdersRes.data.data);
        } else if (availableOrdersRes.data && availableOrdersRes.data.requiresOnline) {
          setAvailableOrders([]);
        } else if (availableOrdersRes.data) {
          setAvailableOrders(availableOrdersRes.data);
        } else {
          setAvailableOrders([]);
        }
        
        setOrders(ordersRes.data.orders || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load dashboard data.');
        setLoading(false);
      });
  }, [orderStatus]);

  // Check for new available orders and play sound
  useEffect(() => {
    if (availableOrders && availableOrders.length > 0) {
      // Play delivery-specific sound for new available orders
      notificationSound.playDeliverySound();
      
      // Show browser notification for new orders
      const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      if (Notification.permission === 'granted' && settings.browserNotifications !== false) {
        new Notification('New Delivery Order Available', {
          body: `${availableOrders.length} new order(s) available for delivery`,
          icon: '/favicon.ico',
          tag: 'delivery-order',
          requireInteraction: true // Keep notification visible until user interacts
        });
      }
    }
  }, [availableOrders]);

  // Real-time location update
  useEffect(() => {
    if (!profile || !profile._id) return;
    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation([lat, lng]);
          setLocationError('');
          // Send to backend
          const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api').replace(/\/$/, '');
          fetch(joinUrl(API_BASE, '/delivery/location-geo'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ lat, lng, online: profile.availability?.isOnline })
          });
          // Emit via Socket.IO
          socket.emit('deliveryboy-location-update', {
            deliveryBoyId: profile._id,
            lat,
            lng,
            online: profile.availability?.isOnline
          });
        },
        (err) => {
          setLocationError('Unable to access your location. Please allow location access in your browser.');
          console.error('Geolocation error:', err);
        }
      );
    };
    updateLocation();
    const interval = setInterval(updateLocation, 15000); // update every 15s
    return () => clearInterval(interval);
  }, [profile]);

  // Real-time order assignment
  useEffect(() => {
    socket.on('order-assigned', (order) => {
      setAvailableOrders((prev) => prev ? [order, ...prev] : [order]);
      setSnackbar({ open: true, message: 'A new order has been assigned to you!', severity: 'info' });
      notificationSound.playDeliverySound();
    });
    return () => socket.off('order-assigned');
  }, []);

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    // Listen for online status updates
    socket.on('onlineStatusUpdate', (data) => {
      if (data.deliveryBoyId === profile?._id) {
        setProfile(prev => ({
          ...prev,
          availability: {
            ...prev.availability,
            isOnline: data.isOnline,
            lastSeen: new Date().toISOString(),
          },
        }));
        
        // If going online, refresh available orders
        if (data.isOnline) {
          getAvailableOrders()
            .then(availableOrdersRes => {
              if (availableOrdersRes.data && availableOrdersRes.data.data) {
                setAvailableOrders(availableOrdersRes.data.data);
              } else if (availableOrdersRes.data && availableOrdersRes.data.requiresOnline) {
                setAvailableOrders([]);
              } else if (availableOrdersRes.data) {
                setAvailableOrders(availableOrdersRes.data);
              } else {
                setAvailableOrders([]);
              }
            })
            .catch(err => console.error('Failed to refresh available orders:', err));
        } else {
          // If going offline, clear available orders
          setAvailableOrders([]);
        }
      }
    });

    // Listen for new available orders
    socket.on('newAvailableOrder', (data) => {
      if (profile?.availability?.isOnline) {
        // Refresh available orders when new ones come in
        getAvailableOrders()
          .then(availableOrdersRes => {
            if (availableOrdersRes.data && availableOrdersRes.data.data) {
              setAvailableOrders(availableOrdersRes.data.data);
            } else if (availableOrdersRes.data && availableOrdersRes.data.requiresOnline) {
              setAvailableOrders([]);
            } else if (availableOrdersRes.data) {
              setAvailableOrders(availableOrdersRes.data);
            } else {
              setAvailableOrders([]);
            }
          })
          .catch(err => console.error('Failed to refresh available orders:', err));
      }
    });

    return () => {
      socket.off('onlineStatusUpdate');
      socket.off('newAvailableOrder');
    };
  }, [profile?._id, profile?.availability?.isOnline]);

  // Fetch address when location changes
  useEffect(() => {
    if (location && location.length === 2) {
      const [lat, lng] = location;
      setLocationLoading(true);
      axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        .then(res => {
          setLocationName(res.data.display_name || '');
        })
        .catch((err) => {
          setLocationName('');
          console.error('Reverse geocoding failed:', err);
        })
        .finally(() => setLocationLoading(false));
    }
  }, [location]);

  // Custom icon for delivery boy
  const deliveryIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048310.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // My Orders: filter and sort
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let filtered = orders;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(order =>
        (order.user?.personalInfo?.fullName || '').toLowerCase().includes(s) ||
        (order.orderNumber || '').toString().toLowerCase().includes(s) ||
        (order.address || '').toLowerCase().includes(s)
      );
    }
    if (sort === 'newest') {
      filtered = filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'oldest') {
      filtered = filtered.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return filtered;
  }, [orders, search, sort]);

  // Accept order
  const handleAccept = async (orderId) => {
    if (!isApproved) {
      setSnackbar({ 
        open: true, 
        message: 'You cannot accept orders until your account is approved by admin.', 
        severity: 'warning' 
      });
      return;
    }
    
    setActionLoading((prev) => ({ ...prev, [orderId]: 'accept' }));
    try {
      await acceptOrder(orderId);
      setAvailableOrders((prev) => prev.filter((o) => o._id !== orderId));
      // Refresh active orders after accepting
      const ordersRes = await getOrders(orderStatus);
      setOrders(ordersRes.data.orders || []);
      setTab(1); // Switch to 'My Orders' tab
      setSnackbar({ open: true, message: 'Order accepted successfully!', severity: 'success' });
      
      // Play delivery sound for successful acceptance
      notificationSound.playDeliverySound();
    } catch (err) {
      let errorMsg = 'Failed to accept order.';
      if (err && err.message) {
        errorMsg = err.message;
      } else if (err && err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  // Ignore order
  const handleIgnore = async (orderId) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: 'ignore' }));
    try {
      await rejectOrder(orderId);
      setAvailableOrders((prev) => prev.filter((o) => o._id !== orderId));
      setSnackbar({ open: true, message: 'Order ignored.', severity: 'info' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to ignore order.', severity: 'error' });
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  // Update handleToggleOnline to fetch location when going online
  const handleToggleOnline = async () => {
    if (!profile) return;
    setOnlineLoading(true);
    try {
      const newStatus = !profile.availability?.isOnline;
      if (newStatus) {
        // Going online: fetch location
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setLocation([lat, lng]);
            // Send to backend
            const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api').replace(/\/$/, '');
            fetch(joinUrl(API_BASE, '/delivery/location-geo'), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              body: JSON.stringify({ lat, lng, online: true })
            });
            // Emit via Socket.IO
            socket.emit('deliveryboy-location-update', {
              deliveryBoyId: profile._id,
              lat,
              lng,
              online: true
            });
          }
        );
      }
      await updateOnlineStatus(newStatus);
      setProfile((prev) => ({
        ...prev,
        availability: {
          ...prev.availability,
          isOnline: newStatus,
          lastSeen: new Date().toISOString(),
        },
      }));
      
      // If going online, refresh available orders
      if (newStatus) {
        try {
          const availableOrdersRes = await getAvailableOrders();
          if (availableOrdersRes.data && availableOrdersRes.data.data) {
            setAvailableOrders(availableOrdersRes.data.data);
          } else if (availableOrdersRes.data && availableOrdersRes.data.requiresOnline) {
            setAvailableOrders([]);
          } else if (availableOrdersRes.data) {
            setAvailableOrders(availableOrdersRes.data);
          } else {
            setAvailableOrders([]);
          }
        } catch (err) {
          console.error('Failed to refresh available orders:', err);
        }
      }
      
      setSnackbar({ open: true, message: `You are now ${newStatus ? 'Online' : 'Offline'}.`, severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update online status.', severity: 'error' });
    } finally {
      setOnlineLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 1.5, sm: 3 }, pt: 2 }}>
      {/* Notification Bell */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
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
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {/* Profile Card */}
      <Card sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        {loading ? (
          <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
        ) : (
          <Avatar sx={{ width: 56, height: 56, fontSize: 28, bgcolor: 'primary.main', mr: 2 }} src={profile?.profilePhoto ? `${process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com'}${profile.profilePhoto}` : null}>
            {profile?.personalInfo?.fullName?.charAt(0).toUpperCase()}
          </Avatar>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            {loading ? <Skeleton width={100} /> : profile?.personalInfo?.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? <Skeleton width={80} /> : `${profile?.vehicleInfo?.vehicleType || ''} • ${profile?.vehicleInfo?.vehicleNumber || ''}`}
          </Typography>
          {/* Show current location name if available, or fallback if not */}
          {locationLoading && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              Fetching location...
            </Typography>
          )}
          {location && !locationLoading && !locationName && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              📍 Unable to determine address for your current location.
            </Typography>
          )}
          {locationName && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              📍 {locationName}
            </Typography>
          )}
          {/* Show geolocation error if present */}
          {locationError && (
            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
              {locationError}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip
              label={profile?.availability?.isOnline ? 'Online' : 'Offline'}
              color={profile?.availability?.isOnline ? 'success' : 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Switch
              checked={!!profile?.availability?.isOnline}
              onChange={handleToggleOnline}
              color="success"
              disabled={onlineLoading || loading || !isApproved}
              inputProps={{ 'aria-label': 'Toggle online status' }}
            />
            {onlineLoading && <CircularProgress size={18} thickness={5} sx={{ ml: 1 }} />}
            <Typography variant="caption" color="text.secondary">
              {loading ? <Skeleton width={60} /> : `Last updated: ${profile?.availability?.lastSeen ? new Date(profile.availability.lastSeen).toLocaleTimeString() : '-'}`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
          <Chip icon={<WifiIcon fontSize="small" />} label={profile?.availability?.isOnline ? 'Online' : 'Offline'} color={profile?.availability?.isOnline ? 'success' : 'default'} size="small" sx={{ mb: 0.5 }} />
          <Chip icon={<StarIcon fontSize="small" />} label={performance ? `${performance.averageRating || 0}/5` : '0/5'} color="warning" size="small" sx={{ mb: 0.5 }} />
          <Chip icon={<LocalShippingIcon fontSize="small" />} label={orders ? `${orders.length}/${profile?.workDetails?.maxOrdersPerDay || 20} Orders` : '0/20 Orders'} color="primary" size="small" sx={{ mb: 0.5 }} />
          <Chip 
            label={profile?.status || 'Active'} 
            color={isApproved ? 'success' : 'warning'} 
            size="small" 
          />
        </Box>
      </Card>
      
      {/* Approval Status Alert */}
      {!isApproved && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Your account is {profile?.status === 'pending_approval' ? 'pending approval' : profile?.status}. 
            You can view available orders but cannot accept them until your account is approved by admin.
          </Typography>
        </Alert>
      )}
      
      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Available Orders
              {!loading && !profile?.availability?.isOnline && isApproved && (
                <Chip 
                  label="Go Online" 
                  size="small" 
                  color="warning" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
              {!loading && !isApproved && (
                <Chip 
                  label="Not Approved" 
                  size="small" 
                  color="error" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
          } 
        />
        <Tab label="My Orders" />
        <Tab label="Performance" />
      </Tabs>
      {/* Tab Content */}
      {tab === 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>Available Orders</Typography>
            {loading ? (
              <Skeleton height={40} />
            ) : !profile?.availability?.isOnline ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <WifiIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Go Online to See Orders
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You need to be online to view and accept available delivery orders.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleToggleOnline}
                  disabled={onlineLoading}
                  startIcon={onlineLoading ? <CircularProgress size={16} /> : <WifiIcon />}
                >
                  {onlineLoading ? 'Going Online...' : 'Go Online'}
                </Button>
              </Box>
            ) : availableOrders && availableOrders.length > 0 ? (
              <List>
                {availableOrders.map((order) => (
                  <Card key={order._id} sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <AssignmentIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Order #{order.orderNumber || order._id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.user?.personalInfo?.fullName || 'Customer'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.address || 'No address'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.status}
                        </Typography>
                      </Box>
                      <Chip label="Available" color="primary" size="small" sx={{ mr: 1 }} />
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                        disabled={actionLoading[order._id] === 'accept' || !isApproved}
                        onClick={() => handleAccept(order._id)}
                      >
                        {actionLoading[order._id] === 'accept' ? 'Accepting...' : 'Accept'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled={actionLoading[order._id] === 'ignore' || !isApproved}
                        onClick={() => handleIgnore(order._id)}
                      >
                        {actionLoading[order._id] === 'ignore' ? 'Ignoring...' : 'Ignore'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LocalShippingIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">No orders available</Typography>
                <Typography variant="caption" color="text.secondary">New orders will appear here when they become available</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      {tab === 1 && (
        <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                size="small"
                placeholder="Search orders..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, minWidth: 0 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort</InputLabel>
                <Select
                  value={sort}
                  label="Sort"
                  onChange={e => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={orderStatus}
                  label="Status"
                  onChange={e => setOrderStatus(e.target.value)}
                >
                  {ORDER_STATUSES.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {loading ? (
              <List>
                {[1, 2, 3].map((i) => (
                  <Card key={i} sx={{ mb: 2, borderRadius: 3, boxShadow: 1 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width={120} height={24} />
                        <Skeleton width={180} height={18} />
                        <Skeleton width={100} height={18} />
                      </Box>
                      <Skeleton variant="rectangular" width={60} height={32} />
                    </CardContent>
                  </Card>
                ))}
              </List>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <List>
                {filteredOrders.map((order) => (
                  <Card key={order._id} sx={{ mb: 2, borderRadius: 3, boxShadow: 2, cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <AssignmentIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Order #{order.orderNumber || order._id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.user?.personalInfo?.fullName || 'Customer'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.address || 'No address'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.status}
                        </Typography>
                      </Box>
                      <Chip label={order.status} color={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'primary'} size="small" sx={{ mr: 1 }} />
                      <IconButton color="success" size="small">
                        <CheckCircleIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LocalShippingIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">No orders found</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      {tab === 2 && (
        <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>Performance</Typography>
            {loading ? (
              <Skeleton height={40} />
            ) : (
              <Box>
                <Typography variant="body2" mb={1}>Total Earnings: <b>₹{earnings?.totalEarned || 0}</b></Typography>
                <Typography variant="body2" mb={1}>Today's Earnings: <b>₹{earnings?.today || 0}</b></Typography>
                <Typography variant="body2" mb={1}>Total Deliveries: <b>{performance?.totalDeliveries || 0}</b></Typography>
                <Typography variant="body2" mb={1}>Successful Deliveries: <b>{performance?.successfulDeliveries || 0}</b></Typography>
                <Typography variant="body2" mb={1}>Cancelled Deliveries: <b>{performance?.cancelledDeliveries || 0}</b></Typography>
                <Typography variant="body2" mb={1}>Success Rate: <b>{performance?.successRate || 0}%</b></Typography>
                <Typography variant="body2" mb={1}>Average Rating: <b>{performance?.averageRating || 0}/5</b></Typography>
                <Typography variant="body2" mb={1}>Total Ratings: <b>{performance?.totalRatings || 0}</b></Typography>
                <Typography variant="body2" mb={1}>Average Delivery Time: <b>{performance?.averageDeliveryTime ? `${performance.averageDeliveryTime.toFixed(1)} min` : '-'}</b></Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default function WrappedDeliveryDashboard(props) {
  return (
    <DeliveryApprovalGuard>
      <DeliveryDashboard {...props} />
    </DeliveryApprovalGuard>
  );
}

// Keep the original export for named import if needed
export { DeliveryDashboard };
