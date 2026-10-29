/**
 * LeaderboardModal.jsx
 * Kerala Distance & Score Leaderboard with live database integration.
 * Refined Kerala aesthetic: Kasavu gold medals, classical typography,
 * district heritage emblems, and zero emojis.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getLeaderboardAsync } from '../services/scoreService';
import {
  TrophyIcon,
  RunnerIcon,
  CloseIcon,
  RefreshIcon,
  SnakeBoatIcon,
  TempleElephantIcon,
  TeaHillsIcon,
  KeralaLotusOrnament,
} from './Icons';

export const LeaderboardModal = ({ isOpen, onClose, currentStats, playerName = '' }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('GLOBAL');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeRunnerName = playerName || localStorage.getItem('gokerala_player_name') || 'Traveler';

  const fetchScores = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboardAsync(25);
      setLeaderboard(data);
    } catch (e) {
      console.warn('Error loading leaderboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchScores();
    }
  }, [isOpen]);

  // Render refined metallic rank badge (completely replaces platform emojis)
  const renderRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #ffd700 0%, #c59b27 100%)',
          color: '#091c13',
          fontWeight: 900,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 10px rgba(255, 215, 0, 0.45)',
          border: '1px solid #fff3a8',
          fontFamily: 'Cinzel, Georgia, serif',
          flexShrink: 0,
        }}>
          I
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
          color: '#0f172a',
          fontWeight: 900,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 8px rgba(226, 232, 240, 0.35)',
          border: '1px solid #ffffff',
          fontFamily: 'Cinzel, Georgia, serif',
          flexShrink: 0,
        }}>
          II
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
          color: '#fff',
          fontWeight: 900,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 8px rgba(249, 115, 22, 0.3)',
          border: '1px solid #fdba74',
          fontFamily: 'Cinzel, Georgia, serif',
          flexShrink: 0,
        }}>
          III
        </div>
      );
    }
    return (
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#9cc7b2',
        fontWeight: 700,
        fontSize: 11,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontFamily: 'Outfit, sans-serif',
        flexShrink: 0,
      }}>
        #{rank}
      </div>
    );
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <KeralaLotusOrnament size={20} color="#ffd700" />
            <Text style={styles.headerTitle}>TRAVELERS' CHRONICLE</Text>
          </div>
          <Text style={styles.headerSubtitle}>
            Permanent Distance Rankings Across God's Own Country
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <CloseIcon size={18} color="#ffd700" />
          </TouchableOpacity>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'GLOBAL' && styles.tabBtnActive]}
            onPress={() => setActiveTab('GLOBAL')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <TrophyIcon size={14} color={activeTab === 'GLOBAL' ? '#ffd700' : '#8cb8a3'} />
              <Text style={[styles.tabText, activeTab === 'GLOBAL' && styles.tabTextActive]}>
                Distance & Points
              </Text>
            </div>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'CHAMPIONS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('CHAMPIONS')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <SnakeBoatIcon size={16} color={activeTab === 'CHAMPIONS' ? '#ffd700' : '#8cb8a3'} />
              <Text style={[styles.tabText, activeTab === 'CHAMPIONS' && styles.tabTextActive]}>
                District Champions
              </Text>
            </div>
          </TouchableOpacity>
        </View>

        {/* Runner Status Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RunnerIcon size={14} color="#ffd700" />
            <span style={{ fontSize: 11.5, color: '#9cc7b2' }}>
              Active Traveler: <strong style={{ color: '#ffd700', letterSpacing: 0.4 }}>{activeRunnerName}</strong>
            </span>
          </div>
          <button
            onClick={fetchScores}
            disabled={isLoading}
            style={{
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#ffd700',
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 10.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'background-color 0.2s',
            }}
          >
            <RefreshIcon size={12} color="#ffd700" />
            <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Content List */}
        <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 16 }}>
          {activeTab === 'GLOBAL' ? (
            leaderboard.map((item) => {
              const isYou = item.name.toLowerCase() === activeRunnerName.toLowerCase();
              return (
                <View
                  key={item.id || item.rank}
                  style={[styles.rankRow, isYou && styles.rankRowYou]}
                >
                  <View style={styles.rankLeft}>
                    {renderRankBadge(item.rank)}
                    <View style={{ marginLeft: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.playerName, isYou && styles.playerTextYou]}>
                          {item.name}
                        </Text>
                        {isYou && (
                          <span style={{
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: 0.8,
                            color: '#07170f',
                            backgroundColor: '#ffd700',
                            padding: '1px 6px',
                            borderRadius: 4,
                          }}>
                            YOU
                          </span>
                        )}
                      </div>
                      <Text style={styles.playerLoc}>{item.location}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.distanceText, isYou && styles.playerTextYou]}>
                      {item.distance}
                    </Text>
                    {item.score ? (
                      <Text style={{ fontSize: 10.5, color: '#ffd700', fontWeight: '700' }}>
                        {item.score.toLocaleString()} pts
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.championsList}>
              <View style={styles.champCard}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                  flexShrink: 0,
                }}>
                  <SnakeBoatIcon size={24} color="#ffd700" />
                </div>
                <View style={styles.champMeta}>
                  <Text style={styles.champTitle}>Alappuzha Backwater Master</Text>
                  <Text style={styles.champHolder}>Fahad Faasil • 11.2 km</Text>
                  <Text style={styles.champDesc}>Record holder for fastest sprint across Vembanad canal banks</Text>
                </View>
              </View>

              <View style={styles.champCard}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                  flexShrink: 0,
                }}>
                  <TempleElephantIcon size={24} color="#ffd700" />
                </div>
                <View style={styles.champMeta}>
                  <Text style={styles.champTitle}>Thrissur Pooram Maestro</Text>
                  <Text style={styles.champHolder}>Rahul Varma • 12.4 km</Text>
                  <Text style={styles.champDesc}>Legendary physical endurance through Vadakkumnathan temple perimeter</Text>
                </View>
              </View>

              <View style={styles.champCard}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(110, 231, 183, 0.12)',
                  border: '1px solid rgba(110, 231, 183, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                  flexShrink: 0,
                }}>
                  <TeaHillsIcon size={24} color="#6ee7b7" />
                </div>
                <View style={styles.champMeta}>
                  <Text style={styles.champTitle}>Munnar High-Range Trekker</Text>
                  <Text style={styles.champHolder}>Ananya Nair • 14.8 km</Text>
                  <Text style={styles.champDesc}>Undefeated record across misty Western Ghats tea slope elevations</Text>
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
    backgroundColor: 'rgba(2, 10, 6, 0.9)',
    backdropFilter: 'blur(14px)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2500,
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 490,
    maxHeight: '84%',
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
    letterSpacing: 1.6,
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
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#ffd700',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  tabText: {
    fontSize: 12.5,
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
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  rankRowYou: {
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.6)',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  playerLoc: {
    fontSize: 11,
    color: '#8cb8a3',
    marginTop: 1,
  },
  distanceText: {
    fontSize: 13.5,
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
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  champMeta: {
    flex: 1,
  },
  champTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 0.4,
  },
  champHolder: {
    fontSize: 12,
    color: '#b0d6c4',
    marginTop: 2,
    fontWeight: '600',
  },
  champDesc: {
    fontSize: 10.5,
    color: '#8cb8a3',
    marginTop: 3,
    lineHeight: 14,
  },
});
