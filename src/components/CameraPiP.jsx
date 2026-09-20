/**
 * CameraPiP.jsx
 * Small Screen Picture-in-Picture camera view.
 * Supports:
 * 1. High-precision Python MediaPipe WebSocket stream (33 joints 3D)
 * 2. In-browser fallback optical heuristic tracker
 * Allows the player to see their own body movement in real time
 * with skeleton tracking overlay, gesture classification, and confidence meter.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureDetector } from '../services/GestureDetector';

// 33 Landmark Skeleton Bone Connections for Canvas Rendering
const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
  [11, 23], [12, 24], [23, 24],                     // Torso
  [23, 25], [25, 27], [27, 29], [29, 31],          // Left Leg
  [24, 26], [26, 28], [28, 30], [30, 32],          // Right Leg
  [0, 2], [2, 7], [0, 5], [5, 8]                    // Face
];

export const CameraPiP = ({
  onGestureDetected,
  calibrationData,
  onOpenCalibration,
  isMinimizedDefault = false,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const wsRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [currentGesture, setCurrentGesture] = useState('NEUTRAL');
  const [confidence, setConfidence] = useState(95);
  const [isMinimized, setIsMinimized] = useState(isMinimizedDefault);
  const [isFacingUser, setIsFacingUser] = useState(true);
  const [isPythonConnected, setIsPythonConnected] = useState(false);

  // 1. Connect to Python MediaPipe WebSocket Server (ws://localhost:8765)
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    function connectWebSocket() {
      try {
        ws = new WebSocket('ws://localhost:8765');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('🐍 Connected to Python MediaPipe Precision Engine!');
          setIsPythonConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'PYTHON_POSE_UPDATE') {
              setCurrentGesture(data.gesture);
              setConfidence(data.confidence);

              // Render full 33-joint skeleton on canvas
              if (canvasRef.current && data.landmarks) {
                renderPythonSkeleton(canvasRef.current, data.landmarks, data.gesture);
              }

              if (onGestureDetected) {
                onGestureDetected({
                  gesture: data.gesture,
                  targetLane: data.target_lane,
                  confidence: data.confidence,
                  dx: data.dx,
                  dy: data.dy,
                  vel_x: data.vel_x,
                  vel_y: data.vel_y,
                  source: 'PYTHON_MEDIAPIPE',
                });
              }
            }
          } catch (err) {
            console.error(err);
          }
        };

        ws.onclose = () => {
          setIsPythonConnected(false);
          // Retry connecting in background every 3 seconds
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          setIsPythonConnected(false);
          ws.close();
        };
      } catch (e) {
        setIsPythonConnected(false);
      }
    }

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // 2. Initialize local browser camera feed
  useEffect(() => {
    let stream = null;

    async function startCamera() {
      try {
        setCameraError(null);
        const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isFacingUser ? 'user' : 'environment',
            width: { ideal: isMobileDevice ? 480 : 640 },
            height: { ideal: isMobileDevice ? 360 : 480 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setHasCamera(true);
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
        setCameraError('Camera access required for body gesture control. (Keyboard / Touch fallback active)');
        setHasCamera(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isFacingUser]);

  // 3. Fallback in-browser GestureDetector (active when Python server is not streaming)
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !hasCamera) return;

    const detector = new GestureDetector(videoRef.current, canvasRef.current);
    if (calibrationData) {
      detector.setCalibration(calibrationData);
    }

    detector.setCallback((data) => {
      // Only use browser detection if Python WebSocket is NOT connected
      if (!isPythonConnected) {
        setCurrentGesture(data.gesture);
        setConfidence(data.confidence);
        if (onGestureDetected) {
          onGestureDetected(data);
        }
      }
    });

    detector.start();
    detectorRef.current = detector;

    return () => {
      detector.stop();
      detectorRef.current = null;
    };
  }, [hasCamera, calibrationData, isPythonConnected]);

  // Render high-precision 33-landmark skeleton from Python MediaPipe
  const renderPythonSkeleton = (canvas, landmarks, gesture) => {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    let strokeColor = '#00FF99';
    if (gesture.includes('LEFT')) strokeColor = '#FFD700'; // Gold
    else if (gesture.includes('RIGHT')) strokeColor = '#FF8C00'; // Orange
    else if (gesture === 'JUMP') strokeColor = '#00E5FF'; // Cyan
    else if (gesture === 'CROUCH') strokeColor = '#FF3366'; // Red

    const ptMap = {};
    landmarks.forEach((lm) => {
      ptMap[lm.id] = { x: lm.x * w, y: lm.y * h };
    });

    // Draw Bones
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = strokeColor;

    POSE_CONNECTIONS.forEach(([s, e]) => {
      const p1 = ptMap[s];
      const p2 = ptMap[e];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });

    // Draw 33 Joint Circles
    landmarks.forEach((lm) => {
      const px = lm.x * w;
      const py = lm.y * h;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    });

    // Draw Gesture Directional Banner
    if (gesture !== 'NEUTRAL') {
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.fillStyle = strokeColor;
      ctx.textAlign = 'center';
      ctx.fillText(gesture.replace('_', ' '), w / 2, 20);
    }

    ctx.restore();
  };

  // Status badge style
  const getBadgeStyle = () => {
    switch (currentGesture) {
      case 'JUMP_LEFT':
      case 'LEAN_LEFT':
        return { backgroundColor: '#ffd700', color: '#111' };
      case 'JUMP_RIGHT':
      case 'LEAN_RIGHT':
        return { backgroundColor: '#ff8c00', color: '#fff' };
      case 'JUMP':
        return { backgroundColor: '#00e5ff', color: '#111' };
      case 'CROUCH':
        return { backgroundColor: '#ff3366', color: '#fff' };
      default:
        return { backgroundColor: 'rgba(0, 255, 153, 0.85)', color: '#061a10' };
    }
  };

  return (
    <View style={[styles.wrapper, isMinimized && styles.wrapperMinimized]}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.liveDot, (hasCamera || isPythonConnected) && styles.liveDotActive]} />
          <Text style={styles.headerTitle}>
            {isPythonConnected ? '🐍 PYTHON POSE (33-PTS)' : 'GESTURE CAM'}
          </Text>
        </View>

        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={onOpenCalibration}
            accessibilityLabel="Calibrate Body Gestures"
          >
            <Text style={styles.headerBtnText}>⚙️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setIsMinimized(!isMinimized)}
            accessibilityLabel="Toggle Small Screen"
          >
            <Text style={styles.headerBtnText}>{isMinimized ? '⛶' : '—'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Small Screen Camera Frame */}
      {!isMinimized && (
        <View style={styles.screenContainer}>
          {cameraError && !isPythonConnected ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>📷</Text>
              <Text style={styles.errorText}>{cameraError}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => setIsFacingUser(!isFacingUser)}
              >
                <Text style={styles.retryBtnText}>Retry Camera</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <div style={styles.videoWrapper}>
              {/* Live Webcam Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={styles.videoElement}
              />

              {/* Skeleton & Gesture HUD Overlay */}
              <canvas
                ref={canvasRef}
                width={190}
                height={140}
                style={styles.canvasOverlay}
              />
            </div>
          )}

          {/* Real-time Gesture & Confidence Badge */}
          <View style={styles.footerHUD}>
            <View style={[styles.gestureBadge, { backgroundColor: getBadgeStyle().backgroundColor }]}>
              <Text style={[styles.gestureBadgeText, { color: getBadgeStyle().color }]}>
                {currentGesture === 'NEUTRAL' ? '🧍 RUNNING' : currentGesture.replace('_', ' ')}
              </Text>
            </View>
            <Text style={styles.confidenceText}>
              {confidence}% {isPythonConnected ? 'PRECISE' : 'ACC'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 220,
    backgroundColor: 'rgba(10, 24, 18, 0.92)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d4af37', // Kasavu Gold
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    zIndex: 999,
  },
  wrapperMinimized: {
    width: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#888',
    marginRight: 6,
  },
  liveDotActive: {
    backgroundColor: '#00ff88',
  },
  headerTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 0.8,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBtn: {
    padding: 3,
  },
  headerBtnText: {
    fontSize: 12,
    color: '#fff',
  },
  screenContainer: {
    width: '100%',
    padding: 6,
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoElement: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)', // Mirror webcam feed
  },
  canvasOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  footerHUD: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  gestureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gestureBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  confidenceText: {
    fontSize: 9,
    color: '#aaa',
    fontWeight: '600',
  },
  errorBox: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 50, 50, 0.1)',
    borderRadius: 8,
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 10,
    color: '#ffcccc',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  retryBtn: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  retryBtnText: {
    color: '#111',
    fontSize: 10,
    fontWeight: '700',
  },
});

