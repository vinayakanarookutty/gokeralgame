/**
 * LoadingScreen.jsx
 * Immersive, Kerala-themed 3D Asset & Engine Preloading Screen.
 * 
 * Ensures all 9 3D GLB assets, Three.js shaders, Web Audio Chenda rhythms,
 * and Camera Motion Tracking are 100% loaded and compiled before gameplay starts,
 * preventing sudden asset pop-ins, frame freezes, and collision physics bugs.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { modelManager, ASSET_NAMES } from '../game/ModelManager';

const KERALA_TIPS = [
  {
    icon: '🧍',
    title: 'Posture Matters',
    desc: 'Stand 1.5 to 2.5 meters away from your camera for full-body tracking precision.',
  },
  {
    icon: '👈 👉',
    title: 'Smooth Lane Shifting',
    desc: 'Lean your shoulders left or right to change highway lanes and dodge oncoming traffic.',
  },
  {
    icon: '🙆',
    title: 'Jump Obstacles',
    desc: 'Raise both arms overhead or jump upward to leap over low barriers and roadside logs.',
  },
  {
    icon: '🧎',
    title: 'Duck & Slide',
    desc: 'Crouch down or lower your torso to slide safely under low bridges.',
  },
  {
    icon: '🥥',
    title: 'Tender Coconuts',
    desc: 'Collect glowing Tender Coconuts on the highway to activate your protective shield!',
  },
  {
    icon: '🥁',
    title: 'Pandi Melam Beats',
    desc: 'Authentic Kerala Chenda percussion rhythms sync dynamically with your sprint speed!',
  },
  {
    icon: '🌴',
    title: 'God\'s Own Country',
    desc: 'Sprint through Alappuzha backwaters, Munnar tea hills, and Thrissur festival grounds.',
  },
];

export const LoadingScreen = ({ onReady, isRestart = false }) => {
  const [progress, setProgress] = useState(0);
  const [currentAsset, setCurrentAsset] = useState('Initializing Kerala 3D Engine...');
  const [statusMap, setStatusMap] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState(null); // 3, 2, 1, 'GO!'
  const [tipIndex, setTipIndex] = useState(0);

  const countdownTimerRef = useRef(null);
  const hasTriggeredReadyRef = useRef(false);

  // 1. Listen to ModelManager progress updates & preload
  useEffect(() => {
    let isMounted = true;

    // Fast-track if already loaded or quick restart
    const initialStatus = modelManager.getProgress();
    if (initialStatus.isAllLoaded) {
      setProgress(100);
      setCurrentAsset('3D Assets & Shaders Ready!');
      setIsLoaded(true);
      startCountdown();
      return;
    }

    const unsubscribe = modelManager.onProgress((data) => {
      if (!isMounted) return;
      setProgress(data.percent);
      if (data.currentItem) {
        setCurrentAsset(`Loading ${data.currentItem}...`);
      }
      if (data.statusMap) {
        setStatusMap(data.statusMap);
      }
      if (data.isAllLoaded) {
        setIsLoaded(true);
        setCurrentAsset('Kerala 3D World Ready!');
        startCountdown();
      }
    });

    // Initiate preloading of all models
    modelManager.preloadAll().then(() => {
      if (!isMounted) return;
      setProgress(100);
      setIsLoaded(true);
      setCurrentAsset('Scene Shaders Compiled & Ready!');
      startCountdown();
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // 2. Rotate Kerala Tips every 3 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % KERALA_TIPS.length);
    }, 3000);
    return () => clearInterval(tipInterval);
  }, []);

  // 3. Post-load Countdown sequence: 3 -> 2 -> 1 -> SPRINT!
  const startCountdown = () => {
    if (countdownTimerRef.current || hasTriggeredReadyRef.current) return;

    let count = 3;
    setCountdown(count);

    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown('SPRINT!');
      } else {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        triggerReady();
      }
    }, 850);
  };

  const triggerReady = () => {
    if (hasTriggeredReadyRef.current) return;
    hasTriggeredReadyRef.current = true;
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (onReady) {
      onReady();
    }
  };

  const currentTip = KERALA_TIPS[tipIndex];

  return (
    <View style={styles.container}>
      {/* Ambient background glow */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      {/* Header section */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🌴 GOD'S OWN COUNTRY 3D</Text>
        </View>
        <Text style={styles.title}>GOKERALA</Text>
        <Text style={styles.subtitle}>GESTURE RUN</Text>
      </View>

      {/* Center Section: Progress or Countdown */}
      <View style={styles.centerCard}>
        {countdown !== null ? (
          // Countdown view when 100% loaded
          <View style={styles.countdownContainer}>
            <Text style={styles.readyText}>STAND READY IN VIEW!</Text>
            <View style={styles.countdownCircle}>
              <Text
                style={[
                  styles.countdownNumber,
                  typeof countdown === 'string' && styles.countdownGoText,
                ]}
              >
                {countdown}
              </Text>
            </View>
            <Text style={styles.countdownSub}>Assume upright runner posture</Text>

            <TouchableOpacity style={styles.skipBtn} onPress={triggerReady} activeOpacity={0.8}>
              <Text style={styles.skipBtnText}>START SPRINT NOW ⚡</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Asset Preloading Progress View
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressStatus}>{currentAsset}</Text>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>

            {/* Glowing Golden Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.max(5, progress)}%` }]}>
                <View style={styles.progressBarShimmer} />
              </View>
            </View>

            {/* Subsystem checklist pills */}
            <View style={styles.pillsGrid}>
              <View style={[styles.pill, statusMap.countryRoad && styles.pillActive]}>
                <Text style={styles.pillText}>
                  {statusMap.countryRoad ? '✓' : '⏳'} Highway Road
                </Text>
              </View>
              <View style={[styles.pill, statusMap.wagonr && styles.pillActive]}>
                <Text style={styles.pillText}>
                  {statusMap.wagonr ? '✓' : '⏳'} Traffic Cars
                </Text>
              </View>
              <View style={[styles.pill, statusMap.autorickshaw && styles.pillActive]}>
                <Text style={styles.pillText}>
                  {statusMap.autorickshaw ? '✓' : '⏳'} Auto-Rickshaw
                </Text>
              </View>
              <View style={[styles.pill, statusMap.coconutPalm && styles.pillActive]}>
                <Text style={styles.pillText}>
                  {statusMap.coconutPalm ? '✓' : '⏳'} Coconut Palms
                </Text>
              </View>
              <View style={[styles.pill, statusMap.coconut && styles.pillActive]}>
                <Text style={styles.pillText}>
                  {statusMap.coconut ? '✓' : '⏳'} Tender Coconuts
                </Text>
              </View>
              <View style={[styles.pill, statusMap.fisherBoat && styles.pillActive]}>
                <Text style={styles.pillText}>
                  {statusMap.fisherBoat ? '✓' : '⏳'} Backwater Boats
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Rotating Tips Carousel */}
      <View style={styles.tipsCard}>
        <View style={styles.tipIconBox}>
          <Text style={styles.tipIcon}>{currentTip.icon}</Text>
        </View>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>{currentTip.title}</Text>
          <Text style={styles.tipDesc}>{currentTip.desc}</Text>
        </View>
      </View>

      {/* Footer reassurance */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ⚡ Pre-warming 3D shaders, Chenda beats & body tracking to eliminate gameplay bugs
        </Text>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    zIndex: 9999,
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    filter: 'blur(70px)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(0, 255, 153, 0.08)',
    filter: 'blur(90px)',
  },
  header: {
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderColor: '#D4AF37',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeText: {
    color: '#FFDF73',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 38,
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
  },
  centerCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(10, 30, 20, 0.85)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  progressContainer: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressStatus: {
    color: '#E0F2E9',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  progressPercent: {
    color: '#FFDF73',
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 12,
  },
  progressBarTrack: {
    width: '100%',
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 7,
    overflow: 'hidden',
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderWidth: 1,
    marginBottom: 18,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  pillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillActive: {
    backgroundColor: 'rgba(0, 255, 153, 0.12)',
    borderColor: 'rgba(0, 255, 153, 0.4)',
  },
  pillText: {
    color: '#CCCCCC',
    fontSize: 11,
    fontWeight: '600',
  },
  countdownContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  readyText: {
    color: '#00FF99',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  countdownCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: '#D4AF37',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    marginBottom: 12,
  },
  countdownNumber: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
  },
  countdownGoText: {
    fontSize: 22,
    color: '#00FF99',
    fontWeight: '900',
  },
  countdownSub: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  skipBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  skipBtnText: {
    color: '#05140d',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tipsCard: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  tipIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tipIcon: {
    fontSize: 22,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: '#FFDF73',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  tipDesc: {
    color: '#BBBBBB',
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    color: '#668877',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
});
