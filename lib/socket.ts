import { io } from 'socket.io-client';
import Constants from 'expo-constants';

// Get the server URL from environment variables or use a default
const SOCKET_URL = Constants.expoConfig?.extra?.serverUrl || 'https://eyyback.vercel.app';

// Create socket instance with configuration
const socket = io(SOCKET_URL, {
  // Allow polling fallback so environments without a compatible
  // native WebSocket won't immediately fail.
  transports: ['polling', 'websocket'],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export const createSocket = () => {
  return socket;
};

export default socket; 