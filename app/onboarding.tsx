import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Range Anxiety?',
    description: 'Never worry about running out of juice. Find verified charging hubs near you instantly.',
    icon: 'battery-dead' as const,
    color: '#FF5252',
  },
  {
    id: '2',
    title: 'Station Filter Map',
    description: 'Easy to find station locations with our intuitive filter system.',
    icon: 'map-outline' as const,
    color: '#00E676',
  },
  {
    id: '3',
    title: 'Eco Rewards',
    description: 'Earn Green Points for every charge and track your CO2 savings for a sustainable future.',
    icon: 'leaf-outline' as const,
    color: '#4CAF50',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<Animated.FlatList>(null);
  const router = useRouter();

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<any>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/');
    }
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <LinearGradient 
      colors={['#0F0C29', '#302B63', '#24243E']}
      style={styles.container}
    >
      <View style={styles.orbTopLeft} />
      <View style={styles.orbBottomRight} />

      <Animated.FlatList
        ref={slidesRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [50, 0, -50],
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1, 0.8],
          });

          return (
            <View style={styles.slide}>
              <Animated.View
                style={[
                  styles.iconGlassyWrapper,
                  {
                    transform: [{ scale }],
                    borderColor: item.color,
                  },
                ]}>
                <Ionicons name={item.icon} size={80} color={item.color} />
              </Animated.View>

              <Animated.Text
                style={[
                  styles.title,
                  {
                    opacity,
                    transform: [{ translateY }],
                  },
                ]}>
                {item.title}
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.description,
                  {
                    opacity,
                    transform: [{ translateY }],
                  },
                ]}>
                {item.description}
              </Animated.Text>
            </View>
          );
        }}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            // Active dot scales to 2x width (instead of 3x)
            const dotScaleX = scrollX.interpolate({
              inputRange,
              outputRange: [1, 2, 1],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    opacity: dotOpacity,
                    transform: [{ scaleX: dotScaleX }],
                    backgroundColor: i === currentIndex ? '#A855F7' : '#A855F7',
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}>
              <Text style={styles.buttonText}>
                {currentIndex === SLIDES.length - 1 ? 'GET STARTED' : 'NEXT'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0C29' },
  orbTopLeft: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    transform: [{ scale: 1.5 }],
  },
  orbBottomRight: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    transform: [{ scale: 1.2 }],
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  iconGlassyWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  description: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.3,
    paddingHorizontal: 10,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    paddingHorizontal: 30,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 12,           // slightly wider base
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A855F7',
    marginHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipBtn: {
    paddingVertical: 15,
    paddingRight: 15,
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  button: {
    flex: 0.7,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  gradientBtn: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1.5,
  },
});