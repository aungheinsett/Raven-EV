import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { addDoc, collection, doc, increment, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { auth, db } from '../../config/firebase';

export default function PaymentScreen() {
  const [loading, setLoading] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [scannedName, setScannedName] = useState('');
  const [permission, requestPermission] = useCameraPermissions();

  const quickAmounts = [50, 100, 200, 500];

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScannedName(data);
    setScannerVisible(false);
    Alert.alert('Scanner Linked', `Connected to: ${data}`);
  };

  const calculatePoints = (amt: number) => Math.floor(amt / 10);

  const handleConfirmAndPay = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Not Logged In', 'Please log in first.');
      return;
    }

    if (!scannedName) {
      Alert.alert('No Station', 'Please scan a QR code first.');
      return;
    }

    setLoading(true);
    try {
      const pointsEarned = calculatePoints(numAmount);

      await updateDoc(doc(db, 'users', user.uid), {
        greenPoints: increment(pointsEarned),
      });

      await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        amount: numAmount,
        station: scannedName,
        pointsEarned,
        timestamp: new Date().toISOString(),
      });

      const upiUrl = `upi://pay?pa=sai.aung@paytm&pn=${encodeURIComponent(scannedName)}&am=${numAmount}&cu=INR`;
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
      } else {
        Alert.alert('UPI Not Supported', 'Please install a UPI app.');
      }

      Alert.alert(
        'Payment Initiated',
        `₹${numAmount} to ${scannedName}\nYou earned ${pointsEarned} Green Points!`
      );
      setAmount('');
      setScannedName('');
    } catch (err) {
      Alert.alert('Error', 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!permission?.granted && scannerVisible) {
    requestPermission();
  }

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>⚡ EV SETTLEMENT</Text>
            <TouchableOpacity onPress={() => setScannerVisible(true)} style={styles.scanBtn}>
              <Ionicons name="qr-code-outline" size={24} color="#8B5CF6" />
              <Text style={styles.scanText}>SCAN HUB</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.accountBox}>
            <Text style={styles.accountLabel}>CONNECTED STATION</Text>
            <Text style={styles.accountName}>
              {scannedName || 'Please Scan QR Code'}
            </Text>
            {scannedName ? (
              <TouchableOpacity style={styles.clearStation} onPress={() => setScannedName('')}>
                <Ionicons name="close-circle" size={20} color="#FF5252" />
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.cardLabel}>💰 ENTER AMOUNT</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currency}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.quickRow}>
              {quickAmounts.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.quickBtn, parseFloat(amount) === val && styles.quickBtnActive]}
                  onPress={() => setAmount(val.toString())}
                >
                  <Text style={[styles.quickText, parseFloat(amount) === val && styles.quickTextActive]}>
                    ₹{val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {amount ? (
              <Text style={styles.pointsHint}>
                You will earn {calculatePoints(parseFloat(amount))} Green Points
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.payBtn, { opacity: scannedName && amount ? 1 : 0.5 }]}
            onPress={handleConfirmAndPay}
            disabled={loading || !scannedName || !amount}
          >
            {loading ? (
              <ActivityIndicator color="#0F0C29" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.payBtnText}>CONFIRM & PAY</Text>
                <Ionicons name="arrow-forward" size={20} color="#0F0C29" />
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={scannerVisible} animationType="slide">
        <View style={styles.scannerModal}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
          <View style={styles.scanOverlay}>
            <View style={styles.scanTarget} />
            <Text style={styles.scanPrompt}>Align QR code with the frame</Text>
          </View>
          <TouchableOpacity style={styles.closeScanner} onPress={() => setScannerVisible(false)}>
            <Ionicons name="close-circle" size={70} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingTop: 60, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 3,
    opacity: 0.6,
  },
  scanBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scanText: {
    color: '#8B5CF6',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
  },
  accountBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  accountLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  accountName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },
  clearStation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  clearText: {
    color: '#FF5252',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  priceCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 30,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 30,
  },
  cardLabel: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  currency: {
    color: 'white',
    fontSize: 32,
    fontWeight: '300',
    marginRight: 10,
  },
  amountInput: {
    color: 'white',
    fontSize: 60,
    fontWeight: 'bold',
    minWidth: 100,
    textAlign: 'center',
    padding: 0,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickBtnActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  quickText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  quickTextActive: {
    color: '#0F0C29',
  },
  pointsHint: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 20,
    textAlign: 'center',
  },
  payBtn: {
    backgroundColor: '#8B5CF6',
    height: 70,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  payBtnText: {
    color: '#0F0C29',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scannerModal: { flex: 1, backgroundColor: 'black' },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanTarget: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 30,
  },
  scanPrompt: {
    color: 'white',
    marginTop: 20,
    fontSize: 14,
    opacity: 0.8,
  },
  closeScanner: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
});