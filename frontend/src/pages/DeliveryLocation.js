import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeliveryApprovalGuard from '../components/DeliveryApprovalGuard';

const DeliveryLocation = () => {
  // Placeholder location data
  const location = {
    address: '123 Main St, City, State',
    lastUpdated: '2 min ago',
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="primary" mb={2}>
          My Location
        </Typography>
        <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                {location.address}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Last updated: {location.lastUpdated}
            </Typography>
            <Button variant="outlined" size="small" sx={{ mt: 2 }}>
              Update Location
            </Button>
          </CardContent>
        </Card>
        {/* Placeholder for map */}
        <Box sx={{ width: '100%', height: 220, bgcolor: '#e3e7ef', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 18 }}>
          Map view coming soon
        </Box>
      </Box>
    </>
  );
};

export default function WrappedDeliveryLocation(props) {
  return (
    <DeliveryApprovalGuard>
      <DeliveryLocation {...props} />
    </DeliveryApprovalGuard>
  );
}

// Keep the original export for named import if needed
export { DeliveryLocation };
