import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Dialog, Card, CardContent, Chip, Grid, TextField, Menu, MenuItem, Popover, Select, InputLabel, FormControl } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { getAllPayments } from '../services/adminPayments';

const PAGE_SIZE = 15;

const statusColors = {
  Paid: 'success',
  Pending: 'warning',
  Cancel: 'error',
  Draft: 'default',
};

const AdminPayments = () => {
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      !search ||
      p.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalPayments = filteredPayments.length;
  const paginatedPayments = filteredPayments.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => {
    setProfileAnchor(null);
    logout();
  };
  const handleOpenDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setSelectedPayment(null);
    setDetailsOpen(false);
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
          Payments (Invoices)
        </Typography>
        <Grid container spacing={2} mb={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              size="small"
              label="Search Invoice/Customer"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(0); }}
              sx={{ minWidth: 200 }}
              placeholder="Invoice # or Customer Name"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(0); }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Cancel">Cancel</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={5} textAlign="right">
            <Button variant="outlined" onClick={fetchPayments} sx={{ minWidth: 120 }}>Refresh</Button>
          </Grid>
        </Grid>
        <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 3, boxShadow: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Pharmacist</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Net Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9}><Box display="flex" justifyContent="center"><CircularProgress size={28} /></Box></TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={9}><Alert severity="error">{error}</Alert></TableCell></TableRow>
              ) : paginatedPayments.length === 0 ? (
                <TableRow><TableCell colSpan={9}>No payments found.</TableCell></TableRow>
              ) : (
                paginatedPayments.map(payment => (
                  <TableRow key={payment._id} hover>
                    <TableCell>#{payment.invoiceNumber}</TableCell>
                    <TableCell>{payment.customerName}</TableCell>
                    <TableCell>{payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{payment.pharmacist?.personalInfo?.pharmacyName || payment.pharmacist?.pharmacyName || payment.pharmacist || 'N/A'}</TableCell>
                    <TableCell>₹{payment.totalAmount?.toFixed(2)}</TableCell>
                    <TableCell>₹{payment.totalDiscount?.toFixed(2)}</TableCell>
                    <TableCell>₹{payment.netTotal?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label={payment.status} color={statusColors[payment.status] || 'default'} size="small" sx={{ fontWeight: 700, textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" color="info" onClick={() => handleOpenDetails(payment)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {`${currentPage * PAGE_SIZE + 1}-${Math.min((currentPage + 1) * PAGE_SIZE, totalPayments)} of ${totalPayments}`}
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
              {Array.from({ length: Math.ceil(totalPayments / PAGE_SIZE) }, (_, i) => i).map((pageNum) => (
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
                disabled={currentPage >= Math.ceil(totalPayments / PAGE_SIZE) - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </Box>
          </Box>
        </TableContainer>
        {/* Payment Details Dialog */}
        <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
          <Box p={0}>
            <Card sx={{ borderRadius: 3, boxShadow: 6, bgcolor: '#f8fafc', m: 2 }}>
              <CardContent>
                <Typography variant="h5" fontWeight={700} color="primary.main" mb={2}>
                  Invoice Details
                </Typography>
                {selectedPayment ? (
                  <Box>
                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={6}><b>Invoice #:</b> {selectedPayment.invoiceNumber}</Grid>
                      <Grid item xs={6}><b>Date:</b> {selectedPayment.date ? new Date(selectedPayment.date).toLocaleString() : 'N/A'}</Grid>
                      <Grid item xs={6}><b>Customer:</b> {selectedPayment.customerName}</Grid>
                      <Grid item xs={6}><b>Status:</b> <Chip label={selectedPayment.status} color={statusColors[selectedPayment.status] || 'default'} size="small" /></Grid>
                      <Grid item xs={6}><b>Pharmacist:</b> {selectedPayment.pharmacist?.personalInfo?.pharmacyName || selectedPayment.pharmacist?.pharmacyName || selectedPayment.pharmacist || 'N/A'}</Grid>
                      <Grid item xs={6}><b>Created At:</b> {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 'N/A'}</Grid>
                      <Grid item xs={6}><b>Total Amount:</b> ₹{selectedPayment.totalAmount?.toFixed(2)}</Grid>
                      <Grid item xs={6}><b>Discount:</b> ₹{selectedPayment.totalDiscount?.toFixed(2)}</Grid>
                      <Grid item xs={6}><b>Net Total:</b> ₹{selectedPayment.netTotal?.toFixed(2)}</Grid>
                    </Grid>
                  </Box>
                ) : null}
              </CardContent>
            </Card>
          </Box>
        </Dialog>
      </Box>
    </>
  );
};

export default AdminPayments;
