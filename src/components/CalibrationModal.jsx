/**
 * CalibrationModal.jsx
 * Interactive 4-step gesture calibration sequence:
 * 1. Center Neutral
 * 2. Lean Left
 * 3. Lean Right
 * 4. Crouch / Jump
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const STEPS = [
  {
    id: 'NEUTRAL',
    title: 'Stand in Center',
    instruction: 'Stand comfortably in the center of your camera frame.',
    targetTime: 3,
    icon: '🧍',
  },
  {
    id: 'LEFT',
    title: 'Lean Left',
    instruction: 'Lean your upper body toward your LEFT side.',
    targetTime: 2,
    icon: '👈',
  },
  {
    id: 'RIGHT',
    title: 'Lean Right',
    instruction: 'Lean your upper body toward your RIGHT side.',
    targetTime: 2,
    icon: '👉',
  },
  {
    id: 'CROUCH',
    title: 'Duck / Crouch',
    instruction: 'Crouch down or lower your head to test dodging.',
    targetTime: 2,
    icon: '🧎',
  },
  {
    id: 'DONE',
    title: 'Calibration Complete!',
    instruction: 'Your movements are calibrated. Get ready to experience Kerala!',
    targetTime: 0,
    icon: '✨',
  },
];

export const CalibrationModal = ({ isOpen, onClose, onSaveCalibration, currentTracking }) => {
  if (!isOpen) return null;

  const [stepIndex, setStepIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [samples, setSamples] = useState([]);
  const [calibrationResult, setCalibrationResult] = useState({
    neutralX: 0.5,
    neutralY: 0.45,
    leanLeftThreshold: -0.09,
    leanRightThreshold: 0.09,
    jumpThreshold: -0.12,
    crouchThreshold: 0.12,
  });

  const activeStep = STEPS[stepIndex];

  // Collect samples during active step
  useEffect(() => {
    if (activeStep.id === 'DONE') return;

    const interval = setInterval(() => {
      if (currentTracking) {
        setSamples((prev) => [...prev, { x: currentTracking.normX, y: currentTracking.normY }]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [stepIndex, currentTracking]);

  // Step timer
  useEffect(() => {
    if (activeStep.id === 'DONE') return;

    setCountdown(activeStep.targetTime);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishCurrentStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stepIndex]);

  const finishCurrentStep = () => {
    if (samples.length > 0) {
      const avgX = samples.reduce((acc, s) => acc + s.x, 0) / samples.length;
      const avgY = samples.reduce((acc, s) => acc + s.y, 0) / samples.length;

      setCalibrationResult((prev) => {
        const next = { ...prev };
        if (activeStep.id === 'NEUTRAL') {
          next.neutralX = avgX;
          next.neutralY = avgY;
        } else if (activeStep.id === 'LEFT') {
          next.leanLeftThreshold = Math.min(-0.06, avgX - prev.neutralX);
        } else if (activeStep.id === 'RIGHT') {
          next.leanRightThreshold = Math.max(0.06, avgX - prev.neutralX);
        } else if (activeStep.id === 'CROUCH') {
          next.crouchThreshold = Math.max(0.08, avgY - prev.neutralY);
        }
        return next;
      });
    }

    setSamples([]);
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    }
  };

  const handleFinish = () => {
    onSaveCalibration(calibrationResult);
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BODY GESTURE CALIBRATION</Text>
          <Text style={styles.headerSubtitle}>Kerala Camera Control System</Text>
        </View>

        {/* Center Visual */}
        <View style={styles.body}>
          <Text style={styles.stepIcon}>{activeStep.icon}</Text>
          <Text style={styles.stepTitle}>{activeStep.title}</Text>
          <Text style={styles.stepInstruction}>{activeStep.instruction}</Text>

          {activeStep.id !== 'DONE' && (
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{countdown}</Text>
              <Text style={styles.countdownLabel}>Capturing posture...</Text>
            </View>
          )}

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {STEPS.map((s, idx) => (
              <View
                key={s.id}
                style={[
                  styles.dot,
                  idx === stepIndex && styles.dotActive,
                  idx < stepIndex && styles.dotComplete,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {activeStep.id === 'DONE' ? (
            <TouchableOpacity style={styles.btnPrimary} onPress={handleFinish}>
              <Text style={styles.btnPrimaryText}>START YOUR KERALA RUN</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))}
            >
              <Text style={styles.btnSecondaryText}>Skip Step</Text>
            </TouchableOpacity>
          )}
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
    backgroundColor: 'rgba(3, 10, 7, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0c1f17',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d4af37',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 18,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a0c4b4',
    marginTop: 4,
  },
  body: {
    alignItems: 'center',
    marginVertical: 12,
  },
  stepIcon: {
    fontSize: 54,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  stepInstruction: {
    fontSize: 14,
    color: '#b0d0c2',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  countdownBox: {
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    width: 140,
  },
  countdownNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffd700',
  },
  countdownLabel: {
    fontSize: 11,
    color: '#b0d0c2',
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    backgroundColor: '#ffd700',
    transform: [{ scale: 1.25 }],
  },
  dotComplete: {
    backgroundColor: '#00ff99',
  },
  footer: {
    width: '100%',
    marginTop: 24,
  },
  btnPrimary: {
    backgroundColor: '#d4af37',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#0a1a12',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
  btnSecondary: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#88a698',
    fontSize: 13,
  },
});
