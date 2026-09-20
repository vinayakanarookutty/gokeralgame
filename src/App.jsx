/**
 * App.jsx
 * GoKerala: Gesture Run - Main Application Root
 * Integrates Three.js 3D Engine, Camera PiP Body Gesture Tracking,
 * Kerala Levels, Chenda Audio, and Tourism Discovery.
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GameCanvas } from './game/GameCanvas';
import { CameraPiP } from './components/CameraPiP';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { CalibrationModal } from './components/CalibrationModal';
import { KeralaMapModal } from './components/KeralaMapModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { TourismDiscoveryModal } from './components/TourismDiscoveryModal';
import { GameOverModal } from './components/GameOverModal';
import { audioEngine } from './services/AudioEngine';

export const App = () => {
  // Game State
  const [gameState, setGameState] = useState('MENU'); // 'MENU', 'PLAYING', 'PAUSED', 'GAME_OVER'
  const [hudData, setHudData] = useState({
    score: 0,
    distance: 0,
    km: '0.00',
    coins: 0,
    coconuts: 0,
    hearts: 3,
    location: { name: 'Alappuzha Backwaters', subtitle: 'Venice of the East' },
    activePowerUp: null,
    powerUpRemaining: 0,
  });
  const [gameOverStats, setGameOverStats] = useState(null);

  // Modals
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [discoveredLocation, setDiscoveredLocation] = useState(null);

  // Gestures & Calibration
  const [latestGesture, setLatestGesture] = useState(null);
  const [liveTracking, setLiveTracking] = useState(null);
  const [calibrationData, setCalibrationData] = useState(() => {
    try {
      const saved = localStorage.getItem('gokerala_calibration');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Audio & Records
  const [isMuted, setIsMuted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gokerala_high_score') || '0', 10);
  });
  const [maxKm, setMaxKm] = useState(() => {
    return localStorage.getItem('gokerala_max_km') || '0.00';
  });

  const engineRef = useRef(null);

  // Handle gesture received from Camera PiP directly to engine to prevent 60fps React re-renders
  const handleGestureDetected = (data) => {
    if (engineRef.current) {
      engineRef.current.handleGesture(data);
    }
    // Only update state when calibration modal is open to avoid render overhead
    if (isCalibrationOpen) {
      setLiveTracking(data);
    }
  };

  // Save new calibration
  const handleSaveCalibration = (newCalibration) => {
    setCalibrationData(newCalibration);
    try {
      localStorage.setItem('gokerala_calibration', JSON.stringify(newCalibration));
    } catch (e) {
      console.error(e);
    }
  };

  // Game lifecycle
  const handleStartGame = () => {
    setGameState('PLAYING');
    audioEngine.init();
    if (engineRef.current) {
      engineRef.current.start();
    }
  };

  const handlePauseToggle = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
      if (engineRef.current) engineRef.current.pause();
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
      if (engineRef.current) engineRef.current.resume();
    }
  };

  const handleToggleAudio = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleGameOver = (stats) => {
    setGameState('GAME_OVER');
    setGameOverStats(stats);

    // Update records
    if (stats.score > highScore) {
      setHighScore(stats.score);
      localStorage.setItem('gokerala_high_score', stats.score.toString());
    }
    if (parseFloat(stats.km) > parseFloat(maxKm)) {
      setMaxKm(stats.km);
      localStorage.setItem('gokerala_max_km', stats.km);
    }
  };

  const handleLocationDiscovered = (location) => {
    setDiscoveredLocation(location);
    if (engineRef.current) {
      engineRef.current.pause();
    }
  };

  const handleContinueTourism = () => {
    setDiscoveredLocation(null);
    if (engineRef.current) {
      engineRef.current.resume();
    }
  };

  const handleRestart = () => {
    setGameState('PLAYING');
    setGameOverStats(null);
    if (engineRef.current) {
      engineRef.current.destroy();
    }
    // Re-mount happens via key change
  };

  // On-screen touch swipe fallback
  const handleSwipeControl = (action) => {
    if (action === 'LEFT') {
      setLatestGesture({ gesture: 'LEAN_LEFT', time: Date.now() });
    } else if (action === 'RIGHT') {
      setLatestGesture({ gesture: 'LEAN_RIGHT', time: Date.now() });
    } else if (action === 'JUMP') {
      setLatestGesture({ gesture: 'JUMP', time: Date.now() });
    } else if (action === 'CROUCH') {
      setLatestGesture({ gesture: 'CROUCH', time: Date.now() });
    }
  };

  return (
    <View style={styles.appContainer}>
      {/* 3D Game Canvas (Three.js) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <GameCanvas
          key={gameOverStats ? 'game-restarted' : 'game-active'}
          engineRef={engineRef}
          gestureInput={latestGesture}
          onHUDUpdate={setHudData}
          onGameOver={handleGameOver}
          onLocationDiscovered={handleLocationDiscovered}
        />
      )}

      {/* Heads-Up Display (HUD) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <GameHUD
          hudData={hudData}
          onPause={handlePauseToggle}
          isPaused={gameState === 'PAUSED'}
          onToggleAudio={handleToggleAudio}
          isMuted={isMuted}
          onSwipeControl={handleSwipeControl}
        />
      )}

      {/* Camera Picture-in-Picture ("Small Screen" body movement preview) */}
      <CameraPiP
        onGestureDetected={handleGestureDetected}
        calibrationData={calibrationData}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
      />

      {/* Main Home Menu */}
      {gameState === 'MENU' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenMap={() => setIsMapOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenCalibration={() => setIsCalibrationOpen(true)}
          highScore={highScore}
          maxKm={maxKm}
        />
      )}

      {/* Calibration Wizard Modal */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        onSaveCalibration={handleSaveCalibration}
        currentTracking={liveTracking}
      />

      {/* Kerala Journey Map Modal */}
      <KeralaMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        currentDistanceKm={parseFloat(hudData.km || '0')}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentStats={hudData}
      />

      {/* Tourism Cultural Milestone Card */}
      <TourismDiscoveryModal
        isOpen={!!discoveredLocation}
        location={discoveredLocation}
        onContinue={handleContinueTourism}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={gameState === 'GAME_OVER'}
        stats={gameOverStats}
        onRestart={handleRestart}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#05110c',
    overflow: 'hidden',
  },
});
