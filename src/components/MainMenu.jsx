/**
 * MainMenu.jsx
 * Main Home Menu for GoKerala: Gesture Run
 * Features cinematic title, gesture instructions preview, and navigation
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const MainMenu = ({
  onStartGame,
  onOpenMap,
  onOpenLeaderboard,
  onOpenCalibration,
  highScore = 0,
  maxKm = '0.00',
}) => {
  return (
    <View style={styles.menuContainer}>
      {/* Background Kerala Gradient Backdrop */}
      <View style={styles.backdropGlow} />

      {/* Title & Tagline */}
      <View style={styles.titleSection}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🌴 OFFICIAL KERALA 3D EXPERIENCE</Text>
        </View>
        <Text style={styles.gameTitle}>GOKERALA</Text>
        <Text style={styles.gameSubtitle}>GESTURE RUN</Text>
        <Text style={styles.tagline}>Move. Explore. Experience Kerala.</Text>
      </View>

      {/* Center Action: Play / Stand to Run */}
      <View style={styles.centerSection}>
        <TouchableOpacity style={styles.playBtn} onPress={onStartGame} activeOpacity={0.8}>
          <Text style={styles.playBtnText}>START RUN</Text>
          <Text style={styles.playBtnSub}>STAND UPRIGHT TO RUN 🧍</Text>
        </TouchableOpacity>

        {/* Highscore ticker */}
        <View style={styles.recordPill}>
          <Text style={styles.recordText}>
            🏆 Best Run: {maxKm} KM • {highScore.toLocaleString()} pts
          </Text>
        </View>
      </View>

      {/* Gesture Controls Guide Cards */}
      <View style={styles.gestureGuide}>
        <Text style={styles.guideTitle}>BODY GESTURE CONTROLS (CAMERA)</Text>
        <View style={styles.gestureRow}>
          <View style={styles.gestureCard}>
            <Text style={styles.gestureIcon}>🧍</Text>
            <Text style={styles.gestureLabel}>Stand Upright</Text>
            <Text style={styles.gestureDesc}>Run Forward</Text>
          </View>
          <View style={styles.gestureCard}>
            <Text style={styles.gestureIcon}>👈 👉</Text>
            <Text style={styles.gestureLabel}>Lean Left / Right</Text>
            <Text style={styles.gestureDesc}>Switch Lanes</Text>
          </View>
          <View style={styles.gestureCard}>
            <Text style={styles.gestureIcon}>🙆</Text>
            <Text style={styles.gestureLabel}>Jump Gesture</Text>
            <Text style={styles.gestureDesc}>Hurdle Logs</Text>
          </View>
          <View style={styles.gestureCard}>
            <Text style={styles.gestureIcon}>🧎</Text>
            <Text style={styles.gestureLabel}>Duck / Crouch</Text>
            <Text style={styles.gestureDesc}>Slide Under</Text>
          </View>
        </View>
      </View>

      {/* Bottom Nav Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navBtn} onPress={onOpenMap}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={styles.navText}>Kerala Map</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={onOpenLeaderboard}>
          <Text style={styles.navIcon}>🏆</Text>
          <Text style={styles.navText}>Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={onOpenCalibration}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navText}>Calibrate</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#05140d',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    zIndex: 1000,
  },
  backdropGlow: {
    position: 'absolute',
    top: '20%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    filter: 'blur(70px)',
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 1.5,
  },
  gameTitle: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 6,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  gameSubtitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 20,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 5,
    marginTop: -4,
  },
  tagline: {
    fontSize: 14,
    color: '#a0c7b3',
    fontStyle: 'italic',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  centerSection: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  playBtn: {
    width: '100%',
    backgroundColor: '#ffd700',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    borderWidth: 2,
    borderColor: '#fff5b8',
  },
  playBtnText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 22,
    fontWeight: '900',
    color: '#07170f',
    letterSpacing: 2,
  },
  playBtnSub: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3d2f00',
    marginTop: 3,
    letterSpacing: 1,
  },
  recordPill: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recordText: {
    fontSize: 12,
    color: '#ffd700',
    fontWeight: '600',
  },
  gestureGuide: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: 'rgba(10, 26, 18, 0.75)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  guideTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 12,
  },
  gestureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gestureCard: {
    alignItems: 'center',
  },
  gestureIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  gestureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  gestureDesc: {
    fontSize: 9,
    color: '#8cb8a3',
    marginTop: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    maxWidth: 420,
    justifyContent: 'center',
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  navIcon: {
    fontSize: 16,
  },
  navText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
