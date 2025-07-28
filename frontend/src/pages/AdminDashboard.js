import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge, Button, Divider, Grid, Card, CardContent, CircularProgress, Chip } from '@mui/material';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StarIcon from '@mui/icons-material/Star';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getDashboardData } from '../services/adminDashboard';

const COLORS = ['#1976d2', '#f59e42', '#ef4444', '#22c55e', '#a21caf', '#fbbf24'];

const widgetIcons = {
  orders: <TrendingUpIcon fontSize="large" color="primary" />, // Orders
  sales: <LocalPharmacyIcon fontSize="large" color="secondary" />, // Sales
  users: <GroupAddIcon fontSize="large" color="success" />, // New Users
  prescriptions: <AssignmentLateIcon fontSize="large" color="warning" />, // Pending Prescriptions
  outOfStock: <WarningAmberIcon fontSize="large" color="error" />, // Out of Stock
  topSelling: <StarIcon fontSize="large" color="primary" />, // Top Selling
};

const widgetBoxStyle = {
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: '24px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: 120,
  transition: 'box-shadow 0.3s, transform 0.3s',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(25,118,210,0.10)',
    transform: 'translateY(-2px) scale(1.02)',
  },
};
const chartBoxStyle = {
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #fff 60%, #e0e7ff 100%)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: '24px 12px',
  minHeight: 350,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

import { getDashboardData } from '../services/adminDashboard';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kpi, setKpi] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => { setProfileAnchor(null); logout(); };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // Fetch KPIs and analytics in parallel
        const [kpiRes, analyticsRes] = await Promise.all([
          getDashboardData(),
          getAnalytics()
        ]);
        setKpi(kpiRes);
        setAnalytics(analyticsRes);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Prepare chart data
  const orderStats = analytics?.orderStats?.map(stat => ({
    name: `${stat._id.month}/${stat._id.year}`,
    Orders: stat.count
  })) || [];
  const salesStats = analytics?.salesStats?.map(stat => ({
    name: `${stat._id.month}/${stat._id.year}`,
    Sales: stat.total
  })) || [];
  const topSelling = kpi?.topSelling || [];
  const outOfStock = kpi?.outOfStock || [];

  // Pie chart for top selling
  const topSellingPie = topSelling.map((item, i) => ({ name: item.name, value: item.totalSold }));
  // Pie chart for stock status
  const stockPie = [
    { name: 'Out of Stock', value: outOfStock.length },
    { name: 'In Stock', value: (kpi?.totalMedicines || 0) - outOfStock.length }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f7f9fb', pb: 6 }}>
      {/* Clean Welcome Header */}
      <Box sx={{
        width: '100%',
        py: 3,
        px: { xs: 2, md: 6 },
        mb: 2,
        background: '#fff',
        borderBottom: '1px solid #e3e8ee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Typography variant="h5" fontWeight={700} color="primary.main">
          Admin Dashboard
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
      <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            {/* KPI Widgets - Flat Card Style */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <Box sx={{
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1px solid #e3e8ee',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: 120,
                  boxShadow: 'none',
                  transition: 'border 0.2s',
                  '&:hover': { border: '1.5px solid', borderColor: 'primary.main' },
                }}>
                  {widgetIcons.orders}
                  <Typography color="text.secondary" gutterBottom fontWeight={600}>Orders Today</Typography>
                  <Typography variant="h4" fontWeight={700}>{kpi?.totalOrdersToday ?? '--'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <Box sx={{
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1px solid #e3e8ee',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: 120,
                  boxShadow: 'none',
                  transition: 'border 0.2s',
                  '&:hover': { border: '1.5px solid', borderColor: 'primary.main' },
                }}>
                  {widgetIcons.sales}
                  <Typography color="text.secondary" gutterBottom fontWeight={600}>Sales This Month</Typography>
                  <Typography variant="h4" fontWeight={700}>₹{kpi?.totalSalesThisMonth?.toLocaleString() ?? '--'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <Box sx={{
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1px solid #e3e8ee',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: 120,
                  boxShadow: 'none',
                  transition: 'border 0.2s',
                  '&:hover': { border: '1.5px solid', borderColor: 'primary.main' },
                }}>
                  {widgetIcons.users}
                  <Typography color="text.secondary" gutterBottom fontWeight={600}>New Users This Week</Typography>
                  <Typography variant="h4" fontWeight={700}>{kpi?.newUsersThisWeek ?? '--'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <Box sx={{
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1px solid #e3e8ee',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: 120,
                  boxShadow: 'none',
                  transition: 'border 0.2s',
                  '&:hover': { border: '1.5px solid', borderColor: 'primary.main' },
                }}>
                  {widgetIcons.prescriptions}
                  <Typography color="text.secondary" gutterBottom fontWeight={600}>Pending Prescriptions</Typography>
                  <Typography variant="h4" fontWeight={700}>{kpi?.pendingPrescriptions ?? '--'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <Box sx={{
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1px solid #e3e8ee',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: 120,
                  boxShadow: 'none',
                  transition: 'border 0.2s',
                  '&:hover': { border: '1.5px solid', borderColor: 'primary.main' },
                }}>
                  {widgetIcons.outOfStock}
                  <Typography color="text.secondary" gutterBottom fontWeight={600}>Out of Stock</Typography>
                  <Typography variant="h4" fontWeight={700}>{outOfStock.length ?? '--'}</Typography>
                  <Box mt={1}>
                    {outOfStock.slice(0, 2).map((med, i) => (
                      <Chip key={i} label={med.name} color="error" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                    {outOfStock.length > 2 && <Chip label={`+${outOfStock.length - 2} more`} size="small" />}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <Box sx={{
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1px solid #e3e8ee',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: 120,
                  boxShadow: 'none',
                  transition: 'border 0.2s',
                  '&:hover': { border: '1.5px solid', borderColor: 'primary.main' },
                }}>
                  {widgetIcons.topSelling}
                  <Typography color="text.secondary" gutterBottom fontWeight={600}>Top Sellers</Typography>
                  {topSelling.length === 0 ? <Typography variant="h6">--</Typography> : (
                    <>
                      <Typography variant="h6" fontWeight={700}>{topSelling[0].name}</Typography>
                      <Typography variant="body2" color="text.secondary">Sold: {topSelling[0].totalSold}</Typography>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
            {/* Charts Section - Flat Card Style */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1px solid #e3e8ee',
                  p: 3,
                  minHeight: 350,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'none',
                }}>
                  <Typography variant="h6" mb={2} fontWeight={700}>Orders by Month</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={orderStats}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="Orders" fill="#1976d2" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1px solid #e3e8ee',
                  p: 3,
                  minHeight: 350,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'none',
                }}>
                  <Typography variant="h6" mb={2} fontWeight={700}>Sales by Month</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={salesStats}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="Sales" fill="#1976d2" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1px solid #e3e8ee',
                  p: 3,
                  minHeight: 350,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'none',
                }}>
                  <Typography variant="h6" mb={2} fontWeight={700}>Top Selling Medicines</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={topSellingPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#1976d2"
                        label
                        animationDuration={800}
                      >
                        {topSellingPie.map((entry, idx) => (
                          <Cell key={`cell-top-${idx}`} fill="#1976d2" />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1px solid #e3e8ee',
                  p: 3,
                  minHeight: 350,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'none',
                }}>
                  <Typography variant="h6" mb={2} fontWeight={700}>Stock Status</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={stockPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#1976d2"
                        label
                        animationDuration={800}
                      >
                        {stockPie.map((entry, idx) => (
                          <Cell key={`cell-stock-${idx}`} fill="#1976d2" />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
