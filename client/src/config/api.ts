// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

// Validate API URL format
const validateApiUrl = (url: string): string => {
  // Remove any trailing slashes
  const cleanUrl = url.replace(/\/+$/, '');
  
  // Ensure it doesn't end with /api if it already contains it
  if (cleanUrl.includes('/api')) {
    return cleanUrl;
  }
  
  // Add /api if not present
  return `${cleanUrl}/api`;
};

// Export validated URLs
export const API_URL = validateApiUrl(API_BASE_URL);
export const WS_URL = WS_BASE_URL;

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    API_URL,
    WS_URL,
    NODE_ENV: process.env.NODE_ENV
  });
}
