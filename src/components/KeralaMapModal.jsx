/**
 * KeralaMapModal.jsx
 * Stylized interactive map of Kerala tracking player's journey from North to South.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LOCATIONS } from '../game/KeralaWorlds';

const MAP_NODES = [
  { id: 'KASARAGOD', name: 'Bekal & Kasaragod', kmTarget: 0, unlocked: true, icon: '🏰' },
  { id: 'WAYANAD', name: 'Wayanad Rainforest', kmTarget: 1.8, unlocked: true, icon: '🌧️' },
  { id: 'KOZHIKODE', name: 'Kozhikode Malabar', kmTarget: 2.5, unlocked: true, icon: '⛵' },
  { id: 'THRISSUR', name: 'Thrissur Pooram', kmTarget: 1.2, unlocked: true, icon: '🐘' },
  { id: 'MUNNAR', name: 'Munnar Tea Hills', kmTarget: 0.6, unlocked: true, icon: '🌿' },
  { id: 'ALAPPUZHA', name: 'Alappuzha Backwaters', kmTarget: 0, unlocked: true, icon: '🌴' },
  { id: 'KOCHI', name: 'Fort Kochi Coast', kmTarget: 3.2, unlocked: false, icon: '🎣' },
  { id: 'KOVALAM', name: 'Kovalam & Varkala Cliffs', kmTarget: 2.4, unlocked: true, icon: '🌊' },
];

export const KeralaMapModal = ({ isOpen, onClose, currentDistanceKm = 0, onSelectLocation }) => {
  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>KERALA JOURNEY MAP</Text>
          <Text style={styles.headerSubtitle}>Traverse the Spice Coast through Body Movement</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          <View style={styles.timeline}>
            {MAP_NODES.map((node, index) => {
              const isUnlocked = currentDistanceKm >= node.kmTarget;
              return (
                <View key={node.id} style={styles.timelineItem}>
                  {/* Node Connector Line */}
                  {index < MAP_NODES.length - 1 && <View style={styles.connectorLine} />}

                  {/* Marker Dot */}
                  <View style={[styles.marker, isUnlocked && styles.markerUnlocked]}>
                    <Text style={styles.markerIcon}>{node.icon}</Text>
                  </View>

                  {/* Details Card */}
                  <TouchableOpacity
                    style={[styles.nodeDetails, isUnlocked && styles.nodeDetailsUnlocked]}
                    onPress={() => {
                      if (isUnlocked && LOCATIONS[node.id] && onSelectLocation) {
                        onSelectLocation(LOCATIONS[node.id]);
                        onClose();
                      }
                    }}
                    disabled={!isUnlocked}
                  >
                    <View style={styles.nodeHeaderRow}>
                      <Text style={styles.nodeTitle}>{node.name}</Text>
                      {isUnlocked ? (
                        <Text style={styles.unlockedTag}>EXPLORED</Text>
                      ) : (
                        <Text style={styles.lockedTag}>🔒 {node.kmTarget} KM</Text>
                      )}
                    </View>
                    <Text style={styles.nodeSub}>
                      {isUnlocked ? 'Click to set starting environment' : `Run ${node.kmTarget} km with gestures to unlock`}
                    </Text>
                  </TouchableOpacity>
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
    backgroundColor: 'rgba(2, 8, 5, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2500,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    backgroundColor: '#091c13',
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  timeline: {
    position: 'relative',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    left: 21,
    top: 36,
    width: 2,
    height: 42,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#152b21',
    borderWidth: 2,
    borderColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    zIndex: 2,
  },
  markerUnlocked: {
    borderColor: '#ffd700',
    backgroundColor: '#1b402e',
  },
  markerIcon: {
    fontSize: 20,
  },
  nodeDetails: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  nodeDetailsUnlocked: {
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  nodeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nodeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  unlockedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00ff99',
    backgroundColor: 'rgba(0, 255, 153, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffaa66',
    backgroundColor: 'rgba(255, 170, 102, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nodeSub: {
    fontSize: 11,
    color: '#8cb8a3',
    marginTop: 4,
  },
});
