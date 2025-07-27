import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';

export default function DeliveryApprovalGuard({ children }) {
  const { user, token } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      try {
        console.log('🔍 DeliveryApprovalGuard: Starting API call...');
        console.log('🔍 DeliveryApprovalGuard: User:', user);
        console.log('🔍 DeliveryApprovalGuard: Token exists:', !!token);
        
        // Use relative URL to ensure proxy is used
        const res = await fetch('/api/delivery/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        console.log('🔍 DeliveryApprovalGuard: Response status:', res.status);
        console.log('🔍 DeliveryApprovalGuard: Response ok:', res.ok);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Debug: Log the API response
        console.log('🔍 DeliveryApprovalGuard Debug:');
        console.log('  - API Response:', data);
        console.log('  - Delivery Boy Status:', data.deliveryBoy?.status);
        console.log('  - Status type:', typeof data.deliveryBoy?.status);
        console.log('  - Is Active?', data.deliveryBoy?.status === 'active');
        
        setStatus(data.deliveryBoy?.status);
      } catch (error) {
        console.error('Error fetching delivery profile:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        setStatus(null);
      }
      setLoading(false);
    }
    if (user && user.role === 'deliveryBoy') fetchStatus();
    else setLoading(false);
  }, [user, token]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>;
  if (user?.role !== 'deliveryBoy') return null;
  if (status !== 'active') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300}>
        <Alert severity="warning" sx={{ mb: 2, maxWidth: 400 }}>
          <Typography variant="h6">Your account is not yet approved by admin.</Typography>
          <Typography variant="body2">Please wait for approval before accessing delivery features.</Typography>
        </Alert>
      </Box>
    );
  }
  return children;
} 