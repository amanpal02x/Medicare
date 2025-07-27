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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  getAllDeliveryBoys,
  getDeliveryBoyById,
  updateDeliveryBoyStatus,
  approveDeliveryBoy,
  suspendDeliveryBoy,
  deleteDeliveryBoy,
  getDeliveryBoyStatistics,
  formatDeliveryBoyStatus,
  getDeliveryBoyStatusColor,
  calculateDeliveryBoyEfficiency,
  getDeliveryBoyRatingColor
} from '../services/adminDeliveries';

const AdminDeliveries = () => {
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [actionDeliveryBoy, setActionDeliveryBoy] = useState(null);

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => { setProfileAnchor(null); logout(); };

  useEffect(() => {
    fetchDeliveryBoys();
    fetchStatistics();
  }, [currentPage, statusFilter]);

  const fetchDeliveryBoys = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      };
      const data = await getAllDeliveryBoys(params);
      setDeliveryBoys(data.deliveryBoys);
      setTotalPages(data.pagination.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch delivery boys');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getDeliveryBoyStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleViewDetails = async (deliveryBoy) => {
    try {
      const details = await getDeliveryBoyById(deliveryBoy._id);
      setSelectedDeliveryBoy(details);
      setDetailDialogOpen(true);
    } catch (err) {
      toast.error('Failed to fetch delivery boy details');
    }
  };

  const handleActionMenuOpen = (event, deliveryBoy) => {
    setActionAnchorEl(event.currentTarget);
    setActionDeliveryBoy(deliveryBoy);
  };
  const handleActionMenuClose = () => {
    setActionAnchorEl(null);
    setActionDeliveryBoy(null);
  };
  const handleActionMenuSelect = (action) => {
    setActionDialogOpen(false);
    setActionAnchorEl(null);
    setSelectedDeliveryBoy(actionDeliveryBoy);
    setActionDeliveryBoy(null);
    setActionType(action);
    setActionReason('');
    setActionDialogOpen(true);
  };

  const executeAction = async () => {
    if (!selectedDeliveryBoy) return;

    setProcessing(true);
    try {
      switch (actionType) {
        case 'approve':
          await approveDeliveryBoy(selectedDeliveryBoy._id);
          toast.success('Delivery boy approved successfully');
          break;
        case 'suspend':
          await suspendDeliveryBoy(selectedDeliveryBoy._id, actionReason);
          toast.success('Delivery boy suspended successfully');
          break;
        case 'delete':
          await deleteDeliveryBoy(selectedDeliveryBoy._id);
          toast.success('Delivery boy deleted successfully');
          break;
        case 'status':
          await updateDeliveryBoyStatus(selectedDeliveryBoy._id, actionReason);
          toast.success('Delivery boy status updated successfully');
          break;
        default:
          break;
      }
      setActionDialogOpen(false);
      await fetchDeliveryBoys();
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
          Manage Delivery Boys
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Delivery Boys
                </Typography>
                <Typography variant="h4">
                  {statistics.totalDeliveryBoys || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.activeDeliveryBoys || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Online
                </Typography>
                <Typography variant="h4" color="info.main">
                  {statistics.onlineDeliveryBoys || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Deliveries
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {statistics.totalDeliveries || 0}
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
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="pending_approval">Pending Approval</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchDeliveryBoys();
                fetchStatistics();
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Delivery Boys Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table sx={{ minWidth: 800, maxWidth: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Phone</strong></TableCell>
                      {/* <TableCell><strong>Address</strong></TableCell> */}
                      <TableCell><strong>Vehicle</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><strong>Performance</strong></TableCell>
                      {/* <TableCell><strong>Rating</strong></TableCell> */}
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><strong>Earnings</strong></TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><strong>Online</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliveryBoys.map((deliveryBoy) => (
                      <TableRow key={deliveryBoy._id}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {deliveryBoy.personalInfo?.fullName || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>{deliveryBoy.personalInfo?.email || 'N/A'}</TableCell>
                        <TableCell>{deliveryBoy.personalInfo?.phone || 'N/A'}</TableCell>
                        {/* <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {deliveryBoy.personalInfo?.address?.street || 'N/A'}, {deliveryBoy.personalInfo?.address?.city || ''} {deliveryBoy.personalInfo?.address?.state || ''} {deliveryBoy.personalInfo?.address?.pincode || ''}
                          </Typography>
                        </TableCell> */}
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {deliveryBoy.vehicleInfo?.vehicleType || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {deliveryBoy.vehicleInfo?.vehicleNumber || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatDeliveryBoyStatus(deliveryBoy.status)}
                            color={getDeliveryBoyStatusColor(deliveryBoy.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Box>
                            <Typography variant="body2">
                              {deliveryBoy.performance?.totalDeliveries || 0} deliveries
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {calculateDeliveryBoyEfficiency(deliveryBoy.performance)}% success
                            </Typography>
                          </Box>
                        </TableCell>
                        {/* <TableCell>
                          <Chip
                            label={`${deliveryBoy.ratings?.average || 0}/5`}
                            color={getDeliveryBoyRatingColor(deliveryBoy.ratings?.average || 0)}
                            size="small"
                          />
                        </TableCell> */}
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="body2" fontWeight={500}>
                            ₹{deliveryBoy.earnings?.totalEarned || 0}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Chip
                            label={deliveryBoy.availability?.isOnline ? 'Online' : 'Offline'}
                            color={deliveryBoy.availability?.isOnline ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewDetails(deliveryBoy)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<MoreVertIcon />}
                              onClick={(e) => handleActionMenuOpen(e, deliveryBoy)}
                              sx={{ minWidth: 0, px: 1.5, borderRadius: 2, textTransform: 'none' }}
                            >
                              Actions
                            </Button>
                            <Menu
                              anchorEl={actionAnchorEl}
                              open={Boolean(actionAnchorEl) && actionDeliveryBoy?._id === deliveryBoy._id}
                              onClose={handleActionMenuClose}
                              PaperProps={{ sx: { minWidth: 160 } }}
                            >
                              {deliveryBoy.status === 'pending_approval' && [
                                <MenuItem key="approve" onClick={() => handleActionMenuSelect('approve')}>
                                  <CheckCircleIcon fontSize="small" sx={{ color: 'success.main', mr: 1 }} />
                                  Approve
                                </MenuItem>,
                                <MenuItem key="suspend" onClick={() => handleActionMenuSelect('suspend')}>
                                  <CancelIcon fontSize="small" sx={{ color: 'warning.main', mr: 1 }} />
                                  Reject
                                </MenuItem>
                              ]}
                              {deliveryBoy.status === 'active' && (
                                <MenuItem key="suspend" onClick={() => handleActionMenuSelect('suspend')}>
                                  <BlockIcon fontSize="small" sx={{ color: 'warning.main', mr: 1 }} />
                                  Suspend
                                </MenuItem>
                              )}
                              {deliveryBoy.status === 'suspended' && [
                                <MenuItem key="approve" onClick={() => handleActionMenuSelect('approve')}>
                                  <CheckCircleIcon fontSize="small" sx={{ color: 'success.main', mr: 1 }} />
                                  Activate
                                </MenuItem>,
                                <MenuItem key="delete" onClick={() => handleActionMenuSelect('delete')}>
                                  <DeleteIcon fontSize="small" sx={{ color: 'error.main', mr: 1 }} />
                                  Delete
                                </MenuItem>
                              ]}
                              {deliveryBoy.status !== 'pending_approval' && deliveryBoy.status !== 'active' && deliveryBoy.status !== 'suspended' && (
                                <MenuItem key="status" onClick={() => handleActionMenuSelect('status')}>
                                  Update Status
                                </MenuItem>
                              )}
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
            </Box>
          </>
        )}

        {/* Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Delivery Boy Details</DialogTitle>
          <DialogContent>
            {selectedDeliveryBoy && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Personal Information</Typography>
                  <Typography><strong>Full Name:</strong> {selectedDeliveryBoy.personalInfo?.fullName || 'N/A'}</Typography>
                  <Typography><strong>Email:</strong> {selectedDeliveryBoy.personalInfo?.email || 'N/A'}</Typography>
                  <Typography><strong>Phone:</strong> {selectedDeliveryBoy.personalInfo?.phone || 'N/A'}</Typography>
                  <Typography><strong>Date of Birth:</strong> {selectedDeliveryBoy.personalInfo?.dateOfBirth ? new Date(selectedDeliveryBoy.personalInfo.dateOfBirth).toLocaleDateString() : 'N/A'}</Typography>
                  <Typography><strong>Gender:</strong> {selectedDeliveryBoy.personalInfo?.gender || 'N/A'}</Typography>
                  <Typography><strong>Address:</strong> {selectedDeliveryBoy.personalInfo?.address?.street || 'N/A'}, {selectedDeliveryBoy.personalInfo?.address?.city || ''} {selectedDeliveryBoy.personalInfo?.address?.state || ''} {selectedDeliveryBoy.personalInfo?.address?.pincode || ''}</Typography>
                  <Typography><strong>Joining Date:</strong> {selectedDeliveryBoy.workDetails?.joiningDate ? new Date(selectedDeliveryBoy.workDetails.joiningDate).toLocaleDateString() : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Vehicle Information</Typography>
                  <Typography><strong>Vehicle Type:</strong> {selectedDeliveryBoy.vehicleInfo?.vehicleType || 'N/A'}</Typography>
                  <Typography><strong>Vehicle Number:</strong> {selectedDeliveryBoy.vehicleInfo?.vehicleNumber || 'N/A'}</Typography>
                  <Typography><strong>Vehicle Model:</strong> {selectedDeliveryBoy.vehicleInfo?.vehicleModel || 'N/A'}</Typography>
                  <Typography><strong>Vehicle Color:</strong> {selectedDeliveryBoy.vehicleInfo?.vehicleColor || 'N/A'}</Typography>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Performance & Earnings</Typography>
                  <Typography><strong>Total Deliveries:</strong> {selectedDeliveryBoy.performance?.totalDeliveries || 0}</Typography>
                  <Typography><strong>Successful Deliveries:</strong> {selectedDeliveryBoy.performance?.successfulDeliveries || 0}</Typography>
                  <Typography><strong>Success Rate:</strong> {calculateDeliveryBoyEfficiency(selectedDeliveryBoy.performance)}%</Typography>
                  <Typography><strong>Total Earnings:</strong> ₹{selectedDeliveryBoy.earnings?.totalEarned || 0}</Typography>
                  <Typography><strong>Average Rating:</strong> {selectedDeliveryBoy.ratings?.average || 0}/5</Typography>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Status & Availability</Typography>
                  <Typography><strong>Status:</strong> {formatDeliveryBoyStatus(selectedDeliveryBoy.status)}</Typography>
                  <Typography><strong>Online:</strong> {selectedDeliveryBoy.availability?.isOnline ? 'Yes' : 'No'}</Typography>
                  <Typography><strong>Last Seen:</strong> {selectedDeliveryBoy.availability?.lastSeen ? new Date(selectedDeliveryBoy.availability.lastSeen).toLocaleString() : 'N/A'}</Typography>
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
            {actionType === 'approve' && 'Approve Delivery Boy'}
            {actionType === 'suspend' && 'Suspend Delivery Boy'}
            {actionType === 'delete' && 'Delete Delivery Boy'}
            {actionType === 'status' && 'Update Status'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {actionType === 'approve' && 'Are you sure you want to approve this delivery boy?'}
              {actionType === 'suspend' && 'Are you sure you want to suspend this delivery boy?'}
              {actionType === 'delete' && 'Are you sure you want to delete this delivery boy? This action cannot be undone.'}
              {actionType === 'status' && 'Please enter the new status for this delivery boy:'}
            </DialogContentText>
            {(actionType === 'suspend' || actionType === 'status') && (
              <TextField
                autoFocus
                margin="dense"
                label={actionType === 'suspend' ? 'Suspension Reason' : 'New Status'}
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
              disabled={processing || ((actionType === 'suspend' || actionType === 'status') && !actionReason)}
            >
              {processing ? <CircularProgress size={20} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AdminDeliveries;
