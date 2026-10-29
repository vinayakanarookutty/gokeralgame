/**
 * MainMenu.jsx
 * Premium Home Menu for GoKeralam: Gesture Run
 * Features cinematic hero section, organic animations, glassmorphism cards,
 * ambient particle system, interactive play mode selection, and human-feeling micro-interactions.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CONTROL_MODES } from '../services/GestureDetector';

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
    .menu-mode-card {
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .menu-mode-card:hover {
      transform: translateY(-3px) scale(1.02);
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

const PLAY_MODES = [
  {
    id: CONTROL_MODES.HALF_BODY,
    title: 'Half Body',
    tag: 'UPPER BODY',
    icon: '🧍',
    desc: 'Lean torso L/R, jump & crouch',
    color: '#00FF99',
    badge: 'CLASSIC',
  },
  {
    id: CONTROL_MODES.HEAD_ONLY,
    title: 'Head Only',
    tag: 'SEATED PLAY',
    icon: '👤',
    desc: 'Tilt & move head, nod up to jump',
    color: '#00E5FF',
    badge: 'SEATED',
  },
  {
    id: CONTROL_MODES.PALM_ONLY,
    title: 'Single Palm',
    tag: 'AIR CONTROLLER',
    icon: '✋',
    desc: 'Wave palm L/R, flick up to jump',
    color: '#FFD700',
    badge: 'AIR GESTURE',
  },
];

export const MainMenu = ({
  onStartGame,
  onOpenMap,
  onOpenLeaderboard,
  onOpenCalibration,
  highScore = 0,
  maxKm = '0.00',
  controlMode = CONTROL_MODES.HALF_BODY,
  onChangeControlMode,
  playerName = '',
  onChangePlayerName,
}) => {
  const [nameInput, setNameInput] = useState(() => playerName || localStorage.getItem('gokerala_player_name') || '');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  useEffect(() => {
    if (playerName && playerName !== nameInput) {
      setNameInput(playerName);
    }
  }, [playerName]);

  const handleNameChange = (val) => {
    setNameInput(val);
    if (onChangePlayerName) onChangePlayerName(val);
  };

  const handlePlayClick = () => {
    if (!nameInput.trim()) {
      setIsPromptModalOpen(true);
      return;
    }
    if (onChangePlayerName) onChangePlayerName(nameInput.trim());
    onStartGame();
  };

  const handleModalStart = (asGuest = false) => {
    const final = asGuest ? 'Runner' : (nameInput.trim() || 'Runner');
    handleNameChange(final);
    setIsPromptModalOpen(false);
    onStartGame();
  };

  useEffect(() => {
    injectMenuStyles();
  }, []);

  // Ambient particles
  const particles = Array.from({ length: 14 }, (_, i) => ({
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

  // Dynamic gesture guide based on active playing mode
  const getControlsForMode = () => {
    if (controlMode === CONTROL_MODES.HEAD_ONLY) {
      return [
        { icon: '👤', label: 'Face Centered', desc: 'Run Forward', color: '#4ade80' },
        { icon: '🗣️ ↩️', label: 'Tilt / Turn Head', desc: 'Switch Lanes', color: '#00e5ff' },
        { icon: '👆 🙄', label: 'Lift Chin / Head', desc: 'Jump Over', color: '#fbbf24' },
        { icon: '👇 🙇', label: 'Dip Head Down', desc: 'Slide Under', color: '#f472b6' },
      ];
    }
    if (controlMode === CONTROL_MODES.PALM_ONLY) {
      return [
        { icon: '✋', label: 'Palm Centered', desc: 'Run Forward', color: '#4ade80' },
        { icon: '👈 ✋ 👉', label: 'Wave Palm L/R', desc: 'Switch Lanes', color: '#ffd700' },
        { icon: '👆 🖐️', label: 'Flick Palm Up', desc: 'Jump Over', color: '#fbbf24' },
        { icon: '👇 🫳', label: 'Drop Palm Down', desc: 'Slide Under', color: '#f472b6' },
      ];
    }
    // Default: HALF_BODY
    return [
      { icon: '🧍', label: 'Stand Upright', desc: 'Run Forward', color: '#4ade80' },
      { icon: '👈 👉', label: 'Lean Torso L/R', desc: 'Switch Lanes', color: '#60a5fa' },
      { icon: '🙆', label: 'Arms / Jump Up', desc: 'Jump Over', color: '#fbbf24' },
      { icon: '🧎', label: 'Crouch Down', desc: 'Slide Under', color: '#f472b6' },
    ];
  };

  const getPlayBtnSub = () => {
    if (controlMode === CONTROL_MODES.HEAD_ONLY) {
      return 'Sit comfortably and face camera 👤';
    }
    if (controlMode === CONTROL_MODES.PALM_ONLY) {
      return 'Hold up single palm in camera view ✋';
    }
    return 'Stand upright in camera view 🧍';
  };

  const gestureControls = getControlsForMode();

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
        position: 'absolute', top: 0, left: 0, right: 0, height: 90,
        background: 'linear-gradient(to bottom, rgba(4,18,10,0.8), transparent)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
        background: 'linear-gradient(to top, rgba(4,18,10,0.9), transparent)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ─── Hero Title Section ─── */}
      <View style={styles.titleSection}>
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

        <div className="menu-badge-in">
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🌴 KERALA 3D EXPERIENCE</Text>
          </View>
        </div>

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

      {/* ─── Playing Mode Selector ─── */}
      <View style={styles.modeSection}>
        <Text style={styles.modeSectionTitle}>CHOOSE PLAYING MODE</Text>
        <View style={styles.modeCardsRow}>
          {PLAY_MODES.map((mode) => {
            const isSelected = controlMode === mode.id;
            return (
              <div key={mode.id} className="menu-mode-card" style={{ flex: 1 }}>
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    isSelected && [
                      styles.modeCardSelected,
                      { borderColor: mode.color, backgroundColor: 'rgba(212, 175, 55, 0.15)' },
                    ],
                  ]}
                  onPress={() => onChangeControlMode && onChangeControlMode(mode.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.modeCardTop}>
                    <Text style={styles.modeCardIcon}>{mode.icon}</Text>
                    <View
                      style={[
                        styles.modeBadge,
                        {
                          backgroundColor: isSelected ? mode.color : 'rgba(255,255,255,0.08)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeBadgeText,
                          { color: isSelected ? '#07170f' : '#b0c4b8' },
                        ]}
                      >
                        {mode.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.modeCardTitle, isSelected && { color: mode.color }]}>
                    {mode.title}
                  </Text>
                  <Text style={styles.modeCardDesc} numberOfLines={2}>
                    {mode.desc}
                  </Text>
                  {isSelected && (
                    <View style={[styles.modeActiveIndicator, { backgroundColor: mode.color }]} />
                  )}
                </TouchableOpacity>
              </div>
            );
          })}
        </View>
      </View>

      {/* ─── Center CTA Section ─── */}
      <div className="menu-btn-section" style={{ width: '100%', maxWidth: 380 }}>
        <View style={styles.centerSection}>
          {/* Runner Name Profile Input */}
          <div style={{
            width: '100%',
            marginBottom: 10,
            background: 'rgba(10, 30, 20, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: 14,
            padding: '8px 12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
            boxSizing: 'border-box',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}>
              <span style={{
                fontSize: 10,
                fontWeight: '800',
                color: '#ffd700',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}>
                🏃 Runner Profile
              </span>
              <span style={{ fontSize: 9.5, color: '#8cb8a3' }}>
                Cloud Leaderboard
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(2, 12, 7, 0.7)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: 10,
              padding: '6px 10px',
              gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>👤</span>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter your runner name..."
                maxLength={30}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: '600',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
              {nameInput.trim() ? (
                <span style={{ fontSize: 11, color: '#00ff99', fontWeight: '800' }}>✓</span>
              ) : (
                <span style={{ fontSize: 9, color: '#fbbf24', opacity: 0.85 }}>Required</span>
              )}
            </div>
          </div>

          <div className="menu-btn-pulse menu-play-btn" style={{ width: '100%' }}>
            <TouchableOpacity style={styles.playBtn} onPress={handlePlayClick} activeOpacity={0.85}>
              <View style={styles.playBtnInner}>
                <Text style={styles.playBtnIcon}>▶</Text>
                <View>
                  <Text style={styles.playBtnText}>START YOUR RUN</Text>
                  <Text style={styles.playBtnSub}>{getPlayBtnSub()}</Text>
                </View>
              </View>
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

          <div className="menu-record-shine" style={{ borderRadius: 16, marginTop: 10 }}>
            <View style={styles.recordPill}>
              <Text style={styles.recordText}>
                🏆 Best: {maxKm} km  •  {highScore.toLocaleString()} pts
              </Text>
            </View>
          </div>
        </View>
      </div>

      {/* ─── Gesture Controls Guide (Adapts dynamically to active mode) ─── */}
      <div className="menu-gesture-section" style={{ width: '100%', maxWidth: 540 }}>
        <View style={styles.gestureGuide}>
          <Text style={styles.guideTitle}>
            {controlMode === CONTROL_MODES.HEAD_ONLY
              ? '👤 HEAD MOTION CONTROLS'
              : controlMode === CONTROL_MODES.PALM_ONLY
              ? '✋ AIR PALM GESTURE CONTROLS'
              : '🧍 BODY GESTURE CONTROLS'}
          </Text>
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
      <div className="menu-nav-section" style={{ width: '100%', maxWidth: 420 }}>
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

      {/* ─── Name Prompt Modal (if user clicks Play without entering name) ─── */}
      {isPromptModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 8, 5, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 400,
            background: '#0c2217',
            border: '2px solid #ffd700',
            borderRadius: 22,
            padding: 24,
            boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>🏃🌴</div>
            <div style={{
              fontFamily: 'Cinzel, Georgia, serif',
              fontSize: 22,
              fontWeight: 800,
              color: '#ffd700',
              letterSpacing: 1.5,
              marginBottom: 6,
            }}>
              WHO IS RUNNING?
            </div>
            <div style={{
              fontSize: 12.5,
              color: '#a0c7b3',
              lineHeight: 1.4,
              marginBottom: 18,
            }}>
              Enter your runner name to record your high score and travel distance in the Kerala database.
            </div>

            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(3, 15, 9, 0.8)',
              border: '2px solid rgba(212, 175, 55, 0.6)',
              borderRadius: 14,
              padding: '10px 14px',
              gap: 10,
              marginBottom: 16,
              boxSizing: 'border-box',
            }}>
              <span style={{ fontSize: 18 }}>👤</span>
              <input
                autoFocus
                type="text"
                value={nameInput}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleModalStart(false);
                }}
                placeholder="Enter Runner Name (e.g. Rahul, Ananya)"
                maxLength={30}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: '700',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleModalStart(false)}
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #e6be00 100%)',
                  border: 'none',
                  borderRadius: 14,
                  padding: '12px 20px',
                  color: '#07170f',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: 1.2,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(212,175,55,0.4)',
                }}
              >
                LET'S RUN ▶
              </button>

              <button
                onClick={() => handleModalStart(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  padding: '9px 16px',
                  color: '#9cc7b2',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Continue as Guest Runner
              </button>
            </div>
          </div>
        </div>
      )}
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
    paddingVertical: 18,
    paddingHorizontal: 16,
    zIndex: 1000,
    overflow: 'hidden',
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 4,
    zIndex: 2,
  },
  logoWrapper: {
    width: 62,
    height: 62,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: '#05140d',
    marginBottom: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    marginBottom: 6,
  },
  badgeText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 8.5,
    fontWeight: '700',
    color: '#e8c84a',
    letterSpacing: 1.8,
  },
  gameTitle: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    textShadowColor: 'rgba(212, 175, 55, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 16,
  },
  gameSubtitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 16,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 5,
    marginTop: -2,
  },
  tagline: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11.5,
    color: '#8cb8a3',
    fontStyle: 'italic',
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // ─── Playing Mode Selector ───
  modeSection: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
    zIndex: 2,
    marginVertical: 4,
  },
  modeSectionTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 9,
    fontWeight: '800',
    color: '#d4af37',
    letterSpacing: 2,
    marginBottom: 8,
  },
  modeCardsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  modeCard: {
    backgroundColor: 'rgba(8, 22, 15, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    padding: 10,
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    height: 94,
    justifyContent: 'space-between',
  },
  modeCardSelected: {
    borderWidth: 2,
    boxShadow: '0 4px 18px rgba(212, 175, 55, 0.25)',
  },
  modeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  modeCardIcon: {
    fontSize: 22,
  },
  modeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modeBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeCardTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  modeCardDesc: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 8.5,
    color: '#8cb09d',
    lineHeight: 11,
  },
  modeActiveIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  // ─── Center Play Section ───
  centerSection: {
    alignItems: 'center',
    width: '100%',
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  playBtnIcon: {
    fontSize: 18,
    color: '#07170f',
    fontWeight: '900',
  },
  playBtnText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 17,
    fontWeight: '800',
    color: '#07170f',
    letterSpacing: 1.5,
  },
  playBtnSub: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 9.5,
    fontWeight: '600',
    color: '#3d2f00',
    marginTop: 1,
    letterSpacing: 0.4,
  },
  recordPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  recordText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 11,
    color: '#d4c090',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ─── Gesture Guide ───
  gestureGuide: {
    width: '100%',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    backgroundColor: 'rgba(8, 22, 15, 0.7)',
    backdropFilter: 'blur(12px)',
    zIndex: 2,
  },
  guideTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 8.5,
    fontWeight: '800',
    color: '#b09860',
    letterSpacing: 1.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  gestureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 4,
  },
  gestureCard: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  gestureIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  gestureIcon: {
    fontSize: 18,
  },
  gestureLabel: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 10,
    fontWeight: '700',
    color: '#e8e8e8',
    marginBottom: 1,
  },
  gestureDesc: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 8,
    fontWeight: '600',
  },

  // ─── Bottom Nav ───
  bottomNav: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
    zIndex: 2,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 5,
  },
  navIcon: {
    fontSize: 14,
  },
  navText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 10.5,
    fontWeight: '600',
    color: '#c8d0cc',
    letterSpacing: 0.3,
  },
});
