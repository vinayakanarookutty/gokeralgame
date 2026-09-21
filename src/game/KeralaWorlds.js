/**
 * KeralaWorlds.js
 * Procedural 3D models and environments for GoKerala: Gesture Run
 * Featuring authentic Kerala architecture, vegetation, houseboats,
 * temple elephants, and dynamic visual themes.
 */

import * as THREE from 'three';

export const LOCATIONS = {
  ALAPPUZHA: {
    id: 'ALAPPUZHA',
    name: 'Alappuzha Backwaters',
    subtitle: 'Venice of the East (Active Infinite Run)',
    skyColor: 0x76c5f0,
    fogColor: 0xa1dbf5,
    fogNear: 25,
    fogFar: 90,
    groundColor: 0x1f4722, // Lush palm riverbank
    roadColor: 0xd6b586,   // Village pathway / sand
    waterColor: 0x1a738c,
    description: 'Run alongside serene backwaters, houseboats, and coconut groves in an endless sprint.',
    fact: 'Alappuzha backwaters connect over 900 km of interconnected canals, rivers, and lakes.',
  },
  KOCHI: {
    id: 'KOCHI',
    name: 'Fort Kochi Coast',
    subtitle: 'Queen of the Arabian Sea (Next Map - Coming Soon)',
    skyColor: 0x5ba8d1,
    fogColor: 0x8ec8e3,
    fogNear: 25,
    fogFar: 95,
    groundColor: 0xd4a76a,
    roadColor: 0x6e6359,
    waterColor: 0x145a75,
    description: 'Historic Fort Kochi coastline with giant Chinese fishing nets and colonial streets.',
    fact: 'Kochi has been a bustling spice trade hub for over 600 years, connecting India with Arabia and Europe.',
  },
  MUNNAR: {
    id: 'MUNNAR',
    name: 'Munnar Tea Hills',
    subtitle: 'High Ranges of the Western Ghats',
    skyColor: 0x8fd3e8,
    fogColor: 0xcee5df,
    fogNear: 15,
    fogFar: 75,
    groundColor: 0x2d6e32, // Vibrant tea plantation green
    roadColor: 0x7a6d59,   // Winding estate asphalt
    waterColor: 0x3d8272,
    description: 'Race through rolling emerald tea gardens and mist-shrouded peaks.',
    fact: 'Munnar sits at 1,600m altitude and produces some of the world\'s finest orthodox teas.',
  },
  THRISSUR: {
    id: 'THRISSUR',
    name: 'Thrissur Pooram',
    subtitle: 'Festival of Festivals',
    skyColor: 0x221338,   // Evening festival twilight
    fogColor: 0x3d2047,
    fogNear: 20,
    fogFar: 85,
    groundColor: 0x542617, // Temple courtyard earth
    roadColor: 0xa3532f,   // Festive pathway
    waterColor: 0x472338,
    description: 'Chenda rhythms surge as majestic elephants and fireworks light up the night.',
    fact: 'Thrissur Pooram has been celebrated for over 200 years at the Vadakkunnathan Temple.',
  },
  WAYANAD: {
    id: 'WAYANAD',
    name: 'Wayanad Rainforest',
    subtitle: 'Monsoon Wilderness',
    skyColor: 0x3c5450,
    fogColor: 0x4a635e,
    fogNear: 10,
    fogFar: 60,
    groundColor: 0x0f2b15, // Dense rainforest moss
    roadColor: 0x4a3c2c,   // Wet mud and timber bridge
    waterColor: 0x234d3d,
    description: 'Monsoon rain pounds through dense canopy and wooden mountain bridges.',
    fact: 'Wayanad houses the prehistoric Edakkal Caves with petroglyphs dating back 6000 BCE.',
  },
  KOVALAM: {
    id: 'KOVALAM',
    name: 'Kovalam & Varkala Cliffs',
    subtitle: 'Arabian Sea Coastline',
    skyColor: 0xff7b42,   // Golden sunset orange
    fogColor: 0xffa066,
    fogNear: 30,
    fogFar: 100,
    groundColor: 0xcc8540, // Red laterite cliffs
    roadColor: 0xf5d99b,   // Golden sandy coastal path
    waterColor: 0x166687,  // Arabian sea deep turquoise
    description: 'Coastal breeze and crashing ocean waves along iconic red seaside cliffs.',
    fact: 'The red laterite cliffs of Varkala are a unique geological monument along the Arabian Sea.',
  },
};

export class KeralaWorldBuilder {
  constructor() {
    this.materials = this.initMaterials();
  }

  initMaterials() {
    return {
      coconutBark: new THREE.MeshLambertMaterial({ color: 0x5c4033 }),
      coconutLeaf: new THREE.MeshLambertMaterial({ color: 0x2e6f2e, side: THREE.DoubleSide }),
      kettuvallamThatch: new THREE.MeshLambertMaterial({ color: 0xb58b4c }),
      kettuvallamWood: new THREE.MeshLambertMaterial({ color: 0x42260f }),
      kasavuWhite: new THREE.MeshLambertMaterial({ color: 0xfffcf2 }),
      kasavuGold: new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.85,
        roughness: 0.25,
      }),
      elephantSkin: new THREE.MeshLambertMaterial({ color: 0x3d3a37 }),
      nettipattamGold: new THREE.MeshStandardMaterial({
        color: 0xffcc00,
        metalness: 0.9,
        roughness: 0.2,
      }),
      pooramRed: new THREE.MeshLambertMaterial({ color: 0xb81414 }),
      teaBush: new THREE.MeshLambertMaterial({ color: 0x247a38 }),
      water: new THREE.MeshStandardMaterial({
        color: 0x1a829e,
        roughness: 0.1,
        metalness: 0.4,
        transparent: true,
        opacity: 0.88,
      }),
      autoYellow: new THREE.MeshLambertMaterial({ color: 0xffb703 }),
      autoBlack: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
      woodenFence: new THREE.MeshLambertMaterial({ color: 0x6e4e37 }),
    };
  }

  /**
   * Creates an iconic Kerala Coconut Palm tree with curved trunk and drooping fronds
   */
  createCoconutTree() {
    const group = new THREE.Group();

    // Curved palm trunk using spline curve
    const curvePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.4, 2.5, 0.2),
      new THREE.Vector3(1.0, 5.0, 0.4),
      new THREE.Vector3(1.2, 7.5, 0.6),
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const trunkGeo = new THREE.TubeGeometry(curve, 16, 0.26, 8, false);
    const trunkMesh = new THREE.Mesh(trunkGeo, this.materials.coconutBark);
    trunkMesh.castShadow = true;
    group.add(trunkMesh);

    // Crown of coconuts
    const topPos = new THREE.Vector3(1.2, 7.5, 0.6);
    const coconutGeo = new THREE.SphereGeometry(0.24, 6, 6);
    const greenNutMat = new THREE.MeshLambertMaterial({ color: 0x4a7a28 });
    for (let c = 0; c < 5; c++) {
      const nut = new THREE.Mesh(coconutGeo, greenNutMat);
      const angle = (c / 5) * Math.PI * 2;
      nut.position.set(topPos.x + Math.cos(angle) * 0.25, topPos.y - 0.2, topPos.z + Math.sin(angle) * 0.25);
      group.add(nut);
    }

    // Drooping Palm Fronds
    const frondGeo = new THREE.ConeGeometry(0.8, 3.2, 5);
    frondGeo.translate(0, 1.6, 0);

    for (let f = 0; f < 8; f++) {
      const frond = new THREE.Mesh(frondGeo, this.materials.coconutLeaf);
      frond.position.copy(topPos);
      const angle = (f / 8) * Math.PI * 2;
      frond.rotation.y = angle;
      frond.rotation.z = 1.1; // Droop angle
      group.add(frond);
    }

    return group;
  }

  /**
   * Creates a Kerala Kettuvallam (Traditional Houseboat)
   */
  createHouseboat() {
    const group = new THREE.Group();

    // Wooden boat hull
    const hullGeo = new THREE.BoxGeometry(2.0, 0.9, 6.5);
    const hullMesh = new THREE.Mesh(hullGeo, this.materials.kettuvallamWood);
    hullMesh.position.y = 0.45;
    group.add(hullMesh);

    // Curved arched thatched roof (bamboo & coir)
    const roofGeo = new THREE.CylinderGeometry(1.15, 1.15, 5.0, 12, 1, false, 0, Math.PI);
    const roofMesh = new THREE.Mesh(roofGeo, this.materials.kettuvallamThatch);
    roofMesh.rotation.z = Math.PI / 2;
    roofMesh.rotation.y = Math.PI / 2;
    roofMesh.position.set(0, 1.35, 0);
    group.add(roofMesh);

    // Front lantern
    const lanternGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 6);
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffd277 });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.set(0, 1.2, 3.1);
    group.add(lantern);

    return group;
  }

  /**
   * Creates a decorated Thrissur Pooram Elephant with golden Nettipattam
   */
  createTempleElephant() {
    const group = new THREE.Group();

    // Massive Body
    const bodyGeo = new THREE.BoxGeometry(2.2, 2.6, 3.8);
    const body = new THREE.Mesh(bodyGeo, this.materials.elephantSkin);
    body.position.y = 2.6;
    group.add(body);

    // Sturdy Legs
    const legGeo = new THREE.CylinderGeometry(0.42, 0.46, 2.0, 8);
    const legPositions = [
      [-0.8, 1.0, 1.2],
      [0.8, 1.0, 1.2],
      [-0.8, 1.0, -1.2],
      [0.8, 1.0, -1.2],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, this.materials.elephantSkin);
      leg.position.set(x, y, z);
      group.add(leg);
    });

    // Elephant Head
    const headGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const head = new THREE.Mesh(headGeo, this.materials.elephantSkin);
    head.position.set(0, 3.4, 2.3);
    group.add(head);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.24, 0.14, 2.2, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.elephantSkin);
    trunk.position.set(0, 2.4, 3.0);
    trunk.rotation.x = -0.3;
    group.add(trunk);

    // Majestic Golden Nettipattam (Forehead Ornament)
    const nettiGeo = new THREE.PlaneGeometry(1.3, 1.4);
    const netti = new THREE.Mesh(nettiGeo, this.materials.nettipattamGold);
    netti.position.set(0, 3.5, 3.12);
    group.add(netti);

    // Festive Parasol (Muthukkuda) on back
    const umbrellaGeo = new THREE.ConeGeometry(1.5, 0.6, 10);
    const umbrella = new THREE.Mesh(umbrellaGeo, this.materials.pooramRed);
    umbrella.position.set(0, 4.7, 0);
    group.add(umbrella);

    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2);
    const pole = new THREE.Mesh(poleGeo, this.materials.kasavuGold);
    pole.position.set(0, 4.1, 0);
    group.add(pole);

    return group;
  }

  /**
   * Creates an iconic Kerala Auto-Rickshaw (Tuk-tuk) obstacle
   */
  createAutoRickshaw() {
    const group = new THREE.Group();

    // Body cabin (Yellow & Black)
    const lowerBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.8, 2.6),
      this.materials.autoBlack
    );
    lowerBody.position.y = 0.6;
    group.add(lowerBody);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.9, 2.2),
      this.materials.autoYellow
    );
    roof.position.set(0, 1.45, -0.2);
    group.add(roof);

    // Windshield frame
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.7),
      new THREE.MeshBasicMaterial({ color: 0xa5d8ff, transparent: true, opacity: 0.6 })
    );
    glass.position.set(0, 1.35, 0.92);
    group.add(glass);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    const wFront = new THREE.Mesh(wheelGeo, this.materials.autoBlack);
    wFront.position.set(0, 0.3, 1.0);
    group.add(wFront);

    const wRearL = new THREE.Mesh(wheelGeo, this.materials.autoBlack);
    wRearL.position.set(-0.85, 0.3, -0.8);
    const wRearR = new THREE.Mesh(wheelGeo, this.materials.autoBlack);
    wRearR.position.set(0.85, 0.3, -0.8);
    group.add(wRearL, wRearR);

    return group;
  }

  /**
   * Creates a fallen coconut tree log obstacle (requires jumping over)
   */
  createFallenLogObstacle() {
    const group = new THREE.Group();
    const logGeo = new THREE.CylinderGeometry(0.38, 0.38, 5.0, 10);
    logGeo.rotateZ(Math.PI / 2);
    const log = new THREE.Mesh(logGeo, this.materials.coconutBark);
    log.position.y = 0.38;
    log.castShadow = true;
    group.add(log);

    // Coconut fronds on the sides
    const leafGeo = new THREE.ConeGeometry(0.4, 1.8, 4);
    const leaf1 = new THREE.Mesh(leafGeo, this.materials.coconutLeaf);
    leaf1.position.set(-2.4, 0.4, 0);
    leaf1.rotation.z = -1.2;
    group.add(leaf1);

    return group;
  }

  /**
   * Creates high wooden village bridge hurdle (requires crouch / sliding under)
   */
  createOverheadBridgeObstacle() {
    const group = new THREE.Group();

    // Side pillars
    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 3.2, 8);
    const leftPillar = new THREE.Mesh(pillarGeo, this.materials.woodenFence);
    leftPillar.position.set(-2.8, 1.6, 0);
    const rightPillar = new THREE.Mesh(pillarGeo, this.materials.woodenFence);
    rightPillar.position.set(2.8, 1.6, 0);
    group.add(leftPillar, rightPillar);

    // Cross beam low enough to require crouch/slide
    const beamGeo = new THREE.BoxGeometry(6.0, 0.4, 0.6);
    const beam = new THREE.Mesh(beamGeo, this.materials.woodenFence);
    beam.position.set(0, 1.55, 0); // Player height is ~1.8, ducking clears 1.0!
    group.add(beam);

    // Signboard banner: "KERALA VILLAGE WAY"
    const signGeo = new THREE.BoxGeometry(2.8, 0.6, 0.1);
    const sign = new THREE.Mesh(
      signGeo,
      new THREE.MeshLambertMaterial({ color: 0x8a3324 })
    );
    sign.position.set(0, 2.0, 0);
    group.add(sign);

    return group;
  }

  /**
   * Collectible: Golden Kasavu Coin
   */
  createKasavuCoin() {
    const group = new THREE.Group();
    const coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16);
    coinGeo.rotateX(Math.PI / 2);
    const coin = new THREE.Mesh(coinGeo, this.materials.kasavuGold);
    group.add(coin);

    // Center jewel / emblem
    const emblemGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const emblem = new THREE.Mesh(emblemGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    emblem.scale.z = 0.3;
    group.add(emblem);

    return group;
  }

  /**
   * Collectible: Green Tender Coconut
   */
  createCoconutCollectible() {
    const group = new THREE.Group();
    const nutGeo = new THREE.SphereGeometry(0.4, 10, 10);
    nutGeo.scale(1, 1.2, 1);
    const nut = new THREE.Mesh(nutGeo, new THREE.MeshLambertMaterial({ color: 0x479424 }));
    group.add(nut);

    // Small straw
    const strawGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6);
    const straw = new THREE.Mesh(strawGeo, new THREE.MeshBasicMaterial({ color: 0xffd166 }));
    straw.position.set(0.15, 0.4, 0);
    straw.rotation.z = 0.3;
    group.add(straw);

    return group;
  }

  /**
   * Collectible: Kathakali Mask
   */
  createKathakaliMask() {
    const group = new THREE.Group();
    // Green face (Paccha)
    const faceGeo = new THREE.BoxGeometry(0.6, 0.8, 0.2);
    const face = new THREE.Mesh(
      faceGeo,
      new THREE.MeshLambertMaterial({ color: 0x06d6a0 })
    );
    group.add(face);

    // Elaborate Kireedam (Crown)
    const crownGeo = new THREE.CylinderGeometry(0.6, 0.2, 0.7, 8);
    const crown = new THREE.Mesh(crownGeo, this.materials.kasavuGold);
    crown.position.y = 0.65;
    group.add(crown);

    // White beard border (Chutti)
    const chuttiGeo = new THREE.TorusGeometry(0.38, 0.08, 6, 12, Math.PI);
    chuttiGeo.rotateZ(Math.PI);
    const chutti = new THREE.Mesh(
      chuttiGeo,
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    chutti.position.set(0, -0.25, 0.12);
    group.add(chutti);

    return group;
  }

  /**
   * Power-up: Gaja Power (Elephant Statue), Chenda Boost, Coconut Shield
   */
  createPowerUp(type) {
    const group = new THREE.Group();
    group.userData = { powerUpType: type };

    let color = 0xffd700;
    if (type === 'CHENDA_BOOST') color = 0x00f0ff;
    if (type === 'COCONUT_SHIELD') color = 0x55ff55;
    if (type === 'GAJA_POWER') color = 0xffa500;
    if (type === 'MONSOON_MODE') color = 0x3a86ff;

    // Glowing aura ring
    const ringGeo = new THREE.TorusGeometry(0.6, 0.08, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      metalness: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // Inner icon sphere
    const sphereGeo = new THREE.IcosahedronGeometry(0.35, 1);
    const sphere = new THREE.Mesh(sphereGeo, ringMat);
    group.add(sphere);

    return group;
  }
}
