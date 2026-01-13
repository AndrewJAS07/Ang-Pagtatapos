import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    
    // Store error for debugging
    const payload = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      time: new Date().toISOString(),
    };
    
    AsyncStorage.setItem('last_boundary_error', JSON.stringify(payload)).catch((err) => {
      console.error('[ErrorBoundary] Failed to store error:', err);
    });

    this.setState({
      errorInfo: errorInfo.componentStack,
    });
  }

  handleReset = async () => {
    try {
      // Optionally clear user data and return to login
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (e) {
      console.error('[ErrorBoundary] Error clearing storage:', e);
    }

    // Reset error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Reload the app
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <Text style={styles.title}>⚠️ Something went wrong</Text>
            
            <View style={styles.errorBox}>
              <Text style={styles.errorLabel}>Error Message:</Text>
              <Text style={styles.errorText}>{this.state.error?.message}</Text>
            </View>

            {this.state.errorInfo && (
              <View style={styles.errorBox}>
                <Text style={styles.errorLabel}>Component Stack:</Text>
                <Text style={styles.stackText}>{this.state.errorInfo}</Text>
              </View>
            )}

            <View style={styles.debugInfo}>
              <Text style={styles.debugLabel}>Debug Info:</Text>
              <Text style={styles.debugText}>
                An unexpected error occurred. Please try the following:
              </Text>
              <Text style={styles.debugText}>1. Tap "Try Again" to retry</Text>
              <Text style={styles.debugText}>2. If the error persists, restart the app</Text>
              <Text style={styles.debugText}>3. Check your internet connection</Text>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.retryButton} onPress={this.handleReset}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B4619',
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  stackText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    maxHeight: 150,
  },
  debugInfo: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
    padding: 16,
    borderRadius: 8,
  },
  debugLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.2)',
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#0B4619',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
