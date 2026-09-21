/**
 * SplashScreen.jsx
 * Premium Cinematic Intro Splash Screen for GoKeralam: Gesture Run.
 * Features organic animations, ambient floating particles, breathing logo,
 * shimmer progress bar, and warm Kerala-themed visuals.
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

// Inject CSS keyframes for premium animations
const injectSplashStyles = () => {
  if (document.getElementById('splash-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'splash-keyframes';
  style.textContent = `
    @keyframes splashPulseGlow {
      0%, 100% { opacity: 0.15; transform: scale(1); }
      50% { opacity: 0.35; transform: scale(1.15); }
    }
    @keyframes splashPulseGlow2 {
      0%, 100% { opacity: 0.08; transform: scale(1) translate(0, 0); }
      50% { opacity: 0.2; transform: scale(1.1) translate(-10px, 8px); }
    }
    @keyframes splashLogoFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes splashLogoBorderPulse {
      0%, 100% { border-color: rgba(212, 175, 55, 0.4); box-shadow: 0 0 30px rgba(212, 175, 55, 0.2); }
      50% { border-color: rgba(212, 175, 55, 0.85); box-shadow: 0 0 50px rgba(212, 175, 55, 0.5), 0 8px 32px rgba(0,0,0,0.4); }
    }
    @keyframes splashShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(250%); }
    }
    @keyframes splashProgressGrow {
      0% { width: 0%; }
      40% { width: 35%; }
      70% { width: 65%; }
      90% { width: 85%; }
      100% { width: 100%; }
    }
    @keyframes splashParticleFloat {
      0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.5); }
      20% { opacity: 0.8; }
      80% { opacity: 0.6; }
      100% { opacity: 0; transform: translateY(-120px) translateX(var(--drift-x, 20px)) scale(1); }
    }
    @keyframes splashTextReveal {
      0% { opacity: 0; transform: translateY(12px); letter-spacing: 8px; }
      100% { opacity: 1; transform: translateY(0); letter-spacing: 4px; }
    }
    @keyframes splashSubReveal {
      0% { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes splashBadgeFade {
      0% { opacity: 0; transform: scale(0.85); }
      100% { opacity: 1; transform: scale(1); }
    }
    .splash-glow-1 {
      animation: splashPulseGlow 4s ease-in-out infinite;
    }
    .splash-glow-2 {
      animation: splashPulseGlow2 5s ease-in-out infinite;
    }
    .splash-logo-float {
      animation: splashLogoFloat 3s ease-in-out infinite, splashLogoBorderPulse 3s ease-in-out infinite;
    }
    .splash-progress-fill {
      animation: splashProgressGrow 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    .splash-progress-shimmer {
      animation: splashShimmer 1.2s ease-in-out infinite;
    }
    .splash-title-reveal {
      animation: splashTextReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
    }
    .splash-sub-reveal {
      animation: splashSubReveal 0.6s ease-out 0.6s both;
    }
    .splash-badge-reveal {
      animation: splashBadgeFade 0.5s ease-out 0.15s both;
    }
    .splash-loading-reveal {
      animation: splashSubReveal 0.5s ease-out 0.9s both;
    }
    .splash-particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      animation: splashParticleFloat linear forwards;
    }
  `;
  document.head.appendChild(style);
};

// Floating ambient particle
const Particle = ({ delay, x, size, color, duration, driftX }) => (
  <div
    className="splash-particle"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      bottom: '5%',
      backgroundColor: color,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      boxShadow: `0 0 ${size * 2}px ${color}`,
      '--drift-x': `${driftX}px`,
    }}
  />
);

export const SplashScreen = ({ onFinish }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.92));

  useEffect(() => {
    injectSplashStyles();

    // Smooth entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance after 2.2 seconds with graceful fade-out
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  // Generate ambient particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    x: 10 + Math.random() * 80,
    size: 3 + Math.random() * 5,
    color: i % 3 === 0
      ? 'rgba(212, 175, 55, 0.7)'
      : i % 3 === 1
        ? 'rgba(0, 255, 153, 0.5)'
        : 'rgba(255, 223, 115, 0.5)',
    duration: 2.5 + Math.random() * 2,
    driftX: -30 + Math.random() * 60,
  }));

  return (
    <View style={styles.container}>
      {/* Ambient layered glows */}
      <div className="splash-glow-1" style={{
        position: 'absolute',
        top: '15%',
        width: 350,
        height: 350,
        borderRadius: 175,
        background: 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0) 70%)',
        pointerEvents: 'none',
      }} />
      <div className="splash-glow-2" style={{
        position: 'absolute',
        bottom: '10%',
        right: '-5%',
        width: 280,
        height: 280,
        borderRadius: 140,
        background: 'radial-gradient(circle, rgba(0,200,120,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo with breathing border & float */}
        <div className="splash-logo-float">
          <View style={styles.logoWrapper}>
            <Image
              source={{ uri: '/icon.png' }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </div>

        {/* Badge */}
        <div className="splash-badge-reveal">
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🌴 GOD'S OWN COUNTRY</Text>
          </View>
        </div>

        {/* Title with cinematic letter reveal */}
        <div className="splash-title-reveal">
          <Text style={styles.title}>GOKERALAM</Text>
        </div>

        <div className="splash-sub-reveal">
          <Text style={styles.subtitle}>GESTURE RUN 3D</Text>
        </div>

        {/* Premium shimmer progress bar */}
        <div className="splash-loading-reveal" style={{ width: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          <View style={styles.loadingBar}>
            <div className="splash-progress-fill" style={{
              height: '100%',
              borderRadius: 4,
              background: 'linear-gradient(90deg, #D4AF37, #FFE082, #D4AF37)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div className="splash-progress-shimmer" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '40%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              }} />
            </div>
          </View>
          <Text style={styles.loadingText}>Preparing your Kerala adventure...</Text>
        </div>
      </Animated.View>

      {/* Soft bottom vignette */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        background: 'linear-gradient(to top, #04120a, transparent)',
        pointerEvents: 'none',
      }} />
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
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
  },
  logoWrapper: {
    width: 130,
    height: 130,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.6)',
    backgroundColor: '#05140d',
    marginBottom: 22,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderColor: 'rgba(212, 175, 55, 0.5)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginBottom: 14,
  },
  badgeText: {
    color: '#FFDF73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: 'Outfit, sans-serif',
  },
  title: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(212, 175, 55, 0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 14,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 4,
    marginBottom: 28,
  },
  loadingBar: {
    width: 180,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: 12,
  },
  loadingText: {
    color: '#7aac95',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    fontFamily: 'Outfit, sans-serif',
    fontStyle: 'italic',
  },
});
