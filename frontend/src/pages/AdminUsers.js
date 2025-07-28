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
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  getAllUsers,
  getUserById,
  blockUser,
  getUserStatistics,
  formatUserRole,
  getUserRoleColor,
  getUserStatusColor,
  formatUserStatus
} from '../services/adminUsers';

const AdminUsers = () => {
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => { setProfileAnchor(null); logout(); };

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { blocked: statusFilter === 'blocked' })
      };
      const data = await getAllUsers(params);
      setUsers(data.users);
      setTotalPages(data.pagination.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getUserStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleViewDetails = async (user) => {
    try {
      const details = await getUserById(user._id);
      setSelectedUser(details);
      setDetailDialogOpen(true);
    } catch (err) {
      toast.error('Failed to fetch user details');
    }
  };

  const handleAction = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const executeAction = async () => {
    if (!selectedUser) return;

    setProcessing(true);
    try {
      switch (actionType) {
        case 'block':
          await blockUser(selectedUser._id, !selectedUser.blocked);
          toast.success(`User ${selectedUser.blocked ? 'unblocked' : 'blocked'} successfully`);
          break;
        default:
          break;
      }
      setActionDialogOpen(false);
      await fetchUsers();
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

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setCurrentPage(1);
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
          Manage Users
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {statistics.totalUsers || statistics.count || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.activeUsers || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Blocked Users
                </Typography>
                <Typography variant="h4" color="error.main">
                  {statistics.blockedUsers || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  New This Month
                </Typography>
                <Typography variant="h4" color="info.main">
                  {statistics.newUsersThisMonth || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Role</InputLabel>
              <Select
                value={roleFilter}
                label="Filter by Role"
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="pharmacist">Pharmacist</MenuItem>
                <MenuItem value="deliveryBoy">Delivery Boy</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchUsers();
              fetchStatistics();
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Users Table */}
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
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Phone</strong></TableCell>
                    <TableCell><strong>Address</strong></TableCell>
                    <TableCell><strong>Joined</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {user.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={formatUserRole(user.role)}
                          color={getUserRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatUserStatus(user.blocked)}
                          color={getUserStatusColor(user.blocked)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {user.address || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDetails(user)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color={user.blocked ? 'success' : 'error'}
                            startIcon={<BlockIcon />}
                            onClick={() => handleAction(user, 'block')}
                          >
                            {user.blocked ? 'Unblock' : 'Block'}
                          </Button>
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
          <DialogTitle>User Details</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Typography><strong>Name:</strong> {selectedUser.name || 'N/A'}</Typography>
                  <Typography><strong>Email:</strong> {selectedUser.email || 'N/A'}</Typography>
                  <Typography><strong>Role:</strong> {formatUserRole(selectedUser.role)}</Typography>
                  <Typography><strong>Status:</strong> {formatUserStatus(selectedUser.blocked)}</Typography>
                  <Typography><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</Typography>
                  <Typography><strong>Address:</strong> {selectedUser.address || 'N/A'}</Typography>
                  <Typography><strong>City:</strong> {selectedUser.city || 'N/A'}</Typography>
                  <Typography><strong>State:</strong> {selectedUser.state || 'N/A'}</Typography>
                  <Typography><strong>Pincode:</strong> {selectedUser.pincode || 'N/A'}</Typography>
                  <Typography><strong>Joined:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Statistics</Typography>
                  <Typography><strong>Total Orders:</strong> {selectedUser.statistics?.ordersCount || 0}</Typography>
                  <Typography><strong>Total Spent:</strong> ₹{selectedUser.statistics?.totalSpent || 0}</Typography>
                  {selectedUser.statistics?.recentOrders && selectedUser.statistics.recentOrders.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>Recent Orders:</Typography>
                      {selectedUser.statistics.recentOrders.map((order, index) => (
                        <Typography key={index} variant="body2" color="textSecondary">
                          Order #{order.orderNumber} - ₹{order.total} - {order.status}
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
            {actionType === 'block' && (selectedUser?.blocked ? 'Unblock User' : 'Block User')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {actionType === 'block' && (
                selectedUser?.blocked 
                  ? 'Are you sure you want to unblock this user?'
                  : 'Are you sure you want to block this user? They will not be able to access the platform.'
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button 
              onClick={executeAction} 
              variant="contained" 
              color={actionType === 'block' && selectedUser?.blocked ? 'success' : 'error'}
              disabled={processing}
            >
              {processing ? <CircularProgress size={20} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AdminUsers;
