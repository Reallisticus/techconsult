// src/components/utils/HeroBackground.tsx
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

export const HeroBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  function getPerformanceLevel() {
    // Check if we're in a development environment
    const isDev = process.env.NODE_ENV === "development";

    // Mobile detection
    const mobile =
      typeof window !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    // Low-end mobile - force low quality
    if (mobile) {
      return "low";
    }

    // Detect GPU capability
    const gpu = (navigator as any).gpu;
    if (gpu && gpu.requestAdapter) {
      return isDev ? "medium" : "high"; // Use medium in dev environment for better dev experience
    }

    // Check hardware metrics
    const memoryPerformance = (navigator as any).deviceMemory || 4;
    const cpuCores = navigator.hardwareConcurrency || 4;

    if (memoryPerformance <= 2 || cpuCores <= 2) return "low";
    if (memoryPerformance <= 4 || cpuCores <= 4) return "medium";
    return isDev ? "medium" : "high"; // Lower quality in dev for better dev experience
  }

  useEffect(() => {
    try {
      if (!canvasRef.current) return;
      console.log("🔄 HeroBackground useEffect running");

      const performanceLevel = getPerformanceLevel();

      // Create a more robust PRNG with better state management
      const colorSeed = Date.now();
      let randState = colorSeed;

      const seededRandom = () => {
        randState = (randState * 9301 + 49297) % 233280;
        return randState / 233280;
      };

      // Enhanced color palette
      const colorOptions = [
        new THREE.Color("#7C3AED").convertSRGBToLinear(), // Violet
        new THREE.Color("#A78BFA").convertSRGBToLinear(), // Light violet
        new THREE.Color("#60A5FA").convertSRGBToLinear(), // Blue
        new THREE.Color("#34D399").convertSRGBToLinear(), // Green
      ];

      const getRandomColor = () => {
        const colorIndex = Math.floor(seededRandom() * colorOptions.length);
        return colorOptions[colorIndex]!;
      };

      // Initialize colors array INSIDE useEffect
      const colors: THREE.Color[] = [];
      const positions: number[] = [];

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      cameraRef.current = camera;

      camera.position.z = 45;

      // Enhanced renderer with shadow support
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: performanceLevel !== "low",
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio,
          performanceLevel === "low"
            ? 1
            : performanceLevel === "medium"
              ? 1.5
              : 2,
        ),
      );
      renderer.shadowMap.enabled = performanceLevel !== "low";
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      // Load HDR environment map - progressive approach
      try {
        const loadHDR = () => {
          console.log("📦 Starting HDR environment loading");

          const rgbeLoader = new RGBELoader();
          rgbeLoader.setPath("/textures/");

          // First load low-res version
          const lowResPromise = new Promise<THREE.Texture>((resolve) => {
            rgbeLoader.load("studio_small_08_1k.hdr", (texture) => {
              texture.mapping = THREE.EquirectangularReflectionMapping;
              resolve(texture);
            });
          });

          // Then load high-res if needed
          const highResPromise =
            performanceLevel === "low"
              ? null
              : new Promise<THREE.Texture>((resolve) => {
                  rgbeLoader.load(
                    `studio_small_08_${performanceLevel === "medium" ? "2k" : "4k"}.hdr`,
                    (texture) => {
                      texture.mapping = THREE.EquirectangularReflectionMapping;

                      resolve(texture);
                    },
                  );
                });

          return { lowResPromise, highResPromise };
        };

        const { lowResPromise, highResPromise } = loadHDR();
        lowResPromise.then((texture) => {
          scene.environment = texture;
          console.log("Low-res HDR environment loaded");

          highResPromise!.then((highResTexture) => {
            scene.environment = highResTexture;
            console.log("High-res HDR environment loaded");
          });
        });

        console.log("✅ HDR environment initialized");
      } catch (hdrError) {
        console.error("❌ Error in HDR environment loading:", hdrError);
      }

      const setupPostProcessing = () => {
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        let outlinePass: OutlinePass | null = null;

        if (performanceLevel !== "low") {
          // Bloom with settings based on performance
          const bloomStrength = performanceLevel === "high" ? 0.4 : 0.3;
          const bloomRadius = performanceLevel === "high" ? 0.7 : 0.5;
          const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            bloomStrength,
            bloomRadius,
            0.2,
          );
          composer.addPass(bloomPass);

          // Only add outline pass on high performance
          if (performanceLevel === "high") {
            outlinePass = new OutlinePass(
              new THREE.Vector2(window.innerWidth, window.innerHeight),
              scene,
              camera,
            );
            outlinePass.edgeStrength = 3.0;
            outlinePass.edgeGlow = 0.3;
            outlinePass.edgeThickness = 1.0;
            outlinePass.visibleEdgeColor.set(0x88ccff);
            outlinePass.hiddenEdgeColor.set(0x333333);
            composer.addPass(outlinePass);
          }
        }

        return { composer, outlinePass };
      };

      const { composer, outlinePass } = setupPostProcessing();

      // Track objects to highlight
      const highlightedObjects: THREE.Object3D[] = [];

      // Advanced lighting setup
      scene.add(new THREE.AmbientLight(0x111122, 0.4));

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = performanceLevel !== "low";
      if (directionalLight.castShadow) {
        directionalLight.shadow.mapSize.width =
          performanceLevel === "high" ? 1024 : 512;
        directionalLight.shadow.mapSize.height =
          performanceLevel === "high" ? 1024 : 512;
      }
      scene.add(directionalLight);

      const purpleLight = new THREE.PointLight(0x7c3aed, 1.5, 100);
      purpleLight.position.set(-15, 10, 10);
      scene.add(purpleLight);

      const greenLight = new THREE.PointLight(0x34d399, 1.5, 100);
      greenLight.position.set(15, -10, 10);
      scene.add(greenLight);

      const backLight = new THREE.SpotLight(0x2233ff, 0.8);
      backLight.position.set(0, 0, -20);
      backLight.target.position.set(0, 0, 0);
      scene.add(backLight);
      scene.add(backLight.target);

      // Define particle distribution
      const count =
        performanceLevel === "low"
          ? 40
          : performanceLevel === "medium"
            ? 70
            : 100;

      const minDistance = 6;

      // Generate position function
      const generatePosition = () => {
        const radius = 31;
        const theta = seededRandom() * Math.PI * 2;
        const phi = Math.acos(seededRandom() * 2 - 1);

        return [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta) - 5,
          radius * Math.cos(phi),
        ];
      };

      // Check distance function
      const isTooClose = (pos: number[]) => {
        for (let i = 0; i < positions.length; i += 3) {
          const dx = pos[0]! - positions[i]!;
          const dy = pos[1]! - positions[i + 1]!;
          const dz = pos[2]! - positions[i + 2]!;
          const distanceSquared = dx * dx + dy * dy + dz * dz;

          if (distanceSquared < minDistance * minDistance) {
            return true;
          }
        }
        return false;
      };

      // Generate positions
      for (let i = 0; i < count; i++) {
        let pos: number[];
        let attempts = 0;
        const maxAttempts = 100;

        do {
          pos = generatePosition();
          attempts++;
          if (attempts > maxAttempts) {
            console.warn(
              `Couldn't find non-overlapping position after ${maxAttempts} attempts`,
            );
            break;
          }
        } while (positions.length > 0 && isTooClose(pos));

        positions.push(...pos);
        colors.push(getRandomColor()); // Use your seeded random color generator
      }

      // Setup GLTF loader
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(
        "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
      );
      loader.setDRACOLoader(dracoLoader);

      // Create dummy for instancing
      const dummy = new THREE.Object3D();
      const instancedMeshes: THREE.InstancedMesh[] = [];

      // Define enhanced materials
      const materials = {
        primary: new THREE.MeshPhysicalMaterial({
          color: 0x333340, // Dark blue-gray instead of black
          metalness: 0.9,
          roughness: 0.3,
          envMapIntensity: 1.0,
          clearcoat: 0.5, // Add clearcoat for shine
          clearcoatRoughness: 0.2,
        }),
        secondary: new THREE.MeshPhysicalMaterial({
          color: 0x555555,
          metalness: 1.0,
          roughness: 0.1,
          envMapIntensity: 1.2,
          reflectivity: 1.0,
        }),
        accent: new THREE.MeshPhysicalMaterial({
          color: 0x222222,
          emissive: 0x3311aa,
          emissiveIntensity: 1.2, // Increased intensity
          metalness: 0.9,
          roughness: 0.1,
          clearcoat: 1.0, // Maximum clearcoat
          clearcoatRoughness: 0.0,
        }),
      };

      try {
        console.log("📦 Starting model loading");
        loader.load(
          "/models/scene.gltf",
          (gltf) => {
            console.log("Model loaded successfully");

            // Process each mesh in the model
            let meshIndex = 0;
            gltf.scene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                // Analyze geometry to determine best material
                const geometry = child.geometry;
                const boxSize = new THREE.Box3()
                  .setFromObject(child)
                  .getSize(new THREE.Vector3());

                // Choose material strategy based on geometry characteristics
                let material;
                if (
                  boxSize.z > boxSize.x * 1.5 ||
                  boxSize.y > boxSize.x * 1.5
                ) {
                  // Long/tall parts - likely structural
                  material = materials.secondary.clone();
                } else if (geometry.attributes.position.count < 100) {
                  // Small detail parts - likely accents
                  material = materials.accent.clone();
                  highlightedObjects.push(child); // Add to highlight selection
                } else {
                  // Default parts
                  material = materials.primary.clone();
                }

                // Create instanced mesh
                const instancedMesh = new THREE.InstancedMesh(
                  geometry,
                  material,
                  count,
                );
                instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                instancedMesh.castShadow = true;
                instancedMesh.receiveShadow = true;
                instancedMeshes.push(instancedMesh);
                scene.add(instancedMesh);

                meshIndex++;
              }
            });

            // Store accent colors for animation
            const accentColors = colors.map((color) => color.clone());

            // Position each instance
            for (let i = 0; i < count; i++) {
              dummy.position.set(
                positions[i * 3]!,
                positions[i * 3 + 1]!,
                positions[i * 3 + 2]!,
              );

              // Add subtle rotation variance
              dummy.rotation.set(
                seededRandom() * Math.PI * 0.25,
                seededRandom() * Math.PI * 2,
                seededRandom() * Math.PI * 0.25,
              );

              // Scale variation - slightly larger for better visibility
              dummy.scale.setScalar(0.1 + seededRandom() * 0.06);
              dummy.updateMatrix();

              // Apply to all meshes
              instancedMeshes.forEach((mesh, meshIdx) => {
                mesh.setMatrixAt(i, dummy.matrix);
                mesh.instanceMatrix.needsUpdate = true;

                // Color the accent pieces differently for each instance
                if (meshIdx % 3 === 2) {
                  // Assuming every third mesh is an accent piece
                  const material = mesh.material as THREE.MeshPhysicalMaterial;
                  const newMaterial = material.clone();
                  newMaterial.emissive.copy(
                    accentColors[i % accentColors.length]!,
                  );
                  mesh.material = newMaterial;
                }
              });
            }

            // Update outline pass with highlighted objects
            if (outlinePass) {
              outlinePass.selectedObjects = highlightedObjects;
            }

            // Model loading complete
          },
          // Progress callback
          (progress) => {
            if (progress.lengthComputable) {
              const progressValue = progress.loaded / progress.total;
            }
          },
          // Error callback
          (error) => {
            console.error("Error loading model:", error);
          },
        );
        console.log("✅ Model loading initialized");
      } catch (error) {
        console.error("❌ Error in model loading:", error);
        // Mark resource as complete anyway to prevent hanging
      }
      // Create more sophisticated connection network
      const linesGeometry = new THREE.BufferGeometry();
      const linePositions: number[] = [];
      const lineColors: number[] = [];

      // Create an array to track connected points
      const connectedPoints = new Array(count).fill(false);
      const pointConnections: number[][] = Array(count)
        .fill(0)
        .map(() => []);

      // First pass: ensure each point has at least one connection to its nearest neighbor
      const positionVectors: THREE.Vector3[] = [];
      for (let i = 0; i < positions.length; i += 3) {
        if (
          positions[i] !== undefined &&
          positions[i + 1] !== undefined &&
          positions[i + 2] !== undefined
        ) {
          positionVectors.push(
            new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]),
          );
        }
      }
      const getVector = (
        vectors: THREE.Vector3[],
        index: number,
      ): THREE.Vector3 | null => {
        return index >= 0 && index < vectors.length ? vectors[index]! : null;
      };

      // Now ensure we only iterate over valid indices
      const validCount = positionVectors.length;
      for (let i = 0; i < validCount; i++) {
        let nearestIdx = -1;
        let minDistance = Infinity;

        const currentVector = getVector(positionVectors, i);
        if (!currentVector) continue; // Skip if not found (should never happen with our setup)

        for (let j = 0; j < validCount; j++) {
          if (i === j) continue;

          const compareVector = getVector(positionVectors, j);
          if (!compareVector) continue; // Skip if not found

          const distance = currentVector.distanceTo(compareVector);
          if (distance < minDistance) {
            minDistance = distance;
            nearestIdx = j;
          }
        }

        if (nearestIdx !== -1) {
          const p1 = currentVector;
          const p2 = getVector(positionVectors, nearestIdx);

          if (!p1 || !p2) continue; // Type safety check

          // Add this connection
          linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);

          // Create a gradient color for this primary connection
          const lineColor = new THREE.Color("#7C3AED").lerp(
            new THREE.Color("#34D399"),
            seededRandom(), // Instead of i / validCount
          );

          lineColors.push(
            lineColor.r,
            lineColor.g,
            lineColor.b,
            lineColor.r,
            lineColor.g,
            lineColor.b,
          );

          // Mark both points as connected
          connectedPoints[i] = true;
          connectedPoints[nearestIdx] = true;

          // Store this connection
          pointConnections[i]!.push(nearestIdx);
          pointConnections[nearestIdx]!.push(i);
        }
      }

      // Second pass: create some secondary connections using proximity rules
      // Add occasional longer-distance connections for network complexity
      const maxConnections = 3; // Limit connections per node
      const connectionDistance = 15; // Slightly longer distance for secondary connections

      for (let i = 0; i < count; i++) {
        // Skip if this point already has enough connections
        if (pointConnections[i]!.length >= maxConnections) continue;

        // Sort other points by distance for more structured connections
        const otherPoints = [];
        for (let j = 0; j < count; j++) {
          if (i === j || pointConnections[i]!.includes(j)) continue;

          const distance = positionVectors[i]!.distanceTo(positionVectors[j]!);
          if (distance < connectionDistance) {
            otherPoints.push({ index: j, distance: distance });
          }
        }

        // Sort by distance
        otherPoints.sort((a, b) => a.distance - b.distance);

        // Add connections up to the max (or as many as available)
        const connectionsToAdd = Math.min(
          maxConnections - pointConnections[i]!.length,
          otherPoints.length,
        );

        for (let k = 0; k < connectionsToAdd; k++) {
          const targetIdx = otherPoints[k]!.index;

          // Skip if the target already has max connections
          if (pointConnections[targetIdx]!.length >= maxConnections) continue;

          const p1 = positionVectors[i];
          const p2 = positionVectors[targetIdx];

          // Add secondary connection
          linePositions.push(p1!.x, p1!.y, p1!.z, p2!.x, p2!.y, p2!.z);

          // Secondary connections have a more subtle color
          const lineColor = new THREE.Color("#60A5FA").lerp(
            new THREE.Color("#A78BFA"),
            seededRandom(), // Instead of Math.random()
          );

          lineColors.push(
            lineColor.r,
            lineColor.g,
            lineColor.b,
            lineColor.r,
            lineColor.g,
            lineColor.b,
          );

          // Record this connection
          pointConnections[i]!.push(targetIdx);
          pointConnections[targetIdx]!.push(i);
        }
      }

      linesGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3),
      );
      linesGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(lineColors, 3),
      );

      // Create line material with improved visuals
      const linesMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        linewidth: 1, // Note: linewidth is generally fixed at 1 due to WebGL limitations
      });

      const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(lines);

      // Add animated particles flowing along connections for a more dynamic effect
      const particleCount = linePositions.length / 6; // One particle per line segment
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleSizes = new Float32Array(particleCount);
      const particleColors = new Float32Array(particleCount * 3);

      // Initialize particles at random positions along each line
      for (let i = 0; i < particleCount; i++) {
        const lineStartIdx = i * 6; // Each line has 6 values (2 points × 3 coordinates)
        if (linePositions[lineStartIdx] === undefined) continue;

        const startX = linePositions[lineStartIdx];
        const startY = linePositions[lineStartIdx + 1];
        const startZ = linePositions[lineStartIdx + 2];
        const endX = linePositions[lineStartIdx + 3];
        const endY = linePositions[lineStartIdx + 4];
        const endZ = linePositions[lineStartIdx + 5];

        // Random position along the line
        const progress = seededRandom();
        particlePositions[i * 3] = startX + (endX! - startX) * progress;
        particlePositions[i * 3 + 1] = startY! + (endY! - startY!) * progress;
        particlePositions[i * 3 + 2] = startZ! + (endZ! - startZ!) * progress;

        // Random size between 0.4 and 0.8
        particleSizes[i] = 0.4 + seededRandom() * 0.4;

        // Use same color as the line for consistency
        const colorIdx = lineStartIdx * (3 / 6); // Convert from line index to color index
        if (lineColors[colorIdx] !== undefined) {
          particleColors[i * 3]! = lineColors[colorIdx];
          particleColors[i * 3 + 1] = lineColors[colorIdx + 1]!;
          particleColors[i * 3 + 2] = lineColors[colorIdx + 2]!;
        } else {
          // Fallback to default color if line color isn't available
          const defaultColor = new THREE.Color(0x60a5fa);
          particleColors[i * 3] = defaultColor.r;
          particleColors[i * 3 + 1] = defaultColor.g;
          particleColors[i * 3 + 2] = defaultColor.b;
        }
      }

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3),
      );
      particleGeometry.setAttribute(
        "size",
        new THREE.BufferAttribute(particleSizes, 1),
      );
      particleGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(particleColors, 3),
      );

      // Create particle material
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
        fragmentShader: `
    varying vec3 vColor;
    void main() {
      float r = 0.0;
      vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      r = dot(cxy, cxy);
      if (r > 1.0) {
        discard;
      }
      gl_FragColor = vec4(vColor, 1.0 - r);
    }
  `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      // Group for unified rotation
      const group = new THREE.Group();
      group.add(lines);
      group.add(particles); // Add particles to rotation group
      scene.add(group);

      // Animation
      const clock = new THREE.Clock();

      const animate = () => {
        const elapsedTime = clock.getElapsedTime();

        // Rotate the entire group with smooth damping
        group.rotation.y = elapsedTime * 0.05;
        group.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05; // Gentle bobbing
        const updateFrequency = performanceLevel === "low" ? 2 : 1;

        if (Math.floor(elapsedTime * 60) % updateFrequency === 0) {
          // Add instances to group if available
          if (
            instancedMeshes.length > 0 &&
            !group.children.includes(instancedMeshes[0]!)
          ) {
            instancedMeshes.forEach((mesh) => group.add(mesh));
          }

          // Pulsating emissive effect for accent materials
          instancedMeshes.forEach((mesh, meshIdx) => {
            if (meshIdx % 3 === 2) {
              // Accent pieces
              const material = mesh.material as THREE.MeshPhysicalMaterial;
              if (material.emissiveIntensity) {
                material.emissiveIntensity =
                  0.8 + Math.sin(elapsedTime * 2) * 0.4;
              }
            }
          });

          // Animate particles flowing along connections
          const positions = particleGeometry.attributes.position!.array;

          for (let i = 0; i < particleCount; i++) {
            const lineStartIdx = i * 6;
            const startX = linePositions[lineStartIdx];
            const startY = linePositions[lineStartIdx + 1];
            const startZ = linePositions[lineStartIdx + 2];
            const endX = linePositions[lineStartIdx + 3];
            const endY = linePositions[lineStartIdx + 4];
            const endZ = linePositions[lineStartIdx + 5];

            // Calculate motion along the line with a looping pattern
            const speed = 0.2; // Adjust speed as needed
            const progress = (elapsedTime * speed + i * 0.1) % 1.0;

            positions[i * 3] = startX! + (endX! - startX!) * progress;
            positions[i * 3 + 1] = startY! + (endY! - startY!) * progress;
            positions[i * 3 + 2] = startZ! + (endZ! - startZ!) * progress;
          }

          particleGeometry.attributes.position!.needsUpdate = true;
        }

        // Use composer for post-processing
        composer.render();
        requestAnimationFrame(animate);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        if (!canvasRef.current || !renderer || !camera) return;

        // Set proper canvas dimensions matching the viewport
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Maintain correct pixel ratio for high-DPI displays
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(pixelRatio);

        // Update camera aspect ratio
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }

        // Force a render to update view
        if (composer) {
          composer.setSize(window.innerWidth, window.innerHeight);
          composer.render();
        }
      };
      const handleScroll = () => {
        // Keep the canvas fixed in the viewport
        if (canvasRef.current) {
          canvasRef.current.style.position = "fixed";
          canvasRef.current.style.top = "0";
          canvasRef.current.style.left = "0";
          canvasRef.current.style.width = "100vw";
          canvasRef.current.style.height = "100vh";
        }
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll);

      // Initial setup
      handleResize();
      handleScroll();
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll);

        renderer.dispose();
        composer.dispose();
        // Dispose geometries and materials
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (object.material instanceof THREE.Material) {
              object.material.dispose();
            } else if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            }
          }
        });
      };
    } catch (e) {
      console.error("❌ CRITICAL ERROR in HeroBackground:", e);
      console.trace("Stack trace:");
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[-1000] h-full w-full" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 h-full w-full"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      />
    </div>
  );
};
