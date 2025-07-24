import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import notificationSound from '../utils/notificationSound';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    browserNotifications: true,
    volume: 0.5,
    highPrioritySound: true,
    orderNotifications: true,
    statusNotifications: true,
    systemNotifications: true
  });
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [testSound, setTestSound] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Check notification permission
    setNotificationPermission(Notification.permission);
  }, []);

  const handleSettingChange = (setting, value) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        handleSettingChange('browserNotifications', true);
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const testNotificationSound = () => {
    setTestSound(true);
    notificationSound.play();
    setTimeout(() => setTestSound(false), 1000);
  };

  const testHighPrioritySound = () => {
    setTestSound(true);
    notificationSound.playHighPriority();
    setTimeout(() => setTestSound(false), 1000);
  };

  const testPharmacistSound = () => {
    setTestSound(true);
    notificationSound.playPharmacistSound();
    setTimeout(() => setTestSound(false), 1000);
  };

  const testDeliverySound = () => {
    setTestSound(true);
    notificationSound.playDeliverySound();
    setTimeout(() => setTestSound(false), 1000);
  };

  const testBrowserNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from MediCare',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
    }
  };

  const getPermissionStatus = () => {
    switch (notificationPermission) {
      case 'granted':
        return { color: 'success', text: 'Granted', icon: <CheckCircleIcon /> };
      case 'denied':
        return { color: 'error', text: 'Denied', icon: <WarningIcon /> };
      default:
        return { color: 'warning', text: 'Not Set', icon: <InfoIcon /> };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <Box maxWidth={800} mx="auto">
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ 
          background: 'linear-gradient(90deg, #a8ff78 0%, #78ffd6 100%)',
          borderRadius: 3
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <SettingsIcon sx={{ fontSize: 32, color: 'success.main' }} />
            <Typography variant="h5" fontWeight={700} color="success.main">
              Notification Settings
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Browser Notification Permission */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Browser Notifications
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Chip
              icon={permissionStatus.icon}
              label={`Permission: ${permissionStatus.text}`}
              color={permissionStatus.color}
              variant="outlined"
            />
            {notificationPermission === 'default' && (
              <Button
                variant="contained"
                color="primary"
                onClick={requestNotificationPermission}
              >
                Request Permission
              </Button>
            )}
            {notificationPermission === 'granted' && (
              <Button
                variant="outlined"
                color="primary"
                onClick={testBrowserNotification}
              >
                Test Notification
              </Button>
            )}
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.browserNotifications && notificationPermission === 'granted'}
                onChange={(e) => handleSettingChange('browserNotifications', e.target.checked)}
                disabled={notificationPermission !== 'granted'}
              />
            }
            label="Enable browser notifications"
          />
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sound Notifications
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.soundEnabled}
                onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
              />
            }
            label="Enable notification sounds"
          />

          {settings.soundEnabled && (
            <Box mt={2}>
              <Typography gutterBottom>
                Volume Level
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <VolumeOffIcon color="action" />
                <Slider
                  value={settings.volume}
                  onChange={(e, value) => handleSettingChange('volume', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ flex: 1 }}
                />
                <VolumeUpIcon color="action" />
              </Box>
              
              <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<VolumeUpIcon />}
                  onClick={testNotificationSound}
                  disabled={testSound}
                >
                  Test Normal Sound
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VolumeUpIcon />}
                  onClick={testHighPrioritySound}
                  disabled={testSound}
                >
                  Test High Priority
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VolumeUpIcon />}
                  onClick={testPharmacistSound}
                  disabled={testSound}
                  color="primary"
                >
                  Test Pharmacist Sound
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VolumeUpIcon />}
                  onClick={testDeliverySound}
                  disabled={testSound}
                  color="secondary"
                >
                  Test Delivery Sound
                </Button>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.highPrioritySound}
                onChange={(e) => handleSettingChange('highPrioritySound', e.target.checked)}
                disabled={!settings.soundEnabled}
              />
            }
            label="Use high priority sound for urgent notifications"
          />
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Types
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="New Orders"
                secondary="Get notified when new orders are placed"
              />
              <Switch
                checked={settings.orderNotifications}
                onChange={(e) => handleSettingChange('orderNotifications', e.target.checked)}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="info" />
              </ListItemIcon>
              <ListItemText
                primary="Status Updates"
                secondary="Get notified when order status changes"
              />
              <Switch
                checked={settings.statusNotifications}
                onChange={(e) => handleSettingChange('statusNotifications', e.target.checked)}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <SettingsIcon color="action" />
              </ListItemIcon>
              <ListItemText
                primary="System Notifications"
                secondary="Get notified about system updates and maintenance"
              />
              <Switch
                checked={settings.systemNotifications}
                onChange={(e) => handleSettingChange('systemNotifications', e.target.checked)}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Accordion sx={{ borderRadius: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Notification Help
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            <strong>Browser Notifications:</strong> These appear even when you're not actively viewing the MediCare dashboard. 
            They require permission from your browser and will show order details and updates.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>Sound Notifications:</strong> Audio alerts that play when new orders arrive or important updates occur. 
            These work even when the browser tab is not active (if the page is loaded).
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>High Priority Sounds:</strong> More attention-grabbing sounds for urgent notifications like new orders 
            that require immediate attention.
          </Typography>
          
          <Typography variant="body2">
            <strong>Note:</strong> For the best experience, keep the MediCare dashboard open in a browser tab. 
            Sound notifications work best when the page is active or recently visited.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {notificationPermission === 'denied' && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          Browser notifications are currently blocked. To enable them, please:
          <ol style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
            <li>Click the lock/info icon in your browser's address bar</li>
            <li>Change the notification permission to "Allow"</li>
            <li>Refresh this page</li>
          </ol>
        </Alert>
      )}
    </Box>
  );
};

export default NotificationSettings; 