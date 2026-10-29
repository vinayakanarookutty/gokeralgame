/**
 * KeralaMapModal.jsx
 * Stylized interactive map of Kerala tracking traveler's expedition from North to South.
 * Refined Kerala aesthetic with cultural vector insignia and zero platform emojis.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {
  CompassMapIcon,
  CloseIcon,
  SnakeBoatIcon,
  CoastWavesIcon,
  TeaHillsIcon,
  TempleElephantIcon,
  KeralaLotusOrnament,
} from './Icons';

const MAP_NODES = [
  {
    id: 'ALAPPUZHA',
    name: 'Alappuzha Backwaters',
    sub: 'Active Sprint • Vembanad Lake & Palm Canals',
    status: 'ACTIVE',
    IconComponent: SnakeBoatIcon,
    color: '#ffd700',
  },
  {
    id: 'KOCHI',
    name: 'Fort Kochi Coast',
    sub: 'Next Map • Queen of the Arabian Sea & Chinese Fishing Nets',
    status: 'NEXT',
    IconComponent: CoastWavesIcon,
    color: '#38bdf8',
  },
  {
    id: 'MUNNAR',
    name: 'Munnar Tea Hills',
    sub: 'Upcoming World • High Ranges of the Western Ghats',
    status: 'LOCKED',
    IconComponent: TeaHillsIcon,
    color: '#6ee7b7',
  },
  {
    id: 'THRISSUR',
    name: 'Thrissur Pooram',
    sub: 'Upcoming World • Vadakkumnathan Heritage Festival',
    status: 'LOCKED',
    IconComponent: TempleElephantIcon,
    color: '#d4af37',
  },
  {
    id: 'WAYANAD',
    name: 'Wayanad Rainforest',
    sub: 'Upcoming World • Monsoon Cloud Forests & Edakkal Caves',
    status: 'LOCKED',
    IconComponent: KeralaLotusOrnament,
    color: '#10b981',
  },
  {
    id: 'KOVALAM',
    name: 'Kovalam & Varkala Cliffs',
    sub: 'Upcoming World • Coastal Red Cliffs & Sunset Waters',
    status: 'LOCKED',
    IconComponent: CoastWavesIcon,
    color: '#38bdf8',
  },
];

export const KeralaMapModal = ({ isOpen, onClose, currentDistanceKm = 0, onSelectLocation }) => {
  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <CompassMapIcon size={20} color="#ffd700" />
            <Text style={styles.headerTitle}>KERALA EXPEDITION MAP</Text>
          </div>
          <Text style={styles.headerSubtitle}>Current World: Alappuzha Infinite Sprint</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <CloseIcon size={18} color="#ffd700" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          <View style={styles.timeline}>
            {MAP_NODES.map((node, index) => {
              const isActive = node.status === 'ACTIVE';
              const isNext = node.status === 'NEXT';
              const Icon = node.IconComponent;

              return (
                <View key={node.id} style={styles.timelineItem}>
                  {/* Node Connector Line */}
                  {index < MAP_NODES.length - 1 && <View style={styles.connectorLine} />}

                  {/* Marker Dot */}
                  <View style={[styles.marker, isActive && styles.markerUnlocked, isNext && { borderColor: '#00f0ff' }]}>
                    <Icon size={18} color={isActive ? '#ffd700' : isNext ? '#00f0ff' : '#8cb8a3'} />
                  </View>

                  {/* Details Card */}
                  <View
                    style={[
                      styles.nodeDetails,
                      isActive && styles.nodeDetailsUnlocked,
                      isNext && { borderColor: 'rgba(0, 240, 255, 0.4)', backgroundColor: 'rgba(0, 240, 255, 0.05)' },
                    ]}
                  >
                    <View style={styles.nodeHeaderRow}>
                      <Text style={styles.nodeTitle}>{node.name}</Text>
                      {isActive ? (
                        <Text style={[styles.unlockedTag, { backgroundColor: '#ffd700', color: '#07170f' }]}>CURRENT WORLD</Text>
                      ) : isNext ? (
                        <Text style={[styles.lockedTag, { color: '#00f0ff', borderColor: '#00f0ff' }]}>NEXT WORLD</Text>
                      ) : (
                        <Text style={styles.lockedTag}>UPCOMING</Text>
                      )}
                    </View>
                    <Text style={styles.nodeSub}>{node.sub}</Text>
                  </View>
                </View>
              );
            })}
          </View>
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
    backgroundColor: 'rgba(2, 10, 6, 0.9)',
    backdropFilter: 'blur(14px)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2500,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '82%',
    backgroundColor: '#0a2016',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.65)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.2)',
    overflow: 'hidden',
  },
  header: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
    position: 'relative',
  },
  headerTitle: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 19,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#9cc7b2',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    zIndex: 1,
  },
  marker: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0c261b',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    marginRight: 14,
    flexShrink: 0,
  },
  markerUnlocked: {
    borderColor: '#ffd700',
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
  },
  nodeDetails: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 13,
  },
  nodeDetailsUnlocked: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  nodeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  nodeSub: {
    fontSize: 11,
    color: '#a0c7b3',
    lineHeight: 15,
  },
  unlockedTag: {
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    letterSpacing: 0.6,
  },
  lockedTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8cb8a3',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    letterSpacing: 0.6,
  },
});
