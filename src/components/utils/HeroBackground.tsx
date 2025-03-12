// src/components/utils/HeroBackground.tsx
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { useSmoothScroll } from "../../provider/SmoothScrollProvider";

export const HeroBackground = () => {
  // For debugging
  const [debugScrollInfo, setDebugScrollInfo] = useState({
    scroll: 0,
    progress: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const renderRef = useRef<((time: number) => void) | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const { scroll } = useSmoothScroll();
  const lastScrollY = useRef(0);
  const needsUpdate = useRef(true);

  // Store object positions and anchor points for connections
  const modelInstancesRef = useRef<THREE.InstancedMesh[]>([]);
  const instanceMatricesRef = useRef<Float32Array[]>([]);
  const modelPositionsRef = useRef<THREE.Vector3[]>([]);
  const connectionPairsRef = useRef<number[][]>([]);
  const linesMeshRef = useRef<THREE.LineSegments | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const modelMatrixRef = useRef(new THREE.Matrix4());
  const tempVector = useRef(new THREE.Vector3());

  // Store specific anchor points for each model (input and output points)
  const modelAnchorsRef = useRef<
    { input: THREE.Vector3; output: THREE.Vector3 }[]
  >([]);
  const dummy = useRef(new THREE.Object3D());

  // Performance settings - tunable based on device capability
  const getPerformanceLevel = () => {
    const gpu = (navigator as any).gpu;
    const mobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    if (mobile) return "low";
    if (gpu && gpu.requestAdapter) return "high";

    // Check general performance metrics
    const memoryPerformance = (navigator as any).deviceMemory || 4;
    const cpuCores = navigator.hardwareConcurrency || 4;

    if (memoryPerformance <= 4 || cpuCores <= 4) return "medium";
    return "high";
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const performanceLevel = getPerformanceLevel();

    // Performance tuning parameters based on device capability
    const perfParams = {
      instanceCount:
        performanceLevel === "low"
          ? 40
          : performanceLevel === "medium"
            ? 70
            : 100,

      bloomEnabled: performanceLevel !== "low",
      outlineEnabled: performanceLevel === "high",

      shadowsEnabled: performanceLevel !== "low",

      updateFrequency:
        performanceLevel === "low" ? 3 : performanceLevel === "medium" ? 2 : 1,

      particleFactor:
        performanceLevel === "low"
          ? 0.5
          : performanceLevel === "medium"
            ? 0.8
            : 1.0,

      maxConnections:
        performanceLevel === "low" ? 2 : performanceLevel === "medium" ? 3 : 3,
    };

    // Create a more robust PRNG with better state management
    const colorSeed = Date.now();
    let randState = colorSeed;

    const seededRandom = () => {
      randState = (randState * 9301 + 49297) % 233280;
      return randState / 233280;
    };

    // Enhanced color palette - vibrant colors for better visual appeal
    const colorOptions = [
      new THREE.Color("#7C3AED").convertSRGBToLinear(), // Violet
      new THREE.Color("#A78BFA").convertSRGBToLinear(), // Light violet
      new THREE.Color("#60A5FA").convertSRGBToLinear(), // Blue
      new THREE.Color("#34D399").convertSRGBToLinear(), // Green
      new THREE.Color("#EC4899").convertSRGBToLinear(), // Pink
      new THREE.Color("#F59E0B").convertSRGBToLinear(), // Amber
    ];

    const getRandomColor = () => {
      const colorIndex = Math.floor(seededRandom() * colorOptions.length);
      return colorOptions[colorIndex]!;
    };

    // Initialize colors array
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

    // Enhanced renderer with optimized settings
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: performanceLevel !== "low",
      powerPreference: "high-performance", // Request high performance GPU
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
    renderer.shadowMap.enabled = perfParams.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Load HDR environment map
    const loadHDR = () => {
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
                `studio_small_08_${performanceLevel === "medium" ? "4k" : "8k"}.hdr`,
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

      if (highResPromise) {
        highResPromise.then((highResTexture) => {
          scene.environment = highResTexture;
          console.log("High-res HDR environment loaded");
        });
      }
    });

    // Post-processing setup
    const setupPostProcessing = () => {
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      let outlinePass: OutlinePass | null = null;

      if (perfParams.bloomEnabled) {
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
      }

      // Only add outline pass on high performance
      if (perfParams.outlineEnabled) {
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

      return { composer, outlinePass };
    };

    const { composer, outlinePass } = setupPostProcessing();

    // Highlighted objects for outline effect
    const highlightedObjects: THREE.Object3D[] = [];

    // Advanced lighting setup
    scene.add(new THREE.AmbientLight(0x111122, 0.4));

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = perfParams.shadowsEnabled;
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

    // Define particle distribution
    const count = perfParams.instanceCount;
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
      colors.push(getRandomColor());
    }

    // Setup GLTF loader
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
    );
    loader.setDRACOLoader(dracoLoader);

    // Create instancedMeshes array
    const instancedMeshes: THREE.InstancedMesh[] = [];
    modelInstancesRef.current = instancedMeshes;

    // Define unique materials for different parts of the model
    const primaryMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x333340,
      metalness: 0.9,
      roughness: 0.3,
      envMapIntensity: 1.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
    });

    const secondaryMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x555555,
      metalness: 1.0,
      roughness: 0.1,
      envMapIntensity: 1.2,
      reflectivity: 1.0,
    });

    // Initialize arrays to store model positions and anchor points
    const modelPositions: THREE.Vector3[] = Array(count)
      .fill(0)
      .map(() => new THREE.Vector3());
    modelPositionsRef.current = modelPositions;

    // Initialize array for anchor points
    const modelAnchors: { input: THREE.Vector3; output: THREE.Vector3 }[] =
      Array(count)
        .fill(0)
        .map(() => ({
          input: new THREE.Vector3(),
          output: new THREE.Vector3(),
        }));
    modelAnchorsRef.current = modelAnchors;

    // Initialize arrays to store instance matrices
    const instanceMatrices: Float32Array[] = [];
    instanceMatricesRef.current = instanceMatrices;

    // Store accent materials separately for each instance
    const accentMaterials: THREE.MeshPhysicalMaterial[] = [];

    // Load the model
    loader.load("/models/scene.gltf", (gltf) => {
      console.log("Model loaded successfully");

      // Extract model geometry
      const modelGeometries: THREE.BufferGeometry[] = [];
      const geometryTypes: string[] = [];

      // Analyze model to determine appropriate connection points
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const geometry = child.geometry;
          const box = new THREE.Box3().setFromObject(child);
          const size = new THREE.Vector3();
          box.getSize(size);

          // Store geometry information
          modelGeometries.push(geometry);

          // Determine geometry type based on characteristics
          if (size.z > size.x * 1.5 || size.y > size.x * 1.5) {
            geometryTypes.push("structural");
          } else if (geometry.attributes.position.count < 100) {
            geometryTypes.push("accent");
          } else {
            geometryTypes.push("primary");
          }
        }
      });

      // Create accent materials for each instance with unique colors
      for (let i = 0; i < count; i++) {
        const material = new THREE.MeshPhysicalMaterial({
          color: 0x222222,
          emissive: colors[i],
          emissiveIntensity: 1.2,
          metalness: 0.9,
          roughness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.0,
        });
        accentMaterials.push(material);
      }

      // Process each mesh in the model
      let meshIndex = 0;
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const geometry = child.geometry;
          const geometryType = geometryTypes[meshIndex] || "primary";

          // Choose material based on geometry type
          let material;
          if (geometryType === "structural") {
            material = secondaryMaterial;
          } else if (geometryType === "accent") {
            // For accent pieces, we'll use instance-specific materials later
            material = primaryMaterial; // Temporary placeholder
            highlightedObjects.push(child);
          } else {
            material = primaryMaterial;
          }

          // Create instanced mesh
          const instancedMesh = new THREE.InstancedMesh(
            geometry,
            material,
            count,
          );
          instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
          instancedMesh.castShadow = perfParams.shadowsEnabled;
          instancedMesh.receiveShadow = perfParams.shadowsEnabled;

          // Store the instanced mesh
          instancedMeshes.push(instancedMesh);

          // Create matrix array for this mesh
          const matrixArray = new Float32Array(count * 16);
          instanceMatrices.push(matrixArray);

          scene.add(instancedMesh);
          meshIndex++;
        }
      });

      // Find appropriate anchor points for each model instance
      for (let i = 0; i < count; i++) {
        // Set position from our position array
        dummy.current.position.set(
          positions[i * 3]!,
          positions[i * 3 + 1]!,
          positions[i * 3 + 2]!,
        );

        // Store the model's center position
        modelPositions[i]!.copy(dummy.current.position);

        // Add some rotation variance
        dummy.current.rotation.set(
          seededRandom() * Math.PI * 0.25,
          seededRandom() * Math.PI * 2,
          seededRandom() * Math.PI * 0.25,
        );

        // Calculate a scale factor
        const scaleFactor = 0.1 + seededRandom() * 0.06;
        dummy.current.scale.setScalar(scaleFactor);

        // Update the dummy matrix
        dummy.current.updateMatrix();

        // Generate anchor points - these will be offset from the center
        // Find anchor points that will be on the surface of the model
        const modelRadius = 1.0 * scaleFactor; // Approximate model radius

        // Calculate input and output points on opposite sides of the model
        const inputAngle = seededRandom() * Math.PI * 2;
        const outputAngle = inputAngle + Math.PI; // Opposite side

        // Create anchor points on the model surface
        const inputPoint = new THREE.Vector3(
          Math.cos(inputAngle) * modelRadius,
          Math.sin(inputAngle) * modelRadius,
          (seededRandom() - 0.5) * modelRadius,
        );

        const outputPoint = new THREE.Vector3(
          Math.cos(outputAngle) * modelRadius,
          Math.sin(outputAngle) * modelRadius,
          (seededRandom() - 0.5) * modelRadius,
        );

        // Transform anchor points to world space
        inputPoint.add(dummy.current.position);
        outputPoint.add(dummy.current.position);

        // Store anchor points
        modelAnchors[i]!.input.copy(inputPoint);
        modelAnchors[i]!.output.copy(outputPoint);

        // Apply matrix to all meshes
        instancedMeshes.forEach((mesh, meshIdx) => {
          // Apply the matrix
          mesh.setMatrixAt(i, dummy.current.matrix);

          // Store the matrix for later use
          const array = instanceMatrices[meshIdx]!;
          dummy.current.matrix.toArray(array, i * 16);

          // Apply instance-specific material to accent pieces
          if (geometryTypes[meshIdx] === "accent") {
            // Clone the instance-specific accent material for this mesh
            const accentMaterial = accentMaterials[i];

            // We need to replace the shared material with instance-specific materials
            // This requires creating a new array of materials
            if (i === 0) {
              // Only do this once per mesh
              // Create a material array for this mesh
              const materials = new Array(count);
              mesh.material = materials;
            }

            // Set the instance-specific material
            if (Array.isArray(mesh.material)) {
              if (accentMaterial) {
                mesh.material[i] = accentMaterial;
              }
            }
          }
        });
      }

      // Update all instance matrices
      instancedMeshes.forEach((mesh) => {
        mesh.instanceMatrix.needsUpdate = true;
      });

      // Update outline pass with highlighted objects
      if (outlinePass) {
        outlinePass.selectedObjects = highlightedObjects;
      }

      // Create connections between models using anchor points
      createConnections();

      // Force an initial update
      needsUpdate.current = true;
    });

    // Function to create connections between models using anchor points
    const createConnections = () => {
      // Initialize connection pairs and positions
      const connectionPairs: number[][] = [];
      const linePositions: number[] = [];
      const lineColors: number[] = [];

      const maxConnections = perfParams.maxConnections;
      const connectedCount = Array(modelPositionsRef.current.length).fill(0);
      const modelAnchors = modelAnchorsRef.current;

      // First pass - connect nearest neighbors
      for (let i = 0; i < modelPositionsRef.current.length; i++) {
        let nearestIdx = -1;
        let minDistance = Infinity;

        // Find the nearest model
        for (let j = 0; j < modelPositionsRef.current.length; j++) {
          if (i === j) continue;

          const distance = modelPositionsRef.current[i]!.distanceTo(
            modelPositionsRef.current[j]!,
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestIdx = j;
          }
        }

        if (nearestIdx !== -1) {
          // Add this connection if not already connected
          if (
            !connectionPairs.some(
              (pair) =>
                (pair[0] === i && pair[1] === nearestIdx) ||
                (pair[0] === nearestIdx && pair[1] === i),
            )
          ) {
            connectionPairs.push([i, nearestIdx]);
            connectedCount[i]++;
            connectedCount[nearestIdx]++;

            // Add line positions using anchor points
            // Model i's output connects to model nearestIdx's input
            const outputPoint = modelAnchors[i]!.output;
            const inputPoint = modelAnchors[nearestIdx]!.input;

            linePositions.push(
              outputPoint.x,
              outputPoint.y,
              outputPoint.z,
              inputPoint.x,
              inputPoint.y,
              inputPoint.z,
            );

            // Create a gradient color for this connection
            const lineColor = new THREE.Color("#7C3AED").lerp(
              new THREE.Color("#34D399"),
              seededRandom(),
            );

            lineColors.push(
              lineColor.r,
              lineColor.g,
              lineColor.b,
              lineColor.r,
              lineColor.g,
              lineColor.b,
            );
          }
        }
      }

      // Second pass - add more connections for complexity
      for (let i = 0; i < modelPositionsRef.current.length; i++) {
        // Skip if this model already has enough connections
        if (connectedCount[i] >= maxConnections) continue;

        // Find models within range, sorted by distance
        const otherModels = [];
        for (let j = 0; j < modelPositionsRef.current.length; j++) {
          if (i === j) continue;

          // Skip if these models are already connected
          if (
            connectionPairs.some(
              (pair) =>
                (pair[0] === i && pair[1] === j) ||
                (pair[0] === j && pair[1] === i),
            )
          )
            continue;

          const distance = modelPositionsRef.current[i]!.distanceTo(
            modelPositionsRef.current[j]!,
          );
          otherModels.push({ index: j, distance });
        }

        // Sort by distance
        otherModels.sort((a, b) => a.distance - b.distance);

        // Add connections up to max limit
        for (
          let j = 0;
          j < otherModels.length && connectedCount[i] < maxConnections;
          j++
        ) {
          const targetIdx = otherModels[j]!.index;

          // Skip if target already has max connections
          if (connectedCount[targetIdx] >= maxConnections) continue;

          // Add this connection
          connectionPairs.push([i, targetIdx]);
          connectedCount[i]++;
          connectedCount[targetIdx]++;

          // Add line using anchor points
          const outputPoint = modelAnchors[i]!.output;
          const inputPoint = modelAnchors[targetIdx]!.input;

          linePositions.push(
            outputPoint.x,
            outputPoint.y,
            outputPoint.z,
            inputPoint.x,
            inputPoint.y,
            inputPoint.z,
          );

          // Create a color for this secondary connection
          const lineColor = new THREE.Color("#60A5FA").lerp(
            new THREE.Color("#A78BFA"),
            seededRandom(),
          );

          lineColors.push(
            lineColor.r,
            lineColor.g,
            lineColor.b,
            lineColor.r,
            lineColor.g,
            lineColor.b,
          );
        }
      }

      // Store connection pairs
      connectionPairsRef.current = connectionPairs;

      // Create line geometry
      const linesGeometry = new THREE.BufferGeometry();
      linesGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3),
      );
      linesGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(lineColors, 3),
      );

      // Create line material
      const linesMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.7, // Increased opacity for better visibility
        blending: THREE.AdditiveBlending,
        linewidth: 1,
      });

      // Create and add lines
      const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(lines);
      linesMeshRef.current = lines;

      // Create particles flowing along connections
      createParticles(connectionPairs, lineColors);
    };

    // Function to create particles flowing along connections
    const createParticles = (
      connectionPairs: number[][],
      lineColors: number[],
    ) => {
      // Calculate particle count
      const particleCount = Math.floor(
        connectionPairs.length * perfParams.particleFactor,
      );
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleSizes = new Float32Array(particleCount);
      const particleColors = new Float32Array(particleCount * 3);

      const modelAnchors = modelAnchorsRef.current;

      // Initialize particles along each connection
      for (let i = 0; i < particleCount; i++) {
        const connectionIdx = i % connectionPairs.length;
        const pair = connectionPairs[connectionIdx];
        if (!pair) continue;

        const [idx1, idx2] = pair;
        if (idx1 === undefined || idx2 === undefined) continue;

        // Use anchor points for the connection
        const outputPoint = modelAnchors[idx1]!.output;
        const inputPoint = modelAnchors[idx2]!.input;

        // Random position along the line
        const progress = seededRandom();

        // Interpolate between output and input points
        particlePositions[i * 3] =
          outputPoint.x + (inputPoint.x - outputPoint.x) * progress;
        particlePositions[i * 3 + 1] =
          outputPoint.y + (inputPoint.y - outputPoint.y) * progress;
        particlePositions[i * 3 + 2] =
          outputPoint.z + (inputPoint.z - outputPoint.z) * progress;

        // Random size between 0.4 and 0.8
        particleSizes[i] = 0.4 + seededRandom() * 0.4;

        // Use color from the line
        const colorIdx = connectionIdx * 6; // Each connection has 6 color values
        if (lineColors[colorIdx] !== undefined) {
          particleColors[i * 3] = lineColors[colorIdx] ?? 0;
          particleColors[i * 3 + 1] = lineColors[colorIdx + 1] ?? 0;
          particleColors[i * 3 + 2] = lineColors[colorIdx + 2] ?? 0;
        } else {
          // Fallback color
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
      particlesRef.current = particles;
    };

    // Function to update connections and particles
    const updateConnections = (
      frameCount: number,
      elapsedTime: number,
      scrollProgress: number,
    ) => {
      // Only update connections on certain frames for performance
      if (frameCount % perfParams.updateFrequency !== 0 && !needsUpdate.current)
        return;

      needsUpdate.current = false;

      const linesMesh = linesMeshRef.current;
      const particles = particlesRef.current;
      const connectionPairs = connectionPairsRef.current;
      const modelAnchors = modelAnchorsRef.current;
      const group = groupRef.current;

      if (
        !linesMesh ||
        !particles ||
        connectionPairs.length === 0 ||
        !group ||
        !modelAnchors.length
      )
        return;

      // Get group's world matrix once
      modelMatrixRef.current.copy(group.matrixWorld);
      const matrix = modelMatrixRef.current;

      // Update line positions
      const linePositions = linesMesh.geometry.attributes.position!
        .array as Float32Array;

      // Update each line using anchor points
      for (let i = 0; i < connectionPairs.length; i++) {
        const pair = connectionPairs[i];
        if (!pair) continue;

        const [idx1, idx2] = pair;
        if (idx1 === undefined || idx2 === undefined) continue;

        // Get anchor points for this connection
        const outputAnchor = modelAnchors[idx1]!.output;
        const inputAnchor = modelAnchors[idx2]!.input;

        // Apply world matrix to get actual positions
        tempVector.current.copy(outputAnchor).applyMatrix4(matrix);
        const wx1 = tempVector.current.x;
        const wy1 = tempVector.current.y;
        const wz1 = tempVector.current.z;

        tempVector.current.copy(inputAnchor).applyMatrix4(matrix);
        const wx2 = tempVector.current.x;
        const wy2 = tempVector.current.y;
        const wz2 = tempVector.current.z;

        // Update line positions
        const posIdx = i * 6;
        linePositions[posIdx] = wx1;
        linePositions[posIdx + 1] = wy1;
        linePositions[posIdx + 2] = wz1;
        linePositions[posIdx + 3] = wx2;
        linePositions[posIdx + 4] = wy2;
        linePositions[posIdx + 5] = wz2;
      }

      // Mark as needing update
      linesMesh.geometry.attributes.position!.needsUpdate = true;

      // Update particle positions
      const particlePositions = particles.geometry.attributes.position!
        .array as Float32Array;
      const particleCount = particlePositions.length / 3;

      // Speed up particles based on scroll
      const baseSpeed = 0.2;
      const scrollSpeedBoost = scrollProgress * 0.3;
      const effectiveSpeed = baseSpeed + scrollSpeedBoost;

      for (let i = 0; i < particleCount; i++) {
        const connectionIdx = i % connectionPairs.length;
        const pair = connectionPairs[connectionIdx];
        if (!pair) continue;

        const [idx1, idx2] = pair;
        if (idx1 === undefined || idx2 === undefined) continue;

        // Get anchor points for this connection
        const outputAnchor = modelAnchors[idx1]!.output;
        const inputAnchor = modelAnchors[idx2]!.input;

        // Apply world matrix to get actual positions
        tempVector.current.copy(outputAnchor).applyMatrix4(matrix);
        const wx1 = tempVector.current.x;
        const wy1 = tempVector.current.y;
        const wz1 = tempVector.current.z;

        tempVector.current.copy(inputAnchor).applyMatrix4(matrix);
        const wx2 = tempVector.current.x;
        const wy2 = tempVector.current.y;
        const wz2 = tempVector.current.z;

        // Animate along line with progressive motion
        const progress = (elapsedTime * effectiveSpeed + i * 0.1) % 1.0;

        // Update particle position
        const posIdx = i * 3;
        particlePositions[posIdx] = wx1 + (wx2 - wx1) * progress;
        particlePositions[posIdx + 1] = wy1 + (wy2 - wy1) * progress;
        particlePositions[posIdx + 2] = wz1 + (wz2 - wz1) * progress;
      }

      // Mark particles as needing update
      particles.geometry.attributes.position!.needsUpdate = true;

      // Update accent material intensities
      if (frameCount % 5 === 0) {
        // Less frequent updates for performance
        modelInstancesRef.current.forEach((mesh, meshIdx) => {
          if (Array.isArray(mesh.material)) {
            for (let i = 0; i < mesh.material.length; i++) {
              const material = mesh.material[i];
              if (
                material instanceof THREE.MeshPhysicalMaterial &&
                material.emissiveIntensity
              ) {
                material.emissiveIntensity =
                  0.8 + Math.sin(elapsedTime * 2 + i * 0.2) * 0.4;
                // No need to mark as needing update - three.js handles this
              }
            }
          }
        });
      }
    };

    // Group for unified rotation and transformations
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Animation
    const clock = new THREE.Clock();
    let frameCount = 0;

    const animate = (time: number) => {
      frameCount++;
      const elapsedTime = clock.getElapsedTime();

      // Get current scroll progress
      const scrollHeight = Math.min(document.body.scrollHeight, 2000);
      const currentScrollY = scroll.current;
      const scrollProgress = Math.min(1, currentScrollY / (scrollHeight * 0.5));

      // Check if scroll changed significantly
      const scrollChanged = Math.abs(currentScrollY - lastScrollY.current) > 1;
      if (scrollChanged) {
        needsUpdate.current = true;
        lastScrollY.current = currentScrollY;
      }

      // Update debug info (only occasionally for performance)
      if (frameCount % 10 === 0) {
        setDebugScrollInfo({
          scroll: currentScrollY,
          progress: scrollProgress,
        });
      }

      // Dynamic camera position based on scroll
      if (camera) {
        // Camera position changes dramatically with scroll
        const cameraZ = 45 - scrollProgress * 15; // Move closer as we scroll
        const cameraX = scrollProgress * 20 * Math.sin(elapsedTime * 0.1); // Side movement
        const cameraY = scrollProgress * 15 * Math.cos(elapsedTime * 0.1); // Up/down movement

        // Smooth damping factor - faster update on scroll change
        const dampFactor = scrollChanged ? 0.1 : 0.05;

        camera.position.x += (cameraX - camera.position.x) * dampFactor;
        camera.position.y += (cameraY - camera.position.y) * dampFactor;
        camera.position.z += (cameraZ - camera.position.z) * dampFactor;

        // Dynamic look at point
        const lookAtX = scrollProgress * 15 * Math.sin(elapsedTime * 0.2);
        const lookAtY = scrollProgress * 10 * Math.cos(elapsedTime * 0.2);
        camera.lookAt(lookAtX, lookAtY, 0);
      }

      // Apply transformations to the group
      if (group) {
        // Base rotation gets amplified with scroll
        const baseRotationX = elapsedTime * 0.05;
        const baseRotationY = elapsedTime * 0.1;

        // Enhanced rotation based on scroll
        const scrollRotationX = scrollProgress * Math.PI * 0.5; // Rotate up to 90 degrees
        const scrollRotationY = scrollProgress * Math.PI; // Rotate up to 180 degrees
        const scrollRotationZ = scrollProgress * Math.PI * 0.25; // Rotate up to 45 degrees

        // Apply with smooth damping - faster on scroll change
        const dampFactor = scrollChanged ? 0.1 : 0.05;

        group.rotation.x +=
          (baseRotationX + scrollRotationX - group.rotation.x) * dampFactor;
        group.rotation.y +=
          (baseRotationY + scrollRotationY - group.rotation.y) * dampFactor;
        group.rotation.z += (scrollRotationZ - group.rotation.z) * dampFactor;

        // Scale based on scroll - shrink as we scroll down
        const targetScale = 1 - scrollProgress * 0.3;
        group.scale.set(targetScale, targetScale, targetScale);

        // Move instancedMeshes to group if they're not already there
        const instancedMeshes = modelInstancesRef.current;
        instancedMeshes.forEach((mesh) => {
          if (!group.children.includes(mesh)) {
            group.add(mesh);
          }
        });

        // Move lines and particles to group
        const linesMesh = linesMeshRef.current;
        const particles = particlesRef.current;

        if (linesMesh && !group.children.includes(linesMesh)) {
          group.add(linesMesh);
        }

        if (particles && !group.children.includes(particles)) {
          group.add(particles);
        }
      }

      // Update connections and particles
      updateConnections(frameCount, elapsedTime, scrollProgress);

      // Use composer for post-processing
      composer.render();
      frameIdRef.current = requestAnimationFrame(animate);
    };

    // Store the render function
    renderRef.current = animate;

    // Initial render
    frameIdRef.current = requestAnimationFrame(animate);

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !renderer || !camera) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Set proper canvas dimensions matching the viewport
      renderer.setSize(width, height);

      // Maintain correct pixel ratio for high-DPI displays
      const pixelRatio = Math.min(
        window.devicePixelRatio,
        performanceLevel === "low"
          ? 1
          : performanceLevel === "medium"
            ? 1.5
            : 2,
      );
      renderer.setPixelRatio(pixelRatio);

      // Update camera aspect ratio
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      // Force a render to update view
      composer.setSize(width, height);

      // Force connection update
      needsUpdate.current = true;
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

      // Flag connections for update
      needsUpdate.current = true;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    // Initial setup
    handleResize();
    handleScroll();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);

      // Cancel animation frame
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }

      // Properly dispose of resources
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
  }, []);

  // Effect to update animation based on scroll
  useEffect(() => {
    if (renderRef.current) {
      // Request animation frame only when scroll changes
      needsUpdate.current = true;

      if (frameIdRef.current === null && renderRef.current) {
        frameIdRef.current = requestAnimationFrame(renderRef.current);
      }
    }
  }, [scroll.current]);

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
