/**
 * GameEngine.js
 * High-performance 3D Runner Engine powered by Three.js
 * Controls 3-lane kinematics, collision physics, Kerala level environments,
 * dynamic Chenda rhythm synchronization, and power-ups.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KeralaWorldBuilder, LOCATIONS } from './KeralaWorlds.js';
import { audioEngine } from '../services/AudioEngine.js';
import { modelManager } from './ModelManager.js';
import { createRunnerMaterials } from './RunnerTextures.js';

export class GameEngine {
  constructor(containerElement, callbacks = {}) {
    this.container = containerElement;
    this.callbacks = callbacks; // onHUDUpdate, onGameOver, onLocationDiscovered

    this.builder = new KeralaWorldBuilder();
    modelManager.loadAll();

    // Smashed objects physics queue
    this.smashedObjects = [];
    this.segmentIndex = 0;

    // Game State
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.distance = 0; // meters
    this.coins = 0;
    this.coconuts = 0;
    this.hearts = 3;
    this.maxHearts = 3;

    // Speeds and Kinematics
    this.baseSpeed = 16.0; // units per sec
    this.speed = this.baseSpeed;
    this.currentLane = 0; // -1: Left, 0: Center, 1: Right
    this.laneWidth = 2.4;
    this.playerTargetX = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.playerVelX = { v: 0 };
    this.lastLaneShiftTime = 0;

    this.isJumping = false;
    this.jumpVelocity = 0;
    this.gravity = -34;
    this.isCrouching = false;
    this.crouchTimer = 0;

    // Active Power-ups
    this.activePowerUp = null; // 'GAJA_POWER', 'CHENDA_BOOST', 'COCONUT_SHIELD', 'MONSOON_MODE'
    this.powerUpTimer = 0;
    this.powerUpDuration = 8.0;
    this.hasShield = false;

    // Location Progression: Dedicated Infinite Run in Alappuzha Backwaters
    this.locationKeys = ['ALAPPUZHA'];
    this.currentLocationIndex = 0;
    this.currentLocation = LOCATIONS.ALAPPUZHA;
    this.discoveredLocations = new Set(['ALAPPUZHA']);

    // Track Objects
    this.trackSegments = [];
    this.obstacles = [];
    this.collectibles = [];
    this.sceneryObjects = [];
    this.particles = null;

    // Animation & Clock
    this.clock = new THREE.Clock();
    this.animFrameId = null;
    this.runAnimPhase = 0;

    this.initScene();
    this.buildTrack();
    this.buildPlayer();
    this.setupRainParticles();

    // Listeners
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('keydown', this.onKeyDown);
    this.setupTouchControls();
  }

  initScene() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth < 768);
    this.isMobile = isMobile;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.currentLocation.skyColor);
    this.scene.fog = new THREE.Fog(
      this.currentLocation.fogColor,
      isMobile ? 25 : this.currentLocation.fogNear,
      isMobile ? 100 : this.currentLocation.fogFar
    );

    // Camera: adjust far plane on mobile (115 vs 200) to cut off distant geometry passes
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, isMobile ? 115 : 200);
    this.camera.position.set(0, 3.8, 6.5);

    // WebGL Renderer: ultra-optimized for mobile 60 FPS
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isMobile, // Screens on mobile have 400+ PPI; disabling MSAA saves 30% fillrate
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
      depth: true,
      stencil: false,
    });
    this.renderer.setSize(width, height);
    // On mobile, cap pixel ratio strictly to 1.0 (saves 50% GPU fillrate on 1080p/1440p displays)
    this.renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.75));
    // Disable heavy real-time dynamic shadow maps on mobile to maintain rock-solid 60 FPS
    this.renderer.shadowMap.enabled = !isMobile;
    if (!isMobile) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.container.appendChild(this.renderer.domElement);

    // Lighting: boost ambient on mobile for vibrant Kerala daylight without needing shadow map pass
    this.ambientLight = new THREE.AmbientLight(0xffffff, isMobile ? 0.92 : 0.75);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, isMobile ? 1.05 : 1.2);
    this.sunLight.position.set(20, 35, 20);
    this.sunLight.castShadow = !isMobile;
    if (!isMobile) {
      this.sunLight.shadow.bias = -0.0008;
      this.sunLight.shadow.mapSize.width = 1024;
      this.sunLight.shadow.mapSize.height = 1024;
      this.sunLight.shadow.camera.near = 10;
      this.sunLight.shadow.camera.far = 100;
      this.sunLight.shadow.camera.left = -15;
      this.sunLight.shadow.camera.right = 15;
      this.sunLight.shadow.camera.top = 20;
      this.sunLight.shadow.camera.bottom = -10;
    }
    this.scene.add(this.sunLight);
  }

  buildPlayer() {
    this.playerGroup = new THREE.Group();

    // Humanoid Body Root (handles vertical stride bounce)
    this.bodyRoot = new THREE.Group();
    this.playerGroup.add(this.bodyRoot);

    // Ultra-High-Resolution Procedural PBR Materials
    const mats = createRunnerMaterials();
    this.runnerMats = mats;

    // 1. Pelvis & Waist (center of mass ~0.94m)
    this.pelvis = new THREE.Group();
    this.pelvis.position.set(0, 0.94, 0);
    this.bodyRoot.add(this.pelvis);

    // Traditional Kerala Folded Mundu (Athletic knee-length wrap with grand Kasavu Gold Kara border)
    const munduHipGeo = new THREE.CylinderGeometry(0.245, 0.225, 0.35, 16);
    this.mundu = new THREE.Mesh(munduHipGeo, mats.munduMat);
    this.mundu.castShadow = true;
    this.mundu.receiveShadow = true;
    this.pelvis.add(this.mundu);

    // Golden Kasavu Waistband / Aranjanam Belt with Zari weave
    const beltGeo = new THREE.CylinderGeometry(0.252, 0.252, 0.075, 18);
    const belt = new THREE.Mesh(beltGeo, mats.goldZariMat);
    belt.position.y = 0.13;
    belt.castShadow = true;
    this.pelvis.add(belt);

    // 2. Torso & Upper Body (Athletic V-taper with Kasavu Shirt & Angavastram)
    this.torso = new THREE.Group();
    this.torso.position.set(0, 0.18, 0); // relative to pelvis
    this.pelvis.add(this.torso);

    // Athletic Torso Mesh (Ivory Kasavu shirt with woven texture & golden button placket)
    const chestGeo = new THREE.CylinderGeometry(0.26, 0.20, 0.48, 16);
    const chest = new THREE.Mesh(chestGeo, mats.shirtMat);
    chest.position.y = 0.24;
    chest.castShadow = true;
    chest.receiveShadow = true;
    this.torso.add(chest);

    // Muscular Pectoral contour under Kasavu vest
    const pecGeo = new THREE.BoxGeometry(0.34, 0.16, 0.14);
    const pecs = new THREE.Mesh(pecGeo, mats.shirtMat);
    pecs.position.set(0, 0.32, 0.10);
    this.torso.add(pecs);

    // Broad Deltoid Shoulder Caps (Anatomical V-taper)
    const deltoidGeo = new THREE.SphereGeometry(0.088, 12, 10);
    deltoidGeo.scale(1.0, 1.15, 0.95);

    const leftDeltoid = new THREE.Mesh(deltoidGeo, mats.shirtMat);
    leftDeltoid.position.set(-0.25, 0.40, 0);
    leftDeltoid.castShadow = true;
    this.torso.add(leftDeltoid);

    const rightDeltoid = new THREE.Mesh(deltoidGeo, mats.shirtMat);
    rightDeltoid.position.set(0.25, 0.40, 0);
    rightDeltoid.castShadow = true;
    this.torso.add(rightDeltoid);

    // Regal Golden Kasavu Angavastram / Zari Sash draped diagonally across chest & back
    const sashGeo = new THREE.BoxGeometry(0.13, 0.50, 0.42);
    const sash = new THREE.Mesh(sashGeo, mats.sashMat);
    sash.position.set(-0.06, 0.25, 0);
    sash.rotation.z = 0.24;
    sash.castShadow = true;
    this.torso.add(sash);

    // Fluttering Sash Tail (Dynamic cloth trailing behind waist in the wind!)
    this.sashTail = new THREE.Group();
    this.sashTail.position.set(-0.08, 0.05, -0.16);
    this.torso.add(this.sashTail);

    const sashTailGeo = new THREE.BoxGeometry(0.12, 0.34, 0.02);
    sashTailGeo.translate(0, -0.17, 0);
    const sashTailMesh = new THREE.Mesh(sashTailGeo, mats.sashMat);
    sashTailMesh.castShadow = true;
    this.sashTail.add(sashTailMesh);

    // Collar / Gold Neckline trim
    const collarGeo = new THREE.TorusGeometry(0.125, 0.022, 10, 18);
    collarGeo.rotateX(Math.PI / 2);
    const collar = new THREE.Mesh(collarGeo, mats.goldZariMat);
    collar.position.set(0, 0.48, 0);
    this.torso.add(collar);

    // 3. Athletic Neck & Sculpted Human Head
    const neckGeo = new THREE.CylinderGeometry(0.088, 0.098, 0.15, 14);
    const neck = new THREE.Mesh(neckGeo, mats.skinMat);
    neck.position.set(0, 0.53, 0);
    neck.castShadow = true;
    this.torso.add(neck);

    // Head Group
    this.head = new THREE.Group();
    this.head.position.set(0, 0.70, 0);
    this.torso.add(this.head);

    // Sculpted Head Cranium (Warm Kerala skin tone with natural cranial contours)
    const headGeo = new THREE.SphereGeometry(0.155, 18, 16);
    headGeo.scale(0.90, 1.06, 1.02);
    const headMesh = new THREE.Mesh(headGeo, mats.skinMat);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Athletic Jawline & Chin Definition
    const jawGeo = new THREE.BoxGeometry(0.14, 0.09, 0.12);
    const jaw = new THREE.Mesh(jawGeo, mats.skinMat);
    jaw.position.set(0, -0.06, 0.06);
    this.head.add(jaw);

    // Anatomical Ears
    const earGeo = new THREE.SphereGeometry(0.045, 8, 8);
    earGeo.scale(0.4, 1.0, 0.6);
    const earL = new THREE.Mesh(earGeo, mats.skinMat);
    earL.position.set(-0.14, 0.01, -0.01);
    this.head.add(earL);

    const earR = new THREE.Mesh(earGeo, mats.skinMat);
    earR.position.set(0.14, 0.01, -0.01);
    this.head.add(earR);

    // Styled Athletic Hair (Natural hair flow texture covering crown and tapered fade)
    const hairCapGeo = new THREE.SphereGeometry(0.165, 18, 16);
    hairCapGeo.scale(0.92, 1.03, 1.03);
    const hairCap = new THREE.Mesh(hairCapGeo, mats.hairMat);
    hairCap.position.set(0, 0.03, -0.01);
    this.head.add(hairCap);

    // Traditional Kerala Topknot Bun (Kuduma) on top with gold clasp ring
    const knotGeo = new THREE.SphereGeometry(0.068, 14, 14);
    const knot = new THREE.Mesh(knotGeo, mats.hairMat);
    knot.position.set(0, 0.175, -0.02);
    this.head.add(knot);

    const knotRingGeo = new THREE.TorusGeometry(0.046, 0.015, 8, 18);
    knotRingGeo.rotateX(Math.PI / 2);
    const knotRing = new THREE.Mesh(knotRingGeo, mats.goldZariMat);
    knotRing.position.set(0, 0.145, -0.02);
    this.head.add(knotRing);

    // Kerala Golden Ribbon Headband (Kasavu Kettu) wrapping around temples
    const headbandGeo = new THREE.CylinderGeometry(0.160, 0.160, 0.036, 20, 1, true);
    const headband = new THREE.Mesh(headbandGeo, mats.bandMat);
    headband.position.set(0, 0.05, 0);
    this.head.add(headband);

    // 4. Articulated Muscular Arms (Shoulder Pivot -> Bicep -> Elbow -> Forearm -> Fist)
    // Left Arm
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.27, 0.40, 0); // Left shoulder joint
    this.torso.add(this.leftArmPivot);

    const upperArmGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.29, 12);
    upperArmGeo.translate(0, -0.145, 0);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, mats.skinMat);
    leftUpperArm.castShadow = true;
    leftUpperArm.receiveShadow = true;
    this.leftArmPivot.add(leftUpperArm);

    // Left Forearm & Hand (Bent naturally for athletic running posture)
    this.leftForearmPivot = new THREE.Group();
    this.leftForearmPivot.position.set(0, -0.29, 0);
    this.leftForearmPivot.rotation.x = 1.32; // Athletic forward flex
    this.leftArmPivot.add(this.leftForearmPivot);

    const forearmGeo = new THREE.CylinderGeometry(0.048, 0.040, 0.27, 12);
    forearmGeo.translate(0, -0.135, 0);
    const leftForearm = new THREE.Mesh(forearmGeo, mats.skinMat);
    leftForearm.castShadow = true;
    leftForearm.receiveShadow = true;
    this.leftForearmPivot.add(leftForearm);

    // Athletic Golden Wristband / Kada on left wrist
    const wristbandGeo = new THREE.CylinderGeometry(0.043, 0.043, 0.035, 14);
    const leftWristband = new THREE.Mesh(wristbandGeo, mats.goldZariMat);
    leftWristband.position.set(0, -0.23, 0);
    this.leftForearmPivot.add(leftWristband);

    // Left Athletic Fist
    const fistGeo = new THREE.SphereGeometry(0.048, 10, 10);
    fistGeo.scale(0.9, 1.15, 1.25);
    const leftHand = new THREE.Mesh(fistGeo, mats.skinMat);
    leftHand.position.set(0, -0.27, 0.01);
    leftHand.castShadow = true;
    this.leftForearmPivot.add(leftHand);

    // Right Arm
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.27, 0.40, 0); // Right shoulder joint
    this.torso.add(this.rightArmPivot);

    const rightUpperArm = new THREE.Mesh(upperArmGeo, mats.skinMat);
    rightUpperArm.castShadow = true;
    rightUpperArm.receiveShadow = true;
    this.rightArmPivot.add(rightUpperArm);

    this.rightForearmPivot = new THREE.Group();
    this.rightForearmPivot.position.set(0, -0.29, 0);
    this.rightForearmPivot.rotation.x = 1.32;
    this.rightArmPivot.add(this.rightForearmPivot);

    const rightForearm = new THREE.Mesh(forearmGeo, mats.skinMat);
    rightForearm.castShadow = true;
    rightForearm.receiveShadow = true;
    this.rightForearmPivot.add(rightForearm);

    const rightWristband = new THREE.Mesh(wristbandGeo, mats.goldZariMat);
    rightWristband.position.set(0, -0.23, 0);
    this.rightForearmPivot.add(rightWristband);

    const rightHand = new THREE.Mesh(fistGeo, mats.skinMat);
    rightHand.position.set(0, -0.27, 0.01);
    rightHand.castShadow = true;
    this.rightForearmPivot.add(rightHand);

    // Aliases
    this.leftArm = this.leftArmPivot;
    this.rightArm = this.rightArmPivot;

    // 5. Articulated Legs (Hip Pivot -> Quadriceps -> Knee Pivot -> Muscular Calf & Pro Sneakers)
    // Left Leg
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.135, -0.12, 0); // Hip joint in pelvis
    this.pelvis.add(this.leftLegPivot);

    // Athletic Thigh with skin tone & quad contour
    const thighGeo = new THREE.CylinderGeometry(0.076, 0.060, 0.40, 12);
    thighGeo.translate(0, -0.20, 0);
    const leftThigh = new THREE.Mesh(thighGeo, mats.skinMat);
    leftThigh.castShadow = true;
    leftThigh.receiveShadow = true;
    this.leftLegPivot.add(leftThigh);

    // Left Knee
    this.leftKneePivot = new THREE.Group();
    this.leftKneePivot.position.set(0, -0.40, 0);
    this.leftLegPivot.add(this.leftKneePivot);

    // Sculpted Athletic Calf (Gastrocnemius curvature)
    const calfGeo = new THREE.CylinderGeometry(0.062, 0.046, 0.38, 12);
    calfGeo.translate(0, -0.19, 0);
    const leftCalf = new THREE.Mesh(calfGeo, mats.skinMat);
    leftCalf.castShadow = true;
    leftCalf.receiveShadow = true;
    this.leftKneePivot.add(leftCalf);

    // Left Elite Running Trainer
    const shoeGroupL = new THREE.Group();
    shoeGroupL.position.set(0, -0.38, 0.05);
    this.leftKneePivot.add(shoeGroupL);

    const shoeUpperGeo = new THREE.BoxGeometry(0.115, 0.085, 0.25);
    const shoeUpperL = new THREE.Mesh(shoeUpperGeo, mats.shoeMat);
    shoeUpperL.position.y = 0.042;
    shoeUpperL.castShadow = true;
    shoeGroupL.add(shoeUpperL);

    const soleGeo = new THREE.BoxGeometry(0.125, 0.038, 0.27);
    const shoeSoleL = new THREE.Mesh(soleGeo, mats.soleMat);
    shoeSoleL.position.y = -0.02;
    shoeSoleL.castShadow = true;
    shoeGroupL.add(shoeSoleL);

    // Metallic Gold Racing Swoosh on Sneaker
    const stripeGeo = new THREE.BoxGeometry(0.130, 0.020, 0.15);
    const stripeL = new THREE.Mesh(stripeGeo, mats.goldZariMat);
    stripeL.position.set(0, 0.045, 0);
    shoeGroupL.add(stripeL);

    // Right Leg
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.135, -0.12, 0); // Hip joint in pelvis
    this.pelvis.add(this.rightLegPivot);

    const rightThigh = new THREE.Mesh(thighGeo, mats.skinMat);
    rightThigh.castShadow = true;
    rightThigh.receiveShadow = true;
    this.rightLegPivot.add(rightThigh);

    // Right Knee
    this.rightKneePivot = new THREE.Group();
    this.rightKneePivot.position.set(0, -0.40, 0);
    this.rightLegPivot.add(this.rightKneePivot);

    const rightCalf = new THREE.Mesh(calfGeo, mats.skinMat);
    rightCalf.castShadow = true;
    rightCalf.receiveShadow = true;
    this.rightKneePivot.add(rightCalf);

    const shoeGroupR = new THREE.Group();
    shoeGroupR.position.set(0, -0.38, 0.05);
    this.rightKneePivot.add(shoeGroupR);

    const shoeUpperR = new THREE.Mesh(shoeUpperGeo, mats.shoeMat);
    shoeUpperR.position.y = 0.042;
    shoeUpperR.castShadow = true;
    shoeGroupR.add(shoeUpperR);

    const shoeSoleR = new THREE.Mesh(soleGeo, mats.soleMat);
    shoeSoleR.position.y = -0.02;
    shoeSoleR.castShadow = true;
    shoeGroupR.add(shoeSoleR);

    const stripeR = new THREE.Mesh(stripeGeo, mats.goldZariMat);
    stripeR.position.set(0, 0.045, 0);
    shoeGroupR.add(stripeR);

    // Aliases
    this.leftLeg = this.leftLegPivot;
    this.rightLeg = this.rightLegPivot;

    // Power-up Aura Shield Sphere (invisible initially)
    const shieldGeo = new THREE.SphereGeometry(1.5, 16, 16);
    this.shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMat);
    this.shieldMesh.position.y = 1.0;
    this.playerGroup.add(this.shieldMesh);

    this.scene.add(this.playerGroup);
    this.customRunnerModel = null;

    // 3D Animated Mixamo Runner Integration (Running.fbx, Jumping Up.fbx, Running Slide.fbx)
    this.animatedRunnerGroup = null;
    this.runnerMixer = null;
    this.runnerActions = {};
    this.currentRunnerActionName = null;

    if (modelManager.isReady('runner')) {
      this.initAnimatedRunner();
    }

    modelManager.onModelReady((name) => {
      if (name === 'runner') {
        this.initAnimatedRunner();
      } else if (name === 'runnerJump' && this.runnerMixer && modelManager.runnerData.clips['jump']) {
        const jumpClip = modelManager.runnerData.clips['jump'];
        const act = this.runnerMixer.clipAction(jumpClip);
        act.setLoop(THREE.LoopOnce);
        act.clampWhenFinished = true;
        this.runnerActions['jump'] = act;
        console.log('✓ Registered 3D Jump Action in Runner Mixer!');
      } else if (name === 'runnerSlide' && this.runnerMixer && modelManager.runnerData.clips['slide']) {
        const slideClip = modelManager.runnerData.clips['slide'];
        const act = this.runnerMixer.clipAction(slideClip);
        act.setLoop(THREE.LoopOnce);
        act.clampWhenFinished = true;
        this.runnerActions['slide'] = act;
        console.log('✓ Registered 3D Slide Action in Runner Mixer!');
      }
    });

    console.log('✓ Runner initialized with procedural fallback and Mixamo 3D loader!');
  }

  initAnimatedRunner() {
    if (this.animatedRunnerGroup) return;
    const runnerInst = modelManager.getRunnerInstance();
    if (!runnerInst || !runnerInst.mesh) return;

    this.animatedRunnerGroup = runnerInst.mesh;
    this.animatedRunnerGroup.visible = true;

    // Safety sweep: strip all rig lines, curves, locators, and non-skinned bone visualizer meshes
    const toRemove = [];
    this.animatedRunnerGroup.traverse((child) => {
      if (
        child.isLine ||
        child.isLineSegments ||
        child.isPoints ||
        child.type === 'Line' ||
        child.type === 'LineSegments' ||
        child.type === 'Points' ||
        (child.isMesh && !child.isSkinnedMesh)
      ) {
        child.visible = false;
        toRemove.push(child);
        return;
      }
      if (child.isSkinnedMesh) {
        child.frustumCulled = false; // Prevent clipping on screen edges
        child.castShadow = !this.isMobile;
        child.receiveShadow = false; // Disable self-shadowing to eliminate acne stripes
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            m.wireframe = false;
          });
        }
      }
    });
    toRemove.forEach((c) => {
      if (c.parent) c.parent.remove(c);
    });

    this.playerGroup.add(this.animatedRunnerGroup);

    // Hide procedural runner body so only the 3D animated model is visible
    if (this.bodyRoot) {
      this.bodyRoot.visible = false;
    }
    if (this.pelvis) {
      this.pelvis.visible = false;
    }

    // Set up AnimationMixer with the cloned skeleton
    this.runnerMixer = new THREE.AnimationMixer(this.animatedRunnerGroup);
    this.runnerActions = {};

    const clips = runnerInst.clips || {};
    if (clips.run) {
      const act = this.runnerMixer.clipAction(clips.run);
      act.setLoop(THREE.LoopRepeat);
      act.setEffectiveWeight(1.0);
      act.play();
      this.runnerActions['run'] = act;
      this.currentRunnerActionName = 'run';
    }
    if (clips.jump) {
      const act = this.runnerMixer.clipAction(clips.jump);
      act.setLoop(THREE.LoopOnce);
      act.clampWhenFinished = true;
      this.runnerActions['jump'] = act;
    }
    if (clips.slide) {
      const act = this.runnerMixer.clipAction(clips.slide);
      act.setLoop(THREE.LoopOnce);
      act.clampWhenFinished = true;
      this.runnerActions['slide'] = act;
    }

    // Auto-recovery: when jump or slide animation completes, smoothly return to running loop
    this.runnerMixer.addEventListener('finished', (e) => {
      if (e.action === this.runnerActions['jump'] || e.action === this.runnerActions['slide']) {
        if (!this.isJumping && !this.isCrouching) {
          this.playRunnerAction('run');
        }
      }
    });

    console.log('✓ 3D Animated Mixamo Runner activated with running, jumping, and sliding actions!');
  }

  playRunnerAction(actionName) {
    if (!this.runnerMixer || !this.runnerActions) return;
    const nextAction = this.runnerActions[actionName];
    if (!nextAction) return;

    if (this.currentRunnerActionName === actionName && nextAction.isRunning() && nextAction.getEffectiveWeight() > 0.5) {
      return;
    }

    const prevAction = this.runnerActions[this.currentRunnerActionName];

    // Restore weight and active state so animation never gets stuck or frozen
    nextAction.enabled = true;
    nextAction.paused = false;
    nextAction.setEffectiveTimeScale(1.0);
    nextAction.setEffectiveWeight(1.0);
    nextAction.reset();

    if (actionName === 'run') {
      nextAction.setLoop(THREE.LoopRepeat);
      nextAction.clampWhenFinished = false;
    } else {
      nextAction.setLoop(THREE.LoopOnce, 1);
      nextAction.clampWhenFinished = true;
    }

    if (prevAction && prevAction !== nextAction) {
      prevAction.crossFadeTo(nextAction, 0.12, true);
    }
    nextAction.play();
    this.currentRunnerActionName = actionName;
  }

  buildTrack() {
    this.trackGroup = new THREE.Group();
    this.scene.add(this.trackGroup);

    // Infinite 3D Country Highway Environment
    this.countryRoadGroup = new THREE.Group();
    this.scene.add(this.countryRoadGroup);
    this.countryRoadLength = 254.45;
    this.countryRoadInstances = [];

    const initCountryRoad = () => {
      if (this.countryRoadInstances.length === 0 && modelManager.isReady('countryRoad')) {
        const inst1 = modelManager.createCountryRoadInstance();
        inst1.position.set(0, 0, 0);
        const inst2 = modelManager.createCountryRoadInstance();
        inst2.position.set(0, 0, -this.countryRoadLength);
        this.countryRoadGroup.add(inst1, inst2);
        this.countryRoadInstances.push(inst1, inst2);
        console.log('✓ Infinite 3D Country Road active and looping to infinity!');
      }
    };

    if (modelManager.isReady('countryRoad')) {
      initCountryRoad();
    } else {
      modelManager.onModelReady((name) => {
        if (name === 'countryRoad') {
          initCountryRoad();
        }
      });
    }

    // Model ready listener: dynamically upgrade trees, river jetty, and coconuts as soon as 3D models finish loading
    modelManager.onModelReady((name) => {
      this.refreshSceneryAndModels(name);
    });

    // Continuous track segments for obstacles, scenery, and collectibles
    this.segmentLength = 40;
    this.numSegments = this.isMobile ? 4 : 6;

    for (let i = 0; i < this.numSegments; i++) {
      const segZ = -i * this.segmentLength;
      this.createTrackSegment(segZ);
    }
  }

  refreshSceneryAndModels(name) {
    const roadWidth = this.laneWidth * 3 + 1.6;

    if (name === 'coconutPalm' || name === 'tree') {
      this.trackSegments.forEach((seg) => {
        this.populateSegmentTrees(seg, roadWidth);
      });
      console.log('✓ Dynamically upgraded track segments to 3D Coconut Palms and Trees!');
    }

    if (name === 'riverJetty') {
      this.trackSegments.forEach((seg) => {
        if (seg.userData && seg.userData.hasJetty) {
          this.populateSegmentJetty(seg, roadWidth);
        }
      });
      console.log('✓ Dynamically added 3D River Jetty & Boatyard along canal!');
    }

    if (name === 'fisherBoat') {
      this.trackSegments.forEach((seg) => {
        this.populateSegmentBoats(seg, roadWidth);
      });
      console.log('✓ Dynamically upgraded river boats to 3D Fisher Boat model!');
    }

    if (name === 'coconut') {
      this.collectibles.forEach((item) => {
        if (item.active && item.type === 'COCONUT' && item.mesh) {
          const oldMesh = item.mesh;
          if (!oldMesh.userData || !oldMesh.userData.is3DCoconut) {
            const pos = oldMesh.position.clone();
            const parent = oldMesh.parent;
            if (parent) {
              parent.remove(oldMesh);
              const newMesh = modelManager.createCoconutInstance();
              if (newMesh) {
                newMesh.userData.isTransient = true;
                newMesh.position.copy(pos);
                parent.add(newMesh);
                item.mesh = newMesh;
              }
            }
          }
        }
      });
      console.log('✓ Dynamically upgraded collectible coconuts to 3D Tender Coconut model!');
    }
  }

  populateSegmentTrees(seg, roadWidth) {
    // Remove previous trees in this segment
    for (let i = seg.children.length - 1; i >= 0; i--) {
      const child = seg.children[i];
      if (child.userData && (child.userData.isTreeScenery || child.userData.isProceduralTree)) {
        seg.remove(child);
      }
    }

    const halfRoad = roadWidth / 2;

    // 1. Left side (Riverbank canal edge): Iconic leaning 3D Kerala Coconut Palms
    const leftTreeCount = seg.userData && seg.userData.hasJetty ? 1 : 2;
    for (let i = 0; i < leftTreeCount; i++) {
      let palm = null;
      if (modelManager.isReady('coconutPalm')) {
        palm = modelManager.createCoconutPalmInstance();
        palm.userData.isTreeScenery = true;
      } else {
        palm = this.builder.createCoconutTree();
        palm.userData.isProceduralTree = true;
      }
      if (palm) {
        palm.userData.isTransient = true;
        // Positioned along the bank shoulder
        const zOff = seg.userData && seg.userData.hasJetty
          ? (i === 0 ? -12 : 12)
          : (i === 0 ? -9 : 9);
        palm.position.set(-halfRoad - 1.4 - Math.random() * 0.8, 0, zOff);
        palm.rotation.y = Math.random() * Math.PI * 2;
        // Subtle natural tilt towards the river water
        palm.rotation.z = -0.06 - Math.random() * 0.08;
        seg.add(palm);
      }
    }

    // 2. Right side (Lush terrain bank): Majestic 3D Coconut Palms along road and 3D Tropical Trees in background
    for (let i = 0; i < 4; i++) {
      let tree = null;
      const isRoadsidePalm = (i % 2 === 0);

      if (isRoadsidePalm) {
        if (modelManager.isReady('coconutPalm')) {
          tree = modelManager.createCoconutPalmInstance();
          tree.userData.isTreeScenery = true;
        } else {
          tree = this.builder.createCoconutTree();
          tree.userData.isProceduralTree = true;
        }
      } else {
        if (modelManager.isReady('tree')) {
          tree = modelManager.createTreeInstance();
          tree.userData.isTreeScenery = true;
        } else if (modelManager.isReady('coconutPalm')) {
          tree = modelManager.createCoconutPalmInstance();
          tree.userData.isTreeScenery = true;
        } else {
          tree = this.builder.createCoconutTree();
          tree.userData.isProceduralTree = true;
        }
      }

      if (tree) {
        tree.userData.isTransient = true;
        const zOffset = -this.segmentLength / 2 + (i + 0.5) * (this.segmentLength / 4) + (Math.random() - 0.5) * 4;
        const xOffset = isRoadsidePalm
          ? halfRoad + 1.8 + Math.random() * 1.5
          : halfRoad + 4.5 + Math.random() * 4.0;

        tree.position.set(xOffset, 0, zOffset);
        tree.rotation.y = Math.random() * Math.PI * 2;
        seg.add(tree);
      }
    }
  }

  populateSegmentJetty(seg, roadWidth) {
    // Remove previous jetty in this segment
    for (let i = seg.children.length - 1; i >= 0; i--) {
      const child = seg.children[i];
      if (child.userData && child.userData.isRiverJetty) {
        seg.remove(child);
      }
    }

    if (modelManager.isReady('riverJetty')) {
      const jetty = modelManager.createRiverJettyInstance();
      if (jetty) {
        jetty.userData.isRiverJetty = true;
        jetty.userData.isTransient = true;
        // Sits right along the left riverbank edge: shore dock touches road shoulder, pier extends into canal
        jetty.position.set(-roadWidth / 2 - 1.2, -0.15, 0);
        seg.add(jetty);
      }
    }
  }

  populateSegmentBoats(seg, roadWidth) {
    // Remove previous river boats in this segment
    for (let i = seg.children.length - 1; i >= 0; i--) {
      const child = seg.children[i];
      if (child.userData && child.userData.isRiverBoat) {
        seg.remove(child);
      }
    }

    // Place an authentic 3D Fisher Boat in the river canal on alternating segments
    const hasBoat = (seg.userData.segmentIndex % 2 === 1) || (seg.userData.segmentIndex % 3 === 0);
    if (!hasBoat) return;

    let boat = null;
    if (modelManager.isReady('fisherBoat')) {
      boat = modelManager.createFisherBoatInstance();
    } else {
      boat = this.builder.createHouseboat();
      boat.userData = { isTransient: true, isRiverBoat: true, isProceduralBoat: true };
    }

    if (boat) {
      boat.userData.isTransient = true;
      boat.userData.isRiverBoat = true;
      boat.userData.baseY = -0.25;
      boat.userData.seed = (seg.userData.segmentIndex || 1) * 1.77;
      // Position floating gracefully in the canal (-15m to -21m from road center)
      const boatX = -roadWidth / 2 - 14.0 - (seg.userData.segmentIndex % 2) * 5.0;
      const boatZ = (Math.sin(seg.userData.segmentIndex * 3.14) * 8.0);
      boat.position.set(boatX, -0.25, boatZ);
      // Angled naturally with the water flow
      boat.rotation.y = 0.08 + (seg.userData.segmentIndex % 2 === 0 ? 0.14 : -0.1);
      seg.add(boat);
    }
  }

  createTrackSegment(zPos) {
    const seg = new THREE.Group();
    seg.position.z = zPos;
    this.segmentIndex = (this.segmentIndex || 0) + 1;
    const hasJetty = (this.segmentIndex % 2 === 0);
    seg.userData = {
      segmentIndex: this.segmentIndex,
      hasJetty,
    };

    const roadWidth = this.laneWidth * 3 + 1.6;

    // Roadside River / Backwater canal on the left
    const waterWidth = 25;
    const waterGeo = new THREE.PlaneGeometry(waterWidth, this.segmentLength);
    waterGeo.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(waterGeo, this.builder.materials.water);
    water.position.set(-roadWidth / 2 - waterWidth / 2 - 2, -0.25, 0);
    seg.add(water);

    // Lush Landscape Terrain on the right beyond the country road shoulder
    const terrainWidth = 35;
    const terrainGeo = new THREE.PlaneGeometry(terrainWidth, this.segmentLength);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrainMat = new THREE.MeshLambertMaterial({ color: this.currentLocation.groundColor });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.set(roadWidth / 2 + terrainWidth / 2 + 2, -0.05, 0);
    seg.add(terrain);

    // Side Scenery: 3D Coconut Palms and Tropical Trees along country road banks
    this.populateSegmentTrees(seg, roadWidth);

    // Authentic 3D Kerala River Jetty & Boatyard along the roadside backwater canal
    if (hasJetty) {
      this.populateSegmentJetty(seg, roadWidth);
    }

    // Authentic 3D Fisher Boat floating in the roadside river canal
    this.populateSegmentBoats(seg, roadWidth);

    // Special scenery per location
    if (this.currentLocation.id === 'THRISSUR') {
      const elephant = this.builder.createTempleElephant();
      elephant.userData = { isTransient: true };
      elephant.position.set(roadWidth / 2 + 6.0, 0, (Math.random() - 0.5) * 15);
      elephant.rotation.y = -Math.PI / 2 - 0.3;
      seg.add(elephant);
    }

    this.trackGroup.add(seg);
    this.trackSegments.push(seg);

    // Spawn obstacles and collectibles on this segment if ahead
    if (zPos < -20) {
      this.spawnSegmentContent(seg, zPos);
    }
  }

  spawnSegmentContent(segment, zPos) {
    const lanes = [-this.laneWidth, 0, this.laneWidth];

    // Pick obstacle lane
    const hasObstacle = Math.random() < 0.80;
    let obstacleLaneIdx = -1;
    if (hasObstacle) {
      obstacleLaneIdx = Math.floor(Math.random() * 3);
      const obsLane = lanes[obstacleLaneIdx];
      const obsTypeChoice = Math.random();

      let obsMesh = null;
      let obsType = 'FULL_LANE';
      let obstacleCategory = 'WAGONR';

      if (obsTypeChoice < 0.40 && modelManager.isReady('wagonr')) {
        // 3D 2013 Suzuki Wagon R Car Obstacle
        obsMesh = modelManager.createWagonRInstance();
        obsType = 'FULL_LANE';
        obstacleCategory = 'WAGONR';
      } else if (obsTypeChoice < 0.80 && modelManager.isReady('blindvan')) {
        // 3D Suzuki Carry Blind Van Obstacle
        obsMesh = modelManager.createBlindVanInstance();
        obsType = 'FULL_LANE';
        obstacleCategory = 'BLINDVAN';
      } else {
        // 3D Auto-rickshaw / TukTuk in lane
        obsMesh = modelManager.isReady('autorickshaw')
          ? modelManager.createAutoRickshawInstance()
          : (modelManager.isReady('wagonr')
            ? modelManager.createWagonRInstance()
            : (modelManager.isReady('blindvan') ? modelManager.createBlindVanInstance() : this.builder.createAutoRickshaw()));
        obsType = 'FULL_LANE';
        obstacleCategory = 'AUTORICKSHAW';
      }

      if (!obsMesh) {
        obsMesh = this.builder.createAutoRickshaw();
        obsType = 'FULL_LANE';
        obstacleCategory = 'AUTORICKSHAW';
      }

      obsMesh.userData = obsMesh.userData || {};
      obsMesh.userData.isTransient = true;

      const localZ = (Math.random() - 0.5) * 18;
      // Center vehicles accurately in their lane (never block all 3 lanes)
      const spawnX = obsLane;
      obsMesh.position.set(spawnX, 0, localZ);
      segment.add(obsMesh);

      this.obstacles.push({
        mesh: obsMesh,
        segment,
        type: obsType,
        obstacleCategory,
        lane: obstacleLaneIdx - 1,
        worldZ: zPos + localZ,
        active: true,
      });
    }

    // Spawn Collectibles (Gold Kasavu Coins and Tender Coconuts in safe lane)
    // No power-ups or blocking billboard labels on the road
    const coinLaneIdx = Math.floor(Math.random() * 3);
    let safeCoinLaneIdx = coinLaneIdx;
    if (hasObstacle && safeCoinLaneIdx === obstacleLaneIdx) {
      safeCoinLaneIdx = (obstacleLaneIdx + 1) % 3;
    }
    const coinLane = lanes[safeCoinLaneIdx];

    const isCoconut = Math.random() < 0.45;
    for (let c = 0; c < 3; c++) {
      let itemMesh = null;
      if (isCoconut) {
        if (modelManager.isReady('coconut')) {
          itemMesh = modelManager.createCoconutInstance();
        } else {
          itemMesh = this.builder.createCoconutCollectible();
          itemMesh.userData = itemMesh.userData || {};
          itemMesh.userData.isProceduralCoconut = true;
        }
      } else {
        itemMesh = this.builder.createKasavuCoin();
      }
      itemMesh.userData = itemMesh.userData || {};
      itemMesh.userData.isTransient = true;
      const localZ = -8 + c * 4;
      itemMesh.position.set(coinLane, 1.0, localZ);
      segment.add(itemMesh);

      this.collectibles.push({
        mesh: itemMesh,
        segment,
        type: isCoconut ? 'COCONUT' : 'COIN',
        lane: safeCoinLaneIdx - 1,
        active: true,
      });
    }
  }

  setupRainParticles() {
    const count = this.isMobile ? 220 : 700;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x99ccff,
      size: 0.18,
      transparent: true,
      opacity: 0.0, // Invisible until Wayanad or Monsoon power-up
    });

    this.rainParticles = new THREE.Points(geo, mat);
    this.scene.add(this.rainParticles);
  }

  handleGesture(gestureData) {
    if (!this.isRunning || this.isPaused) return;

    const { gesture, targetLane } = gestureData;

    // Direct lane control from body position
    if (targetLane !== undefined) {
      this.setTargetLane(targetLane);
    } else if (gesture === 'JUMP_LEFT' || gesture === 'LEAN_LEFT') {
      this.setTargetLane(-1);
    } else if (gesture === 'JUMP_RIGHT' || gesture === 'LEAN_RIGHT') {
      this.setTargetLane(1);
    } else if (gesture === 'NEUTRAL') {
      this.setTargetLane(0);
    }

    // Vertical triggers
    if (gesture === 'JUMP' || gesture === 'JUMP_LEFT' || gesture === 'JUMP_RIGHT') {
      this.jump();
    } else if (gesture === 'CROUCH') {
      this.crouch();
    } else if (gesture === 'NEUTRAL' || gesture === 'LEAN_LEFT' || gesture === 'LEAN_RIGHT') {
      // If player is running or standing upright, cancel crouch immediately!
      if (this.isCrouching) {
        this.isCrouching = false;
        this.crouchTimer = 0;
        this.playerGroup.scale.set(1.0, 1.0, 1.0);
      }
    } else if (gesture === 'POWER_UP') {
      if (!this.activePowerUp) {
        this.activatePowerUp('GAJA_POWER');
      }
    }
  }

  setTargetLane(lane) {
    const clamped = Math.max(-1, Math.min(1, lane));
    if (this.currentLane !== clamped) {
      const now = performance.now();
      if (this.lastLaneShiftTime && (now - this.lastLaneShiftTime) < 140) {
        return;
      }
      this.lastLaneShiftTime = now;
      this.currentLane = clamped;
      this.playerTargetX = this.currentLane * this.laneWidth;
      audioEngine.playLaneShiftSound();
    }
  }

  shiftLane(dir) {
    const newLane = this.currentLane + dir;
    this.setTargetLane(newLane);
  }

  /**
   * Critically Damped Smooth Spring Damper (C2 Continuous, Zero Glitch / Zero Jitter)
   */
  smoothDamp(current, target, velRef, smoothTime, maxSpeed, dt) {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2.0 / smoothTime;
    const x = omega * dt;
    const exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);
    let change = current - target;
    const maxChange = maxSpeed * smoothTime;
    change = Math.min(Math.max(change, -maxChange), maxChange);
    const fromTarget = current - change;
    const temp = (velRef.v + omega * change) * dt;
    velRef.v = (velRef.v - omega * temp) * exp;
    let output = fromTarget + (change + temp) * exp;
    if ((target - current > 0) === (output > target)) {
      output = target;
      velRef.v = 0;
    }
    return output;
  }

  jump() {
    if (this.isCrouching) {
      this.isCrouching = false;
      this.crouchTimer = 0;
      this.playerGroup.scale.set(1.0, 1.0, 1.0);
    }
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = 14.5;
      this.gravity = -30;
      audioEngine.playJumpSound();
      this.playRunnerAction('jump');
    }
  }

  crouch() {
    if (this.isJumping) {
      // Fast drop downward
      this.jumpVelocity = -22;
    }
    if (!this.isCrouching) {
      this.isCrouching = true;
      this.crouchTimer = 0.8; // seconds
      if (!this.animatedRunnerGroup) {
        this.playerGroup.scale.set(1.0, 0.45, 1.0); // Compress procedural model
      }
      audioEngine.playSlideSound();
      this.playRunnerAction('slide');
    }
  }

  onKeyDown = (e) => {
    if (!this.isRunning || this.isPaused) return;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.shiftLane(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.shiftLane(1);
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
      this.jump();
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.crouch();
    }
  };

  // --- Power-up System ---

  activatePowerUp(type) {
    this.activePowerUp = type;
    this.powerUpTimer = this.powerUpDuration;
    audioEngine.playPowerupSound();

    if (type === 'COCONUT_SHIELD') {
      this.hasShield = true;
      this.shieldMat.color.setHex(0x55ff55);
      this.shieldMat.opacity = 0.55;
    } else if (type === 'GAJA_POWER') {
      this.shieldMat.color.setHex(0xffaa00);
      this.shieldMat.opacity = 0.8;
    } else if (type === 'CHENDA_BOOST') {
      this.shieldMat.color.setHex(0x00f0ff);
      this.shieldMat.opacity = 0.7;
    }
  }

  // --- Main Game Loop ---

  warmup() {
    try {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.compile(this.scene, this.camera);
        this.renderer.render(this.scene, this.camera);
      }
    } catch (e) {
      console.warn('GPU warmup warning:', e);
    }
  }

  start() {
    if (this.isRunning && !this.isPaused) return;
    this.isRunning = true;
    this.isPaused = false;
    this.clock.start();
    audioEngine.startMusic();
    this.animate();
  }

  pause() {
    this.isPaused = true;
    audioEngine.stopMusic();
  }

  resume() {
    this.isPaused = false;
    this.clock.start();
    audioEngine.startMusic();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    audioEngine.stopMusic();
  }

  animate = () => {
    if (!this.isRunning || this.isPaused) return;

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, this.isMobile ? 0.045 : 0.075);
    this.update(delta);
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.animate);
  };

  update(delta) {
    // 1. Dynamic Progressive Infinite Run Speed Curve:
    // As the player covers more distance, speed increases smoothly and exhilaratingly!
    // Starts at 16.0 m/s -> reaches ~23 m/s at 500m, ~29 m/s at 1000m, ~37 m/s at 2000m, up to 45+ m/s
    const speedBoost = Math.sqrt(this.distance) * 0.32 + (this.distance / 150);
    let currentSpeed = this.baseSpeed + speedBoost;
    if (this.activePowerUp === 'CHENDA_BOOST') {
      currentSpeed *= 1.55;
    } else if (this.activePowerUp === 'MONSOON_MODE') {
      currentSpeed *= 0.75; // Cinematic slow motion
    }

    this.speed = currentSpeed;
    audioEngine.setSpeedMultiplier(Math.min(2.5, this.speed / this.baseSpeed));

    // Move Distance & Score
    const frameDistance = this.speed * delta;
    this.distance += frameDistance;
    const scoreMult = this.activePowerUp === 'MONSOON_MODE' ? 2 : 1;
    this.score += Math.floor(frameDistance * scoreMult);

    // 2. Power-up timer countdown
    if (this.activePowerUp) {
      this.powerUpTimer -= delta;
      if (this.powerUpTimer <= 0) {
        this.activePowerUp = null;
        if (!this.hasShield) {
          this.shieldMat.opacity = 0;
        }
      }
    }

    // 3. Dedicated Infinite Run in Alappuzha (seamless run with no map interruptions)

    // 4. Player Kinematics: Critically Damped Smooth Lateral Glide (Zero Glitch / Zero Jitter)
    this.playerX = this.smoothDamp(
      this.playerX,
      this.playerTargetX,
      this.playerVelX,
      0.15, // 150ms smooth transition time
      28.0, // max speed
      delta
    );
    this.playerGroup.position.x = this.playerX;

    // Fluid banking lean dynamically driven by actual lateral velocity
    const tiltAngle = -this.playerVelX.v * 0.024;
    this.playerGroup.rotation.z = tiltAngle;

    // 5. Jump Kinematics
    if (this.isJumping) {
      this.playerY += this.jumpVelocity * delta;
      this.jumpVelocity += this.gravity * delta;

      if (this.playerY <= 0) {
        this.playerY = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;
        if (!this.isCrouching) {
          this.playRunnerAction('run');
        }
      }
      this.playerGroup.position.y = this.playerY;
    }

    // 6. Crouch Kinematics
    if (this.isCrouching) {
      this.crouchTimer -= delta;
      if (this.crouchTimer <= 0) {
        this.isCrouching = false;
        this.playerGroup.scale.set(1.0, 1.0, 1.0); // Reset height
        if (!this.isJumping) {
          this.playRunnerAction('run');
        }
      }
    }

    // 7. Update 3D FBX Animation Mixer
    if (this.runnerMixer) {
      // Dynamic sync with player speed!
      const animSpeedMultiplier = Math.max(0.85, Math.min(2.5, this.speed / this.baseSpeed));
      this.runnerMixer.update(delta * animSpeedMultiplier);
    }

    // Procedural Limb Animation (active when animated FBX runner is loading or not available)
    if (!this.animatedRunnerGroup) {
      this.runAnimPhase += delta * this.speed * 0.95;
      const limbSwing = Math.sin(this.runAnimPhase) * 0.78;

      // Shoulder & Arm swings
      if (this.leftArmPivot) this.leftArmPivot.rotation.x = limbSwing;
      if (this.rightArmPivot) this.rightArmPivot.rotation.x = -limbSwing;

      // Hip & Thigh swings
      if (this.leftLegPivot) this.leftLegPivot.rotation.x = -limbSwing;
      if (this.rightLegPivot) this.rightLegPivot.rotation.x = limbSwing;

      // Dynamic Knee Flexion
      if (this.leftKneePivot) this.leftKneePivot.rotation.x = Math.max(0, limbSwing * 1.15);
      if (this.rightKneePivot) this.rightKneePivot.rotation.x = Math.max(0, -limbSwing * 1.15);

      // Torso counter-rotation
      if (this.torso) this.torso.rotation.y = -limbSwing * 0.12;

      // Vertical stride bounce and banking tilt
      const stepBounce = Math.abs(Math.sin(this.runAnimPhase * 2)) * 0.07;
      if (this.bodyRoot) this.bodyRoot.position.y = stepBounce;
    }
    this.playerGroup.rotation.z = (this.playerTargetX - this.playerX) * -0.22;

    // 7b. Dynamic Smashed Objects Physics (Gaja Power smash launch)
    for (let i = this.smashedObjects.length - 1; i >= 0; i--) {
      const item = this.smashedObjects[i];
      item.life -= delta;
      item.mesh.position.addScaledVector(item.velocity, delta);
      item.mesh.rotation.x += item.rotVel.x * delta;
      item.mesh.rotation.y += item.rotVel.y * delta;
      item.mesh.rotation.z += item.rotVel.z * delta;
      item.velocity.y -= 28 * delta; // Gravity arc
      if (item.life <= 0) {
        if (item.mesh.parent) item.mesh.parent.remove(item.mesh);
        this.smashedObjects.splice(i, 1);
      }
    }

    // 8. Move infinite 3D country road segments towards camera and wrap to infinity
    if (this.countryRoadInstances && this.countryRoadInstances.length > 0) {
      const totalRoadSpan = this.countryRoadLength * this.countryRoadInstances.length;
      this.countryRoadInstances.forEach((roadInst) => {
        roadInst.position.z += frameDistance;
        if (roadInst.position.z >= this.countryRoadLength) {
          roadInst.position.z -= totalRoadSpan;
        }
      });
    }

    // 8b. Track Recycling (Move track segments towards camera for obstacles & collectibles)
    const segTotal = this.numSegments * this.segmentLength;
    const roadWidth = this.laneWidth * 3 + 1.6;

    this.trackSegments.forEach((seg) => {
      seg.position.z += frameDistance;

      // When segment passes behind camera, loop to front!
      if (seg.position.z > this.segmentLength) {
        seg.position.z -= segTotal;
        this.segmentIndex = (this.segmentIndex || 0) + 1;
        seg.userData = seg.userData || {};
        seg.userData.segmentIndex = this.segmentIndex;
        seg.userData.hasJetty = (this.segmentIndex % 2 === 0);

        // Clean old segment children (obstacles, collectibles, scenery)
        for (let i = seg.children.length - 1; i >= 0; i--) {
          const child = seg.children[i];
          if (child.userData && child.userData.isTransient) {
            seg.remove(child);
          }
        }

        // Respawn side scenery (Coconut Palms & Tropical Trees)
        this.populateSegmentTrees(seg, roadWidth);

        // Respawn River Jetty on alternating segments
        if (seg.userData.hasJetty) {
          this.populateSegmentJetty(seg, roadWidth);
        }

        // Respawn 3D Fisher Boat in the river canal
        this.populateSegmentBoats(seg, roadWidth);

        // Respawn obstacles and collectibles
        this.spawnSegmentContent(seg, seg.position.z);
      }
    });

    // Prune inactive obstacles and collectibles to keep collision array compact
    this.obstacles = this.obstacles.filter((o) => o.active);
    this.collectibles = this.collectibles.filter((c) => c.active);

    // 9. Collectible Animations & Magnet Collision
    this.collectibles.forEach((item) => {
      if (!item.active) return;

      // Floating spin
      item.mesh.rotation.y += delta * 3.0;

      // World coordinates
      const worldPos = new THREE.Vector3();
      item.mesh.getWorldPosition(worldPos);

      // Distance to player
      const dist = worldPos.distanceTo(this.playerGroup.position);
      if (dist < 1.4) {
        // Collect!
        item.active = false;
        item.mesh.visible = false;

        if (item.type === 'COCONUT') {
          this.coconuts += 1;
          audioEngine.playCoinSound();
          if (this.onCoinCollect) this.onCoinCollect(this.coconuts);
        } else if (item.type === 'COIN') {
          this.coins += 1;
          audioEngine.playCoinSound();
          if (this.onCoinCollect) this.onCoinCollect(this.coins);
        } else if (item.type === 'POWER_UP') {
          this.activatePowerUp(item.powerUpType);
        }
      }
    });

    // 9b. River Boat Physics: Gentle Kerala Backwater Wave Bobbing
    const time = this.clock.getElapsedTime();
    this.trackSegments.forEach((seg) => {
      seg.children.forEach((child) => {
        if (child.userData && child.userData.isRiverBoat) {
          const seed = child.userData.seed || 0;
          child.position.y = (child.userData.baseY || -0.25) + Math.sin(time * 1.8 + seed) * 0.04;
          child.rotation.z = Math.sin(time * 1.4 + seed) * 0.02;
        }
      });
    });

    // 10. Obstacle Collision Detection with accurate 3D model hitboxes
    this.obstacles.forEach((obs) => {
      if (!obs.active) return;

      const worldPos = new THREE.Vector3();
      obs.mesh.getWorldPosition(worldPos);

      const zDiff = Math.abs(worldPos.z - this.playerGroup.position.z);
      const xDiff = Math.abs(worldPos.x - this.playerGroup.position.x);

      // Model-specific collision ranges
      const isWagonR = obs.obstacleCategory === 'WAGONR';
      const isBlindVan = obs.obstacleCategory === 'BLINDVAN';
      const isAuto = obs.obstacleCategory === 'AUTORICKSHAW';
      const zHitRange = isWagonR ? 2.0 : (isBlindVan ? 1.6 : 1.4);

      if (zDiff < zHitRange) {
        let collides = false;

        if (isWagonR) {
          // Suzuki Wagon R occupies lane: must steer/lean away
          if (xDiff < 1.35) {
            collides = true;
          }
        } else if (isBlindVan) {
          // Suzuki Carry Blind Van occupies lane: must steer/lean away
          if (xDiff < 1.25) {
            collides = true;
          }
        } else if (isAuto) {
          // Auto-rickshaw occupies lane
          if (xDiff < 1.25) {
            collides = true;
          }
        } else if (obs.type === 'LOW') {
          // Low obstacle (jump over): collides if player is NOT jumping high enough
          if (this.playerY < 1.1) {
            collides = true;
          }
        } else if (obs.type === 'HIGH') {
          // High bridge (slide under): collides if player is NOT crouching
          if (!this.isCrouching) {
            collides = true;
          }
        } else if (obs.type === 'FULL_LANE') {
          // Full lane blocker: collides if in same lane
          if (xDiff < 1.2) {
            collides = true;
          }
        }

        if (collides) {
          obs.active = false;
          this.handleCollision(obs);
        }
      }
    });

    // 11. Rain Particles Animation (Active in Wayanad or Monsoon mode)
    const isRaining = this.currentLocation.id === 'WAYANAD' || this.activePowerUp === 'MONSOON_MODE';
    this.rainParticles.material.opacity = isRaining ? 0.75 : 0.0;
    if (isRaining) {
      const positions = this.rainParticles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 32;
        if (positions[i] < 0) positions[i] = 25;
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 12. Camera Follow: Smooth Cinematic Lerp
    this.camera.position.x = this.playerX * 0.35;
    this.camera.position.y = 3.6 + this.playerY * 0.3;
    this.camera.lookAt(this.playerX * 0.6, 1.4 + this.playerY * 0.5, -12);

    // 13. Notify React HUD
    if (this.callbacks.onHUDUpdate) {
      this.callbacks.onHUDUpdate({
        score: this.score,
        distance: Math.floor(this.distance),
        km: (this.distance / 1000).toFixed(2),
        coins: this.coins,
        coconuts: this.coconuts,
        hearts: this.hearts,
        location: this.currentLocation,
        activePowerUp: this.activePowerUp,
        powerUpRemaining: Math.ceil(this.powerUpTimer),
      });
    }
  }

  handleCollision(obs) {
    if (this.activePowerUp === 'GAJA_POWER') {
      // Gaja Power smashes obstacles with dynamic physics launch!
      audioEngine.playCrashSound();
      this.score += 250;
      if (obs.mesh) {
        const velX = (Math.random() - 0.5) * 16;
        this.smashedObjects.push({
          mesh: obs.mesh,
          velocity: new THREE.Vector3(velX, 15, 18),
          rotVel: new THREE.Vector3(Math.random() * 8, Math.random() * 10, Math.random() * 8),
          life: 1.5,
        });
      }
      return;
    }

    if (this.hasShield) {
      // Coconut shield breaks, absorbs damage!
      this.hasShield = false;
      this.shieldMat.opacity = 0;
      audioEngine.playCrashSound();
      return;
    }

    // Take damage
    this.hearts -= 1;
    audioEngine.playCrashSound();

    if (this.hearts <= 0) {
      this.stop();
      if (this.callbacks.onGameOver) {
        this.callbacks.onGameOver({
          score: this.score,
          distance: Math.floor(this.distance),
          km: (this.distance / 1000).toFixed(2),
          coins: this.coins,
          coconuts: this.coconuts,
          location: this.currentLocation.name,
        });
      }
    }
  }

  transitionLocation(newIndex) {
    this.currentLocationIndex = newIndex;
    const key = this.locationKeys[newIndex];
    this.currentLocation = LOCATIONS[key];
    audioEngine.setLocation(key);

    // Update scene lighting and fog
    this.scene.background.setHex(this.currentLocation.skyColor);
    this.scene.fog.color.setHex(this.currentLocation.fogColor);
    this.scene.fog.near = this.currentLocation.fogNear;
    this.scene.fog.far = this.currentLocation.fogFar;

    // Trigger Tourism Discovery
    if (!this.discoveredLocations.has(key)) {
      this.discoveredLocations.add(key);
      if (this.callbacks.onLocationDiscovered) {
        this.callbacks.onLocationDiscovered(this.currentLocation);
      }
    }
  }

  onWindowResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  setupTouchControls() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;

    this.onTouchStart = (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = performance.now();
    };

    this.onTouchMove = (e) => {
      // Prevent browser default pull-to-refresh while playing
      if (this.isRunning && !this.isPaused && e.cancelable) {
        e.preventDefault();
      }
    };

    this.onTouchEnd = (e) => {
      if (!this.isRunning || this.isPaused || !e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - this.touchStartX;
      const dy = touch.clientY - this.touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const dt = performance.now() - this.touchStartTime;

      if (absDx > 28 || absDy > 28) {
        if (absDx > absDy) {
          if (dx < 0) {
            this.shiftLane(-1); // Swipe Left
          } else {
            this.shiftLane(1);  // Swipe Right
          }
        } else {
          if (dy < 0) {
            this.jump();   // Swipe Up
          } else {
            this.crouch(); // Swipe Down
          }
        }
      } else if (dt < 280) {
        // Tap steering: tap left half or right half
        const screenWidth = window.innerWidth;
        if (touch.clientY < window.innerHeight * 0.32) {
          this.jump();
        } else if (touch.clientX < screenWidth * 0.42) {
          this.shiftLane(-1);
        } else if (touch.clientX > screenWidth * 0.58) {
          this.shiftLane(1);
        }
      }
    };

    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('keydown', this.onKeyDown);
    if (this.onTouchStart) {
      window.removeEventListener('touchstart', this.onTouchStart);
      window.removeEventListener('touchmove', this.onTouchMove);
      window.removeEventListener('touchend', this.onTouchEnd);
    }
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
