import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
  return (
    <>
      {/* Ensures the top clock/battery icons are white and the background is seamless */}
      <StatusBar style="light" translucent={true} />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#00E676', // Vibrant EV Green
          tabBarInactiveTintColor: '#888888',
          tabBarStyle: { 
            backgroundColor: '#1E1E1E', // Matching your dark theme
            borderTopColor: '#41bfbf',
            // FIX: These three lines push the menu up away from the home exit bar
            height: 90,          
            paddingBottom: 30,   
            paddingTop: 10,      
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}>
        
        <Tabs.Screen
          name="index"
          options={{
            title: 'Find Hub',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size + 2} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="status"
          options={{
            title: 'Live Status',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flash" size={size + 2} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="payment"
          options={{
            title: 'Scan & Pay',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="qr-code" size={size + 2} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'My EV',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size + 4} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}