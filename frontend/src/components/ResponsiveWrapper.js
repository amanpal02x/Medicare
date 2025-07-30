import React, { Children, cloneElement } from 'react';
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
    // Filter out Header components for mobile
    const mobileChildren = Children.toArray(children).filter(child => {
      // Check if the child is a Header component
      if (child.type && child.type.name === 'Header') {
        return false; // Remove Header for mobile
      }
      return true;
    });

    return (
      <MobileLayout isPublic={isPublic}>
        {mobileChildren}
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