/**
 * LeaderboardModal.jsx
 * Kerala Distance Leaderboard & Regional Champions
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const GLOBAL_LEADERBOARD = [
  { rank: 1, name: 'Ananya Nair (Kochi)', distance: '14.8 km', location: 'Munnar', badge: '👑' },
  { rank: 2, name: 'Rahul Varma (Thrissur)', distance: '12.4 km', location: 'Thrissur', badge: '🥈' },
  { rank: 3, name: 'Fahad Faasil (Alappuzha)', distance: '11.2 km', location: 'Alappuzha', badge: '🥉' },
  { rank: 4, name: 'YOU (Runner)', distance: '8.9 km', location: 'Alappuzha', badge: '⭐', isYou: true },
  { rank: 5, name: 'Devika Menon (Calicut)', distance: '7.5 km', location: 'Wayanad' },
  { rank: 6, name: 'Ashwin Pillai (Trivandrum)', distance: '6.8 km', location: 'Kovalam' },
];

export const LeaderboardModal = ({ isOpen, onClose, currentStats }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('GLOBAL');

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>KERALA LEADERBOARDS</Text>
          <Text style={styles.headerSubtitle}>Longest Physical Journeys Through Kerala</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'GLOBAL' && styles.tabBtnActive]}
            onPress={() => setActiveTab('GLOBAL')}
          >
            <Text style={[styles.tabText, activeTab === 'GLOBAL' && styles.tabTextActive]}>
              🏆 Distance Rankings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'CHAMPIONS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('CHAMPIONS')}
          >
            <Text style={[styles.tabText, activeTab === 'CHAMPIONS' && styles.tabTextActive]}>
              🌴 District Champions
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.list}>
          {activeTab === 'GLOBAL' ? (
            GLOBAL_LEADERBOARD.map((item) => (
              <View
                key={item.rank}
                style={[styles.rankRow, item.isYou && styles.rankRowYou]}
              >
                <View style={styles.rankLeft}>
                  <Text style={styles.rankNumber}>{item.badge || `#${item.rank}`}</Text>
                  <View>
                    <Text style={[styles.playerName, item.isYou && styles.playerTextYou]}>
                      {item.name}
                    </Text>
                    <Text style={styles.playerLoc}>{item.location}</Text>
                  </View>
                </View>
                <Text style={[styles.distanceText, item.isYou && styles.playerTextYou]}>
                  {item.isYou && currentStats ? `${currentStats.km} km` : item.distance}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.championsList}>
              <View style={styles.champCard}>
                <Text style={styles.champEmoji}>🛶</Text>
                <View style={styles.champMeta}>
                  <Text style={styles.champTitle}>Alappuzha Backwater Ace</Text>
                  <Text style={styles.champHolder}>Fahad Faasil • 11.2 km</Text>
                </View>
              </View>
              <View style={styles.champCard}>
                <Text style={styles.champEmoji}>🐘</Text>
                <View style={styles.champMeta}>
                  <Text style={styles.champTitle}>Thrissur Pooram Maestro</Text>
                  <Text style={styles.champHolder}>Rahul Varma • 12.4 km</Text>
                </View>
              </View>
              <View style={styles.champCard}>
                <Text style={styles.champEmoji}>🌿</Text>
                <View style={styles.champMeta}>
                  <Text style={styles.champTitle}>Munnar High-Range Trekker</Text>
                  <Text style={styles.champHolder}>Ananya Nair • 14.8 km</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
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
    backgroundColor: 'rgba(2, 8, 5, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2500,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    backgroundColor: '#0c2117',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d4af37',
    overflow: 'hidden',
  },
  header: {
    padding: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
    position: 'relative',
  },
  headerTitle: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 20,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9cc7b2',
    marginTop: 2,
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    padding: 6,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#ffd700',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  tabText: {
    fontSize: 13,
    color: '#8cb8a3',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffd700',
    fontWeight: '800',
  },
  list: {
    padding: 16,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  rankRowYou: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffd700',
    width: 28,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  playerLoc: {
    fontSize: 11,
    color: '#8cb8a3',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00ff99',
  },
  playerTextYou: {
    color: '#ffd700',
  },
  championsList: {
    gap: 12,
  },
  champCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  champEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  champMeta: {
    flex: 1,
  },
  champTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffd700',
  },
  champHolder: {
    fontSize: 12,
    color: '#b0d6c4',
    marginTop: 2,
  },
});
