/**
 * GameOverModal.jsx
 * Game over summary screen with Kerala distance stats, collectibles,
 * and quick restart or calibration.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const GameOverModal = ({
  isOpen,
  stats,
  onRestart,
  onOpenMap,
  onOpenCalibration,
}) => {
  if (!isOpen) return null;

  const {
    score = 0,
    km = '0.00',
    coins = 0,
    coconuts = 0,
    location = 'Kerala',
  } = stats || {};

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>JOURNEY ENDED</Text>
        <Text style={styles.headerSubtitle}>You traveled across {location}</Text>

        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{km}</Text>
            <Text style={styles.statLabel}>KILOMETERS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{score.toLocaleString()}</Text>
            <Text style={styles.statLabel}>POINTS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🪙 {coins}</Text>
            <Text style={styles.statLabel}>KASAVU COINS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🥥 {coconuts}</Text>
            <Text style={styles.statLabel}>COCONUTS</Text>
          </View>
        </View>

        <View style={styles.buttonStack}>
          <TouchableOpacity style={styles.btnPrimary} onPress={onRestart}>
            <Text style={styles.btnPrimaryText}>RUN AGAIN ⚡</Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onOpenMap}>
              <Text style={styles.btnSecondaryText}>🗺️ View Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={onOpenCalibration}>
              <Text style={styles.btnSecondaryText}>⚙️ Calibrate</Text>
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
    backgroundColor: 'rgba(2, 8, 5, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3500,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0c2217',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffd700',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  headerTitle: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 26,
    fontWeight: '900',
    color: '#ff4d4d',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#a0c7b3',
    marginTop: 4,
    marginBottom: 20,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffd700',
  },
  statLabel: {
    fontSize: 10,
    color: '#8cb8a3',
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
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
  },
  btnPrimaryText: {
    color: '#091c13',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  btnSecondaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
