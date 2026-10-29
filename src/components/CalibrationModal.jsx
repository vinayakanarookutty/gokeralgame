/**
 * CalibrationModal.jsx
 * Interactive 4-step gesture calibration sequence with Multi-Mode support:
 * 1. HALF_BODY (Upper body center, lean left, lean right, crouch)
 * 2. HEAD_ONLY (Face center, tilt left, tilt right, dip down)
 * 3. PALM_ONLY (Palm center, move left, move right, lower down)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CONTROL_MODES } from '../services/GestureDetector';

const MODE_STEPS = {
  [CONTROL_MODES.HALF_BODY]: [
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
      instruction: 'Crouch down or lower your body to test dodging.',
      targetTime: 2,
      icon: '🧎',
    },
    {
      id: 'DONE',
      title: 'Calibration Complete!',
      instruction: 'Body movements calibrated! Get ready to run through Kerala!',
      targetTime: 0,
      icon: '✨',
    },
  ],
  [CONTROL_MODES.HEAD_ONLY]: [
    {
      id: 'NEUTRAL',
      title: 'Center Your Head',
      instruction: 'Look straight at camera with your face relaxed in the center.',
      targetTime: 3,
      icon: '👤',
    },
    {
      id: 'LEFT',
      title: 'Tilt / Turn Head Left',
      instruction: 'Tilt or steer your head toward the LEFT.',
      targetTime: 2,
      icon: '🗣️ ↩️',
    },
    {
      id: 'RIGHT',
      title: 'Tilt / Turn Head Right',
      instruction: 'Tilt or steer your head toward the RIGHT.',
      targetTime: 2,
      icon: '↪️ 🗣️',
    },
    {
      id: 'CROUCH',
      title: 'Dip Head Down',
      instruction: 'Lower your head or nod down slightly to test sliding.',
      targetTime: 2,
      icon: '🙇',
    },
    {
      id: 'DONE',
      title: 'Head Tracking Ready!',
      instruction: 'Your head motions are calibrated! Enjoy comfortable seated play!',
      targetTime: 0,
      icon: '✨',
    },
  ],
  [CONTROL_MODES.PALM_ONLY]: [
    {
      id: 'NEUTRAL',
      title: 'Hold Palm in Center',
      instruction: 'Hold up one open palm in the middle of your camera view.',
      targetTime: 3,
      icon: '✋',
    },
    {
      id: 'LEFT',
      title: 'Move Palm Left',
      instruction: 'Wave or shift your palm toward the LEFT.',
      targetTime: 2,
      icon: '👈 ✋',
    },
    {
      id: 'RIGHT',
      title: 'Move Palm Right',
      instruction: 'Wave or shift your palm toward the RIGHT.',
      targetTime: 2,
      icon: '✋ 👉',
    },
    {
      id: 'CROUCH',
      title: 'Drop Palm Down',
      instruction: 'Lower your palm toward the bottom to test sliding.',
      targetTime: 2,
      icon: '👇 🫳',
    },
    {
      id: 'DONE',
      title: 'Palm Controller Ready!',
      instruction: 'Your single palm air controller is calibrated and primed!',
      targetTime: 0,
      icon: '✨',
    },
  ],
};

export const CalibrationModal = ({
  isOpen,
  onClose,
  onSaveCalibration,
  currentTracking,
  controlMode = CONTROL_MODES.HALF_BODY,
  onChangeControlMode,
}) => {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState(controlMode);
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

  const steps = MODE_STEPS[activeMode] || MODE_STEPS[CONTROL_MODES.HALF_BODY];
  const activeStep = steps[stepIndex] || steps[0];

  const handleSwitchMode = (mode) => {
    setActiveMode(mode);
    setStepIndex(0);
    setSamples([]);
    if (onChangeControlMode) onChangeControlMode(mode);
  };

  // Collect samples during active step
  useEffect(() => {
    if (activeStep.id === 'DONE') return;

    const interval = setInterval(() => {
      if (currentTracking) {
        const x = currentTracking.normX || currentTracking.dx || 0.5;
        const y = currentTracking.normY || currentTracking.dy || 0.45;
        setSamples((prev) => [...prev, { x, y }]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [stepIndex, currentTracking, activeStep.id]);

  // Step countdown timer
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
  }, [stepIndex, activeMode]);

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
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    }
  };

  const handleFinish = () => {
    onSaveCalibration({
      ...calibrationResult,
      mode: activeMode,
    });
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>GESTURE CALIBRATION</Text>
          <Text style={styles.headerSubtitle}>Kerala Kinematic Vision System</Text>
        </View>

        {/* Mode Selector Tabs inside Modal */}
        <View style={styles.modeTabsRow}>
          <TouchableOpacity
            style={[styles.modeTab, activeMode === CONTROL_MODES.HALF_BODY && styles.modeTabActive]}
            onPress={() => handleSwitchMode(CONTROL_MODES.HALF_BODY)}
          >
            <Text style={[styles.modeTabText, activeMode === CONTROL_MODES.HALF_BODY && styles.modeTabTextActive]}>
              🧍 Half Body
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, activeMode === CONTROL_MODES.HEAD_ONLY && styles.modeTabActive]}
            onPress={() => handleSwitchMode(CONTROL_MODES.HEAD_ONLY)}
          >
            <Text style={[styles.modeTabText, activeMode === CONTROL_MODES.HEAD_ONLY && styles.modeTabTextActive]}>
              👤 Head Only
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, activeMode === CONTROL_MODES.PALM_ONLY && styles.modeTabActive]}
            onPress={() => handleSwitchMode(CONTROL_MODES.PALM_ONLY)}
          >
            <Text style={[styles.modeTabText, activeMode === CONTROL_MODES.PALM_ONLY && styles.modeTabTextActive]}>
              ✋ Single Palm
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Visual */}
        <View style={styles.body}>
          <Text style={styles.stepIcon}>{activeStep.icon}</Text>
          <Text style={styles.stepTitle}>{activeStep.title}</Text>
          <Text style={styles.stepInstruction}>{activeStep.instruction}</Text>

          {activeStep.id !== 'DONE' && (
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{countdown}</Text>
              <Text style={styles.countdownLabel}>Capturing movement...</Text>
            </View>
          )}

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {steps.map((s, idx) => (
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
            <View style={styles.footerBtnGroup}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
              >
                <Text style={styles.btnSecondaryText}>Skip Step</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
    zIndex: 6000,
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0c1f17',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d4af37',
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 11,
    color: '#a0c4b4',
    marginTop: 2,
  },
  // Mode Tabs
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    width: '100%',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#d4af37',
  },
  modeTabText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#90a89b',
  },
  modeTabTextActive: {
    color: '#07170f',
    fontWeight: '900',
  },
  body: {
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  stepIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  stepInstruction: {
    fontSize: 13,
    color: '#b0d0c2',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  countdownBox: {
    alignItems: 'center',
    marginTop: 16,
    padding: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    width: 140,
  },
  countdownNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffd700',
  },
  countdownLabel: {
    fontSize: 10,
    color: '#b0d0c2',
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
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
    marginTop: 18,
  },
  btnPrimary: {
    backgroundColor: '#d4af37',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#0a1a12',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
  footerBtnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#88a698',
    fontSize: 12,
  },
  btnCancel: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  btnCancelText: {
    color: '#e07070',
    fontSize: 12,
  },
});
