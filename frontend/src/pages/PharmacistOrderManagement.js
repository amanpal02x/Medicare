import React, { useEffect, useState } from 'react';
import { getAssignedOrders, updateOrderStatus, claimOrder } from '../services/pharmacistOrders';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge, Divider } from '@mui/material';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';

const statusOrder = ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const PharmacistOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [nextStatus, setNextStatus] = useState('');
  const [statusDescription, setStatusDescription] = useState('');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 15;
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = React.useState(null);
  const [notifAnchor, setNotifAnchor] = React.useState(null);
  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => { setProfileAnchor(null); logout(); };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAssignedOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimOrder = async (orderId) => {
    setStatusLoading(true);
    try {
      await claimOrder(orderId);
      toast.success('Order claimed!');
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to claim order');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleOpenStatusDialog = (order, status) => {
    setSelectedOrder(order);
    setNextStatus(status);
    setStatusDescription('');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    setStatusLoading(true);
    try {
      await updateOrderStatus(selectedOrder._id, nextStatus, statusDescription);
      toast.success('Order status updated!');
      setStatusDialogOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const getNextStatuses = (order) => {
    const idx = statusOrder.indexOf(order.status);
    // Only allow forward transitions, not cancelled
    const next = [];
    if (order.status === 'pending') next.push('accepted');
    if (order.status === 'accepted') next.push('preparing');
    if (order.status === 'preparing') next.push('out_for_delivery');
    if (order.status === 'out_for_delivery') next.push('delivered');
    return next;
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = orders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading) {
    return (
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <CircularProgress />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '50px 20px', textAlign: 'center', color: 'red' }}>
        <p>{error}</p>
      </div>
    );
  }

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
                <Box display="flex" alignItems="center" gap={1}><AssignmentIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Role:</b> {user?.role}</Typography></Box>
              </Box>
              <Divider sx={{ my: 1, width: '100%' }} />
              <Button variant="contained" color="primary" fullWidth onClick={handleLogout} startIcon={<LogoutIcon />}>LOGOUT</Button>
            </Box>
          </Popover>
        </Box>
      </Box>
      <div style={{ padding: '30px 0' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 30 }}>Pharmacist Order Management</h1>
        <Button variant="outlined" onClick={fetchOrders} style={{ marginBottom: 20 }}>Refresh</Button>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <p>No orders found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 2px 8px #0001' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={thStyle}>Order ID</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Placed</th>
                  <th style={thStyle}>Items</th>
                  <th style={thStyle}>Assignment</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{order.orderNumber || order._id}</td>
                    <td style={tdStyle}>{statusLabels[order.status] || order.status}</td>
                    <td style={tdStyle}>₹{order.total?.toFixed(2)}</td>
                    <td style={tdStyle}>{new Date(order.createdAt).toLocaleString()}</td>
                    <td style={tdStyle}>
                      {[...(order.medicines || []).map(item => `${item.medicine?.name} x${item.quantity}`),
                        ...(order.products || []).map(item => `${item.product?.name} x${item.quantity}`)
                      ].join(', ')}
                    </td>
                    <td style={tdStyle}>
                      {order.isAssignedToMe && <span style={{ color: '#2196f3' }}>Assigned to you</span>}
                      {order.isUnassigned && <span style={{ color: '#f59e0b' }}>Unassigned</span>}
                      {!order.isAssignedToMe && !order.isUnassigned && <span>Assigned</span>}
                    </td>
                    <td style={tdStyle}>
                      {order.isUnassigned && (
                        <Button variant="contained" color="primary" size="small" disabled={statusLoading} onClick={() => handleClaimOrder(order._id)}>
                          Claim
                        </Button>
                      )}
                      {order.isAssignedToMe && getNextStatuses(order).map(status => (
                        <Button key={status} variant="contained" color="secondary" size="small" style={{ marginLeft: 6 }} disabled={statusLoading} onClick={() => handleOpenStatusDialog(order, status)}>
                          Mark as {statusLabels[status]}
                        </Button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 8 }}>
                <Button variant="outlined" size="small" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</Button>
                {[...Array(totalPages)].map((_, idx) => (
                  <Button
                    key={idx + 1}
                    variant={currentPage === idx + 1 ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </Button>
                ))}
                <Button variant="outlined" size="small" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Status update dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: 16 }}>
            <b>Order:</b> {selectedOrder?.orderNumber || selectedOrder?._id}<br />
            <b>Current Status:</b> {statusLabels[selectedOrder?.status]}
          </div>
          <div style={{ marginBottom: 16 }}>
            <b>New Status:</b> {statusLabels[nextStatus]}
          </div>
          <textarea
            placeholder="Description (optional)"
            value={statusDescription}
            onChange={e => setStatusDescription(e.target.value)}
            rows={3}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={statusLoading}>Cancel</Button>
          <Button onClick={handleUpdateStatus} disabled={statusLoading} variant="contained" color="primary">
            {statusLoading ? <CircularProgress size={20} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Table cell and header styles
const thStyle = {
  padding: '10px 12px',
  borderBottom: '2px solid #ddd',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '1rem',
  background: '#f5f5f5',
};
const tdStyle = {
  padding: '10px 12px',
  fontSize: '0.98rem',
  verticalAlign: 'top',
};

export default PharmacistOrderManagement;
