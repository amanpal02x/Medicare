import React from 'react';
import ResponsiveWrapper from './ResponsiveWrapper';

const ResponsiveLayout = ({ children, isPublic = false, toggleDarkMode, darkMode }) => {
  return (
    <ResponsiveWrapper 
      isPublic={isPublic} 
      isUserPage={!isPublic}
      toggleDarkMode={toggleDarkMode} 
      darkMode={darkMode}
    >
      {children}
    </ResponsiveWrapper>
  );
};

export default ResponsiveLayout; 