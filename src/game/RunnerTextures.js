/**
 * RunnerTextures.js
 * Generates ultra-high-resolution procedural PBR textures for the Kerala Runner:
 * - Realistic warm Kerala skin tone with anatomical muscle shading & pores
 * - Crisp woven Kasavu ivory shirt with golden button placket
 * - Traditional handloom Mundu with authentic Kasavu Gold Zari Kara border
 * - Regal golden Angavastram brocade sash with woven diamond motifs
 * - Pro athletic runner sneakers with breathable mesh & gold racing swoosh
 * - Natural hair strand texture & temple-trimmed headband
 */

import * as THREE from 'three';

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * 1. Warm Human Skin Texture with Anatomical Shading & Micro-grain
 */
export function createSkinTexture() {
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  // Base warm Kerala golden-tan tone
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, '#a8744d'); // Highlight tone
  grad.addColorStop(0.3, '#9c6846'); // Mid-tone
  grad.addColorStop(0.7, '#8b5936'); // Shadow tone
  grad.addColorStop(1.0, '#7c4c2c'); // Deep contour
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle muscle tone contouring (deltoid and spinal shading)
  const contourGrad = ctx.createRadialGradient(256, 200, 30, 256, 200, 220);
  contourGrad.addColorStop(0, 'rgba(200, 145, 100, 0.25)'); // Highlight
  contourGrad.addColorStop(0.6, 'rgba(130, 80, 50, 0.0)');
  contourGrad.addColorStop(1.0, 'rgba(90, 50, 30, 0.22)'); // Edge shadow
  ctx.fillStyle = contourGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle spinal groove down center
  ctx.strokeStyle = 'rgba(80, 45, 25, 0.15)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(256, 40);
  ctx.lineTo(256, 480);
  ctx.stroke();

  // Natural epidermal micro-noise to eliminate flat plastic look
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 10;
    d[i] = Math.min(255, Math.max(0, d[i] + noise));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise * 0.9));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise * 0.7));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 2. Woven Kerala Kasavu Shirt Fabric with Golden Placket & Buttons
 */
export function createShirtTexture() {
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  // Crisp handloom Kerala ivory cotton
  ctx.fillStyle = '#faf7ee';
  ctx.fillRect(0, 0, 512, 512);

  // Fine handloom cotton cross-weave pattern
  ctx.strokeStyle = 'rgba(215, 205, 185, 0.22)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 512; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  for (let x = 0; x < 512; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Dual Golden Zari Kasavu stripes running vertically
  const goldStripeGrad = ctx.createLinearGradient(0, 0, 512, 0);
  goldStripeGrad.addColorStop(0.42, 'rgba(212, 175, 55, 0)');
  goldStripeGrad.addColorStop(0.45, '#ffd700');
  goldStripeGrad.addColorStop(0.48, '#fff3a8');
  goldStripeGrad.addColorStop(0.50, '#d4af37');
  goldStripeGrad.addColorStop(0.52, '#fff3a8');
  goldStripeGrad.addColorStop(0.55, '#ffd700');
  goldStripeGrad.addColorStop(0.58, 'rgba(212, 175, 55, 0)');
  ctx.fillStyle = goldStripeGrad;
  ctx.fillRect(215, 0, 82, 512);

  // Center button placket line
  ctx.strokeStyle = '#c49a20';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.stroke();

  // Golden shirt buttons spaced down the placket
  for (let y = 60; y < 500; y += 80) {
    // Button rim
    ctx.fillStyle = '#b8860b';
    ctx.beginPath();
    ctx.arc(256, y, 6.5, 0, Math.PI * 2);
    ctx.fill();
    // Shiny gold button center
    ctx.fillStyle = '#ffea75';
    ctx.beginPath();
    ctx.arc(255, y - 1, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 3. Traditional Kerala Mundu (Dhoti) with Authentic Kasavu Zari Kara Border
 */
export function createMunduTexture() {
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  // Traditional natural off-white Mundu fabric
  ctx.fillStyle = '#f5f2e6';
  ctx.fillRect(0, 0, 512, 512);

  // Woven handloom texture
  ctx.strokeStyle = 'rgba(210, 200, 180, 0.18)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 512; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Vertical cloth pleat fold shadows (Kosuvalu)
  for (let x = 40; x < 500; x += 60) {
    const pleat = ctx.createLinearGradient(x - 15, 0, x + 15, 0);
    pleat.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
    pleat.addColorStop(0.5, 'rgba(60, 45, 30, 0.12)');
    pleat.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
    ctx.fillStyle = pleat;
    ctx.fillRect(x - 15, 0, 30, 440);
  }

  // --- Grand Kerala Kasavu Zari Border (Kara) at Hemline (Bottom 75px) ---
  const zariY = 437;
  const zariHeight = 75;

  // Thin red temple piping line atop the gold border
  ctx.fillStyle = '#b32400';
  ctx.fillRect(0, zariY - 4, 512, 4);

  // Metallic gold base
  const goldGrad = ctx.createLinearGradient(0, zariY, 0, 512);
  goldGrad.addColorStop(0, '#ffd700');
  goldGrad.addColorStop(0.3, '#fff49e');
  goldGrad.addColorStop(0.7, '#d4af37');
  goldGrad.addColorStop(1.0, '#b8860b');
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, zariY, 512, zariHeight);

  // Traditional Kerala Diamond Chevron motifs (Puliyilakkara)
  ctx.strokeStyle = '#8a6500';
  ctx.lineWidth = 2.5;
  for (let x = 0; x < 512; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, zariY + 12);
    ctx.lineTo(x + 12, zariY + 36);
    ctx.lineTo(x + 24, zariY + 12);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, zariY + 60);
    ctx.lineTo(x + 12, zariY + 36);
    ctx.lineTo(x + 24, zariY + 60);
    ctx.stroke();
  }

  // Bottom gold fringe accent
  ctx.fillStyle = '#e8c045';
  ctx.fillRect(0, 508, 512, 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * 4. Regal Golden Kasavu Angavastram (Shoulder Sash) Brocade
 */
export function createSashTexture() {
  const canvas = createCanvas(256, 512);
  const ctx = canvas.getContext('2d');

  // Rich metallic gold base
  const bg = ctx.createLinearGradient(0, 0, 256, 0);
  bg.addColorStop(0, '#d4af37');
  bg.addColorStop(0.5, '#ffe566');
  bg.addColorStop(1, '#b8860b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 512);

  // Intricate woven zari diamond pattern
  ctx.strokeStyle = 'rgba(120, 80, 0, 0.45)';
  ctx.lineWidth = 2;
  const step = 20;
  for (let x = -256; x < 512; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 512, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 512, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Border piping in royal emerald green & gold
  ctx.fillStyle = '#0a4d2e';
  ctx.fillRect(0, 0, 8, 512);
  ctx.fillRect(248, 0, 8, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 5. Elite Athletic Running Shoes with Breathable Mesh & Gold Racing Swoosh
 */
export function createShoeTexture() {
  const canvas = createCanvas(512, 256);
  const ctx = canvas.getContext('2d');

  // White athletic performance mesh upper
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, 512, 256);

  // Breathable micro-mesh honeycomb grid
  ctx.strokeStyle = 'rgba(200, 205, 210, 0.4)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 512; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 180);
    ctx.stroke();
  }

  // Metallic Gold Lightning / Racing Swoosh on flanks
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(60, 110);
  ctx.lineTo(340, 60);
  ctx.lineTo(300, 95);
  ctx.lineTo(460, 45);
  ctx.lineTo(240, 135);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dual-density molded midsole foam (silver-grey aerodynamic stripe)
  ctx.fillStyle = '#212529';
  ctx.fillRect(0, 180, 512, 76);

  ctx.fillStyle = '#d4af37';
  ctx.fillRect(0, 180, 512, 6);

  // Outsole rubber traction tread grooves
  ctx.fillStyle = '#111315';
  for (let x = 15; x < 500; x += 28) {
    ctx.fillRect(x, 210, 18, 46);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 6. Natural Hair Strand Texture
 */
export function createHairTexture() {
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#161210';
  ctx.fillRect(0, 0, 256, 256);

  // Directional hair strand highlights
  ctx.strokeStyle = 'rgba(70, 55, 45, 0.35)';
  ctx.lineWidth = 1.5;
  for (let y = 0; y < 256; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y + (Math.random() - 0.5) * 6);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 7. Master PBR Material Factory for Kerala Runner
 */
export function createRunnerMaterials() {
  const skinTex = createSkinTexture();
  const shirtTex = createShirtTexture();
  const munduTex = createMunduTexture();
  const sashTex = createSashTexture();
  const shoeTex = createShoeTexture();
  const hairTex = createHairTexture();

  // Premium PBR Materials with tailored roughness and metalness
  const skinMat = new THREE.MeshStandardMaterial({
    map: skinTex,
    roughness: 0.62,
    metalness: 0.04,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    map: shirtTex,
    roughness: 0.68,
    metalness: 0.18,
  });

  const munduMat = new THREE.MeshStandardMaterial({
    map: munduTex,
    roughness: 0.65,
    metalness: 0.22,
  });

  const goldZariMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.88,
    roughness: 0.22,
  });

  const sashMat = new THREE.MeshStandardMaterial({
    map: sashTex,
    roughness: 0.35,
    metalness: 0.72,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    map: hairTex,
    roughness: 0.85,
    metalness: 0.05,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    map: shoeTex,
    roughness: 0.52,
    metalness: 0.15,
  });

  const soleMat = new THREE.MeshStandardMaterial({
    color: 0x181818,
    roughness: 0.88,
    metalness: 0.05,
  });

  const bandMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.28,
    metalness: 0.82,
  });

  return {
    skinMat,
    shirtMat,
    munduMat,
    goldZariMat,
    sashMat,
    hairMat,
    shoeMat,
    soleMat,
    bandMat,
  };
}
