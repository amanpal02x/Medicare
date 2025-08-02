import React from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import useDeviceDetection from '../hooks/useDeviceDetection';

const ResponsiveTest = () => {
  const { isMobile, isTablet, isSmallDesktop, isLargeDesktop, screenWidth } = useDeviceDetection();

  const getCurrentLayout = () => {
    if (isMobile) return 'Mobile Layout';
    if (isTablet) return 'Tablet Layout (Responsive Desktop)';
    if (isSmallDesktop) return 'Small Desktop Layout (Responsive Desktop)';
    if (isLargeDesktop) return 'Large Desktop Layout (Original Dashboard)';
    return 'Unknown';
  };

  const getLayoutFeatures = () => {
    if (isMobile) {
      return [
        'Mobile-specific layout',
        'Bottom navigation',
        'No header/footer',
        'Full-screen content'
      ];
    }
    if (isTablet || isSmallDesktop) {
      return [
        'Hamburger menu',
        'Responsive sidebar',
        'Fixed header',
        'Adaptive content'
      ];
    }
    if (isLargeDesktop) {
      return [
        'Permanent sidebar',
        'Traditional layout',
        'Full navigation',
        'Desktop optimized'
      ];
    }
    return [];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Responsive Layout Test
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Device & Layout
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Screen Width:</strong> {screenWidth}px
            </Typography>
            <Typography variant="body1">
              <strong>Current Layout:</strong> {getCurrentLayout()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" gutterBottom>
              <strong>Device Type:</strong>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label="Mobile" 
                color={isMobile ? "primary" : "default"} 
                variant={isMobile ? "filled" : "outlined"}
              />
              <Chip 
                label="Tablet" 
                color={isTablet ? "primary" : "default"} 
                variant={isTablet ? "filled" : "outlined"}
              />
              <Chip 
                label="Small Desktop" 
                color={isSmallDesktop ? "primary" : "default"} 
                variant={isSmallDesktop ? "filled" : "outlined"}
              />
              <Chip 
                label="Large Desktop" 
                color={isLargeDesktop ? "primary" : "default"} 
                variant={isLargeDesktop ? "filled" : "outlined"}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Layout Features
        </Typography>
        <Grid container spacing={1}>
          {getLayoutFeatures().map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Chip label={feature} variant="outlined" />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Breakpoint Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2">
              <strong>Mobile:</strong> &lt; 768px
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2">
              <strong>Tablet:</strong> 768px - 1024px
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2">
              <strong>Small Desktop:</strong> 1024px - 1200px
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2">
              <strong>Large Desktop:</strong> &gt; 1200px
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="body2" color="info.contrastText">
          <strong>Test Instructions:</strong> Resize your browser window to test different responsive breakpoints. 
          You should see the layout change between mobile, tablet, small desktop, and large desktop modes.
        </Typography>
      </Box>
    </Box>
  );
};

export default ResponsiveTest; 