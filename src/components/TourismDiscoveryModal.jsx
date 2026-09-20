/**
 * TourismDiscoveryModal.jsx
 * Cultural celebration modal shown when discovering a new Kerala destination
 * Connects the game directly to the GoKerala Tourism platform.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const TourismDiscoveryModal = ({ location, isOpen, onContinue }) => {
  if (!isOpen || !location) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Glow badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🌴 NEW DESTINATION UNLOCKED</Text>
        </View>

        <Text style={styles.title}>You Discovered {location.name}!</Text>
        <Text style={styles.subtitle}>{location.subtitle}</Text>

        <View style={styles.factCard}>
          <Text style={styles.factHeading}>💡 Did you know?</Text>
          <Text style={styles.factBody}>{location.fact}</Text>
        </View>

        <Text style={styles.promptText}>
          {location.description}
        </Text>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => {
              window.open(`https://www.keralatourism.org/destination/${location.id.toLowerCase()}`, '_blank');
            }}
          >
            <Text style={styles.exploreBtnText}>🌐 Explore Real Destination</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
            <Text style={styles.continueBtnText}>KEEP RUNNING ▶</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(2, 10, 6, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#0c2419',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#ffd700',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#95c4ae',
    marginBottom: 16,
  },
  factCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd700',
    marginBottom: 16,
  },
  factHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffd700',
    marginBottom: 4,
  },
  factBody: {
    fontSize: 13,
    color: '#e0f0e8',
    lineHeight: 18,
  },
  promptText: {
    fontSize: 13,
    color: '#b0d6c4',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  exploreBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  continueBtn: {
    flex: 1,
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#081a11',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
