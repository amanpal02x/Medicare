import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge, Button, Divider, TextField } from '@mui/material';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { generateInviteToken, getAllInviteTokens } from '../services/adminSettings';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';

const AdminSettings = () => {
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [inviteRole, setInviteRole] = useState('pharmacist');
  const [inviteResult, setInviteResult] = useState(null);
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [inviteTokens, setInviteTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [tokensError, setTokensError] = useState('');

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => { setProfileAnchor(null); logout(); };

  const handleGenerateInvite = async () => {
    setInviteError('');
    setInviteResult(null);
    setInviteLoading(true);
    try {
      const res = await generateInviteToken(inviteRole);
      setInviteResult(res);
    } catch (e) {
      setInviteError(e.message || 'Failed to generate invite link');
    }
    setInviteLoading(false);
  };
  const handleCopy = () => {
    if (inviteResult?.inviteLink) {
      navigator.clipboard.writeText(inviteResult.inviteLink);
    }
  };

  const fetchInviteTokens = async () => {
    setTokensLoading(true);
    setTokensError('');
    try {
      const res = await getAllInviteTokens();
      setInviteTokens(res.tokens || []);
    } catch (e) {
      setTokensError(e.message || 'Failed to fetch invite tokens');
    }
    setTokensLoading(false);
  };

  React.useEffect(() => {
    if (tab === 1) fetchInviteTokens();
  }, [tab]);

  const handleTabChange = (e, v) => setTab(v);

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
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h1>Admin Settings</h1>
        <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 4 }}>
          <Tab label="Generate Invite Link" />
          <Tab label="All Generated Links" />
        </Tabs>
        {tab === 0 && (
          <Box mt={4} mb={2}>
            <Typography variant="h6" fontWeight={600} color="primary">Generate Invite Link</Typography>
            <Box display="flex" alignItems="center" justifyContent="center" gap={2} mt={2}>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ fontSize: 16, padding: '6px 12px', borderRadius: 6 }}>
                <option value="pharmacist">Pharmacist</option>
                <option value="deliveryBoy">Delivery Boy</option>
              </select>
              <Button variant="contained" color="primary" onClick={handleGenerateInvite} disabled={inviteLoading}>
                Generate Invite
              </Button>
            </Box>
            {inviteError && <Typography color="error" mt={2}>{inviteError}</Typography>}
            {inviteResult && inviteResult.inviteLink && (
              <Box mt={2} display="flex" alignItems="center" justifyContent="center" gap={1}>
                <TextField value={inviteResult.inviteLink} InputProps={{ readOnly: true }} size="small" sx={{ minWidth: 320 }} />
                <IconButton onClick={handleCopy}><ContentCopyIcon /></IconButton>
              </Box>
            )}
            {inviteResult && inviteResult.expiresAt && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Expires: {new Date(inviteResult.expiresAt).toLocaleString()}
              </Typography>
            )}
          </Box>
        )}
        {tab === 1 && (
          <Box mt={4}>
            <Typography variant="h6" fontWeight={600} color="primary">All Generated Invite Links</Typography>
            {tokensLoading ? (
              <Box mt={3}><CircularProgress /></Box>
            ) : tokensError ? (
              <Typography color="error" mt={2}>{tokensError}</Typography>
            ) : inviteTokens.length === 0 ? (
              <Typography mt={2}>No invite links found.</Typography>
            ) : (
              <Box mt={3}>
                <table style={{ width: '100%', maxWidth: 800, margin: '0 auto', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Role</th>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Link</th>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Status</th>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Expires</th>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inviteTokens.map(token => (
                      <tr key={token._id}>
                        <td style={{ padding: 8, border: '1px solid #eee', textTransform: 'capitalize' }}>{token.role}</td>
                        <td style={{ padding: 8, border: '1px solid #eee', wordBreak: 'break-all' }}>
                          <TextField value={window.location.origin + `/register/${token.role === 'pharmacist' ? 'pharmacist' : 'delivery'}?token=${token.token}`} InputProps={{ readOnly: true }} size="small" sx={{ minWidth: 220 }} />
                        </td>
                        <td style={{ padding: 8, border: '1px solid #eee' }}>{token.status}</td>
                        <td style={{ padding: 8, border: '1px solid #eee' }}>{new Date(token.expiresAt).toLocaleString()}</td>
                        <td style={{ padding: 8, border: '1px solid #eee' }}>
                          <IconButton onClick={() => navigator.clipboard.writeText(window.location.origin + `/register/${token.role === 'pharmacist' ? 'pharmacist' : 'delivery'}?token=${token.token}`)}><ContentCopyIcon /></IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Box>
        )}
      </div>
    </>
  );
};

export default AdminSettings;
