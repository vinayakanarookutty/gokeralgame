/**
 * GameOverModal.jsx
 * Game over summary screen with Kerala distance stats, collectibles,
 * runner profile, and quick restart or calibration.
 * Classy Kerala theme, warm humanized travel chronicle, and zero emojis.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  KasavuCoinIcon,
  CoconutIcon,
  RunnerIcon,
  PlayIcon,
  TrophyIcon,
  CompassMapIcon,
  CalibrationSlidersIcon,
  KeralaLotusOrnament,
} from './Icons';

export const GameOverModal = ({
  isOpen,
  stats,
  onRestart,
  onOpenMap,
  onOpenCalibration,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  const {
    score = 0,
    km = '0.00',
    coins = 0,
    coconuts = 0,
    location = 'Kerala',
    playerName = 'Traveler',
  } = stats || {};

  const locationName = typeof location === 'object' ? location.name : location;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Traveler Profile Header Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.45)',
          borderRadius: 20,
          padding: '5px 14px',
          marginBottom: 12,
        }}>
          <RunnerIcon size={14} color="#ffd700" />
          <span style={{ fontSize: 11.5, fontWeight: '800', color: '#ffd700', letterSpacing: 1 }}>
            TRAVELER: {playerName || 'Traveler'}
          </span>
        </div>

        <Text style={styles.headerTitle}>JOURNEY CONCLUDED</Text>
        <Text style={styles.headerSubtitle}>
          You navigated through {locationName}
        </Text>

        {/* 4-Stat Grid with Bespoke Vector Iconography */}
        <View style={styles.statGrid}>
          {/* Distance */}
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{km}</Text>
            <Text style={styles.statLabel}>KILOMETERS</Text>
          </View>

          {/* Points */}
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{score.toLocaleString()}</Text>
            <Text style={styles.statLabel}>EXPEDITION POINTS</Text>
          </View>

          {/* Kasavu Gold Coins */}
          <View style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <KasavuCoinIcon size={20} color="#ffd700" />
              <Text style={styles.statValue}>{coins}</Text>
            </div>
            <Text style={styles.statLabel}>KASAVU COINS</Text>
          </View>

          {/* Tender Coconuts */}
          <View style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CoconutIcon size={20} color="#6ee7b7" />
              <Text style={styles.statValue}>{coconuts}</Text>
            </div>
            <Text style={styles.statLabel}>TENDER COCONUTS</Text>
          </View>
        </View>

        {/* Humanized Sync Feedback */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 18,
          padding: '8px 14px',
          background: 'rgba(0, 255, 153, 0.06)',
          borderRadius: 12,
          border: '1px solid rgba(0, 255, 153, 0.22)',
          boxSizing: 'border-box',
        }}>
          <KeralaLotusOrnament size={14} color="#00ff99" />
          <span style={{ fontSize: 11.5, color: '#b0d6c4', fontWeight: '500', letterSpacing: 0.3 }}>
            Your journey has been inscribed in the Kerala Chronicle
          </span>
        </div>

        {/* Action Button Stack */}
        <View style={styles.buttonStack}>
          <TouchableOpacity style={styles.btnPrimary} onPress={onRestart} activeOpacity={0.85}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Text style={styles.btnPrimaryText}>BEGIN NEW RUN</Text>
              <PlayIcon size={13} color="#091c13" />
            </div>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            {onOpenLeaderboard && (
              <TouchableOpacity style={styles.btnSecondary} onPress={onOpenLeaderboard} activeOpacity={0.8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrophyIcon size={14} color="#ffd700" />
                  <Text style={styles.btnSecondaryText}>Chronicle</Text>
                </div>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnSecondary} onPress={onOpenMap} activeOpacity={0.8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CompassMapIcon size={14} color="#ffd700" />
                <Text style={styles.btnSecondaryText}>Kerala Map</Text>
              </div>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={onOpenCalibration} activeOpacity={0.8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalibrationSlidersIcon size={14} color="#ffd700" />
                <Text style={styles.btnSecondaryText}>Calibrate</Text>
              </div>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 10, 6, 0.92)',
    backdropFilter: 'blur(16px)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3500,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#0c2318',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.65)',
    padding: 28,
    alignItems: 'center',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 175, 55, 0.22)',
  },
  headerTitle: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 24,
    fontWeight: '900',
    color: '#f87171',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#a0c7b3',
    marginTop: 4,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffd700',
    fontFamily: 'Outfit, sans-serif',
  },
  statLabel: {
    fontSize: 9.5,
    color: '#8cb8a3',
    fontWeight: '700',
    marginTop: 5,
    letterSpacing: 0.6,
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: '#ffd700',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    boxShadow: '0 6px 20px rgba(212, 175, 55, 0.35)',
  },
  btnPrimaryText: {
    color: '#091c13',
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: 'Outfit, sans-serif',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  btnSecondaryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
