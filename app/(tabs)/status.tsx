import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, increment, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../../config/firebase';

const { width } = Dimensions.get('window');

const CAR_IMAGES: { [key: string]: any } = {
  TATA: require('../../assets/images/tata1.png'),
  Other: require('../../assets/images/mgev.png'),
};

export default function StatusScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Listen to Firestore updates
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Not logged in', 'Please sign in first.');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          const docData = snap.data();
          // Ensure fields exist (if not, set defaults)
          if (docData.batteryLevel === undefined || docData.isCharging === undefined) {
            // Initialize missing fields
            updateDoc(doc(db, 'users', user.uid), {
              batteryLevel: 0,
              isCharging: false,
            }).catch((err) => console.warn('Init fields error:', err));
          }
          setData(docData);
        } else {
          // Document doesn't exist – create it with defaults
          setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            greenPoints: 0,
            profileCompleted: false,
            createdAt: new Date().toISOString(),
            batteryLevel: 0,
            isCharging: false,
          }).catch((err) => console.warn('Create doc error:', err));
        }
        setLoading(false);
      },
      (error) => {
        console.error('Snapshot error:', error);
        Alert.alert('Error', 'Failed to load status. Check your internet.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Manage charging interval based on Firestore state
  useEffect(() => {
    const isActive = data?.isCharging || false;
    const battery = data?.batteryLevel || 0;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Start charging if active and battery < 100
    if (isActive && battery < 100) {
      intervalRef.current = setInterval(async () => {
        const user = auth.currentUser;
        if (!user) {
          console.warn('No user, cannot update battery.');
          return;
        }

        try {
          // Increment battery by 1%
          await updateDoc(doc(db, 'users', user.uid), {
            batteryLevel: increment(1),
          });
          console.log(`Battery +1% → ${battery + 1}%`);
        } catch (error) {
          console.error('Failed to update battery:', error);
          // Stop interval on error to avoid endless retries
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          Alert.alert('Update Error', 'Could not increase battery. Check Firebase permissions.');
        }
      }, 2000);
    }

    // If battery reached 100, stop charging automatically
    if (isActive && battery >= 100) {
      stopCharging();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [data?.isCharging, data?.batteryLevel]);

  // Pulse animation for glow
  useEffect(() => {
    if (data?.isCharging) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [data?.isCharging]);

  // --- CHARGE CONTROL FUNCTIONS ---
  const startCharging = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }

    try {
      // If battery is 100, reset to 0 for demo fun
      const currentBattery = data?.batteryLevel || 0;
      await updateDoc(doc(db, 'users', user.uid), {
        isCharging: true,
        batteryLevel: currentBattery >= 100 ? 0 : currentBattery,
      });
      console.log('Charging started.');
    } catch (error) {
      console.error('Start charging error:', error);
      Alert.alert('Start Failed', 'Could not start charging. Check permissions.');
    }
  };

  const stopCharging = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isCharging: false,
      });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      console.log('Charging stopped.');
    } catch (error) {
      console.error('Stop charging error:', error);
      Alert.alert('Stop Failed', 'Could not stop charging. Check permissions.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#8B5CF6" size="large" />
      </View>
    );
  }

  const isActive = data?.isCharging || false;
  const currentModel = data?.evModel || 'Other';
  const batteryLevel = data?.batteryLevel || 0;

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.topLabel}>⚡ RAVEN EV CONNECT</Text>
            <Text style={styles.carTitle}>{isActive ? '⚡ CHARGING' : '🔌 STANDBY'}</Text>
          </View>
          <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
            <Ionicons name="flash" size={24} color={isActive ? '#8B5CF6' : '#555'} />
          </View>
        </View>

        {/* Car Image with Glow */}
        <View style={styles.carContainer}>
          {isActive && (
            <Animated.View
              style={[
                styles.glowSpot,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.5)', 'transparent']}
                style={styles.glowFill}
              />
            </Animated.View>
          )}

          <Image
            source={CAR_IMAGES[currentModel] || CAR_IMAGES['Other']}
            style={styles.carImage}
            resizeMode="contain"
          />

          <LinearGradient colors={['#0F0C29', 'transparent']} style={styles.maskTop} />
          <LinearGradient colors={['transparent', '#24243E']} style={styles.maskBottom} />
        </View>

        {/* Battery Status Card */}
        <View style={styles.glassCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.glassLabel}>🔋 BATTERY</Text>
            <Text style={styles.glassValue}>{batteryLevel}%</Text>
          </View>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${batteryLevel}%`,
                  backgroundColor: isActive ? '#8B5CF6' : '#444',
                },
              ]}
            />
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusText}>
              {isActive ? '⚡ Fast Charging Active' : '🔌 Connect charger to start'}
            </Text>
            {isActive && (
              <View style={styles.liveDot}>
                <View style={styles.liveDotInner} />
              </View>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.miniGlass}>
            <Ionicons name="speedometer-outline" size={22} color="#8B5CF6" />
            <Text style={styles.miniLabel}>Range</Text>
            <Text style={styles.miniValue}>{isActive ? `${Math.round(batteryLevel * 3.2)} km` : '--'}</Text>
          </View>

          <View style={styles.miniGlass}>
            <Ionicons name="thermometer-outline" size={22} color="#8B5CF6" />
            <Text style={styles.miniLabel}>Temp</Text>
            <Text style={styles.miniValue}>{isActive ? '24°C' : '--'}</Text>
          </View>

          <View style={styles.miniGlass}>
            <Ionicons name="time-outline" size={22} color="#8B5CF6" />
            <Text style={styles.miniLabel}>Charge Time</Text>
            <Text style={styles.miniValue}>
              {isActive ? `${Math.max(0, Math.ceil((100 - batteryLevel) / 0.5))} min` : '--'}
            </Text>
          </View>
        </View>

        {/* Eco Stats */}
        <View style={styles.ecoCard}>
          <Ionicons name="leaf-outline" size={24} color="#8B5CF6" />
          <Text style={styles.ecoText}>
            CO₂ Saved: <Text style={styles.ecoValue}>{(batteryLevel * 0.165).toFixed(1)} kg</Text>
          </Text>
          <Text style={styles.ecoSubtext}>This session</Text>
        </View>

        {/* --- CHARGE CONTROL BUTTON --- */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.chargeBtn, isActive ? styles.stopBtn : styles.startBtn]}
            onPress={isActive ? stopCharging : startCharging}
          >
            <Ionicons
              name={isActive ? 'power-outline' : 'flash-outline'}
              size={24}
              color={isActive ? '#FF5252' : '#FFF'}
            />
            <Text style={styles.chargeBtnText}>
              {isActive ? 'STOP CHARGING' : 'START CHARGING'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, backgroundColor: '#0F0C29', justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  topLabel: {
    color: '#8B5CF6',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  carTitle: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 4,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCircleActive: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },

  carContainer: {
    alignItems: 'center',
    height: 260,
    justifyContent: 'center',
    marginVertical: 10,
  },
  carImage: {
    width: width * 0.95,
    height: 220,
    zIndex: 5,
  },
  glowSpot: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  glowFill: {
    width: 240,
    height: 70,
    borderRadius: 120,
    transform: [{ scaleX: 1.5 }],
  },
  maskTop: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 60,
    zIndex: 10,
  },
  maskBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
    zIndex: 10,
  },

  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 30,
    padding: 25,
    marginHorizontal: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  glassValue: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    marginVertical: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '500',
  },
  liveDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    marginBottom: 20,
    gap: 10,
  },
  miniGlass: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  miniLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
  },
  miniValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },

  ecoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    marginHorizontal: 25,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 20,
  },
  ecoText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  ecoValue: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  ecoSubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },

  buttonContainer: {
    paddingHorizontal: 25,
    marginTop: 5,
  },
  chargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startBtn: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
  },
  stopBtn: {
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
    borderWidth: 2,
    borderColor: '#FF5252',
    shadowColor: '#FF5252',
  },
  chargeBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});