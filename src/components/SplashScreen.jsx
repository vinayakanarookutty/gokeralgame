/**
 * SplashScreen.jsx
 * Cinematic Intro Splash Screen for GoKeralam: Gesture Run.
 * Displays on app launch while pre-warming storage, Web Audio, and 3D assets.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

export const SplashScreen = ({ onFinish }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.88));

  useEffect(() => {
    // 1. Fade in & scale up logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Auto-advance after 1.8 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Ambient background glow */}
      <View style={styles.glow} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Icon */}
        <View style={styles.logoWrapper}>
          <Image
            source={{ uri: '/icon.png' }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Title & Tagline */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🌴 GOD'S OWN COUNTRY</Text>
        </View>
        <Text style={styles.title}>GOKERALAM</Text>
        <Text style={styles.subtitle}>GESTURE RUN 3D</Text>

        {/* Animated Loading Bar */}
        <View style={styles.loadingBar}>
          <View style={styles.loadingProgress} />
        </View>
        <Text style={styles.loadingText}>Initializing 3D World...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#04120a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    filter: 'blur(80px)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.6)',
    backgroundColor: '#05140d',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    marginBottom: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderColor: '#D4AF37',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeText: {
    color: '#FFDF73',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(212, 175, 55, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 3,
    marginBottom: 24,
  },
  loadingBar: {
    width: 160,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: 10,
  },
  loadingProgress: {
    width: '60%',
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 3,
  },
  loadingText: {
    color: '#88AA99',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
