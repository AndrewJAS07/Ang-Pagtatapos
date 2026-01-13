import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import createSocket from './socket-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSocketUrl } from './config';

// Define the context type
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

// Create the context
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
});

// Create the provider component
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const serverUrl = getSocketUrl();
    let interval: any;
    try {
      const socketInstance = createSocket(serverUrl);
      let connectErrorCount = 0
      let realtimeDisabled = false

      const handleConnect = () => {
        console.log('[socket-context] Socket connected');
        setIsConnected(true);
        setError(null);
        connectErrorCount = 0;
      };

      const handleDisconnect = (reason: any) => {
        console.log('[socket-context] Socket disconnected:', reason);
        setIsConnected(false);
      };

      const handleConnectError = (err: Error & { message?: string; code?: string }) => {
        // Log richer details to help debugging (message, code, stack)
        const message = err && err.message ? err.message : String(err)
        console.error('[socket-context] Socket connection error:', {
          message,
          code: (err as any)?.code,
          stack: (err as any)?.stack,
        });
        setError(message ?? String(err));
        setIsConnected(false);

        // If we get repeated websocket/xhr failures, disable realtime and stop retrying
        connectErrorCount += 1
        const isTransportError = /websocket|xhr|poll/i.test(message || '')
        if (isTransportError && connectErrorCount >= 2 && !realtimeDisabled) {
          realtimeDisabled = true
          console.warn('[socket-context] disabling realtime after repeated transport errors; falling back to HTTP polling')
          try {
            // Stop attempts to reconnect
            if (socketInstance.connected) socketInstance.disconnect()
            // Clear repeated reconnect attempts by clearing the interval below
            if (interval) {
              clearInterval(interval)
              interval = null
            }
            // Remove socket from context so components fall back to polling
            setSocket(null)
          } catch (e) {
            // ignore
          }
        }
      };

      socketInstance.on('connect', handleConnect);
      socketInstance.on('disconnect', handleDisconnect);
      socketInstance.on('connect_error', handleConnectError);

      const tryConnectWithToken = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            console.log('[socket-context] no token available, skipping socket connection');
            return; // Do not connect without auth; server will reject unauthenticated sockets
          }
          socketInstance.auth = { token };
          if (!socketInstance.connected) {
            console.log('[socket-context] attempting to connect with token');
            socketInstance.connect();
          }
        } catch (err) {
          console.error('[socket-context] error in tryConnectWithToken:', err);
        }
      };

      setSocket(socketInstance);
      // Attempt initial connect only if token exists
      tryConnectWithToken();
      // Periodically attempt reconnect if we have a token and are not connected
      interval = setInterval(tryConnectWithToken, 10000);

      return () => {
        console.log('[socket-context] cleaning up socket');
        clearInterval(interval);
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
        socketInstance.off('connect_error', handleConnectError);
        if (socketInstance.connected) {
          socketInstance.disconnect();
        }
      };
    } catch (err) {
      console.error('[socket-context] Error creating socket:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to create socket connection';
      setError(errorMsg);
      setSocket(null); // Ensure socket is null on creation failure
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
}

// Custom hook to use the socket context
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}