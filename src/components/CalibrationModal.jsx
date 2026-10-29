/**
 * CalibrationModal.jsx
 * Interactive 4-step gesture calibration sequence with Multi-Mode support:
 * 1. HALF_BODY (Upper body center, lean left, lean right, crouch)
 * 2. HEAD_ONLY (Face center, tilt left, tilt right, dip down)
 * 3. PALM_ONLY (Palm center, move left, move right, lower down)
 * Refined Kerala aesthetic, clear human visual feedback, and zero emojis.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CONTROL_MODES } from '../services/GestureDetector';
import {
  BodyStanceIcon,
  HeadMotionIcon,
  PalmGestureIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownIcon,
  CalibrationSlidersIcon,
  KeralaLotusOrnament,
  PlayIcon,
} from './Icons';

const MODE_STEPS = {
  [CONTROL_MODES.HALF_BODY]: [
    {
      id: 'NEUTRAL',
      title: 'Centered Posture',
      instruction: 'Stand comfortably in the center of your camera frame.',
      targetTime: 3,
      IconComponent: BodyStanceIcon,
      color: '#00ff99',
    },
    {
      id: 'LEFT',
      title: 'Lean Left',
      instruction: 'Lean your upper torso toward your left side.',
      targetTime: 2,
      IconComponent: ChevronLeftIcon,
      color: '#60a5fa',
    },
    {
      id: 'RIGHT',
      title: 'Lean Right',
      instruction: 'Lean your upper torso toward your right side.',
      targetTime: 2,
      IconComponent: ChevronRightIcon,
      color: '#60a5fa',
    },
    {
      id: 'CROUCH',
      title: 'Duck & Crouch',
      instruction: 'Lower your torso or crouch down to test slide dodging.',
      targetTime: 2,
      IconComponent: ArrowDownIcon,
      color: '#f472b6',
    },
    {
      id: 'DONE',
      title: 'Calibration Complete',
      instruction: 'Upper body motion calibrated! You are ready to explore Kerala.',
      targetTime: 0,
      IconComponent: KeralaLotusOrnament,
      color: '#ffd700',
    },
  ],
  [CONTROL_MODES.HEAD_ONLY]: [
    {
      id: 'NEUTRAL',
      title: 'Center Your Head',
      instruction: 'Look straight at camera with your face relaxed in the center.',
      targetTime: 3,
      IconComponent: HeadMotionIcon,
      color: '#38bdf8',
    },
    {
      id: 'LEFT',
      title: 'Tilt Head Left',
      instruction: 'Tilt or gently steer your head toward the left.',
      targetTime: 2,
      IconComponent: ChevronLeftIcon,
      color: '#38bdf8',
    },
    {
      id: 'RIGHT',
      title: 'Tilt Head Right',
      instruction: 'Tilt or gently steer your head toward the right.',
      targetTime: 2,
      IconComponent: ChevronRightIcon,
      color: '#38bdf8',
    },
    {
      id: 'CROUCH',
      title: 'Dip Head Down',
      instruction: 'Lower your head or nod down slightly to test sliding.',
      targetTime: 2,
      IconComponent: ArrowDownIcon,
      color: '#f472b6',
    },
    {
      id: 'DONE',
      title: 'Head Tracking Ready',
      instruction: 'Seated head tracking calibrated! Enjoy relaxed comfort play.',
      targetTime: 0,
      IconComponent: KeralaLotusOrnament,
      color: '#ffd700',
    },
  ],
  [CONTROL_MODES.PALM_ONLY]: [
    {
      id: 'NEUTRAL',
      title: 'Hold Palm in Center',
      instruction: 'Hold up one open palm in the middle of your camera view.',
      targetTime: 3,
      IconComponent: PalmGestureIcon,
      color: '#ffd700',
    },
    {
      id: 'LEFT',
      title: 'Shift Palm Left',
      instruction: 'Glide or shift your palm toward the left side.',
      targetTime: 2,
      IconComponent: ChevronLeftIcon,
      color: '#ffd700',
    },
    {
      id: 'RIGHT',
      title: 'Shift Palm Right',
      instruction: 'Glide or shift your palm toward the right side.',
      targetTime: 2,
      IconComponent: ChevronRightIcon,
      color: '#ffd700',
    },
    {
      id: 'CROUCH',
      title: 'Lower Palm Down',
      instruction: 'Lower your palm toward the bottom of the camera to test slide.',
      targetTime: 2,
      IconComponent: ArrowDownIcon,
      color: '#f472b6',
    },
    {
      id: 'DONE',
      title: 'Palm Sensor Primed',
      instruction: 'Air palm gesture controller calibrated and ready!',
      targetTime: 0,
      IconComponent: KeralaLotusOrnament,
      color: '#ffd700',
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
    neutralY: 0.5,
    leanLeftThreshold: -0.06,
    leanRightThreshold: 0.06,
    crouchThreshold: 0.08,
  });

  const steps = MODE_STEPS[activeMode] || MODE_STEPS[CONTROL_MODES.HALF_BODY];
  const activeStep = steps[stepIndex] || steps[0];

  const handleSwitchMode = (mode) => {
    setActiveMode(mode);
    setStepIndex(0);
    setSamples([]);
    if (onChangeControlMode) onChangeControlMode(mode);
  };

  useEffect(() => {
    setCountdown(activeStep.targetTime);
    setSamples([]);
  }, [stepIndex, activeMode]);

  useEffect(() => {
    if (activeStep.targetTime === 0) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          completeStep();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stepIndex, samples, activeMode]);

  useEffect(() => {
    if (!currentTracking) return;

    let posX = 0.5;
    let posY = 0.5;

    if (activeMode === CONTROL_MODES.HEAD_ONLY && currentTracking.head) {
      posX = currentTracking.head.x;
      posY = currentTracking.head.y;
    } else if (activeMode === CONTROL_MODES.PALM_ONLY && currentTracking.palm) {
      posX = currentTracking.palm.x;
      posY = currentTracking.palm.y;
    } else if (currentTracking.torso) {
      posX = currentTracking.torso.x;
      posY = currentTracking.torso.y;
    }

    setSamples((prev) => [...prev.slice(-30), { x: posX, y: posY }]);
  }, [currentTracking, activeMode]);

  const completeStep = () => {
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

  const StepIcon = activeStep.IconComponent;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalCard}>
        {/* Header */}
        <View style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CalibrationSlidersIcon size={18} color="#ffd700" />
            <Text style={styles.headerTitle}>GESTURE CALIBRATION</Text>
          </div>
          <Text style={styles.headerSubtitle}>Kinematic Vision Precision Calibration</Text>
        </View>

        {/* Mode Selector Tabs */}
        <View style={styles.modeTabsRow}>
          <TouchableOpacity
            style={[styles.modeTab, activeMode === CONTROL_MODES.HALF_BODY && styles.modeTabActive]}
            onPress={() => handleSwitchMode(CONTROL_MODES.HALF_BODY)}
            activeOpacity={0.8}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <BodyStanceIcon size={13} color={activeMode === CONTROL_MODES.HALF_BODY ? '#00ff99' : '#8cb8a3'} />
              <Text style={[styles.modeTabText, activeMode === CONTROL_MODES.HALF_BODY && styles.modeTabTextActive]}>
                Full Stance
              </Text>
            </div>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, activeMode === CONTROL_MODES.HEAD_ONLY && styles.modeTabActive]}
            onPress={() => handleSwitchMode(CONTROL_MODES.HEAD_ONLY)}
            activeOpacity={0.8}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <HeadMotionIcon size={13} color={activeMode === CONTROL_MODES.HEAD_ONLY ? '#38bdf8' : '#8cb8a3'} />
              <Text style={[styles.modeTabText, activeMode === CONTROL_MODES.HEAD_ONLY && styles.modeTabTextActive]}>
                Head Motion
              </Text>
            </div>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, activeMode === CONTROL_MODES.PALM_ONLY && styles.modeTabActive]}
            onPress={() => handleSwitchMode(CONTROL_MODES.PALM_ONLY)}
            activeOpacity={0.8}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <PalmGestureIcon size={13} color={activeMode === CONTROL_MODES.PALM_ONLY ? '#ffd700' : '#8cb8a3'} />
              <Text style={[styles.modeTabText, activeMode === CONTROL_MODES.PALM_ONLY && styles.modeTabTextActive]}>
                Air Palm
              </Text>
            </div>
          </TouchableOpacity>
        </View>

        {/* Center Visual Step */}
        <View style={styles.body}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: `${activeStep.color}18`,
            border: `1.5px solid ${activeStep.color}60`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            boxShadow: `0 0 16px ${activeStep.color}35`,
          }}>
            <StepIcon size={26} color={activeStep.color} />
          </div>

          <Text style={styles.stepTitle}>{activeStep.title}</Text>
          <Text style={styles.stepInstruction}>{activeStep.instruction}</Text>

          {activeStep.id !== 'DONE' && (
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{countdown}</Text>
              <Text style={styles.countdownLabel}>Capturing movement vector...</Text>
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

        {/* Footer Buttons */}
        <View style={styles.footer}>
          {activeStep.id === 'DONE' ? (
            <TouchableOpacity style={styles.btnPrimary} onPress={handleFinish} activeOpacity={0.85}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Text style={styles.btnPrimaryText}>SAVE & BEGIN SPRINT</Text>
                <PlayIcon size={12} color="#07170f" />
              </div>
            </TouchableOpacity>
          ) : (
            <View style={styles.footerBtnGroup}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                activeOpacity={0.8}
              >
                <Text style={styles.btnSecondaryText}>Skip Step</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancel} onPress={onClose} activeOpacity={0.8}>
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
    backgroundColor: 'rgba(2, 10, 6, 0.92)',
    backdropFilter: 'blur(14px)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 6000,
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#0c2318',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.65)',
    padding: 24,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 175, 55, 0.22)',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 18,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8cb8a3',
    letterSpacing: 0.3,
  },
  modeTabsRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
  },
  modeTabText: {
    fontSize: 10.5,
    color: '#8cb8a3',
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#ffd700',
    fontWeight: '800',
  },
  body: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 6,
  },
  stepTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  stepInstruction: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12.5,
    color: '#b0d6c4',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
    maxWidth: 320,
  },
  countdownBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
    minWidth: 180,
  },
  countdownNumber: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: 32,
    fontWeight: '900',
    color: '#ffd700',
  },
  countdownLabel: {
    fontSize: 10.5,
    color: '#8cb8a3',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dotActive: {
    backgroundColor: '#ffd700',
    width: 22,
    borderRadius: 4,
  },
  dotComplete: {
    backgroundColor: '#00ff99',
  },
  footer: {
    width: '100%',
    marginTop: 10,
  },
  btnPrimary: {
    backgroundColor: '#ffd700',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
  },
  btnPrimaryText: {
    color: '#07170f',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontFamily: 'Outfit, sans-serif',
  },
  footerBtnGroup: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  btnSecondaryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  btnCancel: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.3)',
  },
  btnCancelText: {
    color: '#ff8080',
    fontSize: 12,
    fontWeight: '600',
  },
});
