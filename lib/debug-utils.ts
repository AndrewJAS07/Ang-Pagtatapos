import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * Debug utilities for troubleshooting crash issues
 * Import and call in a debug screen to diagnose problems
 */

export const DebugUtils = {
  /**
   * Check if user is properly authenticated
   */
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;

      const auth = {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        hasUser: !!userData,
        userId: userData?._id,
        userRole: userData?.role,
        userEmail: userData?.email,
      };

      console.log('[DebugUtils] Auth Status:', auth);
      return auth;
    } catch (err) {
      console.error('[DebugUtils] Error checking auth:', err);
      throw err;
    }
  },

  /**
   * Check last errors stored
   */
  checkErrors: async () => {
    try {
      const jsError = await AsyncStorage.getItem('last_js_error');
      const boundaryError = await AsyncStorage.getItem('last_boundary_error');

      const errors = {
        jsError: jsError ? JSON.parse(jsError) : null,
        boundaryError: boundaryError ? JSON.parse(boundaryError) : null,
      };

      console.log('[DebugUtils] Stored Errors:', errors);
      return errors;
    } catch (err) {
      console.error('[DebugUtils] Error checking errors:', err);
      throw err;
    }
  },

  /**
   * Clear all stored errors
   */
  clearErrors: async () => {
    try {
      await AsyncStorage.removeItem('last_js_error');
      await AsyncStorage.removeItem('last_boundary_error');
      console.log('[DebugUtils] Errors cleared');
    } catch (err) {
      console.error('[DebugUtils] Error clearing errors:', err);
      throw err;
    }
  },

  /**
   * Get all AsyncStorage keys and values (privacy warning)
   */
  getAllStorageData: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data: Record<string, any> = {};

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        try {
          data[key] = JSON.parse(value || '');
        } catch {
          data[key] = value;
        }
      }

      console.log('[DebugUtils] All Storage Data:', data);
      return data;
    } catch (err) {
      console.error('[DebugUtils] Error getting storage data:', err);
      throw err;
    }
  },

  /**
   * Show diagnostic alert with current status
   */
  showDiagnostic: async () => {
    try {
      const auth = await DebugUtils.checkAuth();
      const errors = await DebugUtils.checkErrors();

      let message = '=== DIAGNOSTIC REPORT ===\n\n';
      message += `Authentication:\n`;
      message += `  Token: ${auth.hasToken ? '✓' : '✗'}\n`;
      message += `  User: ${auth.hasUser ? '✓' : '✗'}\n`;
      message += `  Role: ${auth.userRole || 'N/A'}\n\n`;

      message += `Errors:\n`;
      message += `  JS Error: ${errors.jsError ? '✓ Found' : '✗ None'}\n`;
      message += `  Boundary Error: ${errors.boundaryError ? '✓ Found' : '✗ None'}\n`;

      if (errors.jsError) {
        message += `\nLatest JS Error:\n${errors.jsError.message}\n`;
      }
      if (errors.boundaryError) {
        message += `\nLatest Boundary Error:\n${errors.boundaryError.message}\n`;
      }

      Alert.alert('Diagnostic Report', message);
    } catch (err) {
      Alert.alert('Error', `Failed to get diagnostic: ${err instanceof Error ? err.message : String(err)}`);
    }
  },

  /**
   * Reset app to login state
   */
  resetToLogin: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('pushToken');
      await DebugUtils.clearErrors();
      console.log('[DebugUtils] App reset to login state');
      Alert.alert('Success', 'App has been reset. Please close and reopen the app.');
    } catch (err) {
      Alert.alert('Error', `Failed to reset: ${err instanceof Error ? err.message : String(err)}`);
    }
  },

  /**
   * Test API connection
   */
  testAPIConnection: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please login first.');
        return;
      }

      const api = (await import('../lib/api')).default;
      console.log('[DebugUtils] Testing API connection...');

      try {
        const response = await api.get('/auth/me');
        console.log('[DebugUtils] API test successful:', response.data);
        Alert.alert('Success', 'API connection is working!');
      } catch (apiError) {
        console.error('[DebugUtils] API test failed:', apiError);
        Alert.alert(
          'API Error',
          apiError instanceof Error ? apiError.message : String(apiError)
        );
      }
    } catch (err) {
      console.error('[DebugUtils] Error in testAPIConnection:', err);
    }
  },

  /**
   * Log all current status information
   */
  logFullStatus: async () => {
    try {
      console.log('=== FULL DEBUG STATUS ===');
      const auth = await DebugUtils.checkAuth();
      const errors = await DebugUtils.checkErrors();

      console.log('[DebugUtils] Auth:', auth);
      console.log('[DebugUtils] Errors:', errors);

      // Try to get app config
      try {
        const config = (await import('../lib/config')).config;
        console.log('[DebugUtils] Config:', config);
      } catch (e) {
        console.log('[DebugUtils] Could not load config');
      }

      console.log('=== END DEBUG STATUS ===');
    } catch (err) {
      console.error('[DebugUtils] Error logging status:', err);
    }
  },
};

/**
 * Example usage in a debug screen component:
 * 
 * import { DebugUtils } from '../../lib/debug-utils';
 * 
 * export default function DebugScreen() {
 *   return (
 *     <View>
 *       <Button
 *         title="Show Diagnostic"
 *         onPress={() => DebugUtils.showDiagnostic()}
 *       />
 *       <Button
 *         title="Reset App"
 *         onPress={() => DebugUtils.resetToLogin()}
 *       />
 *       <Button
 *         title="Test API"
 *         onPress={() => DebugUtils.testAPIConnection()}
 *       />
 *     </View>
 *   );
 * }
 */

export default DebugUtils;
