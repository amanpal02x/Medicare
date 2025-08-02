import { useState, useEffect } from 'react';

const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isSmallDesktop, setIsSmallDesktop] = useState(false);
  const [isLargeDesktop, setIsLargeDesktop] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      
      // Mobile: < 768px
      // Tablet: 768px - 1024px
      // Small Desktop: 1024px - 1200px
      // Large Desktop: > 1200px
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsSmallDesktop(width >= 1024 && width < 1200);
      setIsLargeDesktop(width >= 1200);
      setIsDesktop(width >= 1024);
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallDesktop,
    isLargeDesktop,
    screenWidth
  };
};

export default useDeviceDetection; 