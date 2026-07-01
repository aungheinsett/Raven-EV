import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
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

export default function VerifySignup() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationStep, setVerificationStep] = useState<'email' | 'phone'>('email');
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValidIndianPhone = (val: string) => /^[6-9]\d{9}$/.test(val.replace(/\s/g, ''));

  const handleVerify = () => {
    if (verificationStep === 'email') {
      if (isValidEmail(email)) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setVerificationStep('phone');
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });
      } else {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      }
    } else {
      if (isValidIndianPhone(phone)) {
        router.push('/signup/vehicle');
      } else {
        Alert.alert('Invalid Phone', 'Enter a valid 10-digit mobile number.');
      }
    }
  };

  return (
    <LinearGradient colors={['#13062b', '#2a1240', '#3d1f56']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.content}>
          <View style={styles.stepContainer}>
            <View style={[styles.stepDot, styles.stepDone]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, styles.stepActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>
          <Text style={styles.stepLabel}>STEP 2 OF 3</Text>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={verificationStep === 'email' ? 'mail-unread-outline' : 'call-outline'}
                size={40}
                color="#b388ff"
              />
            </View>
            <Text style={styles.title}>
              {verificationStep === 'email' ? 'Verify Email' : 'Verify Phone'}
            </Text>
            <Text style={styles.subtitle}>
              {verificationStep === 'email'
                ? "We'll send a code to this address"
                : 'Enter your mobile number for OTP'}
            </Text>
          </View>

          <Animated.View style={[styles.glassCard, { opacity: fadeAnim }]}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {verificationStep === 'email' ? 'EMAIL ADDRESS' : 'MOBILE NUMBER'}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name={verificationStep === 'email' ? 'mail-outline' : 'call-outline'}
                  size={20}
                  color="#b388ff"
                />
                <TextInput
                  placeholder={verificationStep === 'email' ? 'you@example.com' : '98765 43210'}
                  style={styles.input}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType={verificationStep === 'email' ? 'email-address' : 'phone-pad'}
                  value={verificationStep === 'email' ? email : phone}
                  onChangeText={verificationStep === 'email' ? setEmail : setPhone}
                />
                {(verificationStep === 'email' ? email : phone).length > 0 && (
                  <TouchableOpacity
                    onPress={() =>
                      verificationStep === 'email' ? setEmail('') : setPhone('')
                    }
                  >
                    <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.3)" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleVerify}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#b388ff', '#7c4dff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                <Text style={styles.btnText}>
                  {verificationStep === 'email' ? 'SEND CODE' : 'VERIFY & CONTINUE'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {verificationStep === 'phone' && (
              <TouchableOpacity
                onPress={() => {
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  }).start(() => {
                    setVerificationStep('email');
                    Animated.timing(fadeAnim, {
                      toValue: 1,
                      duration: 200,
                      useNativeDriver: true,
                    }).start();
                  });
                }}
                style={styles.backLink}
              >
                <Text style={styles.backLinkText}>
                  <Ionicons name="arrow-back" size={14} color="#b388ff" /> Change Email
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider} />
            <Text style={styles.resendHint}>
              {verificationStep === 'email'
                ? 'Make sure you have access to this email'
                : "We'll send a 6-digit OTP via SMS"}
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
  stepDone: {
    backgroundColor: '#b388ff',
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
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
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
  mainButton: { marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  gradientBtn: { height: 54, justifyContent: 'center', alignItems: 'center' },
  btnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1.2,
  },
  backLink: { marginTop: 16, alignItems: 'center' },
  backLinkText: { color: '#b388ff', fontSize: 14, fontWeight: '500' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 16,
  },
  resendHint: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    textAlign: 'center',
  },
});