import React from 'react';
import useDeviceDetection from '../hooks/useDeviceDetection';
import MobileLayout from './MobileLayout';
import DashboardLayout from './DashboardLayout';

const ResponsiveWrapper = ({ 
  children, 
  isPublic = false, 
  isUserPage = false,
  toggleDarkMode, 
  darkMode 
}) => {
  const { isMobile } = useDeviceDetection();

  // For mobile devices
  if (isMobile) {
    return (
      <MobileLayout isPublic={isPublic}>
        {children}
      </MobileLayout>
    );
  }

  // For desktop devices
  if (isPublic) {
    // Public pages on desktop - just render children (they have their own header/footer)
    return children;
  }

  if (isUserPage) {
    // User pages on desktop - use DashboardLayout
    return (
      <DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
        {children}
      </DashboardLayout>
    );
  }

  // Default case - just render children
  return children;
};

export default ResponsiveWrapper; 