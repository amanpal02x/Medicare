// API Utility Functions
import config from './config';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2
};

// Enhanced fetch with retry logic
export const fetchWithRetry = async (url, options = {}, retryCount = 0) => {
  try {
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // If response is ok, return it
    if (response.ok) {
      return response;
    }
    
    // If we've reached max retries, throw the error
    if (retryCount >= RETRY_CONFIG.maxRetries) {
      return response;
    }
    
    // If it's a server error (5xx), retry
    if (response.status >= 500) {
      console.warn(`Server error ${response.status}, retrying... (${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      
      // Wait before retrying with exponential backoff
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return fetchWithRetry(url, options, retryCount + 1);
    }
    
    // For other errors, don't retry
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      if (retryCount < RETRY_CONFIG.maxRetries) {
        console.warn(`Request timeout, retrying... (${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
        
        const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return fetchWithRetry(url, options, retryCount + 1);
      }
      throw new Error('Request timeout. Please check your internet connection and try again.');
    }
    
    // Network errors - retry if we haven't reached max retries
    if (retryCount < RETRY_CONFIG.maxRetries) {
      console.warn(`Network error, retrying... (${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return fetchWithRetry(url, options, retryCount + 1);
    }
    
    throw error;
  }
};

// Enhanced error handler
export const handleApiError = async (response, operation) => {
  if (!response.ok) {
    console.error(`${operation} failed:`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });
    
    let errorMessage = `${operation} failed with status ${response.status}`;
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Authentication failed. Please login again.');
    } else if (response.status === 403) {
      throw new Error('Access denied. You may not have permission to perform this action.');
    } else if (response.status === 404) {
      throw new Error('Resource not found. The requested endpoint may not exist.');
    } else if (response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(errorMessage);
    }
  }
};

// Check if user is online
export const isOnline = () => {
  return navigator.onLine;
};

// Add online/offline event listeners
export const setupOnlineStatusListener = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}; 