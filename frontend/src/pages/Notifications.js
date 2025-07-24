import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNotifications } from '../context/NotificationContext';
import { Button, CircularProgress, Box, Typography, Card, CardContent, Avatar, Fade, Tooltip } from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import InfoIcon from '@mui/icons-material/Info';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function getRelativeTime(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(date).toLocaleString();
}

function getTypeIcon(type) {
  switch (type) {
    case 'order':
      return <AssignmentTurnedInIcon color="primary" />;
    case 'delivery':
      return <LocalShippingIcon color="success" />;
    case 'error':
      return <ErrorOutlineIcon color="error" />;
    case 'info':
    default:
      return <InfoIcon color="info" />;
  }
}

const Notifications = () => {
  const { notifications, loading, error, clearAllNotifications } = useNotifications();
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearAllNotifications();
    } catch (err) {
      // Optionally handle error
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: 600, margin: '24px auto 0 auto', padding: '0 16px 32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActiveIcon fontSize="large" sx={{ color: '#1976d2' }} /> Notifications
          </Typography>
          {notifications.length > 0 && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ClearAllIcon />}
              onClick={handleClear}
              disabled={clearing}
              sx={{ minWidth: 0, fontWeight: 600 }}
            >
              Clear All
            </Button>
          )}
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box color="error.main" textAlign="center" py={4}>{error}</Box>
        ) : notifications.length === 0 ? (
          <Fade in={true}>
            <Box textAlign="center" py={6}>
              <Avatar sx={{ bgcolor: '#e3f2fd', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                <NotificationsActiveIcon sx={{ color: '#1976d2', fontSize: 48 }} />
              </Avatar>
              <Typography variant="h6" color="textSecondary" mb={1}>
                No notifications yet!
              </Typography>
              <Typography variant="body2" color="textSecondary">
                You’re all caught up. We’ll let you know when something arrives.
              </Typography>
            </Box>
          </Fade>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {notifications.map((n) => (
              <Fade in={true} key={n._id}>
                <Card
                  sx={{
                    borderLeft: n.isRead ? '5px solid #bdbdbd' : '5px solid #1976d2',
                    background: n.isRead ? '#f8fafd' : '#e3f2fd',
                    boxShadow: n.isRead ? 1 : 3,
                    opacity: n.isRead ? 0.7 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: n.isRead ? '#bdbdbd' : '#1976d2', color: '#fff', width: 48, height: 48 }}>
                      {getTypeIcon(n.type)}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ wordBreak: 'break-word' }}>
                        {n.message}
                      </Typography>
                      {n.replyPreview && (
                        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                          "{n.replyPreview}..."
                        </Typography>
                      )}
                      {n.adminName && (
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                          By: {n.adminName}
                        </Typography>
                      )}
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Tooltip title={new Date(n.createdAt).toLocaleString()} placement="top">
                          <Typography variant="caption" color="textSecondary">
                            {getRelativeTime(n.createdAt)}
                          </Typography>
                        </Tooltip>
                        {!n.isRead && (
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#1976d2', ml: 1 }} />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Box>
        )}
      </div>
    </>
  );
};

export default Notifications;
