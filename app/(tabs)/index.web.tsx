import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MapScreenWeb() {
  return (
    <View style={styles.container}>
      <View style={styles.webFallback}>
        <Text style={styles.webText}>Map View is available on mobile devices</Text>
        <Text style={styles.webSubText}>Please use Expo Go on Android or iOS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  webText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  webSubText: { color: '#888', fontSize: 14, marginTop: 10, textAlign: 'center' },
});
