import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../config/firebase';

export default function AccountSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNext = async () => {
    if (password.length < 6) {
      Alert.alert('Security', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCred.user.uid), {
        email: email,
        greenPoints: 0,
        profileCompleted: false,
        createdAt: new Date().toISOString(),
      });
      router.push('/signup/verify');
    } catch (error: any) {
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#4716a4', '#2a1240', '#3d1f56']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Step Indicator */}
          <View style={styles.stepContainer}>
            <View style={[styles.stepDot, styles.stepActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>
          <Text style={styles.stepLabel}>STEP 1 OF 3</Text>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="rocket-outline" size={42} color="#b388ff" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the EV revolution</Text>
          </View>

          <Animated.View style={[styles.glassCard, { opacity: fadeAnim }]}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#b388ff" />
                <TextInput
                  placeholder="you@example.com"
                  style={styles.input}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {email.length > 0 && (
                  <TouchableOpacity onPress={() => setEmail('')}>
                    <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.3)" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#b388ff" />
                <TextInput
                  placeholder="••••••••"
                  style={styles.input}
                  secureTextEntry
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  onChangeText={setPassword}
                />
              </View>
              <Text style={styles.passwordHint}>Minimum 6 characters</Text>
            </View>

            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleNext}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#b388ff', '#7c4dff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={styles.btnText}>CONTINUE</Text>
                    <Ionicons name="arrow-forward" size={20} color="#000" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>
                Already a member? <Text style={styles.highlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>

            <Text style={styles.terms}>
              By continuing you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  stepActive: {
    backgroundColor: '#b388ff',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 2,
  },
  stepLabel: {
    color: '#b388ff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: { alignItems: 'center', marginBottom: 30 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(179,136,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(179,136,255,0.3)',
  },
  title: { color: '#FFF', fontSize: 28, fontWeight: '700', letterSpacing: 0.5 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 },
  glassCard: {
    backgroundColor: 'rgba(90, 32, 32, 0.04)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#b388ff',
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  inputGroup: { marginBottom: 18 },
  label: {
    color: '#b388ff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  input: {
    flex: 1,
    color: '#FFF',
    marginLeft: 12,
    fontSize: 16,
    paddingVertical: 10,
  },
  passwordHint: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  mainButton: { marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  gradientBtn: { height: 54, justifyContent: 'center', alignItems: 'center' },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1.2,
    marginRight: 8,
  },
  backBtn: { marginTop: 20, alignItems: 'center' },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  highlight: { color: '#b388ff', fontWeight: '600' },
  terms: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
  termsLink: { color: '#b388ff', textDecorationLine: 'underline' },
});