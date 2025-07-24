import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import {
  BugReport as BugReportIcon,
  VolumeUp as VolumeUpIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import notificationSound from '../utils/notificationSound';

const NotificationDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    updateDebugInfo();
  }, []);

  const updateDebugInfo = () => {
    const info = {
      webAudioSupported: typeof window !== 'undefined' && window.AudioContext,
      notificationSupported: 'Notification' in window,
      notificationPermission: Notification.permission,
      audioContextState: null,
      settings: JSON.parse(localStorage.getItem('notificationSettings') || '{}'),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Try to get audio context state
    try {
      if (notificationSound.audioContext) {
        info.audioContextState = notificationSound.audioContext.state;
      }
    } catch (error) {
      info.audioContextState = 'error: ' + error.message;
    }

    setDebugInfo(info);
  };

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const testWebAudio = () => {
    addTestResult('Web Audio API', 'running', 'Testing Web Audio API support...');
    
    try {
      if (!debugInfo.webAudioSupported) {
        addTestResult('Web Audio API', 'failed', 'Web Audio API not supported');
        return;
      }

      notificationSound.play();
      addTestResult('Web Audio API', 'success', 'Sound played successfully');
    } catch (error) {
      addTestResult('Web Audio API', 'failed', error.message);
    }
  };

  const testPharmacistSound = () => {
    addTestResult('Pharmacist Sound', 'running', 'Testing pharmacist notification sound...');
    
    try {
      if (!debugInfo.webAudioSupported) {
        addTestResult('Pharmacist Sound', 'failed', 'Web Audio API not supported');
        return;
      }

      notificationSound.playPharmacistSound();
      addTestResult('Pharmacist Sound', 'success', 'Pharmacist sound played successfully');
    } catch (error) {
      addTestResult('Pharmacist Sound', 'failed', error.message);
    }
  };

  const testDeliverySound = () => {
    addTestResult('Delivery Sound', 'running', 'Testing delivery notification sound...');
    
    try {
      if (!debugInfo.webAudioSupported) {
        addTestResult('Delivery Sound', 'failed', 'Web Audio API not supported');
        return;
      }

      notificationSound.playDeliverySound();
      addTestResult('Delivery Sound', 'success', 'Delivery sound played successfully');
    } catch (error) {
      addTestResult('Delivery Sound', 'failed', error.message);
    }
  };

  const testHighPrioritySound = () => {
    addTestResult('High Priority Sound', 'running', 'Testing high priority notification sound...');
    
    try {
      if (!debugInfo.webAudioSupported) {
        addTestResult('High Priority Sound', 'failed', 'Web Audio API not supported');
        return;
      }

      notificationSound.playHighPriority();
      addTestResult('High Priority Sound', 'success', 'High priority sound played successfully');
    } catch (error) {
      addTestResult('High Priority Sound', 'failed', error.message);
    }
  };

  const testBrowserNotification = () => {
    addTestResult('Browser Notification', 'running', 'Testing browser notification...');
    
    try {
      if (!debugInfo.notificationSupported) {
        addTestResult('Browser Notification', 'failed', 'Notifications API not supported');
        return;
      }

      if (debugInfo.notificationPermission !== 'granted') {
        addTestResult('Browser Notification', 'failed', 'Permission not granted');
        return;
      }

      new Notification('Debug Test', {
        body: 'This is a test notification from debug panel',
        icon: '/favicon.ico',
        tag: 'debug-test'
      });
      
      addTestResult('Browser Notification', 'success', 'Notification sent successfully');
    } catch (error) {
      addTestResult('Browser Notification', 'failed', error.message);
    }
  };

  const testSettings = () => {
    addTestResult('Settings', 'running', 'Testing notification settings...');
    
    try {
      const settings = debugInfo.settings;
      const requiredSettings = ['soundEnabled', 'browserNotifications', 'volume'];
      const missingSettings = requiredSettings.filter(setting => !(setting in settings));
      
      if (missingSettings.length > 0) {
        addTestResult('Settings', 'warning', `Missing settings: ${missingSettings.join(', ')}`);
      } else {
        addTestResult('Settings', 'success', 'All settings present');
      }
    } catch (error) {
      addTestResult('Settings', 'failed', error.message);
    }
  };

  const runAllTests = () => {
    setTestResults([]);
    testWebAudio();
    setTimeout(testBrowserNotification, 1000);
    setTimeout(testSettings, 2000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'failed': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      default: return <BugReportIcon color="action" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box maxWidth={800} mx="auto">
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ 
          background: 'linear-gradient(90deg, #ff6b6b 0%, #ffa726 100%)',
          borderRadius: 3
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <BugReportIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h5" fontWeight={700} color="white">
              Notification Debug Panel
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Information
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemText
                primary="Web Audio API"
                secondary={debugInfo.webAudioSupported ? 'Supported' : 'Not Supported'}
              />
              <Chip 
                label={debugInfo.webAudioSupported ? '✅' : '❌'} 
                color={debugInfo.webAudioSupported ? 'success' : 'error'}
                size="small"
              />
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="Notifications API"
                secondary={debugInfo.notificationSupported ? 'Supported' : 'Not Supported'}
              />
              <Chip 
                label={debugInfo.notificationSupported ? '✅' : '❌'} 
                color={debugInfo.notificationSupported ? 'success' : 'error'}
                size="small"
              />
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="Notification Permission"
                secondary={debugInfo.notificationPermission}
              />
              <Chip 
                label={debugInfo.notificationPermission} 
                color={
                  debugInfo.notificationPermission === 'granted' ? 'success' : 
                  debugInfo.notificationPermission === 'denied' ? 'error' : 'warning'
                }
                size="small"
              />
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="Audio Context State"
                secondary={debugInfo.audioContextState || 'Not initialized'}
              />
              <Chip 
                label={debugInfo.audioContextState || 'N/A'} 
                color={
                  debugInfo.audioContextState === 'running' ? 'success' : 
                  debugInfo.audioContextState === 'suspended' ? 'warning' : 'default'
                }
                size="small"
              />
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="Sound Enabled"
                secondary={debugInfo.settings?.soundEnabled ? 'Yes' : 'No'}
              />
              <Chip 
                label={debugInfo.settings?.soundEnabled ? '✅' : '❌'} 
                color={debugInfo.settings?.soundEnabled ? 'success' : 'error'}
                size="small"
              />
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="Browser Notifications"
                secondary={debugInfo.settings?.browserNotifications ? 'Yes' : 'No'}
              />
              <Chip 
                label={debugInfo.settings?.browserNotifications ? '✅' : '❌'} 
                color={debugInfo.settings?.browserNotifications ? 'success' : 'error'}
                size="small"
              />
            </ListItem>
          </List>
          
          <Box mt={2}>
            <Button
              variant="outlined"
              onClick={updateDebugInfo}
              startIcon={<BugReportIcon />}
            >
              Refresh Debug Info
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Controls
          </Typography>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              onClick={runAllTests}
              startIcon={<BugReportIcon />}
            >
              Run All Tests
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<BugReportIcon />}
              onClick={testWebAudio}
              sx={{ mb: 1 }}
            >
              Test Normal Sound
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<BugReportIcon />}
              onClick={testPharmacistSound}
              sx={{ mb: 1 }}
              color="primary"
            >
              Test Pharmacist Sound
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<BugReportIcon />}
              onClick={testDeliverySound}
              sx={{ mb: 1 }}
              color="secondary"
            >
              Test Delivery Sound
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<BugReportIcon />}
              onClick={testHighPrioritySound}
              sx={{ mb: 1 }}
              color="warning"
            >
              Test High Priority Sound
            </Button>

            <Button
              variant="outlined"
              onClick={testBrowserNotification}
              startIcon={<NotificationsIcon />}
            >
              Test Notification
            </Button>
            
            <Button
              variant="outlined"
              onClick={testSettings}
              startIcon={<BugReportIcon />}
            >
              Test Settings
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Results
          </Typography>
          
          {testResults.length === 0 ? (
            <Typography color="textSecondary">
              No tests run yet. Click "Run All Tests" to start.
            </Typography>
          ) : (
            <List dense>
              {testResults.map((result, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(result.result)}
                        <Typography variant="body2">
                          {result.test}
                        </Typography>
                        <Chip 
                          label={result.result} 
                          color={getStatusColor(result.result)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {result.details}
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          {testResults.length > 0 && (
            <Box mt={2}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setTestResults([])}
              >
                Clear Results
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationDebug; 