// Frontend Configuration Utility
const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'https://medicare-ydw4.onrender.com',
  
  // Environment
  ENV: process.env.REACT_APP_ENV || 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Helper function to get full API URL
  getApiUrl: (endpoint) => {
    const base = config.API_BASE_URL.replace(/\/$/, '');
    const path = endpoint.replace(/^\//, '');
    return `${base}/${path}`;
  },
  
  // Helper function to get socket URL
  getSocketUrl: () => config.SOCKET_URL,
  
  // Helper function to get auth headers
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },
  
  // Helper function to get full headers with auth
  getHeaders: (contentType = 'application/json') => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': contentType };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },
  
  // Log configuration (for debugging)
  logConfig: () => {
    if (config.IS_DEVELOPMENT) {
      console.log('🔧 Frontend Configuration:', {
        API_BASE_URL: config.API_BASE_URL,
        SOCKET_URL: config.SOCKET_URL,
        ENV: config.ENV,
        NODE_ENV: process.env.NODE_ENV,
        HAS_TOKEN: !!localStorage.getItem('token')
      });
    }
  }
};

// Log configuration in development
if (config.IS_DEVELOPMENT) {
  config.logConfig();
}

export default config; 