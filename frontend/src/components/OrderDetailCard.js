import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  AccessTime as AccessTimeIcon,
  LocalShipping as DeliveryIcon,
  ShoppingCart as CartIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const OrderDetailCard = ({ order, onUpdateStatus }) => {
  const formatEarnings = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatOrderDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'out_for_delivery': return 'warning';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600} color="primary">
            Order #{order.orderNumber}
          </Typography>
          <Chip 
            label={getStatusText(order.status)}
            color={getStatusColor(order.status)}
            size="small"
          />
        </Box>

        <Grid container spacing={3}>
          {/* Customer Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Customer Information
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={order.user?.personalInfo?.fullName || 'Customer'}
                  secondary="Customer Name"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <PhoneIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={order.phone}
                  secondary="Contact Number"
                />
              </ListItem>
              {order.user?.personalInfo?.email && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <EmailIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={order.user.personalInfo.email}
                    secondary="Email Address"
                  />
                </ListItem>
              )}
            </List>
          </Grid>

          {/* Delivery Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon />
              Delivery Details
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <LocationIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={order.address}
                  secondary="Delivery Address"
                  primaryTypographyProps={{ sx: { wordBreak: 'break-word' } }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <PaymentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={formatEarnings(order.total)}
                  secondary="Order Amount"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <AccessTimeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={formatOrderDate(order.createdAt)}
                  secondary="Order Date"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        {/* Order Items */}
        {(order.medicines?.length > 0 || order.products?.length > 0) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CartIcon />
              Order Items
            </Typography>
            <List dense>
              {order.medicines?.map((item, index) => (
                <ListItem key={`medicine-${index}`} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DeliveryIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.medicine?.name || 'Medicine'}
                    secondary={`Qty: ${item.quantity} | Price: ${formatEarnings(item.price)}`}
                  />
                </ListItem>
              ))}
              {order.products?.map((item, index) => (
                <ListItem key={`product-${index}`} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CartIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.product?.name || 'Product'}
                    secondary={`Qty: ${item.quantity} | Price: ${formatEarnings(item.price)}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Delivery Notes */}
        {order.deliveryNotes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon />
                Delivery Notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.deliveryNotes}
              </Typography>
            </Box>
          </>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="success"
            onClick={() => onUpdateStatus('delivered')}
            disabled={order.status !== 'out_for_delivery'}
          >
            Mark as Delivered
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => onUpdateStatus('out_for_delivery')}
            disabled={order.status === 'delivered'}
          >
            Update Status
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderDetailCard; 