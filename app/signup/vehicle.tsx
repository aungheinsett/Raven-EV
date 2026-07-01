import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { auth, db } from '../../config/firebase';

const EV_MODELS = [
  'Tesla Model 3', 'Tesla Model Y', 'Tesla Model S', 'Tesla Model X',
  'Nissan Leaf', 'Chevrolet Bolt', 'Hyundai Kona Electric', 'Kia Niro EV',
  'Volkswagen ID.4', 'Ford Mustang Mach-E', 'Audi e-tron', 'BMW i3',
  'BMW i4', 'Mercedes EQC', 'Porsche Taycan', 'Rivian R1T',
  'Rivian R1S', 'Lucid Air', 'Other',
];

export default function VehicleSetup() {
  const [name, setName] = useState('');
  const [car, setCar] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleFinish = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated. Please restart signup.');
      return;
    }
    if (!name.trim() || !car.trim()) {
      Alert.alert('Missing Info', 'Please fill in both fields.');
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: name,
        evModel: car,
        profileCompleted: true,
      });
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Error', 'Could not update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderModalItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setCar(item);
        setModalVisible(false);
      }}
    >
      <Text style={styles.modalItemText}>{item}</Text>
      {car === item && <Ionicons name="checkmark-circle" size={24} color="#b388ff" />}
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#13062b', '#2a1240', '#3d1f56']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          <View style={styles.stepContainer}>
            <View style={[styles.stepDot, styles.stepDone]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, styles.stepDone]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, styles.stepActive]} />
          </View>
          <Text style={styles.stepLabel}>STEP 3 OF 3</Text>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="car-sport-outline" size={42} color="#b388ff" />
            </View>
            <Text style={styles.title}>Almost There!</Text>
            <Text style={styles.subtitle}>Tell us about your EV</Text>
          </View>

          <Animated.View style={[styles.glassCard, { opacity: fadeAnim }]}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#b388ff" />
                <TextInput
                  placeholder="John Doe"
                  style={styles.input}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  onChangeText={setName}
                  value={name}
                />
                {name.length > 0 && (
                  <TouchableOpacity onPress={() => setName('')}>
                    <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.3)" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EV MODEL</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="car-outline" size={20} color="#b388ff" />
                <Text style={[styles.input, car ? styles.inputText : styles.placeholderText]}>
                  {car || 'Select your EV model'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleFinish}
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
                    <Text style={styles.btnText}>FINISH SETUP</Text>
                    <Ionicons name="checkmark-circle" size={22} color="#000" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>Go back and edit</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select EV Model</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={28} color="#FFF" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={EV_MODELS}
                  keyExtractor={(item) => item}
                  renderItem={renderModalItem}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  inputText: { color: '#FFF' },
  placeholderText: { color: 'rgba(255,255,255,0.3)' },
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
  backBtn: { marginTop: 16, alignItems: 'center' },
  backText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2a1240',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalItemText: { color: '#FFF', fontSize: 16 },
});