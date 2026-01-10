import { Platform } from 'react-native';

// Ensure WebSocket is properly configured for React Native
if (Platform.OS !== 'web') {
  try {
    // Try several fallbacks to find a WebSocket implementation that works in this environment
    let WebSocketImpl: any = (global as any).WebSocket || (global as any).window?.WebSocket;

    if (!WebSocketImpl) {
      // Try the commonly exported value from react-native
      try {
        const rn = require('react-native');
        WebSocketImpl = rn.WebSocket || rn.Websocket;
      } catch (e) {
        // ignore
      }
    }

    if (!WebSocketImpl) {
      // Try internal RN path (varies by RN version)
      try {
        // Some RN versions export it under this path
        WebSocketImpl = require('react-native/Libraries/Network/WebSocket');
        WebSocketImpl = WebSocketImpl && (WebSocketImpl.default || WebSocketImpl);
      } catch (e) {
        // ignore
      }
    }

    if (WebSocketImpl) {
      // If the module export is an object with a 'default' (ESModule), use it
      const WebSocket = (WebSocketImpl.default) ? WebSocketImpl.default : WebSocketImpl;

      // Override the global WebSocket if not already set
      if (typeof (global as any).WebSocket === 'undefined') {
        (global as any).WebSocket = WebSocket;
      }

      // Add WebSocket constants first (ensure they exist)
      try {
        (global as any).WebSocket.CONNECTING = (global as any).WebSocket.CONNECTING ?? 0;
        (global as any).WebSocket.OPEN = (global as any).WebSocket.OPEN ?? 1;
        (global as any).WebSocket.CLOSING = (global as any).WebSocket.CLOSING ?? 2;
        (global as any).WebSocket.CLOSED = (global as any).WebSocket.CLOSED ?? 3;
      } catch (e) {
        // ignore
      }

      // Safely add prototype properties if available
      const prototype = (global as any).WebSocket?.prototype;
      if (prototype) {
        if (!('binaryType' in prototype)) {
          Object.defineProperty(prototype, 'binaryType', {
            get: function() {
              return this._binaryType || 'blob';
            },
            set: function(value) {
              this._binaryType = value;
            }
          });
        }

        if (!('readyState' in prototype)) {
          Object.defineProperty(prototype, 'readyState', {
            get: function() {
              return this._readyState || (global as any).WebSocket.CONNECTING;
            }
          });
        }
      }
    }
  } catch (error) {
    console.warn('WebSocket polyfill initialization failed:', error);
  }
}

export {}; 