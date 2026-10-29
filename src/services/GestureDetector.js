/**
 * GestureDetector.js
 * Advanced Multi-Mode Kinematics & Vision Engine
 * Powered by Google MediaPipe Pose (33 Landmarks) & MediaPipe Hands (21 Landmarks)
 *
 * Supported Playing Modes:
 * 1. HALF_BODY - Upper body lean, torso kinematics, full jump & crouch
 * 2. HEAD_ONLY - Seated / desk play: head tilt, lateral head movement, chin lift & nod
 * 3. PALM_ONLY - Single palm air controller: wave left/right, flick up to jump, drop to slide
 */

export const CONTROL_MODES = {
  HALF_BODY: 'HALF_BODY',
  HEAD_ONLY: 'HEAD_ONLY',
  PALM_ONLY: 'PALM_ONLY',
};

// 33 Landmark Skeleton Bone Connections
const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
  [11, 23], [12, 24], [23, 24],                     // Torso
  [23, 25], [25, 27], [27, 29], [29, 31],          // Left Leg & Foot
  [24, 26], [26, 28], [28, 30], [30, 32],          // Right Leg & Foot
  [0, 2], [2, 7], [0, 5], [5, 8]                    // Face
];

// Upper Body Specific Connections (clean presentation for Half Body)
const UPPER_BODY_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
  [11, 23], [12, 24], [23, 24],                     // Torso
  [0, 2], [2, 7], [0, 5], [5, 8], [9, 10]           // Face & Mouth
];

// 21 Landmark Hand Skeleton Connections
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [0, 17]                               // Palm Base
];

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  const touchPoints = typeof navigator.maxTouchPoints === 'number' ? navigator.maxTouchPoints : 0;
  const hasTouch = (typeof window !== 'undefined' && 'ontouchstart' in window) || touchPoints > 1;
  const smallScreen = typeof window !== 'undefined' && (Math.min(window.innerWidth, window.innerHeight) <= 768 || window.innerWidth < 1024);
  return mobileRegex.test(ua) || (hasTouch && smallScreen);
}

export class GestureDetector {
  constructor(videoElement, canvasOverlay, initialMode = 'HALF_BODY') {
    this.video = videoElement;
    this.canvas = canvasOverlay;
    this.ctx = canvasOverlay ? canvasOverlay.getContext('2d') : null;

    this.controlMode = initialMode;
    this.isRunning = false;
    this.onGestureCallback = null;

    // MediaPipe Models
    this.mediaPipePose = null;
    this.mediaPipeHands = null;
    this.useMediaPipePose = false;
    this.useMediaPipeHands = false;
    this.isProcessing = false;
    this.lastFrameTime = 0;

    // Kinematic Baselines & Calibration
    this.calibrated = false;
    this.calibSamples = [];

    // Mode-specific Baselines
    this.baselineTorsoX = 0.50;
    this.baselineTorsoY = 0.50;
    this.baselineNoseY = 0.25;

    this.baselineHeadX = 0.50;
    this.baselineHeadY = 0.28;

    this.baselinePalmX = 0.50;
    this.baselinePalmY = 0.55;

    // Velocity Histories
    this.prevTorsoX = 0.50;
    this.prevTorsoY = 0.50;
    this.prevHeadX = 0.50;
    this.prevHeadY = 0.28;
    this.prevPalmX = 0.50;
    this.prevPalmY = 0.55;
    this.prevTime = performance.now();

    this.velX = 0;
    this.velY = 0;

    // Gesture State & Debounce
    this.currentGesture = 'NEUTRAL';
    this.targetLane = 0;
    this.confidence = 95;

    // Smoothed Lane Steering Filters
    this.smoothedTorsoDx = 0;
    this.smoothedHeadSteer = 0;
    this.smoothedPalmDx = 0;

    // Lane Debounce
    this.pendingLane = 0;
    this.pendingLaneFrames = 0;
    this.lastLaneChangeTime = 0;
    this.lastJumpTime = 0;

    this.initMediaPipe();
  }

  setMode(newMode) {
    if (!CONTROL_MODES[newMode]) return;
    if (this.controlMode === newMode) return;
    this.controlMode = newMode;
    this.currentGesture = 'NEUTRAL';
    this.targetLane = 0;
    this.smoothedTorsoDx = 0;
    this.smoothedHeadSteer = 0;
    this.smoothedPalmDx = 0;
    this.pendingLane = 0;
    this.pendingLaneFrames = 0;
    this.calibrated = false;
    this.calibSamples = [];
    console.log(`🎮 GestureDetector mode changed to: ${newMode}`);
  }

  setCallback(callback) {
    this.onGestureCallback = callback;
  }

  setCalibration(calibrationData) {
    if (!calibrationData) return;
    if (calibrationData.neutralX !== undefined) {
      this.baselineTorsoX = calibrationData.neutralX;
      this.baselineHeadX = calibrationData.neutralX;
      this.baselinePalmX = calibrationData.neutralX;
    }
    if (calibrationData.neutralY !== undefined) {
      this.baselineTorsoY = calibrationData.neutralY;
      this.baselineHeadY = calibrationData.neutralY;
      this.baselinePalmY = calibrationData.neutralY;
    }
    this.calibrated = true;
  }

  async initMediaPipe() {
    const isMobile = isMobileDevice();
    this.targetInterval = isMobile ? 80 : 34; // ~12.5 FPS sampling on mobile leaves CPU free for 60FPS Three.js

    // 1. Initialize MediaPipe Pose (Primary for HALF_BODY and HEAD_ONLY, and fallback for PALM_ONLY)
    try {
      const PoseClass = window.Pose || (await import('@mediapipe/pose')).Pose;
      if (PoseClass) {
        this.mediaPipePose = new PoseClass({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
        });

        this.mediaPipePose.setOptions({
          modelComplexity: 0, // Lite (mobile optimized ~12ms)
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        this.mediaPipePose.onResults(this.onMediaPipePoseResults);
        this.useMediaPipePose = true;
        console.log('✓ Google MediaPipe Pose Engine Initialized!');
      }
    } catch (err) {
      console.warn('MediaPipe Pose initialization warning:', err);
      this.useMediaPipePose = false;
    }

    // 2. Initialize MediaPipe Hands (High-precision 21-joint single palm tracking)
    try {
      const HandsModule = await import('@mediapipe/hands');
      const HandsClass = window.Hands || HandsModule.Hands;
      if (HandsClass) {
        this.mediaPipeHands = new HandsClass({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });

        this.mediaPipeHands.setOptions({
          maxNumHands: 1, // Single palm mode
          modelComplexity: 0, // Lite
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        this.mediaPipeHands.onResults(this.onMediaPipeHandsResults);
        this.useMediaPipeHands = true;
        console.log('✓ Google MediaPipe Hands (Single Palm) Initialized!');
      }
    } catch (err) {
      console.warn('MediaPipe Hands deferred or using Pose hand fallback:', err);
      this.useMediaPipeHands = false;
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isProcessing = false;
    this.processLoop();
  }

  stop() {
    this.isRunning = false;
    this.isProcessing = false;
  }

  processLoop = async () => {
    if (!this.isRunning) return;

    const now = performance.now();
    // Non-blocking concurrency lock and frame throttle
    if (!this.isProcessing && (now - this.lastFrameTime >= (this.targetInterval || 34))) {
      if (this.video && this.video.readyState >= 2) {
        this.isProcessing = true;
        this.lastFrameTime = now;
        try {
          if (this.controlMode === CONTROL_MODES.PALM_ONLY && this.useMediaPipeHands && this.mediaPipeHands) {
            // In Palm Only mode, prioritize dedicated Hands detector for instant palm accuracy
            await this.mediaPipeHands.send({ image: this.video });
          } else if (this.useMediaPipePose && this.mediaPipePose) {
            // In Half Body and Head Only modes, prioritize Pose detector
            await this.mediaPipePose.send({ image: this.video });
          } else {
            this.fallbackOpticalDetection();
          }
        } catch (e) {
          this.fallbackOpticalDetection();
        } finally {
          this.isProcessing = false;
        }
      }
    }

    if (this.isRunning) {
      requestAnimationFrame(this.processLoop);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // 1. POSE RESULTS DISPATCHER (HALF_BODY, HEAD_ONLY, or POSE-PALM FALLBACK)
  // ─────────────────────────────────────────────────────────────────
  onMediaPipePoseResults = (results) => {
    if (!this.isRunning) return;

    const landmarks = results.poseLandmarks;
    if (!landmarks || landmarks.length < 33) {
      return;
    }

    if (this.controlMode === CONTROL_MODES.HEAD_ONLY) {
      this.processHeadOnlyMode(landmarks);
    } else if (this.controlMode === CONTROL_MODES.PALM_ONLY && !this.useMediaPipeHands) {
      // Graceful fallback: If MediaPipe Hands is not active yet, extract palm from Pose wrists & hands
      this.processPoseHandFallback(landmarks);
    } else {
      // Default: HALF_BODY
      this.processHalfBodyMode(landmarks);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // MODE 1: HALF BODY (Upper Body Torso, Shoulders & Airborne Jump)
  // ─────────────────────────────────────────────────────────────────
  processHalfBodyMode(landmarks) {
    const now = performance.now();
    const dt = Math.max(0.001, (now - this.prevTime) / 1000);
    this.prevTime = now;

    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    // Midpoint of shoulders (Mirrored X for intuitive webcam steering)
    const midShoulderX = 1.0 - (leftShoulder.x + rightShoulder.x) / 2;
    const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const headY = nose.y;

    const handsAboveHead = (leftWrist.y < nose.y && rightWrist.y < nose.y);

    // Initial Calibration (first 25 frames)
    if (!this.calibrated) {
      this.calibSamples.push({ x: midShoulderX, y: midShoulderY, headY });
      if (this.calibSamples.length >= 25) {
        this.baselineTorsoX = this.calibSamples.reduce((a, b) => a + b.x, 0) / this.calibSamples.length;
        this.baselineTorsoY = this.calibSamples.reduce((a, b) => a + b.y, 0) / this.calibSamples.length;
        this.baselineNoseY = this.calibSamples.reduce((a, b) => a + b.headY, 0) / this.calibSamples.length;
        this.calibrated = true;
      }
    }

    // Kinematic Velocities
    if (!this.prevHeadY) this.prevHeadY = headY;
    const instVelX = (midShoulderX - this.prevTorsoX) / dt;
    const instVelY = (midShoulderY - this.prevTorsoY) / dt;
    const headVelY = (headY - this.prevHeadY) / dt;

    this.prevTorsoX = midShoulderX;
    this.prevTorsoY = midShoulderY;
    this.prevHeadY = headY;

    this.velX = this.velX * 0.5 + instVelX * 0.5;
    this.velY = this.velY * 0.5 + instVelY * 0.5;

    const dx = midShoulderX - this.baselineTorsoX;
    const headDy = headY - this.baselineNoseY;

    // Smooth baseline adaptation when player is standing steadily
    if (this.calibrated) {
      if (Math.abs(headVelY) < 0.15 && Math.abs(headDy) < 0.05) {
        this.baselineNoseY = this.baselineNoseY * 0.98 + headY * 0.02;
        this.baselineTorsoY = this.baselineTorsoY * 0.98 + midShoulderY * 0.02;
      }
      if (Math.abs(this.velX) < 0.12 && Math.abs(dx) < 0.05) {
        this.baselineTorsoX = this.baselineTorsoX * 0.98 + midShoulderX * 0.02;
      }
    }

    // Lane Steering Hysteresis
    this.smoothedTorsoDx = this.smoothedTorsoDx * 0.70 + dx * 0.30;

    let candidateLane = this.targetLane;
    if (this.targetLane === 0) {
      if (this.smoothedTorsoDx < -0.075 || this.velX < -0.38) candidateLane = -1;
      else if (this.smoothedTorsoDx > 0.075 || this.velX > 0.38) candidateLane = 1;
    } else if (this.targetLane === -1) {
      if (this.smoothedTorsoDx > -0.035 && this.velX > -0.10) candidateLane = 0;
      else if (this.smoothedTorsoDx > 0.075) candidateLane = 1;
    } else if (this.targetLane === 1) {
      if (this.smoothedTorsoDx < 0.035 && this.velX < 0.10) candidateLane = 0;
      else if (this.smoothedTorsoDx < -0.075) candidateLane = -1;
    }

    this.applyLaneDebounce(candidateLane, now);

    // Jump & Crouch
    const canJump = (now - this.lastJumpTime) > 650;
    const isJumpingAirborne = canJump && (headVelY < -0.45 && headDy < -0.055);
    if (isJumpingAirborne) this.lastJumpTime = now;

    const isCrouching = (headVelY > 0.35 && headDy > 0.08) || headDy > 0.12;

    let detected = 'NEUTRAL';
    let conf = 0.96;

    if (isJumpingAirborne) {
      detected = this.targetLane === -1 ? 'JUMP_LEFT' : this.targetLane === 1 ? 'JUMP_RIGHT' : 'JUMP';
      conf = 0.99;
    } else if (isCrouching) {
      detected = 'CROUCH';
      conf = 0.98;
    } else if (handsAboveHead) {
      detected = 'POWER_UP';
      conf = 0.97;
    } else if (this.targetLane === -1) {
      detected = 'LEAN_LEFT';
      conf = 0.96;
    } else if (this.targetLane === 1) {
      detected = 'LEAN_RIGHT';
      conf = 0.96;
    }

    this.currentGesture = detected;
    this.confidence = Math.round(conf * 100);

    this.emitGesture({
      gesture: this.currentGesture,
      targetLane: this.targetLane,
      confidence: this.confidence,
      dx,
      dy: headDy,
      velX: this.velX,
      velY: this.velY,
      mode: CONTROL_MODES.HALF_BODY,
      landmarks,
    });

    this.renderHalfBodySkeleton(landmarks, this.currentGesture);
  }

  // ─────────────────────────────────────────────────────────────────
  // MODE 2: HEAD ONLY (Seated Desk Play: Head Tilt & Lateral Motion)
  // ─────────────────────────────────────────────────────────────────
  processHeadOnlyMode(landmarks) {
    const now = performance.now();
    const dt = Math.max(0.001, (now - this.prevTime) / 1000);
    this.prevTime = now;

    // Head / Face landmarks
    const nose = landmarks[0];
    const leftEye = landmarks[2];
    const rightEye = landmarks[5];

    // Mirrored head position
    const headX = 1.0 - nose.x;
    const headY = nose.y;

    // Head tilt angle across eyes (Mirrored coordinates)
    const eyeDx = (1.0 - rightEye.x) - (1.0 - leftEye.x);
    const eyeDy = rightEye.y - leftEye.y;
    const tiltAngle = Math.atan2(eyeDy, eyeDx);
    const tiltDeg = (tiltAngle * 180) / Math.PI; // Positive = tilt right, negative = tilt left

    // Calibration
    if (!this.calibrated) {
      this.calibSamples.push({ headX, headY });
      if (this.calibSamples.length >= 20) {
        this.baselineHeadX = this.calibSamples.reduce((a, b) => a + b.headX, 0) / this.calibSamples.length;
        this.baselineHeadY = this.calibSamples.reduce((a, b) => a + b.headY, 0) / this.calibSamples.length;
        this.calibrated = true;
      }
    }

    // Velocities
    const headVelX = (headX - this.prevHeadX) / dt;
    const headVelY = (headY - this.prevHeadY) / dt;
    this.prevHeadX = headX;
    this.prevHeadY = headY;

    this.velX = this.velX * 0.5 + headVelX * 0.5;
    this.velY = this.velY * 0.5 + headVelY * 0.5;

    const headDx = headX - this.baselineHeadX;
    const headDy = headY - this.baselineHeadY;

    // Adaptive Baseline for steady sitting
    if (this.calibrated) {
      if (Math.abs(headVelX) < 0.10 && Math.abs(headDx) < 0.04) {
        this.baselineHeadX = this.baselineHeadX * 0.98 + headX * 0.02;
      }
      if (Math.abs(headVelY) < 0.12 && Math.abs(headDy) < 0.04) {
        this.baselineHeadY = this.baselineHeadY * 0.98 + headY * 0.02;
      }
    }

    // Combined lateral steering signal: lateral shift + head tilt angle
    // Players can either slide their head sideways OR tilt their head to steer!
    const effectiveSteer = headDx + (tiltDeg * 0.0035);
    this.smoothedHeadSteer = this.smoothedHeadSteer * 0.70 + effectiveSteer * 0.30;

    let candidateLane = this.targetLane;
    if (this.targetLane === 0) {
      if (this.smoothedHeadSteer < -0.055 || this.velX < -0.30) candidateLane = -1;
      else if (this.smoothedHeadSteer > 0.055 || this.velX > 0.30) candidateLane = 1;
    } else if (this.targetLane === -1) {
      if (this.smoothedHeadSteer > -0.024 && this.velX > -0.08) candidateLane = 0;
      else if (this.smoothedHeadSteer > 0.055) candidateLane = 1;
    } else if (this.targetLane === 1) {
      if (this.smoothedHeadSteer < 0.024 && this.velX < 0.08) candidateLane = 0;
      else if (this.smoothedHeadSteer < -0.055) candidateLane = -1;
    }

    this.applyLaneDebounce(candidateLane, now);

    // Head Jump: Chin / Head Lifted Upwards (headVelY < -0.32, headDy < -0.045)
    const canJump = (now - this.lastJumpTime) > 650;
    const isJumping = canJump && (headVelY < -0.32 && headDy < -0.045);
    if (isJumping) this.lastJumpTime = now;

    // Head Crouch: Head dipped down or nod down
    const isCrouching = (headVelY > 0.28 && headDy > 0.055) || headDy > 0.09;

    let detected = 'NEUTRAL';
    let conf = 0.96;

    if (isJumping) {
      detected = this.targetLane === -1 ? 'JUMP_LEFT' : this.targetLane === 1 ? 'JUMP_RIGHT' : 'JUMP';
      conf = 0.98;
    } else if (isCrouching) {
      detected = 'CROUCH';
      conf = 0.97;
    } else if (this.targetLane === -1) {
      detected = 'LEAN_LEFT';
      conf = 0.96;
    } else if (this.targetLane === 1) {
      detected = 'LEAN_RIGHT';
      conf = 0.96;
    }

    this.currentGesture = detected;
    this.confidence = Math.round(conf * 100);

    this.emitGesture({
      gesture: this.currentGesture,
      targetLane: this.targetLane,
      confidence: this.confidence,
      dx: headDx,
      dy: headDy,
      velX: this.velX,
      velY: this.velY,
      mode: CONTROL_MODES.HEAD_ONLY,
      headTilt: tiltDeg,
      landmarks,
    });

    this.renderHeadOverlay(landmarks, this.currentGesture, headX, headY, tiltDeg, headDy);
  }

  // ─────────────────────────────────────────────────────────────────
  // MODE 3: SINGLE PALM (Air Palm Controller from MediaPipe Hands)
  // ─────────────────────────────────────────────────────────────────
  onMediaPipeHandsResults = (results) => {
    if (!this.isRunning) return;
    if (this.controlMode !== CONTROL_MODES.PALM_ONLY) return;

    const multiHandLandmarks = results.multiHandLandmarks;
    if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
      this.renderPalmEmptyOverlay();
      return;
    }

    // Single Palm: use active hand (index 0)
    const landmarks = multiHandLandmarks[0];
    this.processPalmLandmarks(landmarks);
  };

  processPalmLandmarks(landmarks) {
    const now = performance.now();
    const dt = Math.max(0.001, (now - this.prevTime) / 1000);
    this.prevTime = now;

    // Calculate Palm Center: average of wrist (0), index mcp (5), middle mcp (9), and pinky mcp (17)
    const wrist = landmarks[0];
    const indexMcp = landmarks[5];
    const middleMcp = landmarks[9];
    const pinkyMcp = landmarks[17];
    const middleTip = landmarks[12];

    const palmX = 1.0 - (wrist.x + indexMcp.x + middleMcp.x + pinkyMcp.x) / 4;
    const palmY = (wrist.y + indexMcp.y + middleMcp.y + pinkyMcp.y) / 4;

    // Check hand openness: distance from wrist to tips vs wrist to knuckles
    const isHandRaisedHigh = palmY < 0.22;

    // Calibration
    if (!this.calibrated) {
      this.calibSamples.push({ palmX, palmY });
      if (this.calibSamples.length >= 20) {
        this.baselinePalmX = this.calibSamples.reduce((a, b) => a + b.palmX, 0) / this.calibSamples.length;
        this.baselinePalmY = this.calibSamples.reduce((a, b) => a + b.palmY, 0) / this.calibSamples.length;
        this.calibrated = true;
      }
    }

    // Velocities
    const palmVelX = (palmX - this.prevPalmX) / dt;
    const palmVelY = (palmY - this.prevPalmY) / dt;
    this.prevPalmX = palmX;
    this.prevPalmY = palmY;

    this.velX = this.velX * 0.5 + palmVelX * 0.5;
    this.velY = this.velY * 0.5 + palmVelY * 0.5;

    const palmDx = palmX - this.baselinePalmX;
    const palmDy = palmY - this.baselinePalmY;

    // Adaptive Baseline when palm is resting steadily
    if (this.calibrated) {
      if (Math.abs(palmVelX) < 0.12 && Math.abs(palmDx) < 0.04) {
        this.baselinePalmX = this.baselinePalmX * 0.98 + palmX * 0.02;
      }
      if (Math.abs(palmVelY) < 0.14 && Math.abs(palmDy) < 0.04) {
        this.baselinePalmY = this.baselinePalmY * 0.98 + palmY * 0.02;
      }
    }

    // Lane Steering (Wave / Move Palm Left or Right)
    this.smoothedPalmDx = this.smoothedPalmDx * 0.70 + palmDx * 0.30;

    let candidateLane = this.targetLane;
    if (this.targetLane === 0) {
      if (this.smoothedPalmDx < -0.065 || this.velX < -0.32) candidateLane = -1;
      else if (this.smoothedPalmDx > 0.065 || this.velX > 0.32) candidateLane = 1;
    } else if (this.targetLane === -1) {
      if (this.smoothedPalmDx > -0.028 && this.velX > -0.10) candidateLane = 0;
      else if (this.smoothedPalmDx > 0.065) candidateLane = 1;
    } else if (this.targetLane === 1) {
      if (this.smoothedPalmDx < 0.028 && this.velX < 0.10) candidateLane = 0;
      else if (this.smoothedPalmDx < -0.065) candidateLane = -1;
    }

    this.applyLaneDebounce(candidateLane, now);

    // Palm Jump: Rapid upward flick or raised palm
    const canJump = (now - this.lastJumpTime) > 650;
    const isJumping = canJump && ((palmVelY < -0.38 && palmDy < -0.055) || isHandRaisedHigh);
    if (isJumping) this.lastJumpTime = now;

    // Palm Crouch: Drop palm toward bottom of frame
    const isCrouching = (palmVelY > 0.32 && palmDy > 0.07) || palmY > 0.78;

    let detected = 'NEUTRAL';
    let conf = 0.97;

    if (isJumping) {
      detected = this.targetLane === -1 ? 'JUMP_LEFT' : this.targetLane === 1 ? 'JUMP_RIGHT' : 'JUMP';
      conf = 0.99;
    } else if (isCrouching) {
      detected = 'CROUCH';
      conf = 0.98;
    } else if (this.targetLane === -1) {
      detected = 'LEAN_LEFT';
      conf = 0.96;
    } else if (this.targetLane === 1) {
      detected = 'LEAN_RIGHT';
      conf = 0.96;
    }

    this.currentGesture = detected;
    this.confidence = Math.round(conf * 100);

    this.emitGesture({
      gesture: this.currentGesture,
      targetLane: this.targetLane,
      confidence: this.confidence,
      dx: palmDx,
      dy: palmDy,
      velX: this.velX,
      velY: this.velY,
      mode: CONTROL_MODES.PALM_ONLY,
      palmX,
      palmY,
      landmarks,
    });

    this.renderPalmOverlay(landmarks, this.currentGesture, palmX, palmY, palmDx, palmDy);
  }

  // Fallback for Palm mode using Pose wrist & finger knuckles
  processPoseHandFallback(landmarks) {
    // Pick the most raised wrist (left: 15, right: 16)
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const activeWrist = leftWrist.y < rightWrist.y ? leftWrist : rightWrist;

    const pseudoPalm = [
      { x: activeWrist.x, y: activeWrist.y },
      { x: activeWrist.x - 0.02, y: activeWrist.y - 0.04 },
      { x: activeWrist.x - 0.03, y: activeWrist.y - 0.07 },
      { x: activeWrist.x - 0.04, y: activeWrist.y - 0.09 },
      { x: activeWrist.x - 0.05, y: activeWrist.y - 0.11 },
      { x: activeWrist.x - 0.01, y: activeWrist.y - 0.08 },
      { x: activeWrist.x - 0.01, y: activeWrist.y - 0.11 },
      { x: activeWrist.x - 0.01, y: activeWrist.y - 0.14 },
      { x: activeWrist.x - 0.01, y: activeWrist.y - 0.16 },
      { x: activeWrist.x, y: activeWrist.y - 0.08 },
      { x: activeWrist.x, y: activeWrist.y - 0.12 },
      { x: activeWrist.x, y: activeWrist.y - 0.15 },
      { x: activeWrist.x, y: activeWrist.y - 0.18 },
      { x: activeWrist.x + 0.01, y: activeWrist.y - 0.08 },
      { x: activeWrist.x + 0.01, y: activeWrist.y - 0.11 },
      { x: activeWrist.x + 0.01, y: activeWrist.y - 0.14 },
      { x: activeWrist.x + 0.01, y: activeWrist.y - 0.16 },
      { x: activeWrist.x + 0.02, y: activeWrist.y - 0.07 },
      { x: activeWrist.x + 0.02, y: activeWrist.y - 0.09 },
      { x: activeWrist.x + 0.02, y: activeWrist.y - 0.11 },
      { x: activeWrist.x + 0.02, y: activeWrist.y - 0.13 },
    ];
    this.processPalmLandmarks(pseudoPalm);
  }

  // ─────────────────────────────────────────────────────────────────
  // COMMON HELPERS
  // ─────────────────────────────────────────────────────────────────
  applyLaneDebounce(candidateLane, now) {
    if (candidateLane === this.pendingLane) {
      this.pendingLaneFrames = (this.pendingLaneFrames || 0) + 1;
      if (this.pendingLaneFrames >= 3) {
        if (this.targetLane !== candidateLane) {
          const timeSinceLast = now - (this.lastLaneChangeTime || 0);
          if (timeSinceLast > 160) {
            this.targetLane = candidateLane;
            this.lastLaneChangeTime = now;
          }
        }
      }
    } else {
      this.pendingLane = candidateLane;
      this.pendingLaneFrames = 1;
    }
  }

  emitGesture(data) {
    if (this.onGestureCallback) {
      this.onGestureCallback({
        ...data,
        source: 'MEDIAPIPE_BROWSER',
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // VISUALIZERS: SMALL SCREEN CANVAS OVERLAYS
  // ─────────────────────────────────────────────────────────────────

  /**
   * 1. Half Body Skeleton Overlay
   */
  renderHalfBodySkeleton(landmarks, gesture) {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    let strokeColor = '#00FF99'; // Cyber Green
    if (gesture.includes('LEFT')) strokeColor = '#FFD700'; // Kasavu Gold
    else if (gesture.includes('RIGHT')) strokeColor = '#FF8C00'; // Orange
    else if (gesture === 'JUMP') strokeColor = '#00E5FF'; // Cyan
    else if (gesture === 'CROUCH') strokeColor = '#FF3366'; // Red
    else if (gesture === 'POWER_UP') strokeColor = '#FF00EA'; // Magenta

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;

    UPPER_BODY_CONNECTIONS.forEach(([s, e]) => {
      const p1 = landmarks[s];
      const p2 = landmarks[e];
      if (p1 && p2 && p1.visibility > 0.4 && p2.visibility > 0.4) {
        const x1 = (1.0 - p1.x) * w;
        const y1 = p1.y * h;
        const x2 = (1.0 - p2.x) * w;
        const y2 = p2.y * h;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });

    // Joint Nodes
    landmarks.forEach((p, idx) => {
      if (idx <= 24 && p.visibility > 0.4) {
        const px = (1.0 - p.x) * w;
        const py = p.y * h;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
      }
    });

    this.renderOverlayHeader(ctx, w, strokeColor, '🧍 BODY', gesture);
    ctx.restore();
  }

  /**
   * 2. Head Only Targeting Reticle & Tilt Gauge
   */
  renderHeadOverlay(landmarks, gesture, headX, headY, tiltDeg, headDy) {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    let strokeColor = '#00E5FF'; // Cyan
    if (gesture.includes('LEFT')) strokeColor = '#FFD700';
    else if (gesture.includes('RIGHT')) strokeColor = '#FF8C00';
    else if (gesture === 'JUMP') strokeColor = '#00FF99';
    else if (gesture === 'CROUCH') strokeColor = '#FF3366';

    const cx = headX * w;
    const cy = headY * h;

    ctx.save();

    // 1. Face Targeting Reticle
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((tiltDeg * Math.PI) / 180);

    // Oval around face
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 44, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(-12, 0); ctx.lineTo(-4, 0);
    ctx.moveTo(4, 0); ctx.lineTo(12, 0);
    ctx.moveTo(0, -12); ctx.lineTo(0, -4);
    ctx.moveTo(0, 4); ctx.lineTo(0, 12);
    ctx.stroke();

    // Horizon guide line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-45, 0); ctx.lineTo(45, 0);
    ctx.stroke();

    ctx.restore();

    // 2. Lateral Lane Arrows
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.fillStyle = gesture.includes('LEFT') ? '#FFD700' : 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('◀ L', 14, h / 2);

    ctx.fillStyle = gesture.includes('RIGHT') ? '#FF8C00' : 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('R ▶', w - 24, h / 2);

    // 3. Vertical Elevation Level Gauge
    const barX = w - 8;
    const barHeight = 40;
    const barY = h / 2 - 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(barX, barY, 4, barHeight);

    const normElevation = Math.max(-1, Math.min(1, -headDy * 6));
    const markerY = barY + 20 - normElevation * 18;
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(barX + 2, markerY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    this.renderOverlayHeader(ctx, w, strokeColor, '👤 HEAD', gesture);
    ctx.restore();
  }

  /**
   * 3. Single Palm 21-Joint Skeleton & Flight Ring
   */
  renderPalmOverlay(landmarks, gesture, palmX, palmY, palmDx, palmDy) {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    let strokeColor = '#FFD700'; // Kasavu Gold
    if (gesture.includes('LEFT')) strokeColor = '#60a5fa'; // Blue
    else if (gesture.includes('RIGHT')) strokeColor = '#FF8C00'; // Orange
    else if (gesture === 'JUMP') strokeColor = '#00FF99'; // Green
    else if (gesture === 'CROUCH') strokeColor = '#FF3366'; // Red

    const px = palmX * w;
    const py = palmY * h;

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;

    // Draw 21 Hand Bones
    HAND_CONNECTIONS.forEach(([s, e]) => {
      const p1 = landmarks[s];
      const p2 = landmarks[e];
      if (p1 && p2) {
        const x1 = (1.0 - p1.x) * w;
        const y1 = p1.y * h;
        const x2 = (1.0 - p2.x) * w;
        const y2 = p2.y * h;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });

    // Draw 21 Joint Dots
    landmarks.forEach((p) => {
      const jx = (1.0 - p.x) * w;
      const jy = p.y * h;
      ctx.beginPath();
      ctx.arc(jx, jy, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    });

    // Palm Center Joystick Target Ring
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px, py, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();

    // Palm Steering Indicator Guides
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.fillStyle = gesture.includes('LEFT') ? '#60a5fa' : 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('◀ L', 14, h / 2);

    ctx.fillStyle = gesture.includes('RIGHT') ? '#FF8C00' : 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('R ▶', w - 24, h / 2);

    this.renderOverlayHeader(ctx, w, strokeColor, '✋ PALM', gesture);
    ctx.restore();
  }

  renderPalmEmptyOverlay() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.font = 'bold 10px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('✋ RAISE SINGLE PALM', w / 2, h / 2);
    ctx.restore();
  }

  renderOverlayHeader(ctx, w, color, modeTag, gesture) {
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    const text = gesture !== 'NEUTRAL' ? `${gesture.replace('_', ' ')}` : `${modeTag} READY`;
    ctx.fillText(text, w / 2, 18);
  }

  fallbackOpticalDetection() {
    if (this.onGestureCallback) {
      this.onGestureCallback({
        gesture: this.currentGesture,
        targetLane: this.targetLane,
        confidence: 85,
        dx: 0,
        dy: 0,
        mode: this.controlMode,
      });
    }
  }
}
