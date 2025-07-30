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

  // For mobile devices - apply MobileLayout to ALL pages
  if (isMobile) {
    // Filter out Header and Footer components for mobile
    const mobileChildren = Children.toArray(children).filter(child => {
      // Check if the child is a Header component - more robust detection
      if (child.type && (
        child.type.name === 'Header' || 
        (child.type.displayName && child.type.displayName === 'Header') ||
        (typeof child.type === 'function' && child.type.name === 'Header')
      )) {
        return false; // Remove Header for mobile
      }
      // Check if the child is a Footer component
      if (child.type && (
        child.type.name === 'Footer' || 
        (child.type.displayName && child.type.displayName === 'Footer') ||
        (typeof child.type === 'function' && child.type.name === 'Footer')
      )) {
        return false; // Remove Footer for mobile
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