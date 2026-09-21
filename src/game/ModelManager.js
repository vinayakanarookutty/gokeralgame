/**
 * ModelManager.js
 * Centralized High-Efficiency 3D Asset Loader and Object Pool for GoKerala
 * 
 * Preloads, caches, and efficiently clones 3D models with shared GPU textures and geometries:
 * - Long Infinite Country Road Running Environment (country_road.glb)
 * - 2013 Suzuki Wagon R Car Obstacle (2013_suzuki_wagonr.glb)
 * - Suzuki Carry Blind Van Obstacle (suzuki_carry_blind_van.glb)
 * - 3D Auto-rickshaw / TukTuk Obstacle (low_poly_autorickshaw_aka_tuktuk.glb)
 * - Authentic 3D Tender Coconut Collectible (day_252_tender_coconut.glb)
 * - Authentic 3D Kerala Coconut Palm Tree (coconut_palm.glb)
 * - Authentic 3D Low Poly Tropical Tree (trees_low_poly.glb)
 * - Authentic 3D Kerala River Jetty & Boatyard (river_jetty_and_boatyard.glb)
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const ASSET_NAMES = {
  countryRoad: '3D Country Highway Roadway',
  coconut: '3D Tender Coconuts & Items',
  autorickshaw: '3D Kerala Auto-rickshaws (TukTuk)',
  coconutPalm: '3D Coconut Palm Tree Canopies',
  wagonr: '3D Suzuki Wagon R Vehicles',
  fisherBoat: '3D Backwater Fisher Boats',
  tree: '3D Tropical Rain Trees',
  riverJetty: '3D River Jetty & Boatyard',
  blindvan: '3D Suzuki Carry Commercial Vans',
};

export class ModelManager {
  constructor() {
    this.loader = new GLTFLoader();
    this.templates = {};
    this.loadingStatus = {
      wagonr: false,
      blindvan: false,
      autorickshaw: false,
      countryRoad: false,
      coconut: false,
      coconutPalm: false,
      tree: false,
      riverJetty: false,
      fisherBoat: false,
    };
    this.failedStatus = {};
    this.totalModels = 9;
    this.onModelReadyCallbacks = [];
    this.onProgressCallbacks = [];
    this.preloadPromise = null;
    this._resolvePreload = null;
    this._isPreloadTriggered = false;
  }

  onModelReady(cb) {
    this.onModelReadyCallbacks.push(cb);
    // Immediately invoke for any models that are already loaded
    Object.keys(this.loadingStatus).forEach((name) => {
      if (this.loadingStatus[name] && this.templates[name]) {
        try {
          cb(name, this.templates[name]);
        } catch (e) {
          console.error(`Error in immediate onModelReady callback for ${name}:`, e);
        }
      }
    });
  }

  onProgress(cb) {
    this.onProgressCallbacks.push(cb);
    // Send immediate initial progress
    try {
      cb(this.getProgress());
    } catch (e) {
      console.error('Error in initial onProgress callback:', e);
    }
    return () => {
      this.onProgressCallbacks = this.onProgressCallbacks.filter((c) => c !== cb);
    };
  }

  getProgress() {
    const keys = Object.keys(this.loadingStatus);
    const loadedCount = keys.filter((k) => this.loadingStatus[k]).length;
    const completedCount = keys.filter((k) => this.loadingStatus[k] || this.failedStatus[k]).length;
    const total = this.totalModels;
    const percent = Math.min(100, Math.round((completedCount / total) * 100));
    return {
      loadedCount,
      completedCount,
      totalCount: total,
      percent,
      isAllLoaded: completedCount >= total,
      statusMap: { ...this.loadingStatus },
    };
  }

  checkLoadingProgress(name, isSuccess) {
    const progress = this.getProgress();
    progress.currentItem = ASSET_NAMES[name] || name;
    progress.lastResult = isSuccess ? 'SUCCESS' : 'FAILED';
    this.onProgressCallbacks.forEach((cb) => {
      try {
        cb(progress);
      } catch (e) {
        console.error('Error in onProgress callback:', e);
      }
    });

    if (progress.isAllLoaded && this._resolvePreload) {
      const resolver = this._resolvePreload;
      this._resolvePreload = null;
      resolver(progress);
    }
  }

  notifyModelReady(name) {
    this.checkLoadingProgress(name, true);
    this.onModelReadyCallbacks.forEach((cb) => {
      try {
        cb(name, this.templates[name]);
      } catch (e) {
        console.error('Error in onModelReady callback:', e);
      }
    });
  }

  notifyModelFailed(name, err) {
    this.failedStatus[name] = true;
    console.warn(`Asset ${name} fallback engaged:`, err);
    this.checkLoadingProgress(name, false);
  }

  isReady(name) {
    return Boolean(this.loadingStatus[name] && this.templates[name]);
  }

  areAllReady() {
    const keys = Object.keys(this.loadingStatus);
    return keys.every((k) => this.loadingStatus[k]);
  }

  /**
   * Preload all models and return a Promise that resolves when all assets are loaded.
   */
  preloadAll(onProgress) {
    if (onProgress) {
      this.onProgress(onProgress);
    }

    const currentProgress = this.getProgress();
    if (currentProgress.isAllLoaded) {
      if (onProgress) {
        onProgress({ ...currentProgress, percent: 100, currentItem: 'All 3D Assets Ready' });
      }
      return Promise.resolve(currentProgress);
    }

    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    this.preloadPromise = new Promise((resolve) => {
      this._resolvePreload = resolve;
      this.loadAll();
    });

    return this.preloadPromise;
  }

  /**
   * High-Speed Cache-First Loader for Mobile and Web
   * Automatically caches GLTF models into device CacheStorage for instant 0ms repeat loading
   */
  loadModel(url, onLoad, onError) {
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.open('gokeral-models-v1').then((cache) => {
        cache.match(url).then((cachedResponse) => {
          if (cachedResponse) {
            cachedResponse.arrayBuffer().then((buffer) => {
              this.loader.parse(buffer, '', onLoad, onError);
            }).catch(() => {
              this.loader.load(url, onLoad, undefined, onError);
            });
          } else {
            fetch(url).then((resp) => {
              if (resp.ok) {
                cache.put(url, resp.clone()).catch(() => {});
                return resp.arrayBuffer();
              }
              throw new Error('Fetch failed');
            }).then((buffer) => {
              this.loader.parse(buffer, '', onLoad, onError);
            }).catch(() => {
              this.loader.load(url, onLoad, undefined, onError);
            });
          }
        }).catch(() => {
          this.loader.load(url, onLoad, undefined, onError);
        });
      }).catch(() => {
        this.loader.load(url, onLoad, undefined, onError);
      });
      return;
    }
    this.loader.load(url, onLoad, undefined, onError);
  }

  /**
   * Preload all 9 3D assets in parallel for highest speed
   */
  loadAll() {
    if (this._isPreloadTriggered) return;
    this._isPreloadTriggered = true;

    THREE.Cache.enabled = true;

    // Trigger core and scenery assets
    this.loadCountryRoad();
    this.loadTenderCoconut();
    this.loadAutoRickshaw();
    this.loadCoconutPalm();
    this.loadWagonR();
    this.loadFisherBoat();
    this.loadTreeLowPoly();
    this.loadRiverJetty();
    this.loadBlindVan();
  }

  /**
   * 1. Long Country Road Running Environment (254.5m Straight Country Highway)
   */
  loadCountryRoad() {
    this.loadModel(
      '/models/country_road.glb',
      (gltf) => {
        const root = gltf.scene;

        root.traverse((child) => {
          if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = false;
            child.frustumCulled = true;
            if (child.material) {
              child.material.roughness = 0.82;
              child.material.metalness = 0.1;
            }
          }
        });

        this.templates.countryRoad = root;
        this.loadingStatus.countryRoad = true;
        console.log('✓ Loaded 3D Long Country Road Running Environment model!');
        this.notifyModelReady('countryRoad');
      },
      (err) => {
        console.warn('Could not load /models/country_road.glb:', err);
        this.notifyModelFailed('countryRoad', err);
      }
    );
  }

  /**
   * 2. Suzuki Wagon R (2013) Car Obstacle
   * Scaled accurately for road lane (length ~3.8m, width ~1.95m, height ~1.88m)
   * Rotated 180 degrees (Math.PI) to face player as oncoming traffic
   */
  loadWagonR() {
    this.loadModel(
      '/models/2013_suzuki_wagonr.glb',
      (gltf) => {
        const root = gltf.scene;

        root.rotation.set(0, Math.PI, 0);
        root.scale.set(1, 1, 1);
        root.position.set(0, 0, 0);
        root.updateMatrixWorld(true);

        let bbox = new THREE.Box3().setFromObject(root);
        let size = new THREE.Vector3();
        bbox.getSize(size);

        // Wagon R dimensions: length along Z is ~7.09m raw, target is 3.8m
        const targetLength = 3.8;
        const scale = targetLength / (size.z || 7.09);
        root.scale.set(scale, scale, scale);
        root.updateMatrixWorld(true);

        const scaledBbox = new THREE.Box3().setFromObject(root);
        const center = new THREE.Vector3();
        scaledBbox.getCenter(center);

        const container = new THREE.Group();
        root.position.x = -center.x;
        root.position.z = -center.z;
        root.position.y = -scaledBbox.min.y;

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = true;
            if (child.material) {
              child.material.metalness = 0.35;
              child.material.roughness = 0.5;
            }
          }
        });

        container.add(root);

        this.templates.wagonr = container;
        this.loadingStatus.wagonr = true;
        console.log('✓ Loaded 3D 2013 Suzuki Wagon R car obstacle model!');
        this.notifyModelReady('wagonr');
      },
      (err) => {
        console.warn('Could not load /models/2013_suzuki_wagonr.glb:', err);
        this.notifyModelFailed('wagonr', err);
      }
    );
  }

  /**
   * 3. Suzuki Carry Blind Van Obstacle
   * Scaled accurately for road lane (height ~1.85m, width ~1.41m, length ~2.46m)
   * Naturally faces +Z (oncoming towards player)
   */
  loadBlindVan() {
    this.loadModel(
      '/models/suzuki_carry_blind_van.glb',
      (gltf) => {
        const root = gltf.scene;

        root.rotation.set(0, 0, 0);
        root.scale.set(1, 1, 1);
        root.position.set(0, 0, 0);
        root.updateMatrixWorld(true);

        let bbox = new THREE.Box3().setFromObject(root);
        let size = new THREE.Vector3();
        bbox.getSize(size);

        // Blind Van dimensions: height along Y is ~2.59m raw, target is 1.85m
        const targetHeight = 1.85;
        const scale = targetHeight / (size.y || 2.59);
        root.scale.set(scale, scale, scale);
        root.updateMatrixWorld(true);

        const scaledBbox = new THREE.Box3().setFromObject(root);
        const center = new THREE.Vector3();
        scaledBbox.getCenter(center);

        const container = new THREE.Group();
        root.position.x = -center.x;
        root.position.z = -center.z;
        root.position.y = -scaledBbox.min.y;

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = true;
            if (child.material) {
              child.material.metalness = 0.35;
              child.material.roughness = 0.5;
            }
          }
        });

        container.add(root);

        this.templates.blindvan = container;
        this.loadingStatus.blindvan = true;
        console.log('✓ Loaded 3D Suzuki Carry Blind Van obstacle model!');
        this.notifyModelReady('blindvan');
      },
      (err) => {
        console.warn('Could not load /models/suzuki_carry_blind_van.glb:', err);
        this.notifyModelFailed('blindvan', err);
      }
    );
  }

  /**
   * 3. 3D Low Poly Auto-rickshaw aka TukTuk Obstacle
   */
  loadAutoRickshaw() {
    this.loadModel(
      '/models/low_poly_autorickshaw_aka_tuktuk.glb',
      (gltf) => {
        const root = gltf.scene;

        root.rotation.set(0, 0, 0);
        root.scale.set(1, 1, 1);
        root.position.set(0, 0, 0);

        let bbox = new THREE.Box3().setFromObject(root);
        let size = new THREE.Vector3();
        bbox.getSize(size);

        // Auto-rickshaw dimensions: Height ~ 1.85m, Width ~ 1.45m
        const targetHeight = 1.85;
        const scale = targetHeight / (size.y || 4.0);
        root.scale.set(scale, scale, scale);
        root.updateMatrixWorld(true);

        const scaledBbox = new THREE.Box3().setFromObject(root);
        const center = new THREE.Vector3();
        scaledBbox.getCenter(center);

        const container = new THREE.Group();
        root.position.x = -center.x;
        root.position.z = -center.z;
        root.position.y = -scaledBbox.min.y;

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = true;
          }
        });

        container.add(root);

        this.templates.autorickshaw = container;
        this.loadingStatus.autorickshaw = true;
        console.log('✓ Loaded 3D Auto-rickshaw (TukTuk) obstacle model!');
        this.notifyModelReady('autorickshaw');
      },
      (err) => {
        console.warn('Could not load /models/low_poly_autorickshaw_aka_tuktuk.glb:', err);
        this.notifyModelFailed('autorickshaw', err);
      }
    );
  }

  /**
   * 4. Authentic 3D Tender Coconut Collectible (day_252_tender_coconut.glb)
   */
  loadTenderCoconut() {
    this.loadModel(
      '/models/day_252_tender_coconut.glb',
      (gltf) => {
        try {
          const root = gltf.scene;

          root.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.frustumCulled = true;
              if (child.material) {
                child.material.side = THREE.DoubleSide;
              }
            }
          });

          let bbox = new THREE.Box3().setFromObject(root);
          let size = new THREE.Vector3();
          bbox.getSize(size);

          // Sized to ~0.62m for prominent collectible visual appeal
          const targetSize = 0.62;
          const maxDim = Math.max(size.x, size.y, size.z) || 0.24;
          const scale = targetSize / maxDim;
          root.scale.set(scale, scale, scale);
          root.updateMatrixWorld(true);

          const scaledBbox = new THREE.Box3().setFromObject(root);
          const center = new THREE.Vector3();
          scaledBbox.getCenter(center);

          const container = new THREE.Group();
          root.position.x = -center.x;
          root.position.y = -center.y;
          root.position.z = -center.z;

          // Glowing emerald/golden halo ring around collectible tender coconut
          const haloGeo = new THREE.RingGeometry(0.36, 0.44, 24);
          const haloMat = new THREE.MeshBasicMaterial({
            color: 0x55ff77,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
          });
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.rotation.x = Math.PI / 2;
          container.add(halo);

          container.add(root);

          this.templates.coconut = container;
          this.loadingStatus.coconut = true;
          console.log('✓ Loaded 3D Tender Coconut collectible model!');
          this.notifyModelReady('coconut');
        } catch (e) {
          console.error('Error processing day_252_tender_coconut.glb:', e);
          this.notifyModelFailed('coconut', e);
        }
      },
      (err) => {
        console.warn('Could not load /models/day_252_tender_coconut.glb:', err);
        this.notifyModelFailed('coconut', err);
      }
    );
  }

  /**
   * 5. Authentic 3D Kerala Coconut Palm Tree (coconut_palm.glb)
   */
  loadCoconutPalm() {
    this.loadModel(
      '/models/coconut_palm.glb',
      (gltf) => {
        try {
          const root = gltf.scene;

          root.traverse((child) => {
            if (child.isMesh) {
              // Scenery optimization: disable shadow casting on 10,000 leaf triangles (saves massive mobile GPU draw calls)
              child.castShadow = false;
              child.receiveShadow = true;
              child.frustumCulled = true;
              if (child.material) {
                child.material.side = THREE.DoubleSide;
                child.material.shadowSide = THREE.DoubleSide;
              }
            }
          });

          let bbox = new THREE.Box3().setFromObject(root);
          let size = new THREE.Vector3();
          bbox.getSize(size);

          // Natural height ~7.8 meters for grand roadside Kerala palm canopy
          const targetHeight = 7.8;
          const scale = targetHeight / (size.y || 6.28);
          root.scale.set(scale, scale, scale);
          root.updateMatrixWorld(true);

          const scaledBbox = new THREE.Box3().setFromObject(root);
          const container = new THREE.Group();
          // Keep trunk base at origin ground level (Y=0)
          root.position.x = 0;
          root.position.z = 0;
          root.position.y = -scaledBbox.min.y;

          container.add(root);

          this.templates.coconutPalm = container;
          this.loadingStatus.coconutPalm = true;
          console.log('✓ Loaded 3D Coconut Palm tree model!');
          this.notifyModelReady('coconutPalm');
        } catch (e) {
          console.error('Error processing coconut_palm.glb:', e);
          this.notifyModelFailed('coconutPalm', e);
        }
      },
      (err) => {
        console.warn('Could not load /models/coconut_palm.glb:', err);
        this.notifyModelFailed('coconutPalm', err);
      }
    );
  }

  /**
   * 6. Authentic 3D Tropical Trees (trees_low_poly.glb)
   */
  loadTreeLowPoly() {
    this.loadModel(
      '/models/trees_low_poly.glb',
      (gltf) => {
        try {
          const root = gltf.scene;

          root.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false; // Optimize mobile GPU
              child.receiveShadow = true;
              child.frustumCulled = true;
              if (child.material) {
                child.material.side = THREE.DoubleSide;
                child.material.shadowSide = THREE.DoubleSide;
              }
            }
          });

          let bbox = new THREE.Box3().setFromObject(root);
          let size = new THREE.Vector3();
          bbox.getSize(size);

          // Natural height ~7.5 meters
          const targetHeight = 7.5;
          const scale = targetHeight / (size.y || 1036);
          root.scale.set(scale, scale, scale);
          root.updateMatrixWorld(true);

          const scaledBbox = new THREE.Box3().setFromObject(root);
          const center = new THREE.Vector3();
          scaledBbox.getCenter(center);

          const container = new THREE.Group();
          root.position.x = -center.x;
          root.position.z = -center.z;
          root.position.y = -scaledBbox.min.y;

          container.add(root);

          this.templates.tree = container;
          this.loadingStatus.tree = true;
          console.log('✓ Loaded 3D Low Poly Tropical Tree model!');
          this.notifyModelReady('tree');
        } catch (e) {
          console.error('Error processing trees_low_poly.glb:', e);
          this.notifyModelFailed('tree', e);
        }
      },
      (err) => {
        console.warn('Could not load /models/trees_low_poly.glb:', err);
        this.notifyModelFailed('tree', err);
      }
    );
  }

  /**
   * 7. Authentic 3D Kerala River Jetty & Boatyard (river_jetty_and_boatyard.glb)
   * Rotated so wooden pier extends into the canal (-X) and boatyard dock connects with shore (+X)
   */
  loadRiverJetty() {
    this.loadModel(
      '/models/river_jetty_and_boatyard.glb',
      (gltf) => {
        try {
          const root = gltf.scene;

          root.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false; // Optimize mobile GPU
              child.receiveShadow = true;
              child.frustumCulled = true;
              if (child.material) {
                child.material.side = THREE.DoubleSide;
              }
            }
          });

          // Rotate 90 degrees around Y: pier extends towards negative X (water canal)
          root.rotation.y = Math.PI / 2;
          const scale = 0.85;
          root.scale.set(scale, scale, scale);
          root.updateMatrixWorld(true);

          const scaledBbox = new THREE.Box3().setFromObject(root);

          const container = new THREE.Group();
          // Align shore end of boatyard to touch the riverbank edge (x = 0 in container)
          root.position.x = -scaledBbox.max.x + 1.2;
          root.position.z = -(scaledBbox.min.z + scaledBbox.max.z) / 2;
          // Pilings go under water (-0.1), deck level flush with bank
          root.position.y = 0.05;

          container.add(root);

          this.templates.riverJetty = container;
          this.loadingStatus.riverJetty = true;
          console.log('✓ Loaded 3D River Jetty & Boatyard model!');
          this.notifyModelReady('riverJetty');
        } catch (e) {
          console.error('Error processing river_jetty_and_boatyard.glb:', e);
          this.notifyModelFailed('riverJetty', e);
        }
      },
      (err) => {
        console.warn('Could not load /models/river_jetty_and_boatyard.glb:', err);
        this.notifyModelFailed('riverJetty', err);
      }
    );
  }

  /**
   * 8. Authentic 3D Kerala Fisher Boat (fisher_boat.glb)
   * Scaled to ~6.0m length, floats naturally in the river canal alongside backwaters
   */
  loadFisherBoat() {
    this.loadModel(
      '/models/fisher_boat.glb',
      (gltf) => {
        try {
          const root = gltf.scene;

          root.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false; // Optimize mobile GPU
              child.receiveShadow = true;
              child.frustumCulled = true;
              if (child.material) {
                child.material.side = THREE.DoubleSide;
              }
            }
          });

          const bbox = new THREE.Box3().setFromObject(root);
          const size = new THREE.Vector3();
          bbox.getSize(size);
          const center = new THREE.Vector3();
          bbox.getCenter(center);

          // Natural boat length along Z is 6.0 meters
          const targetLength = 6.0;
          const scale = targetLength / (size.z || 460);
          root.scale.set(scale, scale, scale);
          root.position.x = -center.x * scale;
          root.position.z = -center.z * scale;
          // Hull sits submerged up to waterline in canal
          root.position.y = -(bbox.min.y + 60) * scale;

          const container = new THREE.Group();
          container.add(root);

          this.templates.fisherBoat = container;
          this.loadingStatus.fisherBoat = true;
          console.log('✓ Loaded 3D Fisher Boat river model!');
          this.notifyModelReady('fisherBoat');
        } catch (e) {
          console.error('Error processing fisher_boat.glb:', e);
          this.notifyModelFailed('fisherBoat', e);
        }
      },
      (err) => {
        console.warn('Could not load /models/fisher_boat.glb:', err);
        this.notifyModelFailed('fisherBoat', err);
      }
    );
  }

  // --- Factory Instancers ---

  createCountryRoadInstance() {
    if (!this.templates.countryRoad) return null;
    const clone = this.templates.countryRoad.clone(true);
    clone.userData = {
      isCountryRoad: true,
    };
    return clone;
  }

  createWagonRInstance() {
    if (!this.templates.wagonr) return null;
    const clone = this.templates.wagonr.clone(true);
    clone.userData = {
      isTransient: true,
      obstacleType: 'WAGONR',
      smashable: true,
    };
    return clone;
  }

  createBlindVanInstance() {
    if (!this.templates.blindvan) return null;
    const clone = this.templates.blindvan.clone(true);
    clone.userData = {
      isTransient: true,
      obstacleType: 'BLINDVAN',
      smashable: true,
    };
    return clone;
  }

  createAutoRickshawInstance() {
    if (!this.templates.autorickshaw) return null;
    const clone = this.templates.autorickshaw.clone(true);
    clone.userData = {
      isTransient: true,
      obstacleType: 'AUTORICKSHAW',
      smashable: true,
    };
    return clone;
  }

  createCoconutInstance() {
    if (!this.templates.coconut) return null;
    const clone = this.templates.coconut.clone(true);
    clone.userData = {
      isTransient: true,
      isCoconut: true,
      is3DCoconut: true,
    };
    return clone;
  }

  createCoconutPalmInstance() {
    if (!this.templates.coconutPalm) return null;
    const clone = this.templates.coconutPalm.clone(true);
    clone.userData = {
      isTransient: true,
      isScenery: true,
    };
    return clone;
  }

  createTreeInstance() {
    if (!this.templates.tree) return null;
    const clone = this.templates.tree.clone(true);
    clone.userData = {
      isTransient: true,
      isScenery: true,
    };
    return clone;
  }

  createRiverJettyInstance() {
    if (!this.templates.riverJetty) return null;
    const clone = this.templates.riverJetty.clone(true);
    clone.userData = {
      isTransient: true,
      isScenery: true,
    };
    return clone;
  }

  createFisherBoatInstance() {
    if (!this.templates.fisherBoat) return null;
    const clone = this.templates.fisherBoat.clone(true);
    clone.userData = {
      isTransient: true,
      isRiverBoat: true,
    };
    return clone;
  }
}

export const modelManager = new ModelManager();
if (typeof window !== 'undefined') {
  modelManager.loadAll();
}
