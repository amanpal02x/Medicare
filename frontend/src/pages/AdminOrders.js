import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Dialog, Card, CardContent, Divider as MuiDivider, Chip, Stack, Grid, FormControl, InputLabel, Select, MenuItem, TextField, TablePagination } from '@mui/material';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HomeIcon from '@mui/icons-material/Home';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import { getAllOrders, getOrderById } from '../services/adminOrders';
import { getAvailableDeliveryBoys, assignDeliveryBoyToOrder, getDeliveryBoyById } from '../services/adminDeliveries';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, timelineItemClasses } from '@mui/lab';
import HistoryIcon from '@mui/icons-material/History';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const AdminOrders = () => {
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [availableDeliveryBoys, setAvailableDeliveryBoys] = useState([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [deliveryBoyDialogOpen, setDeliveryBoyDialogOpen] = useState(false);
  const [deliveryBoyDetails, setDeliveryBoyDetails] = useState(null);
  const [deliveryBoyLoading, setDeliveryBoyLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statistics, setStatistics] = useState({ total: 0, delivered: 0, pending: 0, cancelled: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalOrders, setTotalOrders] = useState(0);

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => { setProfileAnchor(null); logout(); };

  // Assign delivery logic
  const handleOpenAssignDialog = async (orderId) => {
    setAssigningOrderId(orderId);
    setAssignDialogOpen(true);
    setAssignError('');
    setAssignLoading(true);
    setSelectedDeliveryBoy('');
    try {
      const boys = await getAvailableDeliveryBoys();
      setAvailableDeliveryBoys(boys);
    } catch (err) {
      setAssignError(err.message || 'Failed to fetch delivery boys');
    } finally {
      setAssignLoading(false);
    }
  };
  const handleAssignDelivery = async () => {
    if (!selectedDeliveryBoy) return;
    setAssignLoading(true);
    setAssignError('');
    try {
      await assignDeliveryBoyToOrder(assigningOrderId, selectedDeliveryBoy);
      setAssignDialogOpen(false);
      fetchOrders();
    } catch (err) {
      setAssignError(err.message || 'Failed to assign delivery boy');
    } finally {
      setAssignLoading(false);
    }
  };
  // View details logic
  const handleOpenDetailsDialog = async (orderId) => {
    setDetailsDialogOpen(true);
    setDetailsLoading(true);
    setOrderDetails(null);
    setDetailsError('');
    try {
      const details = await getOrderById(orderId);
      setOrderDetails(details);
    } catch (err) {
      setDetailsError(err.message || 'Failed to fetch order details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenDeliveryBoyDialog = async (deliveryBoyId) => {
    setDeliveryBoyDialogOpen(true);
    setDeliveryBoyLoading(true);
    setDeliveryBoyDetails(null);
    try {
      const details = await getDeliveryBoyById(deliveryBoyId);
      setDeliveryBoyDetails(details);
    } catch {
      setDeliveryBoyDetails(null);
    } finally {
      setDeliveryBoyLoading(false);
    }
  };
  const handleCloseDeliveryBoyDialog = () => setDeliveryBoyDialogOpen(false);

  // Helper to trigger search
  const handleSearch = () => {
    console.log('Search triggered:', searchInput);
    setCurrentPage(0);
    setTimeout(() => setSearchTerm(searchInput), 0);
  };

  // When searchTerm changes, always reset to page 0
  useEffect(() => {
    console.log('Fetching orders:', { currentPage, pageSize, statusFilter, searchTerm });
    fetchOrders();
  }, [currentPage, pageSize, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage + 1,
        limit: pageSize
      };
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      console.log('API params:', params);
      
      const response = await getAllOrders(params);
      setOrders(response.orders || []);
      
      // Handle both response formats for backward compatibility
      if (response.pagination) {
        // New format: { orders, pagination }
        setTotalOrders(response.pagination.total * pageSize); // Convert back to total count
      } else {
        // Old format: { orders, total }
        setTotalOrders(response.total || 0);
      }
      
      // Update statistics
      if (response.stats) {
        setStatistics({
          total: response.stats.total,
          delivered: response.stats.delivered,
          pending: response.stats.pending,
          cancelled: response.stats.cancelled
        });
      } else {
        const stats = {
          total: response.pagination ? response.pagination.total * pageSize : (response.total || 0),
          delivered: response.orders?.filter(order => order.status === 'delivered').length || 0,
          pending: response.orders?.filter(order => order.status === 'pending').length || 0,
          cancelled: response.orders?.filter(order => order.status === 'cancelled').length || 0
        };
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(0);
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
                <Box display="flex" alignItems="center" gap={1}><AssignmentIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Role:</b> {user?.role}</Typography></Box>
              </Box>
              <Divider sx={{ my: 1, width: '100%' }} />
              <Button variant="contained" color="primary" fullWidth onClick={handleLogout} startIcon={<LogoutIcon />}>LOGOUT</Button>
            </Box>
          </Popover>
        </Box>
      </Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ width: '100%' }}>
          Orders Management
        </Typography>
        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h4">
                  {statistics.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Delivered
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.delivered}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {statistics.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Cancelled
                </Typography>
                <Typography variant="h4" color="error.main">
                  {statistics.cancelled}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Filters and Actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={e => { setStatusFilter(e.target.value); }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Search Order/User"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              sx={{ minWidth: 200 }}
              placeholder="Order ID or User"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={() => fetchOrders()}
          >
            Refresh
          </Button>
        </Box>
        {/* Orders Table */}
        <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 3, boxShadow: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Pharmacy</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Delivery Assign</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow><TableCell colSpan={8}>No orders found.</TableCell></TableRow>
              ) : (
                orders.map(order => (
                  <TableRow key={order._id} hover>
                    <TableCell>#{order.orderNumber || order._id?.slice(-6)}</TableCell>
                    <TableCell>{order.user?.name || order.user?.personalInfo?.fullName || order.user?.email || 'N/A'}</TableCell>
                    <TableCell>{order.pharmacist?.pharmacyName || order.pharmacist?.personalInfo?.pharmacyName || order.pharmacist?.fullName || order.pharmacist?.personalInfo?.fullName || 'N/A'}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>₹{order.total || '-'}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {order.deliveryBoy ? (
                        <Button size="small" variant="text" onClick={() => handleOpenDeliveryBoyDialog(order.deliveryBoy._id || order.deliveryBoy)} style={{ textTransform: 'none', padding: 0 }}>
                          {order.deliveryBoy.personalInfo?.fullName || order.deliveryBoy.name || 'View'}
                        </Button>
                      ) : (
                        ['delivered', 'cancelled'].includes(order.status) ? (
                          <span style={{ color: '#888' }}>N/A</span>
                        ) : (
                          <Button size="small" variant="outlined" color="primary" onClick={() => handleOpenAssignDialog(order._id)}>
                            Assign
                          </Button>
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" color="info" onClick={() => handleOpenDetailsDialog(order._id)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {`${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, totalOrders)} of ${totalOrders}`}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.ceil(totalOrders / pageSize) }, (_, i) => i).map((pageNum) => (
                <Button
                  key={pageNum}
                  size="small"
                  variant={currentPage === pageNum ? "contained" : "outlined"}
                  onClick={() => setCurrentPage(pageNum)}
                  sx={{ minWidth: 40 }}
                >
                  {pageNum + 1}
                </Button>
              ))}
              
              <Button
                size="small"
                disabled={currentPage >= Math.ceil(totalOrders / pageSize) - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </Box>
          </Box>
        </TableContainer>
        {/* Assign Delivery Dialog */}
        <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth>
          <Box p={3}>
            <Typography variant="h6" mb={2}>Assign Delivery Boy</Typography>
            {assignLoading ? <CircularProgress /> : assignError ? <Alert severity="error">{assignError}</Alert> : (
              <>
                <select
                  value={selectedDeliveryBoy}
                  onChange={e => setSelectedDeliveryBoy(e.target.value)}
                  style={{ width: '100%', padding: 8, marginBottom: 16 }}
                >
                  <option value="">Select Delivery Boy</option>
                  {availableDeliveryBoys.map(boy => (
                    <option key={boy._id} value={boy._id}>{boy.personalInfo?.fullName || boy.name || boy.email}</option>
                  ))}
                </select>
                <Button variant="contained" color="primary" fullWidth disabled={!selectedDeliveryBoy || assignLoading} onClick={handleAssignDelivery}>
                  Assign
                </Button>
              </>
            )}
          </Box>
        </Dialog>
        {/* Order Details Dialog */}
        <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
          <Box p={0}>
            <Card sx={{ borderRadius: 3, boxShadow: 6, bgcolor: '#f8fafc', m: 2 }}>
              <CardContent>
                <Typography variant="h5" fontWeight={700} color="primary.main" mb={2}>
                  <AssignmentTurnedInIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Order Details
                </Typography>
                {detailsLoading ? <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box> : detailsError ? <Alert severity="error">{detailsError}</Alert> : orderDetails ? (
                  <Box>
                    {/* Order Info */}
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Chip label={`Order #${orderDetails.orderNumber || orderDetails._id?.slice(-6) || 'N/A'}`} color="primary" icon={<AssignmentTurnedInIcon />} />
                      <Chip label={(orderDetails.status?.toUpperCase() || 'N/A')} color={orderDetails.status === 'delivered' ? 'success' : orderDetails.status === 'cancelled' ? 'error' : 'info'} variant="filled" />
                      <Chip label={`₹${orderDetails.total ?? 'N/A'}`} color="secondary" icon={<MonetizationOnIcon />} />
                      <Chip label={orderDetails.createdAt ? new Date(orderDetails.createdAt).toLocaleString() : 'N/A'} icon={<CalendarTodayIcon />} />
                    </Stack>
                    <MuiDivider sx={{ my: 2 }} />
                    {/* Customer & Pharmacist Info */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} mb={2}>
                      <Box flex={1}>
                        <Typography variant="subtitle2" color="text.secondary" mb={0.5}><PersonIcon sx={{ mr: 0.5, fontSize: 18, verticalAlign: 'middle' }} />Customer</Typography>
                        <Typography variant="body1" fontWeight={500}>{orderDetails.user?.name || orderDetails.user?.personalInfo?.fullName || orderDetails.user?.email || 'N/A'} <span style={{ color: '#888', fontWeight: 400 }}>({orderDetails.user?.email || 'N/A'})</span></Typography>
                        <Typography variant="body2" color="text.secondary"><LocalPhoneIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />{orderDetails.phone || orderDetails.user?.phone || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary"><HomeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />{orderDetails.address || orderDetails.user?.address || 'N/A'}</Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography variant="subtitle2" color="text.secondary" mb={0.5}><LocalPharmacyIcon sx={{ mr: 0.5, fontSize: 18, verticalAlign: 'middle' }} />Pharmacist</Typography>
                        <Typography variant="body1" fontWeight={500}>{orderDetails.pharmacist?.personalInfo?.pharmacyName || orderDetails.pharmacist?.personalInfo?.fullName || orderDetails.pharmacist?.pharmacyName || orderDetails.pharmacist?.fullName || 'N/A'}</Typography>
                        {(orderDetails.pharmacist?.personalInfo?.phone || orderDetails.pharmacist?.phone) && (
                          <Typography variant="body2" color="text.secondary"><LocalPhoneIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />{orderDetails.pharmacist?.personalInfo?.phone || orderDetails.pharmacist?.phone}</Typography>
                        )}
                      </Box>
                    </Stack>
                    <MuiDivider sx={{ my: 2 }} />
                    {/* Items */}
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="text.secondary" mb={0.5}>Medicines</Typography>
                      <Typography variant="body1" mb={1}>{Array.isArray(orderDetails.medicines) && orderDetails.medicines.length > 0 ? orderDetails.medicines.map(m => `${m.medicine?.name || 'N/A'} (x${m.quantity ?? 'N/A'})`).join(', ') : <span style={{ color: '#888' }}>N/A</span>}</Typography>
                      <Typography variant="subtitle2" color="text.secondary" mb={0.5}>Products</Typography>
                      <Typography variant="body1">{Array.isArray(orderDetails.products) && orderDetails.products.length > 0 ? orderDetails.products.map(p => `${p.product?.name || 'N/A'} (x${p.quantity ?? 'N/A'})`).join(', ') : <span style={{ color: '#888' }}>N/A</span>}</Typography>
                    </Box>
                    <MuiDivider sx={{ my: 2 }} />
                    {/* Delivery & Payment */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                      <Box flex={1}>
                        <Typography variant="subtitle2" color="text.secondary" mb={0.5}><LocalShippingIcon sx={{ mr: 0.5, fontSize: 18, verticalAlign: 'middle' }} />Delivery</Typography>
                        <Typography variant="body1" fontWeight={500}>{orderDetails.deliveryBoy?.personalInfo?.fullName || orderDetails.deliveryBoy?.name || 'N/A'}</Typography>
                        {(orderDetails.deliveryBoy?.personalInfo?.phone || orderDetails.deliveryBoy?.phone) && (
                          <Typography variant="body2" color="text.secondary"><LocalPhoneIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />{orderDetails.deliveryBoy?.personalInfo?.phone || orderDetails.deliveryBoy?.phone}</Typography>
                        )}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="subtitle2" color="text.secondary" mb={0.5}><PaymentIcon sx={{ mr: 0.5, fontSize: 18, verticalAlign: 'middle' }} />Payment</Typography>
                        <Typography variant="body1" fontWeight={500}>{orderDetails.payment?.mode?.toUpperCase() || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary">Status: <b>{orderDetails.payment?.status?.toUpperCase() || 'N/A'}</b></Typography>
                      </Box>
                    </Stack>
                    {/* Order History Timeline */}
                    <Box mt={3}>
                      <Typography variant="subtitle1" fontWeight={600} color="primary" mb={1}>
                        <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Order History
                      </Typography>
                      {Array.isArray(orderDetails.statusHistory) && orderDetails.statusHistory.length > 0 ? (
                        <Timeline
                          sx={{
                            [`& .${timelineItemClasses.root}:before`]: {
                              flex: 0,
                              padding: 0,
                            },
                          }}
                        >
                          {orderDetails.statusHistory.map((item, idx) => (
                            <TimelineItem key={idx}>
                              <TimelineSeparator>
                                <TimelineDot color={item.status === 'delivered' ? 'success' : item.status === 'cancelled' ? 'error' : 'primary'} />
                                {idx < orderDetails.statusHistory.length - 1 && <TimelineConnector />}
                              </TimelineSeparator>
                              <TimelineContent>
                                <Typography variant="body2" fontWeight={600}>{item.status?.toUpperCase() || 'N/A'}</Typography>
                                <Typography variant="caption" color="text.secondary">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</Typography>
                                {item.changedBy && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    By: {item.changedBy.user?.name || item.changedBy.user?.email || 'System'} ({item.changedBy.role || 'N/A'})
                                  </Typography>
                                )}
                              </TimelineContent>
                            </TimelineItem>
                          ))}
                        </Timeline>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No history available.</Typography>
                      )}
                    </Box>
                  </Box>
                ) : null}
              </CardContent>
            </Card>
          </Box>
        </Dialog>
        {/* Delivery Boy Detail Dialog */}
        <Dialog open={deliveryBoyDialogOpen} onClose={handleCloseDeliveryBoyDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Delivery Boy Details</DialogTitle>
          <DialogContent>
            {deliveryBoyLoading ? <CircularProgress /> : deliveryBoyDetails ? (
              <div>
                <p><strong>Name:</strong> {deliveryBoyDetails.personalInfo?.fullName || 'N/A'}</p>
                <p><strong>Email:</strong> {deliveryBoyDetails.user?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {deliveryBoyDetails.personalInfo?.phone || 'N/A'}</p>
                <p><strong>Vehicle Type:</strong> {deliveryBoyDetails.vehicleInfo?.vehicleType || 'N/A'}</p>
                <p><strong>Vehicle Number:</strong> {deliveryBoyDetails.vehicleInfo?.vehicleNumber || 'N/A'}</p>
                <p><strong>Status:</strong> {deliveryBoyDetails.status || 'N/A'}</p>
                <p><strong>Total Deliveries:</strong> {deliveryBoyDetails.performance?.totalDeliveries ?? 'N/A'}</p>
                <p><strong>Success Rate:</strong> {deliveryBoyDetails.performance?.successRate ?? 'N/A'}%</p>
                <p><strong>Average Rating:</strong> {deliveryBoyDetails.ratings?.average ?? 'N/A'}</p>
              </div>
            ) : <span>No details found.</span>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeliveryBoyDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AdminOrders;
