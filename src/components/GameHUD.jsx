/**
 * GameHUD.jsx
 * In-game Heads Up Display:
 * Hearts, KM distance, Kasavu gold coins, location badges, active power-ups,
 * and mobile touch swipe fallback controls.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const GameHUD = ({
  hudData,
  onPause,
  isPaused,
  onToggleAudio,
  isMuted,
  onSwipeControl,
}) => {
  const {
    score = 0,
    km = '0.00',
    coins = 0,
    coconuts = 0,
    hearts = 3,
    location = { name: 'Alappuzha', subtitle: 'Backwaters' },
    activePowerUp = null,
    powerUpRemaining = 0,
  } = hudData || {};

  const getPowerUpLabel = () => {
    switch (activePowerUp) {
      case 'GAJA_POWER':
        return { label: '🐘 GAJA SMASH', color: '#ffaa00' };
      case 'CHENDA_BOOST':
        return { label: '⚡ CHENDA BOOST', color: '#00e5ff' };
      case 'COCONUT_SHIELD':
        return { label: '🥥 COCONUT SHIELD', color: '#00ff99' };
      case 'MONSOON_MODE':
        return { label: '🌧️ MONSOON 2X', color: '#8a2be2' };
      default:
        return null;
    }
  };

  const powerUpInfo = getPowerUpLabel();

  return (
    <View style={styles.hudOverlay} pointerEvents="box-none">
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        {/* Hearts & Status */}
        <View style={styles.heartsRow}>
          {[1, 2, 3].map((i) => (
            <Text
              key={i}
              style={[
                styles.heartIcon,
                i > hearts && styles.heartLost,
              ]}
            >
              ❤️
            </Text>
          ))}
        </View>

        {/* Distance Traveled */}
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceValue}>{km}</Text>
          <Text style={styles.distanceUnit}>KM</Text>
          <Text style={styles.locationSmallText}>• {location.name}</Text>
        </View>

        {/* Collectibles & Status */}
        <View style={styles.collectiblesRow}>
          {powerUpInfo && (
            <View style={[styles.statPill, { borderColor: powerUpInfo.color, backgroundColor: 'rgba(5, 15, 10, 0.9)' }]}>
              <Text style={[styles.statValue, { color: powerUpInfo.color, fontSize: 11, fontWeight: '800' }]}>
                {powerUpInfo.label} {powerUpRemaining}s
              </Text>
            </View>
          )}
          <View style={styles.statPill}>
            <Text style={styles.statIcon}>🪙</Text>
            <Text style={styles.statValue}>{coins}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statIcon}>🥥</Text>
            <Text style={styles.statValue}>{coconuts}</Text>
          </View>

          {/* Audio & Pause buttons */}
          <TouchableOpacity style={styles.iconBtn} onPress={onToggleAudio}>
            <Text style={styles.iconBtnText}>{isMuted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onPause}>
            <Text style={styles.iconBtnText}>{isPaused ? '▶️' : '⏸️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* On-screen Touch Controls (Mobile fallback) */}
      <View style={styles.touchControlsArea} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.touchLaneLeft}
          onPress={() => onSwipeControl && onSwipeControl('LEFT')}
          activeOpacity={0.6}
        >
          <Text style={styles.touchLaneHint}>◀</Text>
        </TouchableOpacity>

        <View style={styles.touchVerticalActions}>
          <TouchableOpacity
            style={styles.touchBtnJump}
            onPress={() => onSwipeControl && onSwipeControl('JUMP')}
            activeOpacity={0.6}
          >
            <Text style={styles.touchActionText}>▲ JUMP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.touchBtnSlide}
            onPress={() => onSwipeControl && onSwipeControl('CROUCH')}
            activeOpacity={0.6}
          >
            <Text style={styles.touchActionText}>▼ SLIDE</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.touchLaneRight}
          onPress={() => onSwipeControl && onSwipeControl('RIGHT')}
          activeOpacity={0.6}
        >
          <Text style={styles.touchLaneHint}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingRight: 220, // Leave room for Camera PiP in top-right
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'rgba(10, 26, 18, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  heartIcon: {
    fontSize: 18,
  },
  heartLost: {
    opacity: 0.25,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(10, 26, 18, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  distanceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffd700',
    fontFamily: 'Outfit, sans-serif',
  },
  distanceUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 4,
  },
  collectiblesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 26, 18, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  iconBtn: {
    backgroundColor: 'rgba(10, 26, 18, 0.75)',
    padding: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  iconBtnText: {
    fontSize: 14,
  },
  locationSmallText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9fe3c2',
    marginLeft: 8,
  },
  powerUpPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(5, 15, 10, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 2,
    marginTop: 8,
  },
  powerUpText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  touchControlsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    height: 120,
    paddingBottom: 8,
  },
  touchLaneLeft: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchLaneRight: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchLaneHint: {
    fontSize: 24,
    color: '#ffd700',
  },
  touchVerticalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  touchBtnJump: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#00e5ff',
  },
  touchBtnSlide: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 51, 102, 0.2)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ff3366',
  },
  touchActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
});
