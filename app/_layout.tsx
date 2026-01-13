import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../lib/AuthContext';
import { SocketProvider } from '../lib/socket-context';
import { NotificationsProvider } from '../lib/notifications-context';
import { ErrorBoundary } from '../components/ErrorBoundary';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import Constants from 'expo-constants';
import React from 'react';

// Import polyfills first
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import '../lib/polyfills';

function RootLayout() {
  const colorScheme = useColorScheme();
  React.useEffect(() => {
    (async () => {
      // Skip remote push token registration in Expo Go; only supports development builds
      if ((Constants as any).executionEnvironment === 'storeClient') {
        return;
      }
      const { status } = await Notifications.getPermissionsAsync();
      let granted = status === 'granted';
      if (!granted) {
        const req = await Notifications.requestPermissionsAsync();
        granted = req.status === 'granted';
      }
      if (granted) {
        try {
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          try { await api.post('/notifications/push-token', { token }); } catch {}
          await AsyncStorage.setItem('pushToken', token);
        } catch {}
      }
    })();
  }, []);

  // Global JS error handler - captures uncaught JS errors and saves for inspection
  React.useEffect(() => {
    try {
      const prevHandler = (global as any).ErrorUtils && (global as any).ErrorUtils.getGlobalHandler && (global as any).ErrorUtils.getGlobalHandler();
      const handler = (error: any, isFatal?: boolean) => {
        try {
          const payload = { message: error?.message, stack: error?.stack, isFatal: !!isFatal, time: new Date().toISOString() };
          AsyncStorage.setItem('last_js_error', JSON.stringify(payload));
          console.error('[GlobalErrorHandler]', payload);
        } catch (e) {
          console.error('[GlobalErrorHandler] failed to persist', e);
        }
        if (typeof prevHandler === 'function') {
          try { prevHandler(error, isFatal); } catch(e) { console.error('prevHandler error', e); }
        }
      };
      if ((global as any).ErrorUtils && (global as any).ErrorUtils.setGlobalHandler) {
        (global as any).ErrorUtils.setGlobalHandler(handler);
      }

      (async () => {
        const last = await AsyncStorage.getItem('last_js_error');
        if (last) {
          console.warn('[Recovered last_js_error]', last);
          // leave it in storage for now so you can retrieve it via logs or UI
        }
      })();

      return () => {
        if ((global as any).ErrorUtils && (global as any).ErrorUtils.setGlobalHandler) {
          try { (global as any).ErrorUtils.setGlobalHandler(prevHandler); } catch {}
        }
      };
    } catch (e) { console.error('Failed to set global error handler', e); }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <NotificationsProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <SafeAreaProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: {
                      backgroundColor: '#0B4619',
                    },
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(commuter)" />
                  <Stack.Screen name="(driver)" />
                  <Stack.Screen name="locationcommuter" />
                  <Stack.Screen name="otpcommuter" />
                  <Stack.Screen name="otprider" />
                  <Stack.Screen name="waitingcommuter" />
                  <Stack.Screen name="forgot-password" />
                  <Stack.Screen name="PaymentWebView" />
                  <Stack.Screen name="TopUpScreen" />
                </Stack>
              </SafeAreaProvider>
            </GestureHandlerRootView>
          </NotificationsProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default RootLayout;
