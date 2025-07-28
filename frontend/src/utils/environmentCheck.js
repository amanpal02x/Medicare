// environmentCheck.js
// Utility to check for environment mismatches between frontend and backend

export function checkEnvironmentMismatch() {
  const frontendEnv = process.env.NODE_ENV;
  const backendUrl = process.env.REACT_APP_API_URL;
  
  // Check if we're in development but pointing to production backend
  if (frontendEnv === 'development' && backendUrl && backendUrl.includes('onrender.com')) {
    return true;
  }
  
  // Check if we're in production but pointing to development backend
  if (frontendEnv === 'production' && backendUrl && backendUrl.includes('localhost')) {
    return true;
  }
  
  return false;
} 