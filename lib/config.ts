import Constants from 'expo-constants';

// Environment configuration
export const config = {
  // API Configuration
  API_URL: (Constants as any).expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'https://eyyback.onrender.com',
  API_BASE_URL: (Constants as any).expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'https://eyyback.onrender.com',

  // Socket.IO Configuration
  SOCKET_URL: (Constants as any).expoConfig?.extra?.socketUrl || process.env.EXPO_PUBLIC_SOCKET_URL || 'https://eyyback.onrender.com',
  
  // Google Maps Configuration
  // Do not hardcode keys in client; use env or expo extras
  
  // Development Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Fallback URLs for different network configurations
  FALLBACK_URLS: [
    'https://eyyback.onrender.com',
    // Keep localhost as a development fallback if needed
    'http://127.0.0.1:3000'
  ],
  
  // Remove backend secrets from client build
  // (use backend .env for secrets)
};

// Get API URL with fallback
export const getApiUrl = (): string => {
  return config.API_URL || Constants.expoConfig?.extra?.serverUrl || 'https://eyyback.onrender.com';
};

// Get Socket URL with fallback
export const getSocketUrl = (): string => {
  return config.SOCKET_URL || Constants.expoConfig?.extra?.serverUrl || 'https://eyyback.onrender.com';
};

// Get Google Maps API Key
export const getGoogleMapsApiKey = (): string => {
  const envKey = (typeof process !== 'undefined' && process.env && (process.env.EXPO_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY)) || '';
  return envKey || (Constants as any).expoConfig?.extra?.googleMapsApiKey || 'AIzaSyCv62Aspv5ayOJuzYl4MqhQxjy_ddqb2oc';
};

// Debug: log resolved endpoints at app startup (guarded to avoid leaking info in production)
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[config] Resolved API/SOCKET URLs:', { API_URL: getApiUrl(), SOCKET_URL: getSocketUrl() });
}

export default config;
