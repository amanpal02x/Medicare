import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Menu, MenuItem, Box, Avatar, Tooltip, Divider, ListItemIcon, Popover } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import StoreIcon from '@mui/icons-material/Store';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';
import { getNotifications, markNotificationsRead, markNotificationRead, clearSeenNotifications, testNotification } from '../services/notification';
import { useNotifications } from '../context/NotificationContext';
import notificationSound from '../utils/notificationSound';
import EnhancedProfilePopup from './EnhancedProfilePopup';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const secondaryNav = [
  { label: 'Shop By Category', icon: <MenuIcon fontSize="small" />, route: '/categories', dropdown: true },
  { label: 'Best Sellers', icon: <StarIcon fontSize="small" />, route: '/best-sellers' },
  { label: 'Brands', icon: <LocalOfferIcon fontSize="small" />, route: '/brands' },
  { label: 'About us', icon: <CardGiftcardIcon fontSize="small" />, route: '/about' },
  { label: 'Customer Support', icon: <SupportAgentIcon fontSize="small" />, route: '/support' },
  { label: 'Store locator', icon: <StoreIcon fontSize="small" />, route: '/stores' },
  { label: 'Supports', icon: <SupportAgentIcon fontSize="small" />, route: '/help-supports' },
];

const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com').replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}

const Header = ({ categories = [], onTabChange, activeTab }) => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const { cartCount } = useCart();
  const { socket, joinRoom, leaveRoom } = useSocket();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [profilePopoverAnchor, setProfilePopoverAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const { notifications, clearAllNotifications, fetchNotifications } = useNotifications();
  const [notifUnread, setNotifUnread] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const prevNotifCount = React.useRef(0);
  // Location state for user
  const [userAddress, setUserAddress] = useState('');
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [addressField, setAddressField] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [resolvedCoords, setResolvedCoords] = useState(null);

  useEffect(() => {
    // Fetch address from localStorage (used in LandingPage)
    const savedAddress = localStorage.getItem('deliveryAddress');
    setUserAddress(savedAddress || '');
    // Listen for storage changes (in case user updates location elsewhere)
    const handleStorage = () => {
      setUserAddress(localStorage.getItem('deliveryAddress') || '');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Resolve address when addressField changes
  useEffect(() => {
    setResolvedAddress('');
    setResolvedCoords(null);
    setAddressError('');
    if (!addressField) return;
    // Check for pincode (6 digits)
    if (/^\d{6}$/.test(addressField.trim())) {
      setAddressLoading(true);
      fetch(`https://api.postalpincode.in/pincode/${addressField.trim()}`)
        .then(res => res.json())
        .then(data => {
          if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const po = data[0].PostOffice[0];
            setResolvedAddress(`${po.Name}, ${po.District}, ${po.State}`);
            setResolvedCoords(null);
            setAddressError('');
          } else {
            setResolvedAddress('');
            setAddressError('Invalid pincode');
          }
        })
        .catch(() => {
          setResolvedAddress('');
          setAddressError('Failed to fetch address');
        })
        .finally(() => setAddressLoading(false));
      return;
    }
    // Check for coordinates: "lat, lng"
    const coordMatch = addressField.trim().match(/^(-?\d{1,3}\.\d+)[, ]+(-?\d{1,3}\.\d+)$/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      setAddressLoading(true);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setResolvedAddress(data.display_name);
            setResolvedCoords({ lat, lng });
            setAddressError('');
          } else {
            setResolvedAddress('');
            setResolvedCoords(null);
            setAddressError('No address found for these coordinates.');
          }
        })
        .catch(() => {
          setResolvedAddress('');
          setResolvedCoords(null);
          setAddressError('Failed to fetch address from coordinates.');
        })
        .finally(() => setAddressLoading(false));
      return;
    }
    // Otherwise, treat as manual address
    setResolvedAddress(addressField.trim());
    setResolvedCoords(null);
  }, [addressField]);

  // Join user room for real-time notifications
  useEffect(() => {
    if (user && user._id) {
      joinRoom('user', user._id);
    }
    return () => {
      if (user && user._id) {
        leaveRoom('user', user._id);
      }
    };
  }, [user, joinRoom, leaveRoom]);

  // Listen for custom event to open location dialog
  useEffect(() => {
    const handleOpenLocationDialog = () => {
      setLocationDialogOpen(true);
    };

    window.addEventListener('openLocationDialog', handleOpenLocationDialog);
    return () => {
      window.removeEventListener('openLocationDialog', handleOpenLocationDialog);
    };
  }, []);

  // Setup socket listeners for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      const newNotification = data.notification;
      
      // Add new notification to the beginning of the list
      // setNotifications(prev => [newNotification, ...prev]); // This line is removed
      setNotifUnread(prev => prev + 1);
      
      // Update browser tab title
      document.title = `MediCare (${notifUnread + 1})`;
      
      // Show toast notification
      setToastMsg(newNotification.message);
      setShowToast(true);
      
      // Play notification sound
      try {
        notificationSound.play();
      } catch (error) {
        console.log('Notification sound not available');
        // Fallback to browser notification
        if (Notification.permission === 'granted') {
          new Notification('MediCare', {
            body: newNotification.message,
            icon: '/favicon.ico'
          });
        }
      }
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, notifUnread]);

  // Update unread count when notifications change
  useEffect(() => {
    if (!notifications) return;
    const unread = notifications.filter(n => !n.isRead).length;
    setNotifUnread(unread);
    document.title = unread > 0 ? `MediCare (${unread})` : 'MediCare';
    prevNotifCount.current = notifications.length;
  }, [notifications]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCategoryClick = (cat) => {
    setAnchorEl(null);
    if (cat._id) {
      navigate(`/categories/${cat._id}`);
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleUserNav = (route) => {
    setUserMenuAnchor(null);
    navigate(route);
  };

  const handleLogout = () => {
    setUserMenuAnchor(null);
    logout();
    // setNotifications([]); // This line is removed
    setNotifUnread(0);
    navigate('/');
  };

  const handleProfilePopoverOpen = (event) => {
    setProfilePopoverAnchor(event.currentTarget);
  };

  const handleProfilePopoverClose = () => {
    setProfilePopoverAnchor(null);
  };

  const isProfilePopoverOpen = Boolean(profilePopoverAnchor);

  // Handle restricted content navigation
  const handleRestrictedNav = (route) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(route);
  };

  const handleNotifOpen = (e) => {
    setNotifAnchor(e.currentTarget);
    if (!token) {
      setToastMsg('You must be logged in to view notifications.');
      setShowToast(true);
      return;
    }
    // Mark as read when opening
    markNotificationsRead(token).then(() => setNotifUnread(0)).catch(() => {
      setToastMsg('Error marking notifications as read.');
      setShowToast(true);
    });
  };

  const handleNotifClose = () => setNotifAnchor(null);

  const handleNotifClick = async (notification) => {
    console.log('Header notification clicked - FULL OBJECT:', notification);
    console.log('Header notification clicked - DETAILED:', {
      type: notification.type,
      orderId: notification.orderId,
      link: notification.link,
      message: notification.message,
      _id: notification._id,
      user: notification.user,
      ticketId: notification.ticketId,
      replyPreview: notification.replyPreview,
      adminName: notification.adminName,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    });
    
    setNotifAnchor(null);
    // Mark this specific notification as read
    try {
      await markNotificationRead(notification._id, token);
      // Update local state
      // setNotifications(prev => prev.map(n => 
      //   n._id === notification._id ? { ...n, isRead: true } : n
      // )); // This line is removed
      setNotifUnread(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }

    // Redirect logic for admin reply notifications
    if (notification.type === 'admin_reply' || notification.type === 'admin_query_closed') {
      console.log('Processing admin reply notification...');
      if (notification.orderId) {
        console.log('Header: Found orderId, navigating to order chat:', `/orders/${notification.orderId}/chat`);
        navigate(`/orders/${notification.orderId}/chat`);
        return;
      } else if (notification.link) {
        // If no orderId but there's a link, use the link
        console.log('Header: No orderId, but found link, navigating to:', notification.link);
        navigate(notification.link);
        return;
      } else {
        // Fallback to support page
        console.log('Header: No orderId or link, navigating to support page');
        navigate('/help-supports');
        return;
      }
    }

    // Fallback: Always navigate to the notifications list page
    console.log('Header: Not an admin reply, navigating to notifications page');
    navigate('/notifications');
  };

  const handleClearSeenNotifications = async () => {
    try {
      const result = await clearSeenNotifications(token);
      // Remove seen notifications from local state
      // setNotifications(prev => prev.filter(n => !n.isRead)); // This line is removed
      setToastMsg(result.message || 'Cleared seen notifications');
      setShowToast(true);
    } catch (err) {
      setToastMsg('Error clearing seen notifications');
      setShowToast(true);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await clearAllNotifications();
      setNotifUnread(0);
    } catch (err) {
      setToastMsg('Error clearing notifications');
      setShowToast(true);
    }
  };

  const handleTestNotification = async () => {
    try {
      await testNotification(token);
      setToastMsg('Test notification sent! Check your notifications.');
      setShowToast(true);
    } catch (err) {
      setToastMsg('Error sending test notification');
      setShowToast(true);
    }
  };

  const getActionButton = (notification) => {
    // Early return if notification is null or undefined
    if (!notification) {
      return null;
    }

    // Check if notification has a link (order-related)
    if (notification.link && notification.link.includes('/orders/')) {
      return {
        label: 'View Order',
        action: () => {
          setNotifAnchor(null);
          navigate(notification.link);
        }
      };
    }
    
    // Check if notification has a link to support
    if (notification.link && notification.link.includes('/support')) {
      return {
        label: 'View Support',
        action: () => {
          setNotifAnchor(null);
          navigate('/help-supports');
        }
      };
    }
    
    // Check if notification has a link to prescriptions
    if (notification.link && notification.link.includes('/prescriptions/')) {
      return {
        label: 'View Prescription',
        action: () => {
          setNotifAnchor(null);
          navigate(notification.link);
        }
      };
    }
    
    // Check if notification has a link to payments
    if (notification.link && notification.link.includes('/payments/')) {
      return {
        label: 'View Payment',
        action: () => {
          setNotifAnchor(null);
          navigate(notification.link);
        }
      };
    }
    
    // Check if notification has a link to delivery
    if (notification.link && notification.link.includes('/delivery/')) {
      return {
        label: 'View Delivery',
        action: () => {
          setNotifAnchor(null);
          navigate(notification.link);
        }
      };
    }
    
    // Default fallback
    return null;
  };

  return (
    <>
      <AppBar position="fixed" color="default" elevation={1} sx={{ background: '#fff' }}>
        {/* Main NavBar: Brand Centered, Location Left */}
        <Toolbar sx={{ justifyContent: 'center', py: 1, position: 'relative', minHeight: 64 }}>
          {/* Location display at left */}
          <Box sx={{ position: 'absolute', left: 24, display: 'flex', alignItems: 'center', cursor: 'pointer', minWidth: 180, background: 'rgba(33,134,235,0.06)', borderRadius: 2, px: 2, py: 0.5 }}
            onClick={() => setLocationDialogOpen(true)}
            title={userAddress ? userAddress : 'Set Location'}
          >
            <LocationOnIcon color="primary" sx={{ mr: 1 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
              <Typography variant="body2" color="primary" fontWeight={700} sx={{ fontSize: 15 }}>
                {userAddress ? userAddress.split(',')[0] : 'Set Location'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userAddress ? userAddress.split(',').slice(1).join(',').trim() : 'Choose your area'}
              </Typography>
            </Box>
          </Box>
          {/* Brand Centered */}
          <Typography 
            variant="h4" 
            color="primary" 
            fontWeight={700} 
            letterSpacing={2} 
            sx={{ textAlign: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            MediCare
          </Typography>
        </Toolbar>
        {/* Secondary Navigation: Nav Buttons + Search/Login/Cart/User */}
        <Toolbar sx={{ minHeight: 36, background: '#f8fafd', px: 2, display: 'flex' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1, gap: 2 }}>
            <Button
              startIcon={<DashboardIcon fontSize="small" />}
              sx={{ color: activeTab === 'home' ? 'primary.main' : '#222', textTransform: 'none', fontWeight: 500, fontSize: 15 }}
              onClick={() => navigate('/')}
            >
              Home
            </Button>
            <Button
              startIcon={<CardGiftcardIcon fontSize="small" />}
              sx={{ color: '#222', textTransform: 'none', fontWeight: 500, fontSize: 15 }}
              onClick={() => navigate('/about')}
            >
              About us
            </Button>
            <Button
              startIcon={<ListAltIcon fontSize="small" />}
              sx={{ color: activeTab === 'orders' ? 'primary.main' : '#222', textTransform: 'none', fontWeight: 500, fontSize: 15 }}
              onClick={() => handleRestrictedNav('/orders')}
            >
              Orders
            </Button>
            <Button
              startIcon={<AssignmentIcon fontSize="small" />}
              sx={{ color: activeTab === 'prescriptions' ? 'primary.main' : '#222', textTransform: 'none', fontWeight: 500, fontSize: 15 }}
              onClick={() => handleRestrictedNav('/prescriptions')}
            >
              Prescriptions
            </Button>
            <Button
              startIcon={<StoreIcon fontSize="small" />}
              sx={{ color: '#222', textTransform: 'none', fontWeight: 500, fontSize: 15 }}
              onClick={() => navigate('/stores')}
            >
              Store Locator
            </Button>
            <Button
              startIcon={<SupportAgentIcon fontSize="small" />}
              sx={{ color: '#222', textTransform: 'none', fontWeight: 500, fontSize: 15 }}
              onClick={() => navigate('/help-supports')}
            >
              Supports
            </Button>
          </Box>
          {/* User Navigation or Login */}
          {user ? (
            <>
              <Tooltip title={user.name || 'Account'}>
                <IconButton onClick={handleProfilePopoverOpen} sx={{ ml: 1 }}>
                  <Avatar sx={{ width: 32, height: 32 }} src={user.profilePhoto || null}>
                    {user.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <EnhancedProfilePopup
                user={user}
                onLogout={handleLogout}
                open={isProfilePopoverOpen}
                anchorEl={profilePopoverAnchor}
                onClose={handleProfilePopoverClose}
              />
            </>
          ) : (
            <Button color="primary" variant="contained" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
          <IconButton color="primary" onClick={() => navigate('/cart')}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          <Tooltip title="Notifications">
            <IconButton color="primary" onClick={handleNotifOpen}>
              <Badge 
                badgeContent={notifUnread} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    animation: notifUnread > 0 ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': {
                        boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)',
                      },
                      '70%': {
                        boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)',
                      },
                      '100%': {
                        boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)',
                      },
                    },
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={handleNotifClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                maxWidth: 400,
                maxHeight: 500,
                overflow: 'auto'
              }
            }}
          >
            {notifications.length === 0 ? (
              <MenuItem disabled>No notifications</MenuItem>
            ) : (
              <>
                <MenuItem disabled sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Notifications ({notifications.length})
                </MenuItem>
                {notifications.length > 0 && (
                  <MenuItem 
                    onClick={handleClearAllNotifications}
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      py: 1,
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontWeight: 500
                    }}
                  >
                    <ClearAllIcon fontSize="small" />
                    Clear All
                  </MenuItem>
                )}
                <MenuItem 
                  onClick={() => {
                    setNotifAnchor(null);
                    navigate('/notifications');
                  }}
                  sx={{ 
                    color: 'primary.main',
                    fontSize: '0.875rem',
                    py: 1,
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontWeight: 500
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                  View All Notifications
                </MenuItem>
                {notifications.map(n => (
                  <MenuItem 
                    key={n._id} 
                    onClick={() => handleNotifClick(n)} 
                    sx={{ 
                      whiteSpace: 'normal', 
                      maxWidth: 400, 
                      cursor: n.link ? 'pointer' : 'default',
                      borderBottom: '1px solid #f0f0f0',
                      py: 2,
                      backgroundColor: !n.isRead ? '#f0f8ff' : 'transparent',
                      borderLeft: !n.isRead ? '4px solid #1976d2' : '4px solid transparent',
                      '&:hover': {
                        backgroundColor: n.link ? '#f5f5f5' : 'transparent'
                      }
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {n.message}
                        </Typography>
                        {!n.isRead && (
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: '#1976d2',
                              flexShrink: 0
                            }} 
                          />
                        )}
                      </Box>
                      {n.replyPreview && (
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{ 
                            fontSize: '0.875rem',
                            fontStyle: 'italic',
                            backgroundColor: '#f8f9fa',
                            p: 1,
                            borderRadius: 1,
                            mb: 1
                          }}
                        >
                          "{n.replyPreview}..."
                        </Typography>
                      )}
                      {n.adminName && (
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                          By: {n.adminName}
                        </Typography>
                      )}
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </Typography>
                      {(() => {
                        const actionButton = getActionButton(n);
                        return actionButton ? (
                          <Button
                            size="small"
                            variant="text"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              actionButton.action();
                            }}
                            sx={{ 
                              p: 0, 
                              minWidth: 'auto', 
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              mt: 0.5
                            }}
                          >
                            {actionButton.label} →
                          </Button>
                        ) : null;
                      })()}
                    </Box>
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
        </Toolbar>
      </AppBar>
      {/* Offset for fixed header (height: 128px for two Toolbars) */}
      <div style={{ height: 128 }} />
      <Dialog open={locationDialogOpen} onClose={() => setLocationDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Set Delivery Location</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter Address, Pincode, or Coordinates (lat, lng)"
            value={addressField}
            onChange={e => setAddressField(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
            multiline
            minRows={1}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { border: 'none !important' },
                '&:hover fieldset': { border: 'none !important' },
                '&.Mui-focused fieldset': { border: 'none !important' },
                '& input': { outline: 'none !important' },
                '& textarea': { outline: 'none !important' },
              },
            }}
          />
          {addressLoading && <CircularProgress size={24} sx={{ mt: 1 }} />}
          {resolvedAddress && !addressLoading && (
            <div style={{ marginTop: 8, color: '#2186eb', fontWeight: 600 }}>{resolvedAddress}</div>
          )}
          {addressError && <div style={{ color: 'red', marginTop: 8 }}>{addressError}</div>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialogOpen(false)} color="secondary">Cancel</Button>
          <Button
            onClick={() => {
              if (/^\d{6}$/.test(addressField.trim()) && resolvedAddress) {
                localStorage.setItem('deliveryPincode', addressField.trim());
                localStorage.setItem('deliveryAddress', resolvedAddress);
                setUserAddress(resolvedAddress);
                // Dispatch custom event for same-tab updates
                window.dispatchEvent(new CustomEvent('localStorageChange', {
                  detail: { key: 'deliveryPincode', value: addressField.trim() }
                }));
                setLocationDialogOpen(false);
              } else if (resolvedCoords && resolvedAddress) {
                localStorage.setItem('deliveryAddress', resolvedAddress);
                localStorage.setItem('deliveryCoords', JSON.stringify(resolvedCoords));
                setUserAddress(resolvedAddress);
                setLocationDialogOpen(false);
              } else if (resolvedAddress) {
                localStorage.setItem('deliveryAddress', resolvedAddress);
                setUserAddress(resolvedAddress);
                setLocationDialogOpen(false);
              }
            }}
            color="primary"
            variant="contained"
            disabled={!resolvedAddress}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        message={toastMsg}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </>
  );
};

export default Header; 