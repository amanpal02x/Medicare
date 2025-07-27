import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem as MuiMenuItem, InputLabel, FormControl } from '@mui/material';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { getAllDeals, createDeal, deleteDeal } from '../services/deals';
import { getAllMedicines, getPharmacistMedicines } from '../services/medicines';
import { getAllProducts, getPharmacistProducts } from '../services/products';
import DeleteIcon from '@mui/icons-material/Delete';

const PharmacistDeals = () => {
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [itemType, setItemType] = useState('Medicine');
  const [itemId, setItemId] = useState('');
  const [discount, setDiscount] = useState(10);
  const [endTime, setEndTime] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [products, setProducts] = useState([]);
  const [creating, setCreating] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => { setProfileAnchor(null); logout(); };

  async function refreshDeals() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const data = await getAllDeals(token);
      setDeals(data);
    } catch (e) {
      setError('Failed to load deals');
      setDeals([]);
    }
    setLoading(false);
  }

  useEffect(() => { refreshDeals(); }, []);
  useEffect(() => {
    if (openModal) {
      getPharmacistMedicines().then(setMedicines);
      getPharmacistProducts().then(setProducts);
    }
  }, [openModal]);

  async function handleCreateDeal(e) {
    e.preventDefault();
    setCreating(true);
    setActionMsg('');
    try {
      const token = localStorage.getItem('token');
      await createDeal({
        item: itemId,
        itemType,
        discountPercentage: discount,
        endTime
      }, token);
      setOpenModal(false);
      setItemId('');
      setDiscount(10);
      setEndTime('');
      setActionMsg('Deal created successfully!');
      refreshDeals();
    } catch (err) {
      setActionMsg(err.message || 'Failed to create deal');
    }
    setCreating(false);
  }

  async function handleDeleteDeal(id) {
    if (!window.confirm('Delete this deal?')) return;
    try {
      const token = localStorage.getItem('token');
      await deleteDeal(id, token);
      setActionMsg('Deal deleted');
      refreshDeals();
    } catch (err) {
      setActionMsg(err.message || 'Failed to delete deal');
    }
  }

  return (
    <>
      {/* Top Bar (unchanged) */}
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
      {/* Main Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" fontWeight={700} color="primary">Deals of the Day</Typography>
          <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
            + Create Deal
          </Button>
        </Box>
        {actionMsg && <div style={{ color: '#22c55e', fontWeight: 600, marginBottom: 12 }}>{actionMsg}</div>}
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        {loading ? (
          <div style={{ textAlign: 'center', margin: 40 }}>Loading...</div>
        ) : deals.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 40 }}>No deals found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: 10 }}>Item</th>
                <th>Type</th>
                <th>Discount (%)</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deals.map(deal => {
                const now = new Date();
                const isActive = new Date(deal.startTime) <= now && new Date(deal.endTime) > now;
                return (
                  <tr key={deal._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 10 }}>{deal.item?.name || 'N/A'}</td>
                    <td>{deal.itemType}</td>
                    <td>{deal.discountPercentage}</td>
                    <td>{new Date(deal.startTime).toLocaleString()}</td>
                    <td>{new Date(deal.endTime).toLocaleString()}</td>
                    <td style={{ color: isActive ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{isActive ? 'Active' : 'Expired'}</td>
                    <td style={{ padding: 10, fontWeight: deal.createdBy?._id === user?._id ? 600 : 400, color: deal.createdBy?._id === user?._id ? '#1976d2' : '#666' }}>
                      {deal.createdBy?.name || 'Unknown'}
                      {deal.createdBy?._id === user?._id && ' (You)'}
                    </td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      <Box display="flex" alignItems="center" gap={1} justifyContent="center">
                        {deal.createdBy?._id === user?._id && (
                          <IconButton size="small" color="error" onClick={() => handleDeleteDeal(deal._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                        {/* If you add Edit in future, add here */}
                      </Box>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {/* Create Deal Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Deal of the Day</DialogTitle>
        <form onSubmit={handleCreateDeal}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Item Type</InputLabel>
              <Select value={itemType} label="Item Type" onChange={e => { setItemType(e.target.value); setItemId(''); }} required>
                <MuiMenuItem value="Medicine">Medicine</MuiMenuItem>
                <MuiMenuItem value="Product">Product</MuiMenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>{itemType}</InputLabel>
              <Select value={itemId} label={itemType} onChange={e => setItemId(e.target.value)} required>
                {(itemType === 'Medicine' ? medicines : products).map(item => (
                  <MuiMenuItem key={item._id} value={item._id}>{item.name}</MuiMenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Discount Percentage"
              type="number"
              value={discount}
              onChange={e => setDiscount(Number(e.target.value))}
              inputProps={{ min: 1, max: 100 }}
              required
              fullWidth
            />
            <TextField
              label="End Time"
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} disabled={creating}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Deal'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default PharmacistDeals;
