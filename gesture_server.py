"""
GoKerala: Gesture Run - High-Precision Python Gesture Engine
Powered by Google MediaPipe Pose (33 3D landmarks) & OpenCV

Calculates kinematic vectors:
- Lateral jumping & high-speed leaning (JUMP_LEFT, JUMP_RIGHT)
- Airborne vertical jumping (JUMP)
- Squat / Crouch dodging (CROUCH)
- Hands raised (POWER_UP / PAUSE)
Streams high-frequency 60 FPS JSON to React Native / Three.js via WebSockets.
"""

import cv2
import json
import time
import math
import asyncio
import threading
import sys
import numpy as np
import websockets
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# 33 MediaPipe Landmark Indices
NOSE = 0
LEFT_EYE = 2
RIGHT_EYE = 5
LEFT_EAR = 7
RIGHT_EAR = 8
LEFT_SHOULDER = 11
RIGHT_SHOULDER = 12
LEFT_ELBOW = 13
RIGHT_ELBOW = 14
LEFT_WRIST = 15
RIGHT_WRIST = 16
LEFT_HIP = 23
RIGHT_HIP = 24
LEFT_KNEE = 25
RIGHT_KNEE = 26
LEFT_ANKLE = 27
RIGHT_ANKLE = 28
LEFT_HEEL = 29
RIGHT_HEEL = 30
LEFT_FOOT_INDEX = 31
RIGHT_FOOT_INDEX = 32

POSE_CONNECTIONS = [
    (11, 12), (11, 13), (13, 15), (12, 14), (14, 16), # Arms & shoulders
    (11, 23), (12, 24), (23, 24),                     # Torso
    (23, 25), (25, 27), (27, 29), (29, 31),          # Left leg
    (24, 26), (26, 28), (28, 30), (30, 32),          # Right leg
    (0, 2), (2, 7), (0, 5), (5, 8)                    # Face
]

class PrecisionGestureEngine:
    def __init__(self, model_path="pose_landmarker_lite.task"):
        # Initialize MediaPipe PoseLandmarker
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            output_segmentation_masks=False,
            min_pose_detection_confidence=0.6,
            min_pose_presence_confidence=0.6,
            min_tracking_confidence=0.6
        )
        self.detector = vision.PoseLandmarker.create_from_options(options)

        # Baseline & Calibration
        self.calibrated = False
        self.calibration_samples = []
        self.baseline_torso = np.array([0.5, 0.45]) # (x, y)
        self.baseline_shoulder_width = 0.25
        self.baseline_torso_height = 0.35

        # Kinematic History for Velocity Calculations
        self.prev_torso = np.array([0.5, 0.45])
        self.prev_time = time.time()
        self.smoothed_vel = np.array([0.0, 0.0])

        # State & Cooldowns
        self.current_gesture = "NEUTRAL"
        self.confidence = 0.95
        self.last_action_time = 0.0
        self.action_cooldown = 0.26 # 260ms cooldown between lane shifts
        
        # Latest serialized frame data for WebSockets
        self.latest_payload = None
        self.connected_clients = set()

    def update_calibration(self, torso_center, shoulder_w, torso_h):
        self.calibration_samples.append((torso_center, shoulder_w, torso_h))
        if len(self.calibration_samples) > 30 and not self.calibrated:
            avg_torso = np.mean([s[0] for s in self.calibration_samples], axis=0)
            avg_sw = np.mean([s[1] for s in self.calibration_samples])
            avg_th = np.mean([s[2] for s in self.calibration_samples])
            self.baseline_torso = avg_torso
            self.baseline_shoulder_width = avg_sw
            self.baseline_torso_height = avg_th
            self.calibrated = True
            print(f"✓ Precision Calibration Established: Center={self.baseline_torso}, SW={self.baseline_shoulder_width:.3f}")

    def analyze_pose(self, landmarks, frame_w, frame_h):
        now = time.time()
        dt = max(0.001, now - self.prev_time)
        self.prev_time = now

        # Extract primary joint positions (x, y) in normalized coords
        pts = {}
        landmark_list = []
        for idx, lm in enumerate(landmarks):
            # Mirror X coordinate for intuitive webcam control
            mirrored_x = 1.0 - lm.x
            pts[idx] = np.array([mirrored_x, lm.y, lm.z])
            landmark_list.append({
                "id": idx,
                "x": float(mirrored_x),
                "y": float(lm.y),
                "z": float(lm.z),
                "visibility": float(getattr(lm, "visibility", 1.0) or 1.0)
            })

        # Calculate Torso Key Vectors
        mid_shoulder = (pts[LEFT_SHOULDER][:2] + pts[RIGHT_SHOULDER][:2]) / 2.0
        mid_hip = (pts[LEFT_HIP][:2] + pts[RIGHT_HIP][:2]) / 2.0
        torso_center = (mid_shoulder + mid_hip) / 2.0
        shoulder_width = np.linalg.norm(pts[LEFT_SHOULDER][:2] - pts[RIGHT_SHOULDER][:2])
        torso_height = np.linalg.norm(mid_shoulder - mid_hip)

        # Baseline calibration gathering
        if not self.calibrated or len(self.calibration_samples) < 40:
            self.update_calibration(torso_center, shoulder_width, torso_height)

        # Instantaneous velocity (units / sec)
        inst_vel = (torso_center - self.prev_torso) / dt
        self.prev_torso = torso_center.copy()

        # Smooth velocity with EMA filter
        alpha = 0.35
        self.smoothed_vel = self.smoothed_vel * (1 - alpha) + inst_vel * alpha
        vel_x, vel_y = self.smoothed_vel

        # Relative displacement from neutral baseline
        dx = torso_center[0] - self.baseline_torso[0]
        dy = torso_center[1] - self.baseline_torso[1]

        # Check for Hand Elevation (Power-up or Pause)
        hands_raised = (
            pts[LEFT_WRIST][1] < pts[LEFT_SHOULDER][1] and 
            pts[RIGHT_WRIST][1] < pts[RIGHT_SHOULDER][1]
        )

        # -------------------------------------------------------------
        # HIGH PRECISION GESTURE CLASSIFIER
        # -------------------------------------------------------------
        detected_gesture = "NEUTRAL"
        conf = 0.90

        # Direct Target Lane based on physical position
        target_lane = 0
        if dx < -0.06:
            target_lane = -1
        elif dx > 0.06:
            target_lane = 1
        else:
            target_lane = 0

        # 1. VERTICAL JUMP (Rapid upward velocity or significant upward torso displacement)
        # Note: In screen coordinates, negative Y is upward.
        jump_vel_threshold = -0.45
        jump_disp_threshold = -0.07
        if vel_y < jump_vel_threshold or dy < jump_disp_threshold:
            if target_lane == -1 or vel_x < -0.35:
                detected_gesture = "JUMP_LEFT"
                target_lane = -1
            elif target_lane == 1 or vel_x > 0.35:
                detected_gesture = "JUMP_RIGHT"
                target_lane = 1
            else:
                detected_gesture = "JUMP"
            conf = min(0.99, 0.85 + abs(vel_y) * 0.1)

        # 2. CROUCH / SQUAT / DODGE (Torso lowers or compresses)
        elif dy > 0.06 or torso_height < (self.baseline_torso_height * 0.80):
            detected_gesture = "CROUCH"
            conf = min(0.99, 0.85 + abs(dy) * 1.5)

        # 3. LATERAL JUMP / LEAN LEFT
        elif target_lane == -1:
            if vel_x < -0.40:
                detected_gesture = "JUMP_LEFT"
                conf = 0.98
            else:
                detected_gesture = "LEAN_LEFT"
                conf = min(0.99, 0.85 + abs(dx) * 2.0)

        # 4. LATERAL JUMP / LEAN RIGHT
        elif target_lane == 1:
            if vel_x > 0.40:
                detected_gesture = "JUMP_RIGHT"
                conf = 0.98
            else:
                detected_gesture = "LEAN_RIGHT"
                conf = min(0.99, 0.85 + abs(dx) * 2.0)

        # 5. SPECIAL POWER-UP GESTURE (Both hands raised high above head)
        elif hands_raised:
            detected_gesture = "POWER_UP"
            conf = 0.95

        self.current_gesture = detected_gesture
        self.confidence = conf

        # Construct JSON broadcast payload
        self.latest_payload = {
            "type": "PYTHON_POSE_UPDATE",
            "gesture": self.current_gesture,
            "target_lane": target_lane,
            "confidence": round(self.confidence * 100),
            "torso_center": [float(torso_center[0]), float(torso_center[1])],
            "dx": float(dx),
            "dy": float(dy),
            "vel_x": float(vel_x),
            "vel_y": float(vel_y),
            "is_calibrated": self.calibrated,
            "landmarks": landmark_list,
            "timestamp": time.time()
        }

        return self.current_gesture, self.confidence, dx, dy, vel_x, vel_y, pts

# -------------------------------------------------------------
# WEBSOCKET SERVER FOR REAL-TIME STREAMING
# -------------------------------------------------------------
async def websocket_handler(websocket, engine):
    engine.connected_clients.add(websocket)
    print(f"🎮 React Native Three.js Client Connected! (Total: {len(engine.connected_clients)})")
    try:
        # Send instant greeting with active status
        await websocket.send(json.dumps({
            "type": "SERVER_HELLO",
            "message": "GoKerala Python MediaPipe Engine Connected",
            "landmarks_count": 33
        }))
        while True:
            if engine.latest_payload:
                await websocket.send(json.dumps(engine.latest_payload))
            await asyncio.sleep(0.016) # ~60 FPS update rate
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        engine.connected_clients.remove(websocket)
        print(f"Client disconnected. Remaining: {len(engine.connected_clients)}")

async def run_websocket_server(engine, host="0.0.0.0", port=8765):
    print(f"[INFO] Starting Precision Gesture WebSocket Server on ws://localhost:{port}")
    async with websockets.serve(lambda ws: websocket_handler(ws, engine), host, port):
        await asyncio.Future() # keep running

def start_ws_thread(engine):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(run_websocket_server(engine))

# -------------------------------------------------------------
# OPENCV VISION & HUD LOOP
# -------------------------------------------------------------
def run_vision_loop():
    engine = PrecisionGestureEngine()

    # Launch WebSocket server in background thread
    ws_thread = threading.Thread(target=start_ws_thread, args=(engine,), daemon=True)
    ws_thread.start()

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    if not cap.isOpened():
        print("[ERROR] Could not open webcam.")
        return

    print("==========================================================")
    print("GOKERALA: PRECISION POSE DETECTION ENGINE ACTIVE")
    print("Stand upright -> RUN FORWARD")
    print("Lean / Jump Left -> MOVE LEFT LANE")
    print("Lean / Jump Right -> MOVE RIGHT LANE")
    print("Jump Up -> JUMP OBSTACLE")
    print("Duck / Crouch -> SLIDE UNDER")
    print("Both Hands Up -> POWER-UP")
    print("Press 'q' in OpenCV window to quit")
    print("==========================================================")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        h, w, _ = frame.shape
        # Convert BGR to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        # Detect Pose Landmarks
        detection_result = engine.detector.detect(mp_image)

        # Mirror display frame for natural visual feedback
        display_frame = cv2.flip(frame, 1)

        if detection_result.pose_landmarks and len(detection_result.pose_landmarks) > 0:
            landmarks = detection_result.pose_landmarks[0]
            gesture, conf, dx, dy, vx, vy, pts = engine.analyze_pose(landmarks, w, h)

            # Draw glowing 33-joint skeleton
            joint_color = (0, 255, 153) # Cyber green
            if "LEFT" in gesture:
                joint_color = (0, 215, 255) # Gold
            elif "RIGHT" in gesture:
                joint_color = (0, 140, 255) # Orange
            elif gesture == "JUMP":
                joint_color = (255, 229, 0) # Cyan
            elif gesture == "CROUCH":
                joint_color = (102, 51, 255) # Red/Magenta

            # Draw bones
            for start_idx, end_idx in POSE_CONNECTIONS:
                if start_idx in pts and end_idx in pts:
                    p1 = (int(pts[start_idx][0] * w), int(pts[start_idx][1] * h))
                    p2 = (int(pts[end_idx][0] * w), int(pts[end_idx][1] * h))
                    cv2.line(display_frame, p1, p2, joint_color, 2, cv2.LINE_AA)

            # Draw joint nodes
            for idx, pt in pts.items():
                px = int(pt[0] * w)
                py = int(pt[1] * h)
                cv2.circle(display_frame, (px, py), 4, (255, 255, 255), -1)
                cv2.circle(display_frame, (px, py), 6, joint_color, 1, cv2.LINE_AA)

            # Top HUD Banner
            cv2.rectangle(display_frame, (0, 0), (w, 60), (10, 25, 18), -1)
            cv2.putText(
                display_frame,
                f"GESTURE: {gesture} ({conf*100:.0f}%)",
                (18, 40),
                cv2.FONT_HERSHEY_DUPLEX,
                1.0,
                joint_color,
                2,
                cv2.LINE_AA
            )

            # Velocity & Metrics readout
            metrics_str = f"Dx:{dx:+.2f} Dy:{dy:+.2f} | Vx:{vx:+.2f} Vy:{vy:+.2f}"
            cv2.putText(
                display_frame,
                metrics_str,
                (18, 85),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (200, 240, 220),
                1,
                cv2.LINE_AA
            )

        try:
            cv2.imshow("GoKerala - Precision Gesture Controller", display_frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        except Exception:
            time.sleep(0.016)

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_vision_loop()
