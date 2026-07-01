import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../config/firebase';

interface Transaction {
  id: string;
  type: 'expense' | 'exchange';
  amount: number;
  description: string;
  date: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [greenPointsToExchange, setGreenPointsToExchange] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'expense',
      amount: -250,
      description: 'Charging at EV Station',
      date: '2024-04-15',
    },
    {
      id: '2',
      type: 'expense',
      amount: -500,
      description: 'Route Planning Service',
      date: '2024-04-14',
    },
    {
      id: '3',
      type: 'exchange',
      amount: 100,
      description: 'Green Points Exchanged',
      date: '2024-04-13',
    },
    {
      id: '4',
      type: 'expense',
      amount: -150,
      description: 'Monthly Subscription',
      date: '2024-04-12',
    },
  ]);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            setUserData(snap.data());
          }
        }
      } catch (e) {
        console.error('Profile Fetch Error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/signup/account');
    } catch (e) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleExchange = async () => {
    const points = parseInt(greenPointsToExchange);
    if (!points || points <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number of green points');
      return;
    }

    if (points > (userData?.greenPoints || 0)) {
      Alert.alert('Insufficient Points', "You don't have enough green points");
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const rupees = points;
        const newPoints = (userData?.greenPoints || 0) - points;
        const newBalance = (userData?.digitalRupees || 0) + rupees;

        await setDoc(
          doc(db, 'users', user.uid),
          {
            ...userData,
            greenPoints: newPoints,
            digitalRupees: newBalance,
          },
          { merge: true }
        );

        setUserData({
          ...userData,
          greenPoints: newPoints,
          digitalRupees: newBalance,
        });

        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'exchange',
          amount: rupees,
          description: `${points} Green Points → ₹${rupees}`,
          date: new Date().toISOString().split('T')[0],
        };
        setTransactions([newTransaction, ...transactions]);

        setShowExchangeModal(false);
        setGreenPointsToExchange('');
        Alert.alert('Success', `Exchanged ${points} points for ₹${rupees}`);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to exchange points');
    }
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.displayName?.charAt(0).toUpperCase() || 'R'}
            </Text>
          </View>
          <Text style={styles.name}>{userData?.displayName || 'RAVEN EV User'}</Text>
          <Text style={styles.car}>🚘 {userData?.evModel || 'No Vehicle Linked'}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Green Points</Text>
            <Text style={styles.statValue}>{userData?.greenPoints || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Digital Rupees</Text>
            <Text style={styles.statValue}>₹{userData?.digitalRupees || 0}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.exchangeBtn}
          onPress={() => setShowExchangeModal(true)}
        >
          <Ionicons name="swap-horizontal" size={22} color="#FFF" />
          <Text style={styles.exchangeBtnText}>Exchange Green Points</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="card-outline" size={22} color="#8B5CF6" />
            <Text style={styles.menuText}>Payment Methods</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B5CF6" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FF5252" />
            <Text style={styles.logoutText}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={20} color="#FF5252" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Transaction History</Text>
        <View style={styles.transactionContainer}>
          {transactions.map((txn) => (
            <TouchableOpacity
              key={txn.id}
              style={styles.transactionItem}
              onPress={() =>
                Alert.alert(
                  txn.description,
                  `Amount: ${txn.type === 'expense' ? '-' : '+'}₹${Math.abs(txn.amount)}\nDate: ${txn.date}`
                )
              }
            >
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={txn.type === 'expense' ? 'arrow-down' : 'arrow-up'}
                  size={18}
                  color={txn.type === 'expense' ? '#FF5252' : '#8B5CF6'}
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDesc}>{txn.description}</Text>
                <Text style={styles.transactionDate}>{txn.date}</Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: txn.type === 'expense' ? '#FF5252' : '#8B5CF6' },
                ]}
              >
                {txn.type === 'expense' ? '-' : '+'}₹{Math.abs(txn.amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showExchangeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exchange Green Points</Text>
              <TouchableOpacity onPress={() => setShowExchangeModal(false)}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>
                Available Green Points:{' '}
                <Text style={{ color: '#8B5CF6', fontWeight: 'bold' }}>
                  {userData?.greenPoints || 0}
                </Text>
              </Text>

              <Text style={styles.modalLabel}>Enter Green Points to Exchange:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 100"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="number-pad"
                value={greenPointsToExchange}
                onChangeText={setGreenPointsToExchange}
              />

              <View style={styles.conversionInfo}>
                <Text style={styles.conversionText}>Exchange Rate: 1 Green Point = ₹1</Text>
                {greenPointsToExchange && (
                  <Text style={styles.conversionResult}>
                    You'll receive: ₹{greenPointsToExchange}
                  </Text>
                )}
              </View>

              <Text style={styles.modalLabel}>Use Digital Rupees for:</Text>
              <View style={styles.usageList}>
                <View style={styles.usageItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#8B5CF6" />
                  <Text style={styles.usageText}>Future Payments</Text>
                </View>
                <View style={styles.usageItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#8B5CF6" />
                  <Text style={styles.usageText}>Station Charging</Text>
                </View>
                <View style={styles.usageItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#8B5CF6" />
                  <Text style={styles.usageText}>Premium Features</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.exchangeSubmitBtn} onPress={handleExchange}>
                <Text style={styles.exchangeSubmitText}>Exchange Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, backgroundColor: '#0F0C29', justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 25, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    marginBottom: 15,
  },
  avatarText: { color: '#8B5CF6', fontSize: 40, fontWeight: 'bold' },
  name: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  car: { color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statLabel: { color: '#8B5CF6', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  statValue: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  exchangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    padding: 16,
    borderRadius: 15,
    marginBottom: 25,
  },
  exchangeBtnText: { color: '#8B5CF6', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  sectionTitle: { color: '#8B5CF6', fontSize: 16, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  menu: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 25, padding: 10, marginBottom: 30 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuText: { color: '#FFF', marginLeft: 15, fontSize: 16, flex: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  logoutText: { color: '#FF5252', marginLeft: 15, fontSize: 16, fontWeight: 'bold', flex: 1 },
  transactionContainer: { marginBottom: 30 },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: { flex: 1 },
  transactionDesc: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  transactionDate: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 3 },
  transactionAmount: { fontWeight: 'bold', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  modalBody: { marginBottom: 25 },
  modalLabel: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    padding: 15,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
  },
  conversionInfo: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  conversionText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  conversionResult: { color: '#8B5CF6', fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  usageList: { marginBottom: 25 },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageText: { color: '#FFF', marginLeft: 10, fontSize: 14 },
  exchangeSubmitBtn: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  exchangeSubmitText: { color: '#0F0C29', fontSize: 16, fontWeight: 'bold' },
});