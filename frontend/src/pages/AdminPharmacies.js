import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { 
  IconButton, 
  Avatar, 
  Tooltip, 
  Box, 
  Typography, 
  Badge, 
  Button, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText
} from '@mui/material';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  getAllPharmacies, 
  getPharmacistById, 
  updatePharmacistStatus, 
  getPharmacistStatistics,
  approvePharmacist,
  rejectPharmacist,
  forceDeletePharmacist,
  formatPharmacistStatus,
  getPharmacistStatusColor,
  getPharmacistVerificationColor
} from '../services/adminPharmacies';

const AdminPharmacies = () => {
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPharmacist, setSelectedPharmacist] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [actionPharmacist, setActionPharmacist] = useState(null);

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => { setProfileAnchor(null); logout(); };

  useEffect(() => {
    fetchPharmacists();
    fetchStatistics();
  }, [currentPage, statusFilter]);

  const fetchPharmacists = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      };
      const data = await getAllPharmacies(params);
      setPharmacists(data.pharmacists);
      setTotalPages(data.pagination.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch pharmacists');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getPharmacistStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleViewDetails = async (pharmacist) => {
    try {
      const details = await getPharmacistById(pharmacist._id);
      setSelectedPharmacist(details);
      setDetailDialogOpen(true);
    } catch (err) {
      toast.error('Failed to fetch pharmacist details');
    }
  };

  const handleAction = (pharmacist, type) => {
    setSelectedPharmacist(pharmacist);
    setActionType(type);
    setActionReason('');
    setActionDialogOpen(true);
  };

  const executeAction = async () => {
    if (!selectedPharmacist) return;

    setProcessing(true);
    try {
      switch (actionType) {
        case 'approve':
          await approvePharmacist(selectedPharmacist._id);
          toast.success('Pharmacist approved successfully');
          break;
        case 'reject':
          await rejectPharmacist(selectedPharmacist._id);
          toast.success('Pharmacist rejected successfully');
          break;
        case 'delete':
          await forceDeletePharmacist(selectedPharmacist._id);
          toast.success('Pharmacist deleted successfully');
          break;
        case 'status':
          await updatePharmacistStatus(selectedPharmacist._id, actionReason);
          toast.success('Pharmacist status updated successfully');
          break;
        default:
          break;
      }
      setActionDialogOpen(false);
      await fetchPharmacists();
      await fetchStatistics();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleActionMenuOpen = (event, pharmacist) => {
    setActionAnchorEl(event.currentTarget);
    setActionPharmacist(pharmacist);
  };

  const handleActionMenuClose = () => {
    setActionAnchorEl(null);
    setActionPharmacist(null);
  };

  const handleActionMenuSelect = async (action) => {
    setActionDialogOpen(false);
    setActionAnchorEl(null);
    setSelectedPharmacist(actionPharmacist);
    setActionPharmacist(null);
    setActionType(action);
    setActionReason('');
    setActionDialogOpen(true);
  };

  const getActionButton = (pharmacist) => {
    switch (pharmacist.status) {
      case 'pending':
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleAction(pharmacist, 'approve')}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => handleAction(pharmacist, 'reject')}
            >
              Reject
            </Button>
          </Stack>
        );
      case 'approved':
        return (
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleAction(pharmacist, 'delete')}
          >
            Delete
          </Button>
        );
      default:
        return (
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleAction(pharmacist, 'status')}
          >
            Update Status
          </Button>
        );
    }
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
        <Typography variant="h4" gutterBottom>
          Manage Pharmacies
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Pharmacists
                </Typography>
                <Typography variant="h4">
                  {statistics.totalPharmacists || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.approvedPharmacists || 0}
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
                  {statistics.pendingPharmacists || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Medicines
                </Typography>
                <Typography variant="h4" color="info.main">
                  {statistics.totalMedicines || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchPharmacists();
              fetchStatistics();
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Pharmacists Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Pharmacy Name</strong></TableCell>
                    <TableCell><strong>Owner</strong></TableCell>
                    <TableCell><strong>Contact</strong></TableCell>
                    <TableCell><strong>Phone</strong></TableCell>
                    <TableCell><strong>Address</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Verified</strong></TableCell>
                    <TableCell><strong>Joined</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pharmacists.map((pharmacist) => (
                    <TableRow key={pharmacist._id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {pharmacist.pharmacyName || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {pharmacist.user?.name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {pharmacist.user?.email || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{pharmacist.contact || 'N/A'}</TableCell>
                      <TableCell>{pharmacist.user?.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {pharmacist.address || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatPharmacistStatus(pharmacist.status)}
                          color={getPharmacistStatusColor(pharmacist.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pharmacist.isVerified ? 'Verified' : 'Not Verified'}
                          color={getPharmacistVerificationColor(pharmacist.isVerified)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(pharmacist.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDetails(pharmacist)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<MoreVertIcon />}
                            onClick={(e) => handleActionMenuOpen(e, pharmacist)}
                            sx={{ minWidth: 0, px: 1.5, borderRadius: 2, textTransform: 'none' }}
                          >
                            Actions
                          </Button>
                          <Menu
                            anchorEl={actionAnchorEl}
                            open={Boolean(actionAnchorEl) && actionPharmacist?._id === pharmacist._id}
                            onClose={handleActionMenuClose}
                            PaperProps={{
                              sx: { minWidth: 160 }
                            }}
                          >
                            <MenuItem onClick={() => handleActionMenuSelect('approve')}>
                              <CheckCircleIcon fontSize="small" sx={{ color: 'success.main', mr: 1 }} />
                              Approve
                            </MenuItem>
                            <MenuItem onClick={() => handleActionMenuSelect('reject')}>
                              <BlockIcon fontSize="small" sx={{ color: 'warning.main', mr: 1 }} />
                              Reject
                            </MenuItem>
                            <MenuItem onClick={() => handleActionMenuSelect('delete')}>
                              <DeleteIcon fontSize="small" sx={{ color: 'error.main', mr: 1 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Pharmacist Details</DialogTitle>
          <DialogContent>
            {selectedPharmacist && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Pharmacy Information</Typography>
                  <Typography><strong>Pharmacy Name:</strong> {selectedPharmacist.pharmacyName || 'N/A'}</Typography>
                  <Typography><strong>Contact:</strong> {selectedPharmacist.contact || 'N/A'}</Typography>
                  <Typography><strong>Address:</strong> {selectedPharmacist.address || 'N/A'}</Typography>
                  <Typography><strong>Timings:</strong> {selectedPharmacist.timings || 'N/A'}</Typography>
                  <Typography><strong>KYC Docs:</strong> {Array.isArray(selectedPharmacist.kycDocs) && selectedPharmacist.kycDocs.length > 0 ? selectedPharmacist.kycDocs.join(', ') : 'N/A'}</Typography>
                  <Typography><strong>Status:</strong> {formatPharmacistStatus(selectedPharmacist.status)}</Typography>
                  <Typography><strong>Verified:</strong> {selectedPharmacist.isVerified ? 'Yes' : 'No'}</Typography>
                  <Typography><strong>Joined:</strong> {selectedPharmacist.createdAt ? new Date(selectedPharmacist.createdAt).toLocaleString() : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Owner Information</Typography>
                  <Typography><strong>Name:</strong> {selectedPharmacist.user?.name || 'N/A'}</Typography>
                  <Typography><strong>Email:</strong> {selectedPharmacist.user?.email || 'N/A'}</Typography>
                  <Typography><strong>Phone:</strong> {selectedPharmacist.user?.phone || 'N/A'}</Typography>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Statistics</Typography>
                  <Typography><strong>Total Medicines:</strong> {selectedPharmacist.statistics?.medicinesCount ?? 'N/A'}</Typography>
                  <Typography><strong>Total Orders:</strong> {selectedPharmacist.statistics?.ordersCount ?? 'N/A'}</Typography>
                  {selectedPharmacist.statistics?.recentOrders && selectedPharmacist.statistics.recentOrders.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>Recent Orders:</Typography>
                      {selectedPharmacist.statistics.recentOrders.map((order, index) => (
                        <Typography key={order._id || index} variant="body2" color="textSecondary">
                          Order #{order.orderNumber || order._id?.slice(-6) || 'N/A'} - ₹{order.total ?? 'N/A'} - {order.status || 'N/A'}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Action Dialog */}
        <Dialog
          open={actionDialogOpen}
          onClose={() => setActionDialogOpen(false)}
        >
          <DialogTitle>
            {actionType === 'approve' && 'Approve Pharmacist'}
            {actionType === 'reject' && 'Reject Pharmacist'}
            {actionType === 'delete' && 'Delete Pharmacist'}
            {actionType === 'status' && 'Update Status'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {actionType === 'approve' && 'Are you sure you want to approve this pharmacist?'}
              {actionType === 'reject' && 'Are you sure you want to reject this pharmacist?'}
              {actionType === 'delete' && 'Are you sure you want to delete this pharmacist? This action cannot be undone.'}
              {actionType === 'status' && 'Please enter the new status for this pharmacist:'}
            </DialogContentText>
            {actionType === 'status' && (
              <TextField
                autoFocus
                margin="dense"
                label="New Status"
                fullWidth
                variant="outlined"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                sx={{ mt: 2 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button 
              onClick={executeAction} 
              variant="contained" 
              color={actionType === 'delete' ? 'error' : 'primary'}
              disabled={processing || (actionType === 'status' && !actionReason)}
            >
              {processing ? <CircularProgress size={20} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AdminPharmacies;
