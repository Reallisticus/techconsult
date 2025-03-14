// src/components/utils/HeroBackground.tsx
"use client";

import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { usePerformance, PerformanceLevel } from "~/lib/perf";

export const HeroBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  // Get performance settings
  const { level, pixelRatio, quality3D } = usePerformance();

  // Define particles count based on performance level
  const particleCounts = useMemo(
    () => ({
      low: 50,
      medium: 100,
      high: 150,
    }),
    [],
  );

  // Seeded random generator for deterministic values
  const seededRandom = (seed: number) => {
    let state = seed;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  };

  // Initialize the 3D scene with memory management
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a robust PRNG
    const seed = Date.now();
    const randomizer = seededRandom(seed);

    // Enhanced color palette
    const colorPalette = {
      primary: [
        new THREE.Color("#2563EB").convertSRGBToLinear(), // Royal blue
        new THREE.Color("#60A5FA").convertSRGBToLinear(), // Light blue
      ],
      accent: [
        new THREE.Color("#7C3AED").convertSRGBToLinear(), // Violet
        new THREE.Color("#A78BFA").convertSRGBToLinear(), // Light violet
      ],
      secondary: [
        new THREE.Color("#059669").convertSRGBToLinear(), // Emerald
        new THREE.Color("#34D399").convertSRGBToLinear(), // Light emerald
      ],
    };

    // Get random color from our palette
    const getRandomColor = () => {
      const palettes = [
        colorPalette.primary,
        colorPalette.accent,
        colorPalette.secondary,
      ];
      const selectedPalette =
        palettes[Math.floor(randomizer() * palettes.length)]!;
      const colorIndex = Math.floor(randomizer() * selectedPalette.length);
      return selectedPalette[colorIndex]!;
    };

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera with good defaults
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 50;

    // Configure renderer based on performance level
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: level !== "low",
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });

    // Set appropriate pixel ratio based on performance
    renderer.setPixelRatio(pixelRatio ?? window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Enable shadows only for higher performance levels
    if (level !== "low") {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    rendererRef.current = renderer;

    // Post-processing setup with performance tiering
    const createPostProcessing = () => {
      if (!renderer) return null;

      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      // Add bloom pass only for medium and high performance
      if (level !== "low") {
        // Configure bloom based on performance level
        const bloomStrength = level === "high" ? 0.4 : 0.2;
        const bloomRadius = level === "high" ? 0.7 : 0.4;
        const resolution = new THREE.Vector2(
          window.innerWidth * (pixelRatio ?? window.devicePixelRatio),
          window.innerHeight * (pixelRatio ?? window.devicePixelRatio),
        );

        const bloomPass = new UnrealBloomPass(
          resolution,
          bloomStrength,
          bloomRadius,
          0.1,
        );
        composer.addPass(bloomPass);
      }

      return composer;
    };

    const composer = createPostProcessing();
    composerRef.current = composer;

    // Lighting with performance tiering
    scene.add(new THREE.AmbientLight(0x111122, level === "low" ? 0.3 : 0.5));

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);

    // Enable shadows only on higher performance levels
    if (level !== "low") {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = level === "high" ? 1024 : 512;
      directionalLight.shadow.mapSize.height = level === "high" ? 1024 : 512;
    }

    scene.add(directionalLight);

    // Accent lights for visual interest
    const purpleLight = new THREE.PointLight(0x7c3aed, 1, 100);
    purpleLight.position.set(-15, 10, 10);
    scene.add(purpleLight);

    const greenLight = new THREE.PointLight(0x34d399, 1, 100);
    greenLight.position.set(15, -10, 10);
    scene.add(greenLight);

    // Group to hold all generated elements
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Generate positions for nodes with good distribution
    const positions: THREE.Vector3[] = [];
    const particleCount = particleCounts[level];
    const minDistance = 7; // Minimum distance between particles

    // Generate properly distributed positions
    for (let i = 0; i < particleCount; i++) {
      let position: THREE.Vector3;
      let attempts = 0;
      const maxAttempts = 50;

      // Try to find a non-overlapping position
      do {
        // Spherical distribution for better visual balance
        const radius = 30 + randomizer() * 10;
        const theta = randomizer() * Math.PI * 2;
        const phi = Math.acos(2 * randomizer() - 1);

        position = new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta) - 5,
          radius * Math.cos(phi) * 0.5,
        );

        attempts++;

        // Break loop if we've tried too many times
        if (attempts > maxAttempts) break;

        // Check distance from all existing particles
      } while (positions.some((p) => p.distanceTo(position!) < minDistance));

      positions.push(position!);
    }

    // Create node geometries
    const nodeGeometry = new THREE.SphereGeometry(
      0.8,
      level === "low" ? 8 : level === "medium" ? 16 : 24,
      level === "low" ? 8 : level === "medium" ? 16 : 24,
    );

    // Create node materials with performance-based detail
    const nodeMaterials = [
      new THREE.MeshPhysicalMaterial({
        color: 0x2563eb,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x2563eb,
        emissiveIntensity: 0.2,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x7c3aed,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.2,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x059669,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x059669,
        emissiveIntensity: 0.2,
      }),
    ];

    // Create nodes and add to group
    const nodes: THREE.Mesh[] = positions.map((position, i) => {
      const materialIndex = i % nodeMaterials.length;
      const node = new THREE.Mesh(
        nodeGeometry,
        nodeMaterials[materialIndex]!.clone(),
      );
      node.position.copy(position);
      node.userData = {
        originalPosition: position.clone(),
        pulsatePhase: randomizer() * Math.PI * 2,
        pulsateSpeed: 0.5 + randomizer() * 0.5,
        rotateSpeed: 0.2 + randomizer() * 0.3,
      };

      // Only enable shadows on higher performance settings
      if (level !== "low") {
        node.castShadow = true;
        node.receiveShadow = true;
      }

      group.add(node);
      return node;
    });

    // Connection network - with density based on performance level
    const maxConnections = level === "low" ? 2 : level === "medium" ? 3 : 4;
    const connectionDistance = level === "low" ? 15 : 20;

    // Track connections to prevent duplicates
    const connections: Set<string> = new Set();
    const linesMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });

    // Create connection positions and colors
    const linePositions: number[] = [];
    const lineColors: number[] = [];

    // Connect nearby nodes
    positions.forEach((p1, i) => {
      // Find nearby nodes
      const nearbyNodes = positions
        .map((p2, j) => ({ index: j, distance: p1.distanceTo(p2) }))
        .filter(
          ({ index, distance }) =>
            index !== i &&
            distance < connectionDistance &&
            !connections.has(`${Math.min(i, index)}-${Math.max(i, index)}`),
        )
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxConnections);

      // Create connections
      nearbyNodes.forEach(({ index }) => {
        const p2 = positions[index]!;
        const connectionKey = `${Math.min(i, index)}-${Math.max(i, index)}`;

        // Skip if already connected
        if (connections.has(connectionKey)) return;
        connections.add(connectionKey);

        // Add line positions
        linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);

        // Create gradient colors based on node materials
        const startMaterial = nodeMaterials[i % nodeMaterials.length]!;
        const endMaterial = nodeMaterials[index % nodeMaterials.length]!;

        // Extract color components
        const startColor = startMaterial.color.clone();
        const endColor = endMaterial.color.clone();

        // Set colors
        lineColors.push(
          startColor.r,
          startColor.g,
          startColor.b,
          endColor.r,
          endColor.g,
          endColor.b,
        );
      });
    });

    // Create lines geometry
    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3),
    );
    linesGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(lineColors, 3),
    );

    // Create lines mesh and add to group
    const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
    group.add(lines);

    // Animation flow particles - only for medium/high performance
    if (level !== "low") {
      const particleCount = connections.size;
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleSizes = new Float32Array(particleCount);
      const particleColors = new Float32Array(particleCount * 3);

      // Initialize particles at random positions along each line
      let particleIndex = 0;

      // Extract line segments for particle paths
      const linePaths: Array<{
        start: THREE.Vector3;
        end: THREE.Vector3;
        color: THREE.Color;
      }> = [];

      for (let i = 0; i < linePositions.length; i += 6) {
        const startPos = new THREE.Vector3(
          linePositions[i]!,
          linePositions[i + 1]!,
          linePositions[i + 2]!,
        );

        const endPos = new THREE.Vector3(
          linePositions[i + 3]!,
          linePositions[i + 4]!,
          linePositions[i + 5]!,
        );

        const startColor = new THREE.Color(
          lineColors[i]!,
          lineColors[i + 1]!,
          lineColors[i + 2]!,
        );

        linePaths.push({
          start: startPos,
          end: endPos,
          color: startColor,
        });
      }

      // Create particles along paths
      linePaths.forEach((path, i) => {
        if (particleIndex >= particleCount) return;

        // Random progress along the line
        const progress = randomizer();

        // Interpolate position
        particlePositions[particleIndex * 3] =
          path.start.x + (path.end.x - path.start.x) * progress;
        particlePositions[particleIndex * 3 + 1] =
          path.start.y + (path.end.y - path.start.y) * progress;
        particlePositions[particleIndex * 3 + 2] =
          path.start.z + (path.end.z - path.start.z) * progress;

        // Set size based on performance level
        particleSizes[particleIndex] = level === "high" ? 2.0 : 1.5;

        // Set color
        particleColors[particleIndex * 3] = path.color.r;
        particleColors[particleIndex * 3 + 1] = path.color.g;
        particleColors[particleIndex * 3 + 2] = path.color.b;

        // Store path index for animation
        particleIndex++;
      });

      // Set attributes
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

      // Create particle shader material
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
        },
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

      // Create particles and add to group
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.userData = {
        linePaths,
        particlePositions,
      };
      group.add(particles);
    }

    // Animation loop with optimizations
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Limit updates for lower performance devices
      const updateFrequency = level === "low" ? 3 : level === "medium" ? 2 : 1;
      const shouldUpdate = Math.floor(elapsedTime * 60) % updateFrequency === 0;

      // Always rotate for smooth motion
      if (group) {
        // Rotate more slowly for better performance
        const speed = level === "low" ? 0.03 : level === "medium" ? 0.05 : 0.07;
        group.rotation.y = elapsedTime * speed;

        // Subtle tilting effect
        group.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05;
      }

      // Update nodes and particles only when needed
      if (shouldUpdate) {
        // Animate nodes
        nodes.forEach((node) => {
          const userData = node.userData;

          // Pulsating effect
          const pulseFactor = 0.05;
          const scale =
            1 +
            Math.sin(
              elapsedTime * userData.pulsateSpeed + userData.pulsatePhase,
            ) *
              pulseFactor;
          node.scale.set(scale, scale, scale);

          // Individual rotation
          node.rotation.x = elapsedTime * userData.rotateSpeed;
          node.rotation.y = elapsedTime * userData.rotateSpeed * 0.7;
        });

        // Animate particles - only for medium/high
        if (level !== "low") {
          const particles = group.children.find(
            (child) => child instanceof THREE.Points,
          ) as THREE.Points;

          if (particles) {
            const { linePaths, particlePositions } = particles.userData;
            const positions = particles.geometry.attributes.position!
              .array as Float32Array;

            // Animate positions along paths
            for (let i = 0; i < positions.length / 3; i++) {
              const pathIndex = i % linePaths.length;
              const path = linePaths[pathIndex]!;

              // Calculate progress based on time
              const speed = 0.2;
              const loopDuration = path.start.distanceTo(path.end) * 5; // Adjust speed based on distance
              const cycleTime = (elapsedTime * speed) % loopDuration;
              const progress = cycleTime / loopDuration;

              // Update position
              positions[i * 3] =
                path.start.x + (path.end.x - path.start.x) * progress;
              positions[i * 3 + 1] =
                path.start.y + (path.end.y - path.start.y) * progress;
              positions[i * 3 + 2] =
                path.start.z + (path.end.z - path.start.z) * progress;
            }

            // Mark attribute for update
            particles.geometry.attributes.position!.needsUpdate = true;

            // Update shader time uniform if available
            if ((particles.material as THREE.ShaderMaterial).uniforms?.time) {
              (
                particles.material as THREE.ShaderMaterial
              ).uniforms.time!.value = elapsedTime;
            }
          }
        }
      }

      // Render with composer if available, otherwise use renderer
      if (composer) {
        composer.render();
      } else if (renderer) {
        renderer.render(scene, camera);
      }

      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!renderer || !camera) return;

      // Update camera aspect ratio
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Update renderer size
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Update composer size if available
      if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    // Setup event listeners
    window.addEventListener("resize", handleResize);

    // Initial setup
    handleResize();

    // Cleanup function with proper resource disposal
    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Dispose of all Three.js resources
      if (scene) {
        scene.traverse((object) => {
          // Dispose geometries
          if (
            object instanceof THREE.Mesh ||
            object instanceof THREE.Line ||
            object instanceof THREE.Points
          ) {
            if (object.geometry) {
              object.geometry.dispose();
            }

            // Dispose materials
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else if (object.material) {
              object.material.dispose();
            }
          }
        });
      }

      // Dispose of effects composer
      if (composer) {
        composer.passes.forEach((pass) => {
          // @ts-ignore - dispose exists on passes
          if (pass.dispose) pass.dispose();
        });
      }

      // Dispose of renderer
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
    };
  }, [level, pixelRatio, quality3D, particleCounts]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[-1000] h-full w-full">
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

export default HeroBackground;
