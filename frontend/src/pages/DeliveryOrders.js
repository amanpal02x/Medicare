import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Chip, List, Avatar, Skeleton, Alert, IconButton, Tabs, Tab, InputAdornment, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import { getOrders } from '../services/deliveryDashboard';
import { useNavigate } from 'react-router-dom';
import DeliveryApprovalGuard from '../components/DeliveryApprovalGuard';

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

const DeliveryOrders = () => {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('active');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getOrders(status)
      .then((res) => {
        setOrders(res.orders || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load orders.');
        setLoading(false);
      });
  }, [status]);

  const handleTabChange = (event, newValue) => {
    setStatus(newValue);
  };

  // Filter and sort orders
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

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 1.5, sm: 3 }, pt: 2 }}>
      <Typography variant="h5" fontWeight={700} color="primary" mb={2}>
        My Orders
      </Typography>
      <Tabs
        value={status}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {ORDER_STATUSES.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
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
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
            <Card key={order._id} sx={{ mb: 2, borderRadius: 3, boxShadow: 2, cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }} onClick={() => navigate(`/delivery/orders/${order._id}`)}>
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
        <Card sx={{ p: 2, textAlign: 'center', mt: 4 }}>
          <CardContent>
            <LocalShippingIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body1" color="text.secondary">No orders found</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default function WrappedDeliveryOrders(props) {
  return (
    <DeliveryApprovalGuard>
      <DeliveryOrders {...props} />
    </DeliveryApprovalGuard>
  );
}

// Keep the original export for named import if needed
export { DeliveryOrders };
