/**
 * GameHUD.jsx
 * In-game Heads Up Display:
 * Hearts, KM distance, Kasavu gold coins, location badges, active power-ups,
 * control mode pill switcher, and mobile touch swipe fallback controls.
 * Classy Kerala theme with bespoke vector icons and zero platform emojis.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CONTROL_MODES } from '../services/GestureDetector';
import {
  KasavuCoinIcon,
  CoconutIcon,
  VitalityHeartIcon,
  BodyStanceIcon,
  HeadMotionIcon,
  PalmGestureIcon,
  AudioVolumeIcon,
  PauseIcon,
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from './Icons';

const GameHUDComponent = ({
  onPause,
  isPaused,
  onToggleAudio,
  isMuted,
  onSwipeControl,
  hudData,
  controlMode = CONTROL_MODES.HALF_BODY,
  onChangeControlMode,
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
        return { label: 'GAJA STRENGTH', color: '#ffaa00' };
      case 'CHENDA_BOOST':
        return { label: 'CHENDA TEMPO', color: '#00e5ff' };
      case 'COCONUT_SHIELD':
        return { label: 'COCONUT SHIELD', color: '#00ff99' };
      case 'MONSOON_MODE':
        return { label: 'MONSOON SURGE', color: '#c084fc' };
      default:
        return null;
    }
  };

  const powerUpInfo = getPowerUpLabel();

  const handleCycleMode = () => {
    if (!onChangeControlMode) return;
    if (controlMode === CONTROL_MODES.HALF_BODY) {
      onChangeControlMode(CONTROL_MODES.HEAD_ONLY);
    } else if (controlMode === CONTROL_MODES.HEAD_ONLY) {
      onChangeControlMode(CONTROL_MODES.PALM_ONLY);
    } else {
      onChangeControlMode(CONTROL_MODES.HALF_BODY);
    }
  };

  const getModeInfo = () => {
    switch (controlMode) {
      case CONTROL_MODES.HEAD_ONLY:
        return { Icon: HeadMotionIcon, text: 'HEAD', color: '#38bdf8' };
      case CONTROL_MODES.PALM_ONLY:
        return { Icon: PalmGestureIcon, text: 'PALM', color: '#ffd700' };
      default:
        return { Icon: BodyStanceIcon, text: 'BODY', color: '#00ff99' };
    }
  };

  const modeInfo = getModeInfo();
  const ModeIcon = modeInfo.Icon;

  return (
    <View style={styles.hudOverlay} pointerEvents="box-none">
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        {/* Hearts & Vitality */}
        <View style={styles.heartsRow}>
          {[1, 2, 3].map((i) => (
            <VitalityHeartIcon
              key={i}
              size={18}
              filled={i <= hearts}
              color="#ef4444"
            />
          ))}
        </View>

        {/* Distance Traveled & Location Badge */}
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceValue}>{km}</Text>
          <Text style={styles.distanceUnit}>KM</Text>
          <Text style={styles.locationSmallText}>• {location.name}</Text>
        </View>

        {/* Collectibles & Control Switcher */}
        <View style={styles.collectiblesRow}>
          {powerUpInfo && (
            <View style={[styles.statPill, { borderColor: powerUpInfo.color, backgroundColor: 'rgba(5, 18, 12, 0.92)' }]}>
              <Text style={[styles.statValue, { color: powerUpInfo.color, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5 }]}>
                {powerUpInfo.label} {powerUpRemaining}s
              </Text>
            </View>
          )}

          {/* Mode Pill (Tap to Cycle) */}
          <TouchableOpacity
            style={[styles.statPill, styles.modePill, { borderColor: `${modeInfo.color}80` }]}
            onPress={handleCycleMode}
            accessibilityLabel="Cycle Gesture Control Mode"
            activeOpacity={0.7}
          >
            <ModeIcon size={14} color={modeInfo.color} />
            <Text style={[styles.modePillText, { color: modeInfo.color }]}>{modeInfo.text}</Text>
          </TouchableOpacity>

          {/* Kasavu Gold Coins */}
          <View style={styles.statPill}>
            <KasavuCoinIcon size={16} color="#ffd700" />
            <Text style={[styles.statValue, { marginLeft: 4 }]}>{coins}</Text>
          </View>

          {/* Tender Coconuts */}
          <View style={styles.statPill}>
            <CoconutIcon size={16} color="#6ee7b7" />
            <Text style={[styles.statValue, { marginLeft: 4 }]}>{coconuts}</Text>
          </View>

          {/* Audio Toggle Button */}
          <TouchableOpacity style={styles.iconBtn} onPress={onToggleAudio} activeOpacity={0.7}>
            <AudioVolumeIcon size={15} muted={isMuted} color={isMuted ? '#f87171' : '#ffd700'} />
          </TouchableOpacity>

          {/* Pause / Resume Button */}
          <TouchableOpacity style={styles.iconBtn} onPress={onPause} activeOpacity={0.7}>
            {isPaused ? (
              <PlayIcon size={13} color="#00ff99" />
            ) : (
              <PauseIcon size={13} color="#ffd700" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* On-screen Touch Controls (Mobile fallback) */}
      <View style={styles.touchControlsArea} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.touchLaneLeft}
          onPress={() => onSwipeControl && onSwipeControl('LEFT')}
          activeOpacity={0.65}
        >
          <ChevronLeftIcon size={26} color="#ffd700" />
        </TouchableOpacity>

        <View style={styles.touchVerticalActions}>
          <TouchableOpacity
            style={styles.touchBtnJump}
            onPress={() => onSwipeControl && onSwipeControl('JUMP')}
            activeOpacity={0.65}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <ArrowUpIcon size={14} color="#00e5ff" />
              <Text style={styles.touchActionText}>JUMP</Text>
            </div>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.touchBtnSlide}
            onPress={() => onSwipeControl && onSwipeControl('CROUCH')}
            activeOpacity={0.65}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <ArrowDownIcon size={14} color="#ff3366" />
              <Text style={styles.touchActionText}>SLIDE</Text>
            </div>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.touchLaneRight}
          onPress={() => onSwipeControl && onSwipeControl('RIGHT')}
          activeOpacity={0.65}
        >
          <ChevronRightIcon size={26} color="#ffd700" />
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
    gap: 6,
    backgroundColor: 'rgba(8, 24, 16, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(8, 24, 16, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffd700',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
  },
  distanceValue: {
    fontSize: 21,
    fontWeight: '900',
    color: '#ffd700',
    fontFamily: 'Outfit, sans-serif',
  },
  distanceUnit: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  collectiblesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 24, 16, 0.82)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  modePill: {
    cursor: 'pointer',
    gap: 4,
  },
  modePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'Outfit, sans-serif',
  },
  iconBtn: {
    backgroundColor: 'rgba(8, 24, 16, 0.82)',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationSmallText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#9fe3c2',
    marginLeft: 8,
    letterSpacing: 0.3,
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
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchLaneRight: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchVerticalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  touchBtnJump: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.18)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#00e5ff',
  },
  touchBtnSlide: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 51, 102, 0.18)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#ff3366',
  },
  touchActionText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
});

export const GameHUD = React.memo(GameHUDComponent);
