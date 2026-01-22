import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Platform, StatusBar, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.100:5001/api';

export default function ProfileRider() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState(0);
  const [completedRides, setCompletedRides] = useState(0);
  const [pendingRides, setPendingRides] = useState(0);
  const [cancelledRides, setCancelledRides] = useState(0);
  const [loading, setLoading] = useState(true);
  const [driverInfo, setDriverInfo] = useState(null);

  // Fetch wallet and ride data
  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      // Fetch wallet data
      try {
        const walletResponse = await axios.get(`${API_BASE_URL}/wallet`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWalletBalance(walletResponse.data?.balance || walletResponse.data?.amount || 0);
      } catch (walletError) {
        console.log('Wallet fetch error:', walletError.message);
      }

      // Fetch ride statistics
      try {
        const ridesResponse = await axios.get(`${API_BASE_URL}/rides/my-rides`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const rides = ridesResponse.data || [];
        const completed = rides.filter(r => r.status === 'completed').length;
        const pending = rides.filter(r => r.status === 'accepted').length;
        const cancelled = rides.filter(r => r.status === 'cancelled').length;
        
        setCompletedRides(completed);
        setPendingRides(pending);
        setCancelledRides(cancelled);
      } catch (ridesError) {
        console.log('Rides fetch error:', ridesError.message);
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refetch when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchDriverData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Image 
            source={require('../assets/images/eyytrike1.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={() => router.push('/menurider')}>
            <Ionicons name="menu" size={24} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Loading your data...</Text>
          </View>
        ) : (
          <>
            {/* Statistics Grid */}
            <View style={styles.statsGrid}>
              {/* Total Earning */}
              <View style={styles.statsCard}>
                <Text style={styles.statsValue}>₱{walletBalance.toFixed(2)}</Text>
                <View style={styles.statsIconContainer}>
                  <Ionicons name="wallet-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.statsLabel}>Total{'\n'}Earning</Text>
              </View>

              {/* Complete Ride */}
              <View style={styles.statsCard}>
                <Text style={styles.statsValue}>{completedRides}</Text>
                <View style={styles.statsIconContainer}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.statsLabel}>Complete{'\n'}Ride</Text>
              </View>

              {/* Pending Ride */}
              <View style={styles.statsCard}>
                <Text style={styles.statsValue}>{pendingRides}</Text>
                <View style={styles.statsIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.statsLabel}>Pending{'\n'}Ride</Text>
              </View>

              {/* Cancel Ride */}
              <View style={styles.statsCard}>
                <Text style={styles.statsValue}>{cancelledRides}</Text>
                <View style={styles.statsIconContainer}>
                  <Ionicons name="close-circle-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.statsLabel}>Cancel{'\n'}Ride</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Link href="/dashboardrider" style={[styles.navItem, styles.inactiveNavItem]}>
          <Ionicons name="home" size={24} color="#004D00" style={styles.inactiveIcon} />
        </Link>
        <Link href="/historyrider" style={[styles.navItem, styles.inactiveNavItem]}>
          <Ionicons name="time" size={24} color="#004D00" style={styles.inactiveIcon} />
        </Link>
        <Link href="/profilerider" style={styles.navItem}>
          <Ionicons name="person" size={24} color="#004D00" />
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d4217',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#0d4217',
    padding: 16,
  },
  logo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingLeft: 10,
  },
  logoImage: {
    width: 120,
    height: 32,
    marginLeft: -20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statsCard: {
    width: '48%',
    backgroundColor: '#083010',
    borderRadius: 8,
    padding: 16,
    alignItems: 'flex-start',
    marginBottom: 10,
    height: 120,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statsIconContainer: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 8,
    marginBottom: 8,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#bed2d0',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
    padding: 10,
  },
  inactiveNavItem: {
    opacity: 0.7,
  },
  inactiveIcon: {
    opacity: 0.7,
  },
}); 