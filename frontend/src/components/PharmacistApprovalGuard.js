import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';

export default function PharmacistApprovalGuard({ children }) {
  const { user, token } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      try {
        const res = await fetch('/api/pharmacist/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStatus(data.status || (data.pharmacist && data.pharmacist.status));
      } catch {
        setStatus(null);
      }
      setLoading(false);
    }
    if (user && user.role === 'pharmacist') fetchStatus();
    else setLoading(false);
  }, [user, token]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>;
  if (user?.role !== 'pharmacist') return null;
  if (status !== 'approved') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300}>
        <Alert severity="warning" sx={{ mb: 2, maxWidth: 400 }}>
          <Typography variant="h6">Your account is not yet approved by admin.</Typography>
          <Typography variant="body2">Please wait for approval before accessing pharmacist features.</Typography>
        </Alert>
      </Box>
    );
  }
  return children;
} 