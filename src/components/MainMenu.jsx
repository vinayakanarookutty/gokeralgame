/**
 * MainMenu.jsx
 * Premium Home Menu for GoKeralam: Gesture Run.
 * Designed with authentic Kerala cultural warmth: Kasavu gold accents,
 * Nilambur teak and monsoon greens, bespoke vector iconography,
 * and elegant typography. Completely emoji-free.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CONTROL_MODES } from '../services/GestureDetector';
import {
  KasavuCoinIcon,
  RunnerIcon,
  BodyStanceIcon,
  HeadMotionIcon,
  PalmGestureIcon,
  TrophyIcon,
  CompassMapIcon,
  CalibrationSlidersIcon,
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  KeralaLotusOrnament,
  CloseIcon,
} from './Icons';

// Inject refined CSS keyframes for atmospheric animations
const injectMenuStyles = () => {
  if (document.getElementById('menu-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'menu-keyframes';
  style.textContent = `
    @keyframes menuGlow1 {
      0%, 100% { opacity: 0.14; transform: scale(1) translate(0, 0); }
      50% { opacity: 0.32; transform: scale(1.12) translate(-8px, 6px); }
    }
    @keyframes menuGlow2 {
      0%, 100% { opacity: 0.08; transform: scale(1) translate(0, 0); }
      50% { opacity: 0.22; transform: scale(1.08) translate(14px, -8px); }
    }
    @keyframes menuTitleIn {
      0% { opacity: 0; transform: translateY(18px) scale(0.96); filter: blur(6px); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }
    @keyframes menuSubIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes menuBadgeIn {
      0% { opacity: 0; transform: scale(0.85) translateY(6px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes menuBtnPulse {
      0%, 100% { box-shadow: 0 6px 26px rgba(212,175,55,0.32), 0 0 0 0 rgba(212,175,55,0.2); }
      50% { box-shadow: 0 8px 36px rgba(212,175,55,0.52), 0 0 0 8px rgba(212,175,55,0.08); }
    }
    @keyframes menuBtnShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    @keyframes menuCardIn {
      0% { opacity: 0; transform: translateY(14px) scale(0.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes menuNavIn {
      0% { opacity: 0; transform: translateY(16px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes menuParticle {
      0% { opacity: 0; transform: translateY(0) scale(0.3); }
      18% { opacity: 0.65; }
      82% { opacity: 0.35; }
      100% { opacity: 0; transform: translateY(-160px) translateX(var(--pdx, 15px)) scale(0.8); }
    }
    @keyframes menuLogoGlow {
      0%, 100% { box-shadow: 0 0 24px rgba(212,175,55,0.2), 0 4px 20px rgba(0,0,0,0.5); }
      50% { box-shadow: 0 0 44px rgba(212,175,55,0.42), 0 8px 30px rgba(0,0,0,0.6); }
    }
    @keyframes menuRecordShine {
      0%, 100% { background-position: -200% center; }
      50% { background-position: 200% center; }
    }
    .menu-glow-1 { animation: menuGlow1 6s ease-in-out infinite; }
    .menu-glow-2 { animation: menuGlow2 7s ease-in-out infinite; }
    .menu-title-in { animation: menuTitleIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
    .menu-sub-in { animation: menuSubIn 0.6s ease-out 0.4s both; }
    .menu-badge-in { animation: menuBadgeIn 0.5s ease-out 0.05s both; }
    .menu-tagline-in { animation: menuSubIn 0.5s ease-out 0.65s both; }
    .menu-btn-section { animation: menuCardIn 0.7s ease-out 0.45s both; }
    .menu-btn-pulse { animation: menuBtnPulse 2.8s ease-in-out infinite; }
    .menu-btn-shimmer { animation: menuBtnShimmer 2.5s ease-in-out infinite; }
    .menu-gesture-section { animation: menuCardIn 0.6s ease-out 0.65s both; }
    .menu-nav-section { animation: menuNavIn 0.5s ease-out 0.8s both; }
    .menu-logo-glow { animation: menuLogoGlow 3.5s ease-in-out infinite; }
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
      transition: transform 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;
    }
    .menu-gesture-card:hover {
      transform: translateY(-3px) !important;
      background-color: rgba(212, 175, 55, 0.12) !important;
      border-color: rgba(212, 175, 55, 0.4) !important;
    }
    .menu-nav-btn {
      transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
    }
    .menu-nav-btn:hover {
      transform: translateY(-2px) !important;
      background-color: rgba(212, 175, 55, 0.12) !important;
      border-color: rgba(212, 175, 55, 0.45) !important;
    }
    .menu-nav-btn:active {
      transform: scale(0.97) !important;
    }
    .menu-play-btn {
      transition: transform 0.15s ease;
    }
    .menu-play-btn:hover {
      transform: scale(1.025) !important;
    }
    .menu-play-btn:active {
      transform: scale(0.975) !important;
    }
    .menu-record-shine {
      background: linear-gradient(90deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.18) 25%, rgba(255,223,115,0.28) 50%, rgba(212,175,55,0.18) 75%, rgba(212,175,55,0.08) 100%);
      background-size: 200% 100%;
      animation: menuRecordShine 4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
};

// Ambient floating light particle
const MenuParticle = ({ delay, x, size, color, duration, driftX }) => (
  <div
    className="menu-particle"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      bottom: '3%',
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
    title: 'Full Stance',
    tag: 'UPPER BODY',
    IconComponent: BodyStanceIcon,
    desc: 'Lean torso to weave lanes, leap & duck',
    color: '#00ff99',
    badge: 'CLASSIC',
  },
  {
    id: CONTROL_MODES.HEAD_ONLY,
    title: 'Head Motion',
    tag: 'SEATED PLAY',
    IconComponent: HeadMotionIcon,
    desc: 'Tilt head to steer, nod up to jump',
    color: '#38bdf8',
    badge: 'COMFORT',
  },
  {
    id: CONTROL_MODES.PALM_ONLY,
    title: 'Air Palm',
    tag: 'HAND SENSOR',
    IconComponent: PalmGestureIcon,
    desc: 'Glide palm in camera view to guide runner',
    color: '#ffd700',
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
    const final = asGuest ? 'Traveler' : (nameInput.trim() || 'Traveler');
    handleNameChange(final);
    setIsPromptModalOpen(false);
    onStartGame();
  };

  useEffect(() => {
    injectMenuStyles();
  }, []);

  // Ambient Kasavu light particles
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    delay: Math.random() * 4,
    x: 6 + Math.random() * 88,
    size: 2.5 + Math.random() * 3.5,
    color: i % 4 === 0
      ? 'rgba(212, 175, 55, 0.65)'
      : i % 4 === 1
        ? 'rgba(110, 231, 183, 0.45)'
        : i % 4 === 2
          ? 'rgba(255, 223, 115, 0.45)'
          : 'rgba(160, 205, 185, 0.35)',
    duration: 4.5 + Math.random() * 3.5,
    driftX: -35 + Math.random() * 70,
  }));

  // Dynamic gesture guide based on active playing mode (with clean vector cues)
  const getControlsForMode = () => {
    if (controlMode === CONTROL_MODES.HEAD_ONLY) {
      return [
        { IconCmp: HeadMotionIcon, label: 'Center Face', desc: 'Maintain Track', color: '#4ade80' },
        { IconCmp: ChevronLeftIcon, label: 'Tilt Head Left', desc: 'Steer Left', color: '#38bdf8' },
        { IconCmp: ChevronRightIcon, label: 'Tilt Head Right', desc: 'Steer Right', color: '#38bdf8' },
        { IconCmp: ArrowUpIcon, label: 'Lift Chin Up', desc: 'Leap High', color: '#fbbf24' },
      ];
    }
    if (controlMode === CONTROL_MODES.PALM_ONLY) {
      return [
        { IconCmp: PalmGestureIcon, label: 'Open Palm Center', desc: 'Forward Pace', color: '#4ade80' },
        { IconCmp: ChevronLeftIcon, label: 'Glide Palm Left', desc: 'Switch Left', color: '#ffd700' },
        { IconCmp: ChevronRightIcon, label: 'Glide Palm Right', desc: 'Switch Right', color: '#ffd700' },
        { IconCmp: ArrowUpIcon, label: 'Flick Palm Up', desc: 'Leap High', color: '#fbbf24' },
      ];
    }
    // Default: HALF_BODY
    return [
      { IconCmp: BodyStanceIcon, label: 'Balanced Stance', desc: 'Forward Pace', color: '#4ade80' },
      { IconCmp: ChevronLeftIcon, label: 'Lean Torso Left', desc: 'Shift Left', color: '#60a5fa' },
      { IconCmp: ChevronRightIcon, label: 'Lean Torso Right', desc: 'Shift Right', color: '#60a5fa' },
      { IconCmp: ArrowUpIcon, label: 'Raise Arms / Leap', desc: 'Leap Barriers', color: '#fbbf24' },
    ];
  };

  const getPlayBtnSub = () => {
    if (controlMode === CONTROL_MODES.HEAD_ONLY) {
      return 'Face your camera comfortably to begin';
    }
    if (controlMode === CONTROL_MODES.PALM_ONLY) {
      return 'Raise single open palm in camera frame';
    }
    return 'Stand in camera view to begin your journey';
  };

  const gestureControls = getControlsForMode();

  return (
    <View style={styles.menuContainer}>
      {/* Layered atmospheric glows */}
      <div className="menu-glow-1" style={{
        position: 'absolute', top: '6%', left: '8%',
        width: 320, height: 320, borderRadius: 160,
        background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div className="menu-glow-2" style={{
        position: 'absolute', bottom: '12%', right: '6%',
        width: 280, height: 280, borderRadius: 140,
        background: 'radial-gradient(circle, rgba(20,110,75,0.16) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {particles.map((p) => <MenuParticle key={p.id} {...p} />)}

      {/* Top/bottom vignette gradients */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 100,
        background: 'linear-gradient(to bottom, rgba(4,16,10,0.85), transparent)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        background: 'linear-gradient(to top, rgba(4,16,10,0.92), transparent)',
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
            <KeralaLotusOrnament size={14} color="#ffd700" />
            <Text style={styles.badgeText}>GOD'S OWN COUNTRY • CULTURAL EXPEDITION</Text>
            <KeralaLotusOrnament size={14} color="#ffd700" />
          </View>
        </div>

        <div className="menu-title-in">
          <Text style={styles.gameTitle}>GOKERALAM</Text>
        </div>
        <div className="menu-sub-in">
          <Text style={styles.gameSubtitle}>GESTURE RUN 3D</Text>
        </div>
        <div className="menu-tagline-in">
          <Text style={styles.tagline}>Physical motion meets Kerala backwaters. Move naturally, explore endlessly.</Text>
        </div>
      </View>

      {/* ─── Mode Selector ─── */}
      <View style={styles.modeSection}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ height: 1, width: 28, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4))' }} />
          <Text style={styles.modeSectionTitle}>SELECT CONTROL METHOD</Text>
          <div style={{ height: 1, width: 28, background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)' }} />
        </div>
        <View style={styles.modeCardsRow}>
          {PLAY_MODES.map((mode) => {
            const isSelected = controlMode === mode.id;
            const Icon = mode.IconComponent;
            return (
              <div key={mode.id} className="menu-mode-card" style={{ flex: 1 }}>
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    isSelected && [
                      styles.modeCardSelected,
                      { borderColor: mode.color, backgroundColor: 'rgba(212, 175, 55, 0.14)' },
                    ],
                  ]}
                  onPress={() => onChangeControlMode && onChangeControlMode(mode.id)}
                  activeOpacity={0.82}
                >
                  <View style={styles.modeCardTop}>
                    <Icon size={20} color={isSelected ? mode.color : '#a0c0b0'} />
                    <View
                      style={[
                        styles.modeBadge,
                        {
                          backgroundColor: isSelected ? `${mode.color}22` : 'rgba(255,255,255,0.06)',
                          borderColor: isSelected ? mode.color : 'rgba(255,255,255,0.12)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeBadgeText,
                          { color: isSelected ? mode.color : '#b0c4b8' },
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

      {/* ─── Center Action Section ─── */}
      <div className="menu-btn-section" style={{ width: '100%', maxWidth: 390 }}>
        <View style={styles.centerSection}>
          {/* Runner Name Profile Input */}
          <div style={{
            width: '100%',
            marginBottom: 10,
            background: 'rgba(10, 28, 19, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: 14,
            padding: '9px 12px',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.4)',
            boxSizing: 'border-box',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 5,
            }}>
              <span style={{
                fontSize: 10,
                fontWeight: '800',
                color: '#ffd700',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <RunnerIcon size={13} color="#ffd700" />
                Traveler Profile
              </span>
              <span style={{ fontSize: 9.5, color: '#8cb8a3', letterSpacing: 0.5 }}>
                Kerala Chronicle
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(3, 14, 9, 0.75)',
              border: '1px solid rgba(212, 175, 55, 0.22)',
              borderRadius: 10,
              padding: '6px 11px',
              gap: 8,
            }}>
              <RunnerIcon size={16} color="#d4af37" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Inscribe your traveler name..."
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
                <span style={{ fontSize: 9, color: '#fbbf24', opacity: 0.85, whiteSpace: 'nowrap' }}>Required</span>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="menu-btn-pulse menu-play-btn" style={{ width: '100%' }}>
            <TouchableOpacity style={styles.playBtn} onPress={handlePlayClick} activeOpacity={0.88}>
              <View style={styles.playBtnInner}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#07170f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}>
                  <PlayIcon size={14} color="#ffd700" />
                </div>
                <View>
                  <Text style={styles.playBtnText}>BEGIN EXPEDITION</Text>
                  <Text style={styles.playBtnSub}>{getPlayBtnSub()}</Text>
                </View>
              </View>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: 16, overflow: 'hidden', pointerEvents: 'none',
              }}>
                <div className="menu-btn-shimmer" style={{
                  position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
                }} />
              </div>
            </TouchableOpacity>
          </div>

          {/* Record Display */}
          <div className="menu-record-shine" style={{ borderRadius: 14, marginTop: 10 }}>
            <View style={styles.recordPill}>
              <TrophyIcon size={14} color="#ffd700" />
              <Text style={styles.recordText}>
                Personal Best • {maxKm} km  ·  {highScore.toLocaleString()} pts
              </Text>
            </View>
          </div>
        </View>
      </div>

      {/* ─── Gesture Controls Guide ─── */}
      <div className="menu-gesture-section" style={{ width: '100%', maxWidth: 540 }}>
        <View style={styles.gestureGuide}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            <Text style={styles.guideTitle}>
              {controlMode === CONTROL_MODES.HEAD_ONLY
                ? 'HEAD MOTION SENSING'
                : controlMode === CONTROL_MODES.PALM_ONLY
                ? 'AIR PALM TRACKING'
                : 'UPPER BODY MOTION SENSING'}
            </Text>
          </div>
          <View style={styles.gestureRow}>
            {gestureControls.map((g, i) => {
              const Icon = g.IconCmp;
              return (
                <div className="menu-gesture-card" key={i} style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(212, 175, 55, 0.12)',
                  borderRadius: 12,
                  padding: '7px 4px',
                }}>
                  <View style={styles.gestureCard}>
                    <View style={[styles.gestureIconBg, { backgroundColor: `${g.color}15`, borderColor: `${g.color}35` }]}>
                      <Icon size={16} color={g.color} />
                    </View>
                    <Text style={styles.gestureLabel}>{g.label}</Text>
                    <Text style={[styles.gestureDesc, { color: g.color }]}>{g.desc}</Text>
                  </View>
                </div>
              );
            })}
          </View>
        </View>
      </div>

      {/* ─── Bottom Navigation ─── */}
      <div className="menu-nav-section" style={{ width: '100%', maxWidth: 430 }}>
        <View style={styles.bottomNav}>
          <div className="menu-nav-btn" style={{ flex: 1 }}>
            <TouchableOpacity style={styles.navBtn} onPress={onOpenMap} activeOpacity={0.82}>
              <CompassMapIcon size={17} color="#ffd700" />
              <Text style={styles.navText}>Kerala Map</Text>
            </TouchableOpacity>
          </div>
          <div className="menu-nav-btn" style={{ flex: 1 }}>
            <TouchableOpacity style={styles.navBtn} onPress={onOpenLeaderboard} activeOpacity={0.82}>
              <TrophyIcon size={17} color="#ffd700" />
              <Text style={styles.navText}>Leaderboard</Text>
            </TouchableOpacity>
          </div>
          <div className="menu-nav-btn" style={{ flex: 1 }}>
            <TouchableOpacity style={styles.navBtn} onPress={onOpenCalibration} activeOpacity={0.82}>
              <CalibrationSlidersIcon size={17} color="#ffd700" />
              <Text style={styles.navText}>Calibration</Text>
            </TouchableOpacity>
          </div>
        </View>
      </div>

      {/* ─── Traveler Name Prompt Modal ─── */}
      {isPromptModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 10, 6, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 420,
            background: 'linear-gradient(165deg, #0e271c 0%, #06170f 100%)',
            border: '2px solid #d4af37',
            borderRadius: 22,
            padding: 26,
            boxShadow: '0 12px 48px rgba(0,0,0,0.85), 0 0 35px rgba(212,175,55,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            <div style={{ marginBottom: 10 }}>
              <KeralaLotusOrnament size={36} color="#ffd700" />
            </div>
            <div style={{
              fontFamily: 'Cinzel, Georgia, serif',
              fontSize: 21,
              fontWeight: 800,
              color: '#ffd700',
              letterSpacing: 1.8,
              marginBottom: 8,
            }}>
              KERALA TRAVELER'S CHRONICLE
            </div>
            <div style={{
              fontSize: 12.5,
              color: '#b0d6c4',
              lineHeight: 1.5,
              marginBottom: 18,
            }}>
              Before beginning your sprint across the backwaters, please inscribe your name to record your high score and distance in the permanent rankings.
            </div>

            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(3, 14, 9, 0.85)',
              border: '1.5px solid rgba(212, 175, 55, 0.65)',
              borderRadius: 12,
              padding: '11px 14px',
              gap: 10,
              marginBottom: 18,
              boxSizing: 'border-box',
            }}>
              <RunnerIcon size={18} color="#ffd700" />
              <input
                autoFocus
                type="text"
                value={nameInput}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleModalStart(false);
                }}
                placeholder="Traveler Name (e.g., Arjun, Ananya)"
                maxLength={30}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: 14.5,
                  fontWeight: '600',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleModalStart(false)}
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)',
                  border: 'none',
                  borderRadius: 12,
                  padding: '13px 20px',
                  color: '#07170f',
                  fontSize: 13.5,
                  fontWeight: 900,
                  letterSpacing: 1.4,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(212,175,55,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>ENTER EXPEDITION</span>
                <PlayIcon size={12} color="#07170f" />
              </button>

              <button
                onClick={() => handleModalStart(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 11,
                  padding: '10px 16px',
                  color: '#9cc7b2',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Continue as Guest Traveler
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
    width: 60,
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.55)',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 5,
    marginTop: -2,
  },
  tagline: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
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
  },
  modeCardsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  modeCard: {
    backgroundColor: 'rgba(8, 24, 16, 0.78)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.22)',
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
  modeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  modeBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.6,
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

  // ─── Center Action Section ───
  centerSection: {
    alignItems: 'center',
    width: '100%',
    zIndex: 2,
  },
  playBtn: {
    backgroundColor: '#ffd700',
    borderRadius: 16,
    width: '100%',
    boxShadow: '0 6px 24px rgba(212, 175, 55, 0.35)',
    position: 'relative',
    overflow: 'hidden',
  },
  playBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
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
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
    backgroundColor: 'rgba(8, 24, 16, 0.72)',
    backdropFilter: 'blur(10px)',
    zIndex: 2,
  },
  guideTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 8.5,
    fontWeight: '800',
    color: '#d4af37',
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  gestureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 6,
  },
  gestureCard: {
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  gestureIconBg: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  gestureLabel: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 9.5,
    fontWeight: '700',
    color: '#f0f0f0',
    marginBottom: 1,
    textAlign: 'center',
  },
  gestureDesc: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
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
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    gap: 6,
  },
  navText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 11,
    fontWeight: '600',
    color: '#d8e2dc',
    letterSpacing: 0.3,
  },
});
