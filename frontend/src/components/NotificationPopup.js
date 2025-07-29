import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Slide,
  Fade,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  LocalShipping as DeliveryIcon,
  Person as PersonIcon,
  Assignment as OrderIcon
} from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';
import { acceptOrder, rejectOrder } from '../services/delivery';
import { useNavigate } from 'react-router-dom';

const NotificationPopup = ({ anchorEl, open, onClose, onSeeAll }) => {
  const { notifications, removeNotification } = useSocket();
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [errorMsg, setErrorMsg] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Show new notifications with animation
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      setVisibleNotifications(prev => [latestNotification, ...prev.slice(0, 2)]);
      
      // Auto-remove notification after 8 seconds
      const timer = setTimeout(() => {
        removeNotification(latestNotification.id);
        setVisibleNotifications(prev => prev.filter(n => n.id !== latestNotification.id));
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [notifications, removeNotification]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <WarningIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleClose = (id) => {
    removeNotification(id);
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAccept = async (notification) => {
    setActionLoading((prev) => ({ ...prev, [notification.id]: true }));
    setErrorMsg((prev) => ({ ...prev, [notification.id]: '' }));
    try {
      await acceptOrder(notification.orderId || notification.orderNumber);
      removeNotification(notification.id);
      setVisibleNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    } catch (error) {
      setErrorMsg((prev) => ({ ...prev, [notification.id]: error.message || 'Failed to accept order' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [notification.id]: false }));
    }
  };

  const handleIgnore = async (notification) => {
    setActionLoading((prev) => ({ ...prev, [notification.id]: true }));
    setErrorMsg((prev) => ({ ...prev, [notification.id]: '' }));
    try {
      await rejectOrder(notification.orderId || notification.orderNumber, 'Ignored by delivery boy');
      removeNotification(notification.id);
      setVisibleNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    } catch (error) {
      setErrorMsg((prev) => ({ ...prev, [notification.id]: error.message || 'Failed to ignore order' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [notification.id]: false }));
    }
  };

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', {
      type: notification.type,
      orderId: notification.orderId,
      link: notification.link,
      message: notification.message
    });
    
    // Mark as read
    // Assuming markAsRead is a function from useSocket or a similar context
    // If not, this line will cause an error. For now, commenting out as per edit hint.
    // markAsRead(notification._id); 
    
    // Navigate based on notification type
    if (notification.type === 'order') {
      navigate(`/orders/${notification.orderId}`);
    } else if (notification.type === 'prescription') {
      navigate(`/prescriptions/${notification.prescriptionId}`);
    } else if (notification.type === 'admin_reply' || notification.type === 'admin_query_closed') {
      // For admin reply notifications, check if there's an orderId and navigate to order chat
      if (notification.orderId) {
        console.log('Navigating to order chat:', `/orders/${notification.orderId}/chat`);
        navigate(`/orders/${notification.orderId}/chat`);
      } else if (notification.link) {
        // If no orderId but there's a link, use the link
        console.log('Navigating to link:', notification.link);
        navigate(notification.link);
      } else {
        // Fallback to support page
        console.log('Navigating to support page');
        navigate('/help-support');
      }
    } else {
      // Default to notifications page
      console.log('Navigating to notifications page');
      navigate('/notifications');
    }
  };

  if (visibleNotifications.length === 0) return null;

  // Dropdown mode if anchorEl is provided
  if (anchorEl) {
    return (
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { minWidth: 350, maxWidth: 400, p: 1 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {visibleNotifications.map((notification, index) => (
          <MenuItem key={notification.id} sx={{ whiteSpace: 'normal', alignItems: 'flex-start' }}
            onClick={() => {
              handleNotificationClick(notification);
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar sx={{ bgcolor: getNotificationColor(notification.type), width: 36, height: 36 }}>
                {getNotificationIcon(notification.type)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} fontSize={15} mb={0.5}>
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(notification.timestamp)}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => handleClose(notification.id)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </MenuItem>
        ))}
        {onSeeAll && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
            <Button onClick={onSeeAll} size="small">See all</Button>
          </Box>
        )}
      </Menu>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400
      }}
    >
      {visibleNotifications.map((notification, index) => (
        <Slide
          key={notification.id}
          direction="left"
          in={true}
          timeout={300 + index * 100}
        >
          <Card
            sx={{
              minWidth: 350,
              maxWidth: 400,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: `2px solid ${getNotificationColor(notification.type)}`,
              borderRadius: 2,
              position: 'relative',
              overflow: 'visible',
              cursor: (notification.type === 'admin_reply' || notification.type === 'admin_query_closed') && notification.orderId ? 'pointer' : 'default'
            }}
            onClick={() => handleNotificationClick(notification)}
          >
            <CardContent sx={{ p: 2, pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: getNotificationColor(notification.type),
                    width: 40,
                    height: 40
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </Avatar>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {notification.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleClose(notification.id)}
                      sx={{ ml: 1, p: 0.5 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {notification.message}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {notification.orderNumber && (
                      <Chip
                        icon={<OrderIcon />}
                        label={`Order #${notification.orderNumber}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                    
                    {notification.deliveryBoy && (
                      <Chip
                        icon={<DeliveryIcon />}
                        label={notification.deliveryBoy.name}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                    
                    {notification.pharmacist && (
                      <Chip
                        icon={<PersonIcon />}
                        label={typeof notification.pharmacist === 'object' ? notification.pharmacist.name : notification.pharmacist}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                    
                    {notification.status && (
                      <Chip
                        label={notification.status.replace('_', ' ').toUpperCase()}
                        size="small"
                        color={
                          notification.status === 'delivered' ? 'success' :
                          notification.status === 'cancelled' ? 'error' :
                          notification.status === 'out_for_delivery' ? 'warning' :
                          'default'
                        }
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </Box>
                  
                  {/* Accept/Ignore buttons for delivery assignment notifications */}
                  {notification.orderNumber && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <button
                        onClick={async () => {
                          await handleAccept(notification);
                          // Auto-refresh available orders if error occurs
                          if (errorMsg[notification.id]) {
                            if (typeof window !== 'undefined' && window.location) {
                              window.location.reload(); // Simple refresh, replace with a more targeted refresh if available
                            }
                          }
                        }}
                        disabled={actionLoading[notification.id]}
                        style={{
                          padding: '6px 16px',
                          borderRadius: 4,
                          border: 'none',
                          background: '#4caf50',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: actionLoading[notification.id] ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {actionLoading[notification.id] ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleIgnore(notification)}
                        disabled={actionLoading[notification.id]}
                        style={{
                          padding: '6px 16px',
                          borderRadius: 4,
                          border: 'none',
                          background: '#f44336',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: actionLoading[notification.id] ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {actionLoading[notification.id] ? 'Ignoring...' : 'Ignore'}
                      </button>
                    </Box>
                  )}
                  {errorMsg[notification.id] && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errorMsg[notification.id] === 'Order has already been accepted by another delivery agent.'
                        ? 'Order has already been taken by another delivery agent.'
                        : errorMsg[notification.id]}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {formatTime(notification.timestamp)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Slide>
      ))}
    </Box>
  );
};

export default NotificationPopup; 