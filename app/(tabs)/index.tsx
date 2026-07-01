import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

interface Station {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1: string;
    Latitude: number;
    Longitude: number;
  };
}

interface RouteInfo {
  dist: string;
  time: number;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const FALLBACK_STATIONS: Station[] = [
  {
    ID: 1,
    AddressInfo: {
      Title: 'RAVEN EV Superhub',
      AddressLine1: 'Sector 17, Chandigarh',
      Latitude: 30.7333,
      Longitude: 76.7794,
    },
  },
  {
    ID: 2,
    AddressInfo: {
      Title: 'GreenCharge Plaza',
      AddressLine1: 'Model Town, Ludhiana',
      Latitude: 30.9010,
      Longitude: 75.8573,
    },
  },
  {
    ID: 3,
    AddressInfo: {
      Title: 'EcoDrive Station',
      AddressLine1: 'GT Road, Jalandhar',
      Latitude: 31.3260,
      Longitude: 75.5762,
    },
  },
  {
    ID: 4,
    AddressInfo: {
      Title: 'PowerUp Point',
      AddressLine1: 'Connaught Place, Delhi',
      Latitude: 28.6315,
      Longitude: 77.2167,
    },
  },
  {
    ID: 5,
    AddressInfo: {
      Title: 'Tata Power EV Hub',
      AddressLine1: 'NH 44, Panipat',
      Latitude: 29.3850,
      Longitude: 76.9680,
    },
  },
];

export default function MapScreen() {
  const [location, setLocation] = useState<LocationCoords>({
    latitude: 30.9010,
    longitude: 75.8573,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const [stations, setStations] = useState<Station[]>(FALLBACK_STATIONS);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeCoords, setRouteCoords] = useState<LocationCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let userLoc = await Location.getCurrentPositionAsync({});
        const reg = {
          latitude: userLoc.coords.latitude,
          longitude: userLoc.coords.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        };
        setLocation(reg);
        await fetchStations(reg.latitude, reg.longitude);
      } else {
        await fetchStations(30.9010, 75.8573);
      }
      setLoading(false);
    })();
  }, []);

  const fetchStations = async (lat: number, lng: number) => {
    try {
      const API_KEY = '38d26f9d-a57e-4ee5-b8d8-91e151816876'; // hardcoded key
      const url = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lng}&distance=500&maxresults=20&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && Array.isArray(data) && data.length > 0) {
        setStations(data);
      }
    } catch (error) {
      console.log('API fetch failed. Using fallback stations.', error);
    }
  };

  const getRoute = async (dest: Station) => {
    setIsCalculating(true);
    setRouteCoords([]);

    try {
      const startLon = location.longitude;
      const startLat = location.latitude;
      const endLon = dest.AddressInfo.Longitude;
      const endLat = dest.AddressInfo.Latitude;

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const coords: LocationCoords[] = data.routes[0].geometry.coordinates.map(
          (c: number[]) => ({
            latitude: c[1],
            longitude: c[0],
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          })
        );

        setRouteCoords(coords);
        setRouteInfo({
          dist: (data.routes[0].distance / 1000).toFixed(1),
          time: Math.ceil(data.routes[0].duration / 60),
        });

        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 80, bottom: 380, left: 80 },
          animated: true,
        });
      } else {
        const distance = getDistance(startLat, startLon, endLat, endLon);
        const time = Math.ceil((distance / 60) * 60);
        const simpleCoords: LocationCoords[] = [
          { latitude: startLat, longitude: startLon, latitudeDelta: 0.1, longitudeDelta: 0.1 },
          { latitude: endLat, longitude: endLon, latitudeDelta: 0.1, longitudeDelta: 0.1 },
        ];
        setRouteCoords(simpleCoords);
        setRouteInfo({ dist: distance.toFixed(1), time: time });
        mapRef.current?.fitToCoordinates(simpleCoords, {
          edgePadding: { top: 80, right: 80, bottom: 380, left: 80 },
          animated: true,
        });
      }
    } catch (e) {
      console.log('Route error:', e);
    } finally {
      setIsCalculating(false);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1.2;
  };

  const openDirections = (lat: number, lng: number) => {
    const scheme = Platform.select({
      ios: `http://maps.apple.com/?daddr=${lat},${lng}`,
      android: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    });
    Linking.openURL(scheme);
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#8B5CF6" /></View>;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={location}
        showsUserLocation
        onPress={() => setSelectedStation(null)}
      >
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={6}
            strokeColor="#8B5CF6"
            zIndex={100}
            geodesic={true}
          />
        )}

        {stations.map((s, index) => (
          <Marker
            key={`marker-${s.ID}-${index}`}
            coordinate={{
              latitude: s.AddressInfo.Latitude,
              longitude: s.AddressInfo.Longitude,
            }}
            title={s.AddressInfo.Title}
            description={s.AddressInfo.AddressLine1}
            onPress={() => {
              setSelectedStation(s);
              getRoute(s);
            }}
          />
        ))}
      </MapView>

      {selectedStation && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{selectedStation.AddressInfo.Title}</Text>
          <Text style={styles.cardSub}>{selectedStation.AddressInfo.AddressLine1}</Text>

          <View style={styles.statContainer}>
            {isCalculating ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={{ color: '#8B5CF6', marginLeft: 10, fontWeight: 'bold' }}>
                  Mapping Route...
                </Text>
              </View>
            ) : routeInfo ? (
              <>
                <Text style={styles.statText}>📍 {routeInfo.dist} km</Text>
                <Text style={styles.statText}>
                  🕒 {Math.floor(routeInfo.time / 60)}h {routeInfo.time % 60}m
                </Text>
              </>
            ) : null}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.closeBtn]}
              onPress={() => {
                setSelectedStation(null);
                setRouteCoords([]);
                setRouteInfo(null);
              }}
            >
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.navigateBtn]}
              onPress={() => openDirections(
                selectedStation.AddressInfo.Latitude,
                selectedStation.AddressInfo.Longitude
              )}
            >
              <Ionicons name="navigate-outline" size={20} color="#FFF" />
              <Text style={styles.navigateBtnText}>DIRECTIONS</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0C29' },
  map: { width: '100%', height: '100%' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0C29' },
  infoCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#1A1A2E',
    padding: 25,
    borderRadius: 25,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  cardTitle: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  cardSub: { color: '#888', fontSize: 13, marginTop: 5, fontStyle: 'italic' },
  statContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
    marginBottom: 15,
  },
  statText: { color: '#8B5CF6', fontWeight: 'bold', fontSize: 16 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  closeBtnText: {
    color: '#AAA',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  navigateBtn: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navigateBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
});