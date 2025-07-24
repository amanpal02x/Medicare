import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Tooltip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { getNotifications, markNotificationRead, assignNotification } from '../services/pharmacistOrders';
import notificationSound from '../utils/notificationSound';

const PharmacistNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications();
      
      // Check for new notifications and play sound
      const newNotifications = data.filter(notif => !notif.isRead);
      const previousUnreadCount = notifications.filter(notif => !notif.isRead).length;
      
      if (newNotifications.length > previousUnreadCount) {
        // Play pharmacist-specific notification sound for new notifications
        notificationSound.playPharmacistSound();
        
        // Show browser notification
        const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
        if (Notification.permission === 'granted' && settings.browserNotifications !== false && newNotifications.length > 0) {
          const latestNotification = newNotifications[0];
          new Notification('New Pharmacist Notification', {
            body: latestNotification.message,
            icon: '/favicon.ico',
            tag: 'pharmacist-notification',
            requireInteraction: true // Keep notification visible until user interacts
          });
        }
      }
      
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleAssignNotification = async (notificationId) => {
    try {
      await assignNotification(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, status: 'assigned' } : notif
        )
      );
    } catch (err) {
      console.error('Failed to assign notification:', err);
    }
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    
    // Mark as read when viewed
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <AssignmentIcon color="primary" />;
      case 'order_status':
        return <LocalShippingIcon color="info" />;
      case 'payment':
        return <PaymentIcon color="success" />;
      case 'prescription':
        return <ReceiptIcon color="warning" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_order':
        return 'primary';
      case 'order_status':
        return 'info';
      case 'payment':
        return 'success';
      case 'prescription':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Notifications ({notifications.filter(n => !n.isRead).length} unread)
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchNotifications}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {notifications.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No notifications yet
          </Typography>
        </Card>
      ) : (
        <List>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification._id}>
              <ListItem
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  borderRadius: 2,
                  mb: 1,
                  border: notification.isRead ? 'none' : '1px solid',
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: `${getNotificationColor(notification.type)}.main` }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={notification.isRead ? 400 : 600}
                        color={notification.isRead ? 'text.secondary' : 'text.primary'}
                      >
                        {notification.type === 'new_order' ? 'New Order' : 
                         notification.type === 'order_status' ? 'Order Update' :
                         notification.type === 'payment' ? 'Payment' :
                         notification.type === 'prescription' ? 'Prescription' :
                         'Notification'}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {notification.message || 'No message available'}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <Chip
                          label={formatTimestamp(notification.createdAt)}
                          size="small"
                          variant="outlined"
                        />
                        {notification.order && (
                          <Chip
                            label={`Order #${notification.order.orderNumber || notification.order._id?.toString().slice(-6)}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {!notification.isRead && (
                          <Chip
                            label="Unread"
                            size="small"
                            color="error"
                          />
                        )}
                        {notification.status === 'assigned' && (
                          <Chip
                            label="Assigned"
                            size="small"
                            color="success"
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
                
                <Box display="flex" gap={1}>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleViewNotification(notification)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {!notification.isRead && (
                    <Tooltip title="Mark as Read">
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <MarkEmailReadIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {notification.type === 'new_order' && notification.status !== 'assigned' && (
                    <Tooltip title="Assign to Me">
                      <IconButton
                        size="small"
                        onClick={() => handleAssignNotification(notification._id)}
                      >
                        <AssignmentIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </ListItem>
              
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Notification Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Notification Details
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedNotification.type === 'new_order' ? 'New Order' : 
                 selectedNotification.type === 'order_status' ? 'Order Update' :
                 selectedNotification.type === 'payment' ? 'Payment' :
                 selectedNotification.type === 'prescription' ? 'Prescription' :
                 'Notification'}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {selectedNotification.message || 'No message available'}
              </Typography>
              
              {selectedNotification.order && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Order Information:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Order Number: {selectedNotification.order.orderNumber || selectedNotification.order._id?.toString().slice(-6)}
                  </Typography>
                  {selectedNotification.order.total && (
                    <Typography variant="body2" color="text.secondary">
                      Total: ₹{selectedNotification.order.total}
                    </Typography>
                  )}
                </Box>
              )}
              
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Received: {formatTimestamp(selectedNotification.createdAt)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PharmacistNotifications; 