// Frontend Configuration Utility
const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  
  // Environment
  ENV: process.env.REACT_APP_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Helper function to get full API URL
  getApiUrl: (endpoint) => {
    const base = config.API_BASE_URL.replace(/\/$/, '');
    const path = endpoint.replace(/^\//, '');
    return `${base}/${path}`;
  },
  
  // Helper function to get socket URL
  getSocketUrl: () => config.SOCKET_URL,
  
  // Log configuration (for debugging)
  logConfig: () => {
    if (config.IS_DEVELOPMENT) {
      console.log('🔧 Frontend Configuration:', {
        API_BASE_URL: config.API_BASE_URL,
        SOCKET_URL: config.SOCKET_URL,
        ENV: config.ENV,
        NODE_ENV: process.env.NODE_ENV
      });
    }
  }
};

// Log configuration in development
if (config.IS_DEVELOPMENT) {
  config.logConfig();
}

export default config; 