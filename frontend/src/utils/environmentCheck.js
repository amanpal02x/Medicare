// Utility to check if user is logged into the correct environment
export const checkEnvironment = () => {
  const currentUrl = window.location.origin;
  const proxyUrl = process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com';
  
  console.log('🔍 Environment Check:');
  console.log('  - Current URL:', currentUrl);
  console.log('  - Proxy URL:', proxyUrl);
  
  // Check if we're in development
  const isDevelopment = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
  
  // Check if proxy is pointing to production
  const isProductionProxy = proxyUrl.includes('onrender.com') || proxyUrl.includes('vercel.app');
  
  console.log('  - Is Development:', isDevelopment);
  console.log('  - Is Production Proxy:', isProductionProxy);
  
  return {
    isDevelopment,
    isProductionProxy,
    currentUrl,
    proxyUrl
  };
};

// Check if there might be an environment mismatch
export const checkEnvironmentMismatch = () => {
  const env = checkEnvironment();
  
  // If we're in development but using production proxy, there might be a mismatch
  if (env.isDevelopment && env.isProductionProxy) {
    console.warn('⚠️ Environment mismatch detected: Development frontend with production backend');
    return true;
  }
  
  return false;
}; 