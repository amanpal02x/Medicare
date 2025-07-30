import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import useDeviceDetection from '../hooks/useDeviceDetection';

const ResponsiveTest = () => {
  const { isMobile, isTablet, isDesktop, screenWidth } = useDeviceDetection();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Responsive Layout Test
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Device Detection Results:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Screen Width:</strong> {screenWidth}px
            </Typography>
            <Typography>
              <strong>Is Mobile:</strong> {isMobile ? 'Yes' : 'No'}
            </Typography>
            <Typography>
              <strong>Is Tablet:</strong> {isTablet ? 'Yes' : 'No'}
            </Typography>
            <Typography>
              <strong>Is Desktop:</strong> {isDesktop ? 'Yes' : 'No'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Current Layout:
            </Typography>
            <Typography>
              {isMobile ? 'Mobile Layout' : isTablet ? 'Tablet Layout' : 'Desktop Layout'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Layout Features:
        </Typography>
        <Typography variant="body1" paragraph>
          • <strong>Mobile:</strong> Hamburger menu, bottom navigation, simplified navigation
        </Typography>
        <Typography variant="body1" paragraph>
          • <strong>Desktop:</strong> Full sidebar navigation, header with all features
        </Typography>
        <Typography variant="body1" paragraph>
          • <strong>Public Pages:</strong> Show Header/Footer on desktop, mobile layout on mobile
        </Typography>
        <Typography variant="body1" paragraph>
          • <strong>User Pages:</strong> Dashboard layout on desktop, mobile layout on mobile
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Hidden Elements on Mobile:
        </Typography>
        <Typography variant="body1" paragraph>
          • About navigation link
        </Typography>
        <Typography variant="body1" paragraph>
          • Store locator navigation link
        </Typography>
        <Typography variant="body1" paragraph>
          • Complex navigation menus
        </Typography>
      </Paper>
    </Box>
  );
};

export default ResponsiveTest; 