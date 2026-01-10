import io from 'socket.io-client';
import { getSocketUrl } from './config';

const createSocket = (url?: string) => {
  const serverUrl = url || getSocketUrl();
  const finalUrl = serverUrl.startsWith('http') ? serverUrl : `http://${serverUrl}`;
  const socket = io(finalUrl, {
    // Allow polling fallback first, then upgrade to websocket when available.
    // This avoids immediate "websocket error" failures on environments where
    // a native WebSocket implementation isn't available or compatible.
    transports: ['polling', 'websocket'],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    autoConnect: false,
    path: '/socket.io'
  });
  return socket;
};

export default createSocket;