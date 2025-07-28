import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Alert, Typography, Button } from '@mui/material';
import { checkEnvironmentMismatch } from '../utils/environmentCheck';

export default function DeliveryApprovalGuard({ children }) {
  const { user, token, logout } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [environmentMismatch, setEnvironmentMismatch] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery/profile', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setStatus(data.deliveryBoy?.status);
    } catch (error) {
      console.error('Error fetching delivery profile:', error);
      setStatus(null);
    }
    setLoading(false);
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    await fetchStatus();
    setRefreshing(false);
  };

  useEffect(() => {
    const hasMismatch = checkEnvironmentMismatch();
    setEnvironmentMismatch(hasMismatch);
    
    if (user && user.role === 'deliveryBoy') fetchStatus();
    else setLoading(false);
  }, [user, token]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>;
  if (user?.role !== 'deliveryBoy') return null;
  
  // Show warning only if status is explicitly not active (not when status is null/undefined)
  if (status && status !== 'active') {
    return (
      <Box>
        <Box sx={{ mb: 2 }}>
          {environmentMismatch && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6">Environment Mismatch Detected</Typography>
              <Typography variant="body2">
                You are logged into a different environment than expected. This might be causing the approval issue.
              </Typography>
            </Alert>
          )}
          <Alert severity="warning">
            <Typography variant="h6">Account Approval Required</Typography>
            <Typography variant="body2">
              Your delivery boy account is currently {status === 'pending_approval' ? 'pending approval' : status}. 
              You can view your profile and settings, but you won't be able to accept orders until approved.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              If your account was recently approved, try refreshing the status or logging out and back in.
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={handleRefreshStatus}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Status'}
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={logout}
              >
                Logout
              </Button>
            </Box>
          </Alert>
        </Box>
        {children}
      </Box>
    );
  }
  
  return children;
} 