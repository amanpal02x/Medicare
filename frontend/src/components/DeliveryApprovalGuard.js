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
        const res = await fetch('/api/delivery/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStatus(data.status || (data.deliveryBoy && data.deliveryBoy.status));
      } catch {
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