/**
 * LoadingScreen.jsx
 * Premium, Kerala-themed 3D Asset & Engine Preloading Screen.
 *
 * Features organic animations, ambient particles, glassmorphism cards,
 * smooth progress transitions, rotating tips with crossfade, and
 * cinematic countdown sequence.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { modelManager, ASSET_NAMES } from '../game/ModelManager';

const KERALA_TIPS = [
  {
    icon: '🧍',
    title: 'Posture Matters',
    desc: 'Stand 1.5–2.5m from your camera for best full-body tracking precision.',
  },
  {
    icon: '👈 👉',
    title: 'Smooth Lane Shifting',
    desc: 'Lean your shoulders left or right to change highway lanes and dodge traffic.',
  },
  {
    icon: '🙆',
    title: 'Jump Obstacles',
    desc: 'Raise both arms overhead or jump to leap over barriers and logs.',
  },
  {
    icon: '🧎',
    title: 'Duck & Slide',
    desc: 'Crouch down or lower your torso to slide safely under low bridges.',
  },
  {
    icon: '🥥',
    title: 'Tender Coconuts',
    desc: 'Collect glowing coconuts on the highway to activate your protective shield!',
  },
  {
    icon: '🥁',
    title: 'Pandi Melam Beats',
    desc: 'Authentic Chenda percussion rhythms sync dynamically with your sprint speed!',
  },
  {
    icon: '🌴',
    title: 'God\'s Own Country',
    desc: 'Sprint through Alappuzha backwaters, Munnar tea hills, and Thrissur festivals.',
  },
];

// Inject CSS keyframes for loading screen animations
const injectLoadingStyles = () => {
  if (document.getElementById('loading-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'loading-keyframes';
  style.textContent = `
    @keyframes ldGlow1 {
      0%, 100% { opacity: 0.1; transform: scale(1); }
      50% { opacity: 0.28; transform: scale(1.15); }
    }
    @keyframes ldGlow2 {
      0%, 100% { opacity: 0.06; transform: scale(1) translate(0,0); }
      50% { opacity: 0.16; transform: scale(1.1) translate(-15px, 10px); }
    }
    @keyframes ldParticle {
      0% { opacity: 0; transform: translateY(0) scale(0.3); }
      15% { opacity: 0.6; }
      85% { opacity: 0.3; }
      100% { opacity: 0; transform: translateY(-140px) translateX(var(--dx, 10px)) scale(0.7); }
    }
    @keyframes ldProgressShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(300%); }
    }
    @keyframes ldPillCheck {
      0% { transform: scale(0.9); opacity: 0.7; }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes ldTipFadeIn {
      0% { opacity: 0; transform: translateX(15px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes ldTipFadeOut {
      0% { opacity: 1; transform: translateX(0); }
      100% { opacity: 0; transform: translateX(-15px); }
    }
    @keyframes ldCountPulse {
      0% { transform: scale(0.5); opacity: 0; }
      50% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes ldCountRing {
      0% { box-shadow: 0 0 0 0 rgba(212,175,55,0.5); }
      70% { box-shadow: 0 0 0 20px rgba(212,175,55,0); }
      100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
    }
    @keyframes ldHeaderIn {
      0% { opacity: 0; transform: translateY(-15px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes ldCardIn {
      0% { opacity: 0; transform: translateY(20px) scale(0.97); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes ldFooterIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes ldSpinnerDot {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    .ld-glow-1 { animation: ldGlow1 5s ease-in-out infinite; }
    .ld-glow-2 { animation: ldGlow2 6.5s ease-in-out infinite; }
    .ld-particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      animation: ldParticle linear infinite;
    }
    .ld-progress-shimmer {
      animation: ldProgressShimmer 1.5s ease-in-out infinite;
    }
    .ld-pill-check {
      animation: ldPillCheck 0.4s ease-out forwards;
    }
    .ld-tip-in {
      animation: ldTipFadeIn 0.4s ease-out forwards;
    }
    .ld-tip-out {
      animation: ldTipFadeOut 0.3s ease-in forwards;
    }
    .ld-count-pulse {
      animation: ldCountPulse 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .ld-count-ring {
      animation: ldCountRing 0.8s ease-out forwards;
    }
    .ld-header-in { animation: ldHeaderIn 0.6s ease-out 0.1s both; }
    .ld-card-in { animation: ldCardIn 0.6s ease-out 0.2s both; }
    .ld-tips-in { animation: ldCardIn 0.5s ease-out 0.35s both; }
    .ld-footer-in { animation: ldFooterIn 0.5s ease-out 0.5s both; }
    .ld-skip-btn {
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .ld-skip-btn:hover {
      transform: scale(1.04) !important;
      box-shadow: 0 6px 24px rgba(212,175,55,0.5) !important;
    }
    .ld-skip-btn:active {
      transform: scale(0.97) !important;
    }
    .ld-spinner-dot {
      animation: ldSpinnerDot 1.2s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
};

// Floating particle
const LdParticle = ({ delay, x, size, color, duration, dx }) => (
  <div
    className="ld-particle"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      bottom: '3%',
      backgroundColor: color,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      boxShadow: `0 0 ${size * 2}px ${color}`,
      '--dx': `${dx}px`,
    }}
  />
);

export const LoadingScreen = ({ onReady, isRestart = false }) => {
  const [progress, setProgress] = useState(0);
  const [currentAsset, setCurrentAsset] = useState('Initializing Kerala 3D Engine...');
  const [statusMap, setStatusMap] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipTransition, setTipTransition] = useState('in');
  const [countKey, setCountKey] = useState(0); // Key to re-trigger animation

  const countdownTimerRef = useRef(null);
  const hasTriggeredReadyRef = useRef(null);
  const tipTimerRef = useRef(null);

  useEffect(() => {
    injectLoadingStyles();
  }, []);

  // 1. Listen to ModelManager progress updates & preload
  useEffect(() => {
    let isMounted = true;

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

  // 2. Rotate Kerala Tips with crossfade
  useEffect(() => {
    tipTimerRef.current = setInterval(() => {
      setTipTransition('out');
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % KERALA_TIPS.length);
        setTipTransition('in');
      }, 300);
    }, 3500);
    return () => clearInterval(tipTimerRef.current);
  }, []);

  // 3. Post-load Countdown: 3 -> 2 -> 1 -> SPRINT!
  const startCountdown = () => {
    if (countdownTimerRef.current || hasTriggeredReadyRef.current) return;

    let count = 3;
    setCountdown(count);
    setCountKey((k) => k + 1);

    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        setCountKey((k) => k + 1);
      } else if (count === 0) {
        setCountdown('SPRINT!');
        setCountKey((k) => k + 1);
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
    if (onReady) onReady();
  };

  const currentTip = KERALA_TIPS[tipIndex];

  // Generate ambient particles
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    x: 5 + Math.random() * 90,
    size: 2 + Math.random() * 4,
    color: i % 3 === 0
      ? 'rgba(212,175,55,0.5)'
      : i % 3 === 1
        ? 'rgba(0,200,120,0.3)'
        : 'rgba(255,223,115,0.35)',
    duration: 4 + Math.random() * 4,
    dx: -35 + Math.random() * 70,
  }));

  const assetPills = [
    { key: 'countryRoad', label: 'Highway Road' },
    { key: 'wagonr', label: 'Traffic Cars' },
    { key: 'autorickshaw', label: 'Auto-Rickshaw' },
    { key: 'coconutPalm', label: 'Coconut Palms' },
    { key: 'coconut', label: 'Tender Coconuts' },
    { key: 'fisherBoat', label: 'Backwater Boats' },
  ];

  return (
    <View style={styles.container}>
      {/* Ambient glows */}
      <div className="ld-glow-1" style={{
        position: 'absolute', top: '-5%', left: '15%',
        width: 320, height: 320, borderRadius: 160,
        background: 'radial-gradient(circle, rgba(212,175,55,0.22) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div className="ld-glow-2" style={{
        position: 'absolute', bottom: '5%', right: '5%',
        width: 280, height: 280, borderRadius: 140,
        background: 'radial-gradient(circle, rgba(0,200,120,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {particles.map((p) => <LdParticle key={p.id} {...p} />)}

      {/* Vignettes */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 80,
        background: 'linear-gradient(to bottom, rgba(4,18,10,0.7), transparent)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
        background: 'linear-gradient(to top, rgba(4,18,10,0.8), transparent)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ─── Header ─── */}
      <div className="ld-header-in">
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🌴 GOD'S OWN COUNTRY 3D</Text>
          </View>
          <Text style={styles.title}>GOKERALAM</Text>
          <Text style={styles.subtitle}>GESTURE RUN</Text>
        </View>
      </div>

      {/* ─── Center: Progress or Countdown ─── */}
      <div className="ld-card-in">
        <View style={styles.centerCard}>
          {countdown !== null ? (
            // ─── Countdown View ───
            <View style={styles.countdownContainer}>
              <Text style={styles.readyLabel}>STAND READY IN VIEW</Text>

              {/* Animated countdown circle */}
              <div key={countKey} className="ld-count-ring" style={{
                borderRadius: 56, marginBottom: 14,
              }}>
                <div className="ld-count-pulse">
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
                </div>
              </div>

              <Text style={styles.countdownHint}>Assume upright runner posture</Text>

              <div className="ld-skip-btn">
                <TouchableOpacity style={styles.skipBtn} onPress={triggerReady} activeOpacity={0.85}>
                  <Text style={styles.skipBtnText}>START SPRINT NOW ⚡</Text>
                </TouchableOpacity>
              </div>
            </View>
          ) : (
            // ─── Progress View ───
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.progressLabel}>Loading 3D World</Text>
                  <Text style={styles.progressStatus}>{currentAsset}</Text>
                </View>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>

              {/* Progress bar with shimmer */}
              <View style={styles.progressBarTrack}>
                <div style={{
                  width: `${Math.max(5, progress)}%`,
                  height: '100%',
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #b8922e, #D4AF37, #FFE082, #D4AF37)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'width 0.4s ease-out',
                }}>
                  <div className="ld-progress-shimmer" style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '35%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                  }} />
                </div>
              </View>

              {/* Asset status pills */}
              <View style={styles.pillsGrid}>
                {assetPills.map((pill) => {
                  const done = statusMap[pill.key];
                  return (
                    <div key={pill.key} className={done ? 'ld-pill-check' : ''}>
                      <View style={[styles.pill, done && styles.pillDone]}>
                        <Text style={[styles.pillText, done && styles.pillTextDone]}>
                          {done ? '✓' : '⏳'} {pill.label}
                        </Text>
                      </View>
                    </div>
                  );
                })}
              </View>

              {/* Loading spinner dots */}
              <View style={styles.spinnerRow}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="ld-spinner-dot" style={{
                    width: 6, height: 6, borderRadius: 3,
                    backgroundColor: '#D4AF37',
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </View>
            </View>
          )}
        </View>
      </div>

      {/* ─── Tips Carousel ─── */}
      <div className="ld-tips-in">
        <div key={tipIndex} className={tipTransition === 'in' ? 'ld-tip-in' : 'ld-tip-out'}>
          <View style={styles.tipsCard}>
            <View style={styles.tipIconBox}>
              <Text style={styles.tipIcon}>{currentTip.icon}</Text>
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{currentTip.title}</Text>
              <Text style={styles.tipDesc}>{currentTip.desc}</Text>
            </View>
          </View>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <div className="ld-footer-in">
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ⚡ Pre-warming 3D shaders, Chenda beats & body tracking
          </Text>
        </View>
      </div>
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
    paddingVertical: 32,
    paddingHorizontal: 20,
    zIndex: 9999,
    overflow: 'hidden',
  },
  // ─── Header ───
  header: {
    alignItems: 'center',
    marginTop: 8,
    zIndex: 2,
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeText: {
    fontFamily: 'Outfit, sans-serif',
    color: '#e8c84a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 13,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 4,
  },
  // ─── Center Card ───
  centerCard: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
    backgroundColor: 'rgba(8, 24, 16, 0.8)',
    backdropFilter: 'blur(16px)',
    zIndex: 2,
  },
  // Progress
  progressContainer: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontFamily: 'Outfit, sans-serif',
    color: '#c8d8cf',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  progressStatus: {
    fontFamily: 'Inter, sans-serif',
    color: '#8aab9a',
    fontSize: 11,
    fontWeight: '500',
  },
  progressPercent: {
    fontFamily: 'Outfit, sans-serif',
    color: '#FFDF73',
    fontSize: 26,
    fontWeight: '900',
    marginLeft: 12,
  },
  progressBarTrack: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 6,
    overflow: 'hidden',
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderWidth: 1,
    marginBottom: 18,
  },
  pillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillDone: {
    backgroundColor: 'rgba(0, 200, 120, 0.1)',
    borderColor: 'rgba(0, 200, 120, 0.35)',
  },
  pillText: {
    fontFamily: 'Inter, sans-serif',
    color: '#999',
    fontSize: 10,
    fontWeight: '600',
  },
  pillTextDone: {
    color: '#6ee7a8',
  },
  spinnerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  // Countdown
  countdownContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  readyLabel: {
    fontFamily: 'Outfit, sans-serif',
    color: '#6ee7a8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  countdownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderColor: '#D4AF37',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownNumber: {
    fontFamily: 'Cinzel, Georgia, serif',
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
  },
  countdownGoText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 22,
    color: '#6ee7a8',
    fontWeight: '900',
    letterSpacing: 2,
  },
  countdownHint: {
    fontFamily: 'Inter, sans-serif',
    color: '#8a9e92',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 18,
  },
  skipBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 28,
  },
  skipBtnText: {
    fontFamily: 'Outfit, sans-serif',
    color: '#05140d',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  // ─── Tips ───
  tipsCard: {
    width: '100%',
    maxWidth: 460,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(8px)',
    zIndex: 2,
  },
  tipIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
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
    fontFamily: 'Outfit, sans-serif',
    color: '#e8c84a',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  tipDesc: {
    fontFamily: 'Inter, sans-serif',
    color: '#a0b0a8',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
  },
  // ─── Footer ───
  footer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  footerText: {
    fontFamily: 'Inter, sans-serif',
    color: '#556b5e',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
  },
});
