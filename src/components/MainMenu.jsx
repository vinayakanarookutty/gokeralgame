/**
 * MainMenu.jsx
 * Premium Home Menu for GoKeralam: Gesture Run
 * Features cinematic hero section, organic animations, glassmorphism cards,
 * ambient particle system, and human-feeling micro-interactions.
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

// Inject CSS keyframes for premium menu animations
const injectMenuStyles = () => {
  if (document.getElementById('menu-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'menu-keyframes';
  style.textContent = `
    @keyframes menuGlow1 {
      0%, 100% { opacity: 0.12; transform: scale(1) translate(0, 0); }
      50% { opacity: 0.3; transform: scale(1.12) translate(-8px, 5px); }
    }
    @keyframes menuGlow2 {
      0%, 100% { opacity: 0.06; transform: scale(1) translate(0, 0); }
      50% { opacity: 0.18; transform: scale(1.08) translate(12px, -8px); }
    }
    @keyframes menuGlow3 {
      0%, 100% { opacity: 0.05; transform: scale(1); }
      50% { opacity: 0.15; transform: scale(1.2); }
    }
    @keyframes menuTitleIn {
      0% { opacity: 0; transform: translateY(20px) scale(0.95); filter: blur(8px); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }
    @keyframes menuSubIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes menuBadgeIn {
      0% { opacity: 0; transform: scale(0.8) translateY(8px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes menuBtnPulse {
      0%, 100% { box-shadow: 0 6px 24px rgba(212,175,55,0.3), 0 0 0 0 rgba(212,175,55,0.2); }
      50% { box-shadow: 0 8px 32px rgba(212,175,55,0.5), 0 0 0 8px rgba(212,175,55,0.06); }
    }
    @keyframes menuBtnShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    @keyframes menuCardIn {
      0% { opacity: 0; transform: translateY(15px) scale(0.97); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes menuNavIn {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes menuParticle {
      0% { opacity: 0; transform: translateY(0) scale(0.3); }
      15% { opacity: 0.7; }
      85% { opacity: 0.4; }
      100% { opacity: 0; transform: translateY(-150px) translateX(var(--pdx, 15px)) scale(0.8); }
    }
    @keyframes menuLogoGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.15), 0 4px 20px rgba(0,0,0,0.3); }
      50% { box-shadow: 0 0 40px rgba(212,175,55,0.35), 0 6px 30px rgba(0,0,0,0.4); }
    }
    @keyframes menuRecordShine {
      0%, 100% { background-position: -200% center; }
      50% { background-position: 200% center; }
    }
    @keyframes menuGestureHover {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    .menu-glow-1 { animation: menuGlow1 5s ease-in-out infinite; }
    .menu-glow-2 { animation: menuGlow2 6s ease-in-out infinite; }
    .menu-glow-3 { animation: menuGlow3 7s ease-in-out infinite; }
    .menu-title-in { animation: menuTitleIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
    .menu-sub-in { animation: menuSubIn 0.6s ease-out 0.45s both; }
    .menu-badge-in { animation: menuBadgeIn 0.5s ease-out 0.05s both; }
    .menu-tagline-in { animation: menuSubIn 0.5s ease-out 0.7s both; }
    .menu-btn-section { animation: menuCardIn 0.7s ease-out 0.5s both; }
    .menu-btn-pulse { animation: menuBtnPulse 2.5s ease-in-out infinite; }
    .menu-btn-shimmer { animation: menuBtnShimmer 2.5s ease-in-out infinite; }
    .menu-gesture-section { animation: menuCardIn 0.6s ease-out 0.7s both; }
    .menu-nav-section { animation: menuNavIn 0.5s ease-out 0.85s both; }
    .menu-logo-glow { animation: menuLogoGlow 3s ease-in-out infinite; }
    .menu-particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      animation: menuParticle linear infinite;
    }
    .menu-gesture-card {
      transition: transform 0.25s ease, background-color 0.25s ease;
    }
    .menu-gesture-card:hover {
      transform: translateY(-4px) !important;
      background-color: rgba(212, 175, 55, 0.12) !important;
    }
    .menu-nav-btn {
      transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
    }
    .menu-nav-btn:hover {
      transform: translateY(-2px) !important;
      background-color: rgba(212, 175, 55, 0.1) !important;
      border-color: rgba(212, 175, 55, 0.4) !important;
    }
    .menu-nav-btn:active {
      transform: scale(0.97) !important;
    }
    .menu-play-btn {
      transition: transform 0.15s ease;
    }
    .menu-play-btn:hover {
      transform: scale(1.03) !important;
    }
    .menu-play-btn:active {
      transform: scale(0.97) !important;
    }
    .menu-record-shine {
      background: linear-gradient(90deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.15) 25%, rgba(255,223,115,0.25) 50%, rgba(212,175,55,0.15) 75%, rgba(212,175,55,0.08) 100%);
      background-size: 200% 100%;
      animation: menuRecordShine 4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
};

// Floating particle component
const MenuParticle = ({ delay, x, size, color, duration, driftX }) => (
  <div
    className="menu-particle"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      bottom: '2%',
      backgroundColor: color,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      boxShadow: `0 0 ${size * 2}px ${color}`,
      '--pdx': `${driftX}px`,
    }}
  />
);

export const MainMenu = ({
  onStartGame,
  onOpenMap,
  onOpenLeaderboard,
  onOpenCalibration,
  highScore = 0,
  maxKm = '0.00',
}) => {
  useEffect(() => {
    injectMenuStyles();
  }, []);

  // Generate ambient particles
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    delay: Math.random() * 4,
    x: 5 + Math.random() * 90,
    size: 2 + Math.random() * 4,
    color: i % 4 === 0
      ? 'rgba(212, 175, 55, 0.6)'
      : i % 4 === 1
        ? 'rgba(0, 255, 153, 0.35)'
        : i % 4 === 2
          ? 'rgba(255, 223, 115, 0.4)'
          : 'rgba(160, 199, 179, 0.3)',
    duration: 4 + Math.random() * 4,
    driftX: -40 + Math.random() * 80,
  }));

  const gestureControls = [
    { icon: '🧍', label: 'Stand Upright', desc: 'Run Forward', color: '#4ade80' },
    { icon: '👈 👉', label: 'Lean L/R', desc: 'Switch Lanes', color: '#60a5fa' },
    { icon: '🙆', label: 'Arms Up', desc: 'Jump Over', color: '#fbbf24' },
    { icon: '🧎', label: 'Crouch Down', desc: 'Slide Under', color: '#f472b6' },
  ];

  return (
    <View style={styles.menuContainer}>
      {/* Multi-layered ambient glows */}
      <div className="menu-glow-1" style={{
        position: 'absolute', top: '8%', left: '10%',
        width: 300, height: 300, borderRadius: 150,
        background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div className="menu-glow-2" style={{
        position: 'absolute', bottom: '15%', right: '5%',
        width: 250, height: 250, borderRadius: 125,
        background: 'radial-gradient(circle, rgba(0,180,100,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div className="menu-glow-3" style={{
        position: 'absolute', top: '45%', left: '50%',
        width: 400, height: 400, borderRadius: 200,
        background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 60%)',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {particles.map((p) => <MenuParticle key={p.id} {...p} />)}

      {/* Top/bottom vignette overlays */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 100,
        background: 'linear-gradient(to bottom, rgba(4,18,10,0.8), transparent)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        background: 'linear-gradient(to top, rgba(4,18,10,0.9), transparent)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ─── Hero Title Section ─── */}
      <View style={styles.titleSection}>
        {/* App Logo */}
        <div className="menu-badge-in">
          <div className="menu-logo-glow">
            <View style={styles.logoWrapper}>
              <Image
                source={{ uri: '/icon.png' }}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </div>
        </div>

        {/* Title badge */}
        <div className="menu-badge-in">
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🌴 KERALA 3D EXPERIENCE</Text>
          </View>
        </div>

        {/* Game title */}
        <div className="menu-title-in">
          <Text style={styles.gameTitle}>GOKERALAM</Text>
        </div>
        <div className="menu-sub-in">
          <Text style={styles.gameSubtitle}>GESTURE RUN</Text>
        </div>
        <div className="menu-tagline-in">
          <Text style={styles.tagline}>Move your body. Explore Kerala. Run free.</Text>
        </div>
      </View>

      {/* ─── Center CTA Section ─── */}
      <div className="menu-btn-section">
        <View style={styles.centerSection}>
          {/* Play button with pulse glow and shimmer */}
          <div className="menu-btn-pulse menu-play-btn">
            <TouchableOpacity style={styles.playBtn} onPress={onStartGame} activeOpacity={0.85}>
              <View style={styles.playBtnInner}>
                <Text style={styles.playBtnIcon}>▶</Text>
                <View>
                  <Text style={styles.playBtnText}>START YOUR RUN</Text>
                  <Text style={styles.playBtnSub}>Stand upright in camera view 🧍</Text>
                </View>
              </View>
              {/* Shimmer sweep */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: 18, overflow: 'hidden', pointerEvents: 'none',
              }}>
                <div className="menu-btn-shimmer" style={{
                  position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                }} />
              </div>
            </TouchableOpacity>
          </div>

          {/* Best record pill with subtle shine */}
          <div className="menu-record-shine" style={{ borderRadius: 16, marginTop: 14 }}>
            <View style={styles.recordPill}>
              <Text style={styles.recordText}>
                🏆 Best: {maxKm} km  •  {highScore.toLocaleString()} pts
              </Text>
            </View>
          </div>
        </View>
      </div>

      {/* ─── Gesture Controls Section ─── */}
      <div className="menu-gesture-section">
        <View style={styles.gestureGuide}>
          <Text style={styles.guideTitle}>BODY GESTURE CONTROLS</Text>
          <View style={styles.gestureRow}>
            {gestureControls.map((g, i) => (
              <div className="menu-gesture-card" key={i}>
                <View style={styles.gestureCard}>
                  <View style={[styles.gestureIconBg, { backgroundColor: `${g.color}15` }]}>
                    <Text style={styles.gestureIcon}>{g.icon}</Text>
                  </View>
                  <Text style={styles.gestureLabel}>{g.label}</Text>
                  <Text style={[styles.gestureDesc, { color: g.color }]}>{g.desc}</Text>
                </View>
              </div>
            ))}
          </View>
        </View>
      </div>

      {/* ─── Bottom Navigation ─── */}
      <div className="menu-nav-section">
        <View style={styles.bottomNav}>
          <div className="menu-nav-btn" style={{ flex: 1 }}>
            <TouchableOpacity style={styles.navBtn} onPress={onOpenMap} activeOpacity={0.8}>
              <Text style={styles.navIcon}>🗺️</Text>
              <Text style={styles.navText}>Kerala Map</Text>
            </TouchableOpacity>
          </div>
          <div className="menu-nav-btn" style={{ flex: 1 }}>
            <TouchableOpacity style={styles.navBtn} onPress={onOpenLeaderboard} activeOpacity={0.8}>
              <Text style={styles.navIcon}>🏆</Text>
              <Text style={styles.navText}>Leaderboard</Text>
            </TouchableOpacity>
          </div>
          <div className="menu-nav-btn" style={{ flex: 1 }}>
            <TouchableOpacity style={styles.navBtn} onPress={onOpenCalibration} activeOpacity={0.8}>
              <Text style={styles.navIcon}>⚙️</Text>
              <Text style={styles.navText}>Calibrate</Text>
            </TouchableOpacity>
          </div>
        </View>
      </div>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#04120a',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    zIndex: 1000,
    overflow: 'hidden',
  },
  // ─── Title Section ───
  titleSection: {
    alignItems: 'center',
    marginTop: 8,
    zIndex: 2,
  },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: '#05140d',
    marginBottom: 14,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    marginBottom: 10,
  },
  badgeText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 9,
    fontWeight: '700',
    color: '#e8c84a',
    letterSpacing: 2,
  },
  gameTitle: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 5,
    textShadowColor: 'rgba(212, 175, 55, 0.45)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 20,
  },
  gameSubtitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 18,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 6,
    marginTop: -2,
  },
  tagline: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    color: '#8cb8a3',
    fontStyle: 'italic',
    marginTop: 8,
    letterSpacing: 0.3,
    fontWeight: '400',
  },
  // ─── Center Play Section ───
  centerSection: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    zIndex: 2,
  },
  playBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#D4AF37',
    borderWidth: 1,
    borderColor: 'rgba(255,245,184,0.5)',
  },
  playBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 14,
  },
  playBtnIcon: {
    fontSize: 20,
    color: '#07170f',
    fontWeight: '900',
  },
  playBtnText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 19,
    fontWeight: '800',
    color: '#07170f',
    letterSpacing: 1.5,
  },
  playBtnSub: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    fontWeight: '600',
    color: '#3d2f00',
    marginTop: 1,
    letterSpacing: 0.5,
  },
  recordPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  recordText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 12,
    color: '#d4c090',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  // ─── Gesture Guide ───
  gestureGuide: {
    width: '100%',
    maxWidth: 540,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    backgroundColor: 'rgba(8, 22, 15, 0.7)',
    backdropFilter: 'blur(12px)',
    zIndex: 2,
  },
  guideTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 9,
    fontWeight: '700',
    color: '#b09860',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 14,
  },
  gestureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 6,
  },
  gestureCard: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 14,
  },
  gestureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  gestureIcon: {
    fontSize: 20,
  },
  gestureLabel: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 11,
    fontWeight: '700',
    color: '#e8e8e8',
    marginBottom: 2,
  },
  gestureDesc: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 9,
    fontWeight: '600',
  },
  // ─── Bottom Nav ───
  bottomNav: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    maxWidth: 420,
    justifyContent: 'center',
    zIndex: 2,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  navIcon: {
    fontSize: 15,
  },
  navText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 11,
    fontWeight: '600',
    color: '#c8d0cc',
    letterSpacing: 0.3,
  },
});
