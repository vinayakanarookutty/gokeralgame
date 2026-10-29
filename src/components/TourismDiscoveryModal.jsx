/**
 * TourismDiscoveryModal.jsx
 * Cultural celebration modal shown when discovering a new Kerala destination.
 * Connects the game directly to authentic Kerala cultural heritage.
 * Elegant Kerala aesthetic with zero platform emojis.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { KeralaLotusOrnament, CompassMapIcon, PlayIcon } from './Icons';

export const TourismDiscoveryModal = ({ location, isOpen, onContinue }) => {
  if (!isOpen || !location) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Glow badge */}
        <View style={styles.badge}>
          <KeralaLotusOrnament size={14} color="#ffd700" />
          <Text style={styles.badgeText}>NEW DESTINATION DISCOVERED</Text>
          <KeralaLotusOrnament size={14} color="#ffd700" />
        </View>

        <Text style={styles.title}>You Have Reached {location.name}</Text>
        <Text style={styles.subtitle}>{location.subtitle}</Text>

        <View style={styles.factCard}>
          <Text style={styles.factHeading}>CULTURAL HERITAGE NOTE</Text>
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
            activeOpacity={0.8}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <CompassMapIcon size={14} color="#ffd700" />
              <Text style={styles.exploreBtnText}>Explore Destination Archive</Text>
            </div>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Text style={styles.continueBtnText}>RESUME SPRINT</Text>
              <PlayIcon size={12} color="#07170f" />
            </div>
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
    backgroundColor: 'rgba(2, 10, 6, 0.92)',
    backdropFilter: 'blur(16px)',
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
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.65)',
    padding: 26,
    alignItems: 'center',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 175, 55, 0.22)',
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  badgeText: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 9.5,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#9cc7b2',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  factCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderLeftWidth: 3,
    borderLeftColor: '#ffd700',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  factHeading: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 9.5,
    fontWeight: '800',
    color: '#ffd700',
    marginBottom: 4,
    letterSpacing: 1.2,
  },
  factBody: {
    fontSize: 12,
    color: '#d4e2db',
    lineHeight: 17,
  },
  promptText: {
    fontSize: 12.5,
    color: '#a0c7b3',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  exploreBtn: {
    flex: 1.1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  exploreBtnText: {
    color: '#ffd700',
    fontSize: 11.5,
    fontWeight: '700',
  },
  continueBtn: {
    flex: 1,
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(212, 175, 55, 0.35)',
  },
  continueBtnText: {
    color: '#07170f',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
