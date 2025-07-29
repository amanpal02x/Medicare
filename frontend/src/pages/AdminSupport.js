import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { getSupportTickets, replySupportTicket, closeSupportTicket } from '../services/adminSupport';

const AdminSupport = () => {
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [replyLoading, setReplyLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Fetch all support tickets
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Fetching support tickets...');
        const data = await getSupportTickets();
        console.log('Support tickets response:', data);
        setTickets(data);
      } catch (err) {
        console.error('Error fetching support tickets:', err);
        setError(`Failed to fetch tickets: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [refresh]);

  // Open ticket dialog
  const handleOpenDialog = (ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
    setReply('');
    setReplyFiles([]);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTicket(null);
    setReply('');
    setReplyFiles([]);
  };

  // Handle reply file input
  const handleReplyFileChange = (e) => {
    setReplyFiles(Array.from(e.target.files));
  };

  // Send admin reply
  const handleSendReply = async () => {
    if (!selectedTicket || (!reply.trim() && replyFiles.length === 0)) return;
    setReplyLoading(true);
    try {
      console.log('Admin attempting to reply:', {
        ticketId: selectedTicket._id,
        message: reply,
        filesCount: replyFiles.length,
        user: user
      });
      
      await replySupportTicket(selectedTicket._id, reply, replyFiles);
      setReply('');
      setReplyFiles([]);
      setRefresh(r => r + 1);
      // Refetch ticket details
      const data = await getSupportTickets();
      const updated = data.find(t => t._id === selectedTicket._id);
      setSelectedTicket(updated);
    } catch (err) {
      console.error('Admin reply failed:', err);
      alert('Failed to send reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  // Close ticket
  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    setReplyLoading(true);
    try {
      await closeSupportTicket(selectedTicket._id);
      setRefresh(r => r + 1);
      handleCloseDialog();
    } catch (err) {
      alert('Failed to close ticket.');
    } finally {
      setReplyLoading(false);
    }
  };

  // UI
  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} mt={2}>
        <div style={{ width: 48 }} />
        <Typography variant="h5" fontWeight={600} color="primary" align="center">
          Hello{user && user.name ? `, ${user.name}` : ''}!
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Tooltip title="Notifications">
            <IconButton color="primary" onClick={e => setNotifAnchor(e.currentTarget)}>
              <Badge color="error" badgeContent={notifications.filter(n => !n.isRead).length}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)}>
            {notifications.length === 0 ? (
              <MenuItem disabled>No notifications</MenuItem>
            ) : (
              <>
                <MenuItem disabled>Notifications ({notifications.length})</MenuItem>
                <MenuItem onClick={clearAllNotifications}>Clear All</MenuItem>
                <Divider />
                {notifications.map(n => (
                  <MenuItem key={n._id} onClick={() => setNotifAnchor(null)} style={{ fontWeight: n.isRead ? 400 : 700 }}>
                    {n.message}
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
          <Tooltip title={user?.name || 'Profile'}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, cursor: 'pointer' }} onClick={e => setProfileAnchor(e.currentTarget)}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Avatar>
          </Tooltip>
          <Popover open={Boolean(profileAnchor)} anchorEl={profileAnchor} onClose={() => setProfileAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={1} p={2} minWidth={220}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', color: '#fff' }}>{user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}</Avatar>
              <Typography variant="h6" fontWeight={700} color="primary.main">Profile</Typography>
              <Box width="100%" mt={1}>
                <Box display="flex" alignItems="center" gap={1} mb={1}><PersonIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Name:</b> {user?.name}</Typography></Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}><MailOutlineIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Email:</b> {user?.email}</Typography></Box>
                <Box display="flex" alignItems="center" gap={1}><AssignmentIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Role:</b> {user?.role}</Typography></Box>
              </Box>
              <Divider sx={{ my: 1, width: '100%' }} />
              <Button variant="contained" color="primary" fullWidth onClick={() => { setProfileAnchor(null); logout(); }} startIcon={<LogoutIcon />}>LOGOUT</Button>
            </Box>
          </Popover>
        </Box>
      </Box>
      <Box maxWidth={1100} mx="auto" mt={2}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={2}>Support Tickets</Typography>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="User, Email, Order, Category"
            sx={{ minWidth: 220 }}
          />
        </Box>
        {loading && <div style={{ color: '#888' }}>Loading tickets...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <Box sx={{ border: '1.5px solid #e0e7ef', borderRadius: 3, background: '#fff', p: 2 }}>
          <Box display="flex" fontWeight={700} color="#1976d2" mb={1}>
            <Box flex={2}>User</Box>
            <Box flex={2}>Category</Box>
            <Box flex={2}>Ticket ID</Box>
            <Box flex={2}>Order</Box>
            <Box flex={2}>Status</Box>
            <Box flex={2}>Last Updated</Box>
            <Box flex={1}></Box>
          </Box>
          <Divider sx={{ mb: 1 }} />
          {tickets
            .filter(ticket => {
              if (statusFilter === 'open' && ticket.status === 'closed') return false;
              if (statusFilter === 'closed' && ticket.status !== 'closed') return false;
              return true;
            })
            .filter(ticket => {
              if (!search.trim()) return true;
              const s = search.toLowerCase();
              return (
                ticket.user?.name?.toLowerCase().includes(s) ||
                ticket.category?.toLowerCase().includes(s) ||
                ticket.status?.toLowerCase().includes(s) ||
                (ticket.order && typeof ticket.order === 'object' ? (ticket.order.orderNumber || ticket.order._id) : ticket.order)?.toString().toLowerCase().includes(s) ||
                ticket._id?.toLowerCase().includes(s)
              );
            })
            .map(ticket => (
              <Box key={ticket._id} display="flex" alignItems="center" py={1} borderBottom="1px solid #eee">
                <Box flex={2}>{ticket.user?.name || '—'}</Box>
                <Box flex={2}>{ticket.category || '—'}</Box>
                <Box flex={2} style={{ fontFamily: 'monospace' }}>{ticket._id ? ticket._id.slice(0, 6) : '—'}</Box>
                <Box flex={2}>
                  {ticket.order && typeof ticket.order === 'object' ? (
                    ticket.order.orderNumber ? (
                      <span style={{ fontFamily: 'monospace' }}>{ticket.order.orderNumber}</span>
                    ) : (
                      <span style={{ fontFamily: 'monospace' }}>{ticket.order._id ? ticket.order._id.slice(0, 6) : '—'}</span>
                    )
                  ) : ticket.order ? (
                    <span style={{ fontFamily: 'monospace' }}>{ticket.order.slice(0, 6)}</span>
                  ) : '—'}
                </Box>
                <Box flex={2}><Chip label={ticket.status} color={ticket.status === 'closed' ? 'error' : 'success'} size="small" /></Box>
                <Box flex={2}>{ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : ''}</Box>
                <Box flex={1}><Button size="small" variant="outlined" onClick={() => handleOpenDialog(ticket)}>View</Button></Box>
              </Box>
            ))}
        </Box>
      </Box>
      {/* Ticket Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Support Ticket</DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <>
              <Box mb={2}>
                <Typography variant="subtitle2">User: {selectedTicket.user?.name} ({selectedTicket.user?.email})</Typography>
                <Typography variant="subtitle2">
                  Order: {selectedTicket.order && typeof selectedTicket.order === 'object' ? (
                    <>
                      {selectedTicket.order.orderNumber || selectedTicket.order._id}
                      <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>ID: {selectedTicket.order._id}</span>
                      <Button size="small" sx={{ ml: 1 }} onClick={() => window.open(`/admin/orders?search=${selectedTicket.order.orderNumber || selectedTicket.order._id}`, '_blank')}>View Order</Button>
                    </>
                  ) : selectedTicket.order ? (
                    <>
                      {selectedTicket.order}
                    </>
                  ) : '—'}
                </Typography>
                <Typography variant="subtitle2">Category: {selectedTicket.category || 'General'}</Typography>
                <Typography variant="subtitle2">Status: <Chip label={selectedTicket.status} color={selectedTicket.status === 'closed' ? 'error' : 'success'} size="small" /></Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: 320, overflowY: 'auto', mb: 2 }}>
                {selectedTicket.conversation && selectedTicket.conversation.map((msg, idx) => (
                  <Box key={idx} mb={2} textAlign={msg.sender?._id === user._id ? 'right' : 'left'}>
                    <Typography fontWeight={700} fontSize={13}>{msg.sender?.name || (msg.sender?._id === user._id ? 'You' : 'User')}</Typography>
                    <Box display="inline-block" bgcolor={msg.sender?._id === user._id ? '#e0f7fa' : '#f1f1f1'} borderRadius={2} px={1.5} py={0.5} maxWidth={320}>
                      <Typography fontSize={14}>{msg.message}</Typography>
                      {msg.files && msg.files.length > 0 && (
                        <Box mt={1} display="flex" gap={1}>
                          {msg.files.map((file, i) => (
                            <a key={i} href={file} target="_blank" rel="noopener noreferrer">
                              <img src={file} alt="attachment" style={{ maxWidth: 60, maxHeight: 60, borderRadius: 3, border: '1px solid #eee' }} />
                            </a>
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Typography fontSize={11} color="#888">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</Typography>
                  </Box>
                ))}
              </Box>
              {selectedTicket.status !== 'closed' && (
                <Box mt={2}>
                  <TextField
                    label="Reply"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mb: 1 }}
                    disabled={replyLoading}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleReplyFileChange}
                    disabled={replyLoading}
                  />
                  <Box mt={1} display="flex" gap={1}>
                    {replyFiles.map((file, idx) => (
                      <img key={idx} src={URL.createObjectURL(file)} alt="preview" style={{ maxWidth: 40, maxHeight: 40, borderRadius: 3, border: '1px solid #eee' }} />
                    ))}
                  </Box>
                  <Button onClick={handleSendReply} variant="contained" color="primary" sx={{ mt: 2 }} disabled={replyLoading || (!reply.trim() && replyFiles.length === 0)}>Send Reply</Button>
                  <Button onClick={handleCloseTicket} variant="outlined" color="error" sx={{ mt: 2, ml: 2 }} disabled={replyLoading}>Mark as Solved</Button>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminSupport;
