import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Avatar, Chip, Skeleton, Alert, Button, Divider, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { getOrders } from '../services/deliveryDashboard';
import axios from 'axios';
import DeliveryApprovalGuard from '../components/DeliveryApprovalGuard';

const DeliveryOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const API_BASE = process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api/delivery';
    axios.get(`${API_BASE}/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load order details.');
        setLoading(false);
      });
  }, [orderId]);

  const handleStatusUpdate = async (newStatus) => {
    setStatusLoading(true);
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api/delivery';
      await axios.put(`${API_BASE}/orders/${orderId}/status`, { status: newStatus });
      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch {
      setError('Failed to update order status.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 1.5, sm: 3 }, pt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Card sx={{ p: 2, mb: 2 }}>
          <CardContent>
            <Skeleton variant="text" width={120} height={32} />
            <Skeleton variant="rectangular" width={200} height={24} sx={{ my: 1 }} />
            <Skeleton variant="rectangular" width={300} height={24} sx={{ my: 1 }} />
            <Skeleton variant="rectangular" width={100} height={24} sx={{ my: 1 }} />
            <Skeleton variant="rectangular" width={80} height={32} sx={{ my: 2 }} />
          </CardContent>
        </Card>
      ) : order ? (
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <AssignmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Order #{order.orderNumber || order._id}
                </Typography>
                <Chip label={order.status} color={order.status === 'delivered' ? 'success' : 'primary'} size="small" sx={{ mt: 1 }} />
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Customer</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.user?.personalInfo?.fullName || 'Customer'}<br />
              {order.user?.personalInfo?.phone || ''}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {order.address || 'No address'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Items</Typography>
            <List>
              {(order.medicines || []).map((item, idx) => (
                <ListItem key={idx}>
                  <ListItemAvatar>
                    <Avatar src={item.medicine?.image} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.medicine?.name}
                    secondary={`Qty: ${item.quantity}`}
                  />
                </ListItem>
              ))}
              {(order.products || []).map((item, idx) => (
                <ListItem key={idx}>
                  <ListItemAvatar>
                    <Avatar src={item.product?.image} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.product?.name}
                    secondary={`Qty: ${item.quantity}`}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" mb={1}>
              Placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Last Updated: {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-'}
            </Typography>
            {/* Status update actions */}
            {order.status !== 'delivered' && (
              <Button
                variant="contained"
                color="success"
                disabled={statusLoading}
                onClick={() => handleStatusUpdate('delivered')}
                sx={{ mt: 2 }}
              >
                Mark as Delivered
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}
    </Box>
  );
};

export default function WrappedDeliveryOrderDetail(props) {
  return (
    <DeliveryApprovalGuard>
      <DeliveryOrderDetail {...props} />
    </DeliveryApprovalGuard>
  );
}

// Keep the original export for named import if needed
export { DeliveryOrderDetail };
