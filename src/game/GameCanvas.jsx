/**
 * GameCanvas.jsx
 * React Native Web wrapper for the Three.js Game Engine
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GameEngine } from './GameEngine';

export const GameCanvas = ({
  onHUDUpdate,
  onGameOver,
  onLocationDiscovered,
  gestureInput,
  engineRef,
  isStarted = true,
}) => {
  const containerRef = useRef(null);
  const internalEngineRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, {
      onHUDUpdate,
      onGameOver,
      onLocationDiscovered,
    });
    internalEngineRef.current = engine;
    if (engineRef) {
      engineRef.current = engine;
    }

    // Warm up GPU scene and precompile Three.js materials & shaders
    engine.warmup();

    if (isStarted) {
      engine.start();
    }

    return () => {
      engine.destroy();
      internalEngineRef.current = null;
      if (engineRef) {
        engineRef.current = null;
      }
    };
  }, []);

  // Handle start/pause lifecycle transitions when isStarted changes
  useEffect(() => {
    if (internalEngineRef.current) {
      if (isStarted && !internalEngineRef.current.isRunning) {
        internalEngineRef.current.start();
      }
    }
  }, [isStarted]);

  // Forward gesture updates directly into the engine
  useEffect(() => {
    if (internalEngineRef.current && gestureInput) {
      internalEngineRef.current.handleGesture(gestureInput);
    }
  }, [gestureInput]);

  return (
    <View style={styles.container}>
      <div ref={containerRef} style={styles.canvasContainer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  canvasContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
