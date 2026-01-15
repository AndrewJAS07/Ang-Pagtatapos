const fs = require('fs');
const path = require('path');

const appJsonPath = path.resolve(__dirname, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const expo = appJson.expo || {};

/**
 * Environment variables (EAS-safe)
 */
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://eyyback-1.onrender.com/api';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://eyyback-1.onrender.com';

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || 'https://eyyback-1.onrender.com';

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY ||
  expo.extra?.googleMapsApiKey ||
  'AIzaSyCv62Aspv5ayOJuzYl4MqhQxjy_ddqb2oc';

/**
 * Android Google Maps config
 */
expo.android = expo.android || {};
expo.android.config = expo.android.config || {};
expo.android.config.googleMaps = expo.android.config.googleMaps || {};
expo.android.config.googleMaps.apiKey = GOOGLE_MAPS_API_KEY;

/**
 * Expo extra (available at runtime via Constants.expoConfig.extra)
 */
expo.extra = {
  ...(expo.extra || {}),
  apiUrl: API_URL,
  apiBaseUrl: API_BASE_URL,
  socketUrl: SOCKET_URL,
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
};

/**
 * Export final config
 */
module.exports = { expo };
