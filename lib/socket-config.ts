import io from 'socket.io-client';
import Constants from 'expo-constants';
import { getSocketUrl } from './config';

const createSocket = (url?: string) => {
  const serverUrl = url || getSocketUrl();
  const finalUrl = serverUrl.startsWith('http') ? serverUrl : `http://${serverUrl}`;

  // Prefer polling-only in production builds to avoid websocket upgrade failures
  // commonly caused by serverless platforms or proxies (Vercel, Cloudflare, etc.).
  const isProduction = (process.env.NODE_ENV === 'production') || false;
  const forcePollingFlag = (Constants as any).expoConfig?.extra?.forceSocketPolling === true;
  const usePollingOnly = isProduction || forcePollingFlag;
  const transports = usePollingOnly ? ['polling'] : ['polling', 'websocket'];

  console.log('[socket-config] connecting to', finalUrl, 'using transports', transports);

  const socket = io(finalUrl, {
    // Allow polling fallback first, then upgrade to websocket when available.
    // In production we may force polling for reliability.
    transports,
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