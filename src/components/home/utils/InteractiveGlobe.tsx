"use client";
import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useTexture,
  shaderMaterial,
  Html,
  useGLTF,
  useFBO,
} from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { gsap } from "gsap";

// Import MathUtils from THREE directly
const { lerp, damp } = THREE.MathUtils;

interface InteractiveGlobeProps {
  markerPosition?: [number, number]; // [latitude, longitude]
  markerLabel?: string;
  initialRotation?: [number, number, number];
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  size?: number;
  markerSize?: number; // Control marker size independently
  labelSize?: number; // Control label size independently
  highQuality?: boolean;
  enableAtmosphere?: boolean;
  enablePulse?: boolean;
  pulseColor?: string;
  atmosphereColor?: string;
  globeColor?: string;
  onMarkerClick?: () => void;
  enableInertia?: boolean;
}

// Convert latitude/longitude to 3D coordinates
const latLongToVector3 = (
  lat: number,
  lon: number,
  radius: number,
): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
};

// Enhanced Earth shader material with improved visuals and performance
const EnhancedEarthMaterial = shaderMaterial(
  {
    earthMap: null,
    earthBump: null,
    outlineColor: new THREE.Color("#2563EB"), // Primary color
    oceanColor: new THREE.Color("#172554"), // Primary-950
    continentColor: new THREE.Color("#2463EB"), // Primary color for continents
    glowIntensity: 0.25, // Glow intensity value that can be animated
    hoverPosition: new THREE.Vector3(0, 0, 0), // Position for hover effects
    hoverRadius: 0.0, // Radius of hover effect (0.0 to 0.3 range)
    time: 0, // Time uniform for animations
    interactionStrength: 0.0, // Strength of interaction effects (0.0 to 1.0)
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vFresnel;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      // Calculate fresnel effect for edge glow
      vec3 viewDir = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
      vFresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform sampler2D earthMap;
    uniform sampler2D earthBump;
    uniform vec3 outlineColor;
    uniform vec3 oceanColor;
    uniform vec3 continentColor;
    uniform float glowIntensity;
    uniform vec3 hoverPosition;
    uniform float hoverRadius;
    uniform float time;
    uniform float interactionStrength;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vFresnel;
    
    // Improved noise function for more natural terrain
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      vec4 texColor = texture2D(earthMap, vUv);
      vec3 normal = normalize(vNormal);
      
      // Improved lighting with ambient occlusion simulation
      float diffuse = max(0.15, dot(normal, normalize(vec3(1.0, 1.0, 1.0))));
      float ambientOcclusion = 0.8 + 0.2 * noise(vUv * 100.0);
      
      // Add improved grid pattern for country outlines
      vec2 grid = abs(fract(vUv * 20.0 - 0.5) - 0.5) / fwidth(vUv * 20.0);
      float line = min(grid.x, grid.y);
      float gridFactor = 1.0 - min(line, 1.0);
      
      // Dynamic interaction hover effect
      float distToHover = length(normalize(vPosition) - normalize(hoverPosition));
      float hoverEffect = smoothstep(hoverRadius + 0.2, hoverRadius, distToHover) * interactionStrength;
      
      // Global pulse wave effect
      float pulseWave = sin(time * 2.0 - length(vPosition) * 5.0) * 0.5 + 0.5;
      pulseWave = pow(pulseWave, 5.0) * 0.2 * interactionStrength;
      
      // Improved edge detection for more defined continent borders
      float edgeFactor = length(fwidth(texColor.rgb)) * 15.0;
      
      // Mix continent color with grid lines
      vec3 landColor = mix(texColor.rgb * continentColor, outlineColor, gridFactor * 0.3 + edgeFactor);
      
      // Enhanced ocean with depth variation and ripples
      vec3 enhancedOcean = oceanColor;
      if (texColor.r < 0.1 && texColor.g < 0.1 && texColor.b < 0.1) {
        float oceanDepth = noise(vUv * 30.0 + time * 0.01) * 0.1;
        float oceanRipples = sin(vUv.x * 100.0 + time + sin(vUv.y * 120.0 + time * 0.5)) * 0.02;
        enhancedOcean = oceanColor * (0.8 + oceanDepth + oceanRipples);
      }
      
      // Blend between land and ocean
      vec3 baseColor = texColor.r < 0.1 && texColor.g < 0.1 && texColor.b < 0.1 
          ? enhancedOcean
          : landColor;
      
      // Apply lighting and effects
      vec3 finalColor = baseColor * (diffuse * ambientOcclusion);
      
      // Add glow effects
      finalColor += outlineColor * hoverEffect * 0.5;
      finalColor += outlineColor * pulseWave;
      
      // Add fresnel edge glow
      finalColor += outlineColor * vFresnel * glowIntensity;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
);

// Register the custom shader
extend({ EnhancedEarthMaterial });

// Add the type for the custom shader
declare global {
  namespace JSX {
    interface IntrinsicElements {
      enhancedEarthMaterial: any;
    }
  }
}

// Enhanced Atmosphere material
const AtmosphereMaterial = shaderMaterial(
  {
    glowColor: new THREE.Color("#93C5FD"),
    time: 0,
    intensity: 1.0,
    glowFalloff: 4.0, // Controls the softness of the edge
  },
  // Vertex shader
  `
    varying vec3 vNormal;
    varying vec3 eyeVector;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      eyeVector = normalize(cameraPosition - worldPosition.xyz);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 glowColor;
    uniform float time;
    uniform float intensity;
    uniform float glowFalloff;
    
    varying vec3 vNormal;
    varying vec3 eyeVector;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      // Enhanced fresnel effect with softer falloff
      float fresnel = pow(1.0 - dot(eyeVector, vNormal), glowFalloff);
      
      // Add subtle movement and variation to the atmosphere
      float noise = (sin(vUv.x * 20.0 + time) + cos(vUv.y * 20.0 + time * 0.7)) * 0.05;
      
      // Add distance-based falloff for more natural looking edges
      float distanceFromCenter = length(vWorldPosition);
      float edgeFade = smoothstep(0.98, 1.0, distanceFromCenter);
      
      // Add vertical gradient for atmospheric effect
      float verticalGradient = 0.5 + 0.5 * vNormal.y;
      
      // Combine all effects
      float glowStrength = fresnel * (intensity + noise) * mix(0.7, 1.0, verticalGradient);
      vec3 finalColor = glowColor * glowStrength;
      
      // Smoother alpha falloff based on fresnel and edge distance
      float alpha = fresnel * mix(0.3, 0.8, smoothstep(0.0, 0.4, fresnel)) * (1.0 - edgeFade * 0.5);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
);

// Register the atmosphere shader
extend({ AtmosphereMaterial });

// Add the type for the atmosphere shader
declare global {
  namespace JSX {
    interface IntrinsicElements {
      atmosphereMaterial: any;
    }
  }
}

// Marker pulse material
const MarkerPulseMaterial = shaderMaterial(
  {
    color: new THREE.Color("#7C3AED"),
    time: 0,
    intensity: 1.0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 color;
    uniform float time;
    uniform float intensity;
    
    varying vec2 vUv;
    
    void main() {
      float dist = length(vUv - vec2(0.5, 0.5));
      float pulse = sin(time * 3.0) * 0.5 + 0.5;
      float circle = smoothstep(0.5, 0.0, dist);
      float alpha = circle * (1.0 - dist * 2.0) * intensity * (0.7 + pulse * 0.3);
      gl_FragColor = vec4(color, alpha);
    }
  `,
);

// Register the marker pulse shader
extend({ MarkerPulseMaterial });

// Add the type for the marker pulse shader
declare global {
  namespace JSX {
    interface IntrinsicElements {
      markerPulseMaterial: any;
    }
  }
}

export const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({
  markerPosition = [42.6977, 23.3219], // Sofia, Bulgaria
  markerLabel = "Sofia",
  initialRotation = [0, 0, 0.1],
  autoRotate = true,
  autoRotateSpeed = 0.9,
  enableZoom = true,
  size = 1,
  markerSize = 0.03, // Default marker size
  labelSize = 1, // Default label size scale
  highQuality = true,
  enableAtmosphere = true,
  enablePulse = true,
  pulseColor = "#7C3AED",
  atmosphereColor = "#93C5FD",
  globeColor = "#2563EB",
  onMarkerClick,
  enableInertia = true,
}) => {
  // Calculate actual marker size
  const effectiveMarkerSize = Math.max(0.001, Math.pow(markerSize, 0.5)) * size;

  // Refs
  const globeRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Mesh>(null);
  const pulseMeshRef = useRef<THREE.Mesh>(null);
  const earthMaterialRef = useRef<any>(null);
  const atmosphereMaterialRef = useRef<any>(null);
  const markerPulseMaterialRef = useRef<any>(null);
  const orbitControlsRef = useRef<any>(null);

  // State for interactions and animations
  const [isHoveringMarker, setIsHoveringMarker] = useState(false);
  const [isGlobeRotating, setIsGlobeRotating] = useState(false);
  const [targetRotation, setTargetRotation] =
    useState<[number, number, number]>(initialRotation);
  const [interactionStrength, setInteractionStrength] = useState(0);
  const { viewport, gl, camera, raycaster, mouse, scene } = useThree();

  // Access scene pointer to determine if user is interacting
  const isPointerDown = useRef(false);
  const lastPointerPosition = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const rotationTarget = useRef({
    x: initialRotation[1],
    y: initialRotation[0],
  });
  const rotationCurrent = useRef({
    x: initialRotation[1],
    y: initialRotation[0],
  });

  // Use reasonable defaults for mobile quality
  const quality = useMemo(() => highQuality !== false, [highQuality]);
  const segmentCount = useMemo(() => (quality ? 64 : 32), [quality]);

  // Hover position for shader effects
  const hoverPositionRef = useRef(new THREE.Vector3(0, 0, 0));

  // Marker position in 3D space
  const markerPos = useMemo(
    () => latLongToVector3(markerPosition[0], markerPosition[1], 1.02 * size),
    [markerPosition, size],
  );

  // Load textures
  const [earthMap, earthBump] = useTexture([
    "/textures/earth-map.jpg",
    "/textures/bump-map.jpg",
  ]);

  // Set textures properties
  useEffect(() => {
    [earthMap, earthBump].forEach((texture) => {
      if (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = gl.capabilities.getMaxAnisotropy();
      }
    });
  }, [earthMap, earthBump, gl]);

  // State tracking for visibility of marker label
  const [markerVisibility, setMarkerVisibility] = useState(true);

  // Animation timeline for interactions
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Initialize interaction animations
  useEffect(() => {
    timelineRef.current = gsap.timeline({ paused: true });

    timelineRef.current
      .to(
        { interactionValue: 0 },
        {
          interactionValue: 1,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: function (this: any) {
            setInteractionStrength(this.targets()[0].interactionValue);
          },
        },
      )
      .to({}, { duration: 0.5 }) // Hold at peak value
      .to(
        { interactionValue: 1 },
        {
          interactionValue: 0,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: function (this: any) {
            setInteractionStrength(this.targets()[0].interactionValue);
          },
        },
      );

    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  // Setup pointer event listeners for smoother interactions
  useEffect(() => {
    const handlePointerDown = () => {
      isPointerDown.current = true;
      // Play interaction animation
      if (timelineRef.current) {
        timelineRef.current.play(0);
      }
    };

    const handlePointerUp = () => {
      isPointerDown.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isPointerDown.current) {
        const { movementX, movementY } = e;

        // Calculate rotation velocity based on mouse movement
        if (enableInertia) {
          rotationVelocity.current.x += movementX * 0.001;
          rotationVelocity.current.y += movementY * 0.001;
        }

        // Update last pointer position
        lastPointerPosition.current.x = e.clientX;
        lastPointerPosition.current.y = e.clientY;
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [enableInertia]);

  // Setup raycasting for hover effects
  const handleGlobeHover = useCallback(() => {
    if (!globeRef.current || !raycaster) return;

    // Update raycaster with current mouse position
    raycaster.setFromCamera(mouse, camera);

    // Find intersections with the globe
    const globeMesh = globeRef.current.children.find(
      (child) =>
        child instanceof THREE.Mesh &&
        child.geometry instanceof THREE.SphereGeometry,
    ) as THREE.Mesh;

    if (globeMesh) {
      const intersects = raycaster.intersectObject(globeMesh);

      if (intersects.length > 0) {
        // Update hover position for shader effects
        hoverPositionRef.current.copy(intersects[0]!.point);

        if (earthMaterialRef.current) {
          earthMaterialRef.current.hoverPosition = hoverPositionRef.current;
          earthMaterialRef.current.hoverRadius = 0.1; // Set hover radius
        }
      } else {
        // Reset hover radius when not hovering
        if (earthMaterialRef.current) {
          earthMaterialRef.current.hoverRadius = 0.0;
        }
      }
    }
  }, [raycaster, camera, mouse]);

  // Handle marker interactions
  const handleMarkerInteraction = useCallback(() => {
    if (!markerRef.current || !raycaster) return false;

    // Update raycaster with current mouse position
    raycaster.setFromCamera(mouse, camera);

    // Find intersections with the marker
    const intersects = raycaster.intersectObject(markerRef.current);

    // Check if marker is being hovered
    const isHovering = intersects.length > 0;

    // Update marker hover state
    if (isHovering !== isHoveringMarker) {
      setIsHoveringMarker(isHovering);

      // Animate marker on hover
      if (isHovering) {
        gsap.to(markerRef.current.scale, {
          x: 1.3,
          y: 1.3,
          z: 1.3,
          duration: 0.3,
          ease: "back.out(1.7)",
        });
      } else {
        gsap.to(markerRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }

    return isHovering;
  }, [isHoveringMarker, raycaster, camera, mouse]);

  // Handle camera position adjustments for better viewing
  useEffect(() => {
    if (!camera) return;

    // Set ideal camera position based on globe size
    camera.position.z = 2.5 * size;
    camera.position.y = 0.5 * size;

    // Update camera when size changes
    const handleResize = () => {
      camera.position.z = 2.5 * size;
      camera.position.y = 0.5 * size;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [camera, size]);

  // Main animation loop
  useFrame((state, delta) => {
    // Skip animation if less than 16ms has passed (targeting 60fps)
    if (delta > 0.1) return; // Limit delta for stability on low FPS

    // Update shader time uniform
    if (earthMaterialRef.current) {
      earthMaterialRef.current.time = state.clock.elapsedTime;
      earthMaterialRef.current.interactionStrength = interactionStrength;
      earthMaterialRef.current.glowIntensity = 0.25 + interactionStrength * 0.5;
    }

    // Update atmosphere material parameters
    if (atmosphereMaterialRef.current) {
      atmosphereMaterialRef.current.time = state.clock.elapsedTime;
      atmosphereMaterialRef.current.intensity = 0.8 + interactionStrength * 0.5;
      // Dynamically adjust glow falloff for better edge smoothness
      atmosphereMaterialRef.current.glowFalloff =
        3.5 + Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }

    if (markerPulseMaterialRef.current) {
      markerPulseMaterialRef.current.time = state.clock.elapsedTime;
      markerPulseMaterialRef.current.intensity =
        0.8 + interactionStrength * 0.5;
    }

    // Apply smooth camera zoom with strong damping to prevent twitching
    if (camera && enableZoom) {
      // Use three's damp function for smoother transitions
      const smoothZoom = damp(
        camera.position.z,
        targetZoom.current,
        5, // Higher damping factor for stability
        delta,
      );

      // Only update if the change is significant to prevent micro-jitters
      if (Math.abs(camera.position.z - smoothZoom) > 0.001) {
        camera.position.z = smoothZoom;
      }
    }

    // Advanced inertia-based rotation
    if (enableInertia && globeRef.current) {
      // Apply friction to rotation velocity
      rotationVelocity.current.x *= 0.95;
      rotationVelocity.current.y *= 0.95;

      // Add rotation velocity to target
      if (!isPointerDown.current) {
        rotationTarget.current.x += rotationVelocity.current.x;
        rotationTarget.current.y += rotationVelocity.current.y;
      }

      // Auto-rotate when not interacting and velocity is very low
      const velocityMagnitude =
        Math.abs(rotationVelocity.current.x) +
        Math.abs(rotationVelocity.current.y);
      if (autoRotate && !isPointerDown.current && velocityMagnitude < 0.001) {
        rotationTarget.current.x -= delta * autoRotateSpeed * 0.2;
      }

      // Smooth damping for rotation
      rotationCurrent.current.x = damp(
        rotationCurrent.current.x,
        rotationTarget.current.x,
        4,
        delta,
      );

      rotationCurrent.current.y = damp(
        rotationCurrent.current.y,
        rotationTarget.current.y,
        4,
        delta,
      );

      // Apply rotation to globe
      globeRef.current.rotation.y = rotationCurrent.current.x;
      globeRef.current.rotation.x = rotationCurrent.current.y;
    }
    // Fallback simple rotation mode
    else if (autoRotate && globeRef.current && !isPointerDown.current) {
      globeRef.current.rotation.y -= delta * autoRotateSpeed * 0.2;
    }

    // Run hover detection every frame
    handleGlobeHover();
    handleMarkerInteraction();

    // Animate the marker
    if (markerRef.current) {
      // Smoother marker scale animation when no interaction
      if (!isHoveringMarker) {
        const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        markerRef.current.scale.setScalar(pulseScale);
      }

      // Check if marker is facing the camera for visibility
      const markerPosition = markerRef.current.getWorldPosition(
        new THREE.Vector3(),
      );
      const cameraPosition = camera.position.clone();
      const dirToCamera = cameraPosition.sub(markerPosition).normalize();

      // Get the normal of the globe surface at marker position
      const markerNormal = markerPosition.clone().normalize();

      // Calculate angle between normal and camera direction
      const angle = markerNormal.dot(dirToCamera);

      // If angle is positive, marker is facing the camera
      const isNowVisible = angle > 0;

      // Only update visibility state when it changes to minimize renders
      if (isNowVisible !== markerVisibility) {
        setMarkerVisibility(isNowVisible);
      }
    }

    // Update marker pulse size
    if (pulseMeshRef.current && enablePulse) {
      const pulseSize = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      pulseMeshRef.current.scale.setScalar(pulseSize);
    }
  });

  // Custom zoom state for smoother control
  const [zoomLevel, setZoomLevel] = useState(2.5 * size);
  const targetZoom = useRef(2.5 * size);
  const zoomVelocity = useRef(0);
  const lastZoomDirection = useRef(0);
  const zoomCooldown = useRef(false);

  // Handle orbiting controls configuration
  useEffect(() => {
    if (!orbitControlsRef.current) return;

    // Configure controls for smoother interaction
    orbitControlsRef.current.enableDamping = true;
    orbitControlsRef.current.dampingFactor = 0.08; // Reduced for smoother feel
    orbitControlsRef.current.rotateSpeed = 0.5;

    // Disable the built-in zoom to use our custom implementation
    orbitControlsRef.current.enableZoom = false;
    orbitControlsRef.current.minDistance = 1.5 * size;
    orbitControlsRef.current.maxDistance = 4 * size;

    // Configure input behavior
    orbitControlsRef.current.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };

    // Add event listeners for detecting user interaction
    const controls = orbitControlsRef.current;

    const handleControlStart = () => setIsGlobeRotating(true);
    const handleControlEnd = () => setIsGlobeRotating(false);

    // Add custom wheel handler for smooth zooming
    const handleWheel = (e: WheelEvent) => {
      // Prevent default to avoid page scroll
      e.preventDefault();
      e.stopPropagation();

      // Determine zoom direction with a larger threshold to prevent accidental direction changes
      const direction = Math.sign(e.deltaY);

      // Check if we're changing direction
      const isDirectionChange =
        lastZoomDirection.current !== 0 &&
        direction !== 0 &&
        direction !== lastZoomDirection.current;

      // If changing direction, add a cooldown to prevent twitching
      if (isDirectionChange && !zoomCooldown.current) {
        zoomCooldown.current = true;
        zoomVelocity.current = 0;

        // Reset cooldown after a short delay
        setTimeout(() => {
          zoomCooldown.current = false;
        }, 300);

        return;
      }

      // Skip if we're in cooldown
      if (zoomCooldown.current) return;

      // Update last direction
      if (direction !== 0) {
        lastZoomDirection.current = direction;
      }

      // Calculate zoom amount with non-linear scaling for better control
      // Use a smaller factor for more precise control
      const zoomFactor = 0.05 * size;

      // Use delta mode to determine the appropriate scaling factor
      const delta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;

      // Add to target with clamping to min/max distances
      const newTarget = Math.max(
        1.5 * size,
        Math.min(4 * size, targetZoom.current + delta * zoomFactor * 0.02),
      );

      targetZoom.current = newTarget;
    };

    // Add custom wheel handler directly
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }

    controls.addEventListener("start", handleControlStart);
    controls.addEventListener("end", handleControlEnd);

    return () => {
      controls.removeEventListener("start", handleControlStart);
      controls.removeEventListener("end", handleControlEnd);

      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, [size]);

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (globeRef.current) {
        // Adjust size based on viewport
        const scale = Math.min(1, viewport.width / 10);
        globeRef.current.scale.setScalar(scale * size);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [viewport.width, size]);

  // Performance optimization
  useEffect(() => {
    // Safe check for browser environment
    if (typeof window === "undefined") return;

    // Check if running on a mobile device
    const isMobile = window.innerWidth < 768;

    // Adjust pixelRatio for performance on mobile
    if (isMobile) {
      const originalPixelRatio = gl.getPixelRatio();
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      return () => {
        gl.setPixelRatio(originalPixelRatio);
      };
    }
  }, [gl]);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      // Dispose of textures
      [earthMap, earthBump].forEach((texture) => {
        if (texture) texture.dispose();
      });
    };
  }, [earthMap, earthBump]);

  // Handle marker click
  const handleClick = useCallback(() => {
    if (isHoveringMarker && onMarkerClick) {
      onMarkerClick();

      // Animate marker on click
      if (markerRef.current) {
        gsap.to(markerRef.current.scale, {
          keyframes: [
            { x: 1.5, y: 1.5, z: 1.5, duration: 0.15 },
            { x: 1, y: 1, z: 1, duration: 0.2 },
          ],
          ease: "power2.out",
        });
      }

      // Play interaction animation
      if (timelineRef.current) {
        timelineRef.current.play(0);
      }
    }
  }, [isHoveringMarker, onMarkerClick]);

  useEffect(() => {
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  return (
    <>
      <OrbitControls
        ref={orbitControlsRef}
        enableZoom={false} // We handle zoom ourselves with smooth damping
        enablePan={false}
        enableRotate={true}
        autoRotate={false} // We handle rotation ourselves
        minDistance={1.5 * size}
        maxDistance={4 * size}
      />

      {/* Custom clip space to prevent object clipping */}
      <group>
        {/* Scene lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <directionalLight position={[5, 3, 5]} intensity={0.5} />

        <group
          ref={globeRef}
          rotation={[
            initialRotation[0],
            initialRotation[1],
            initialRotation[2],
          ]}
          onClick={handleClick}
        >
          {/* Earth base with enhanced shader */}
          <mesh>
            <sphereGeometry args={[1 * size, segmentCount, segmentCount]} />
            <enhancedEarthMaterial
              ref={earthMaterialRef}
              earthMap={earthMap}
              earthBump={earthBump}
              outlineColor={new THREE.Color(globeColor)}
              oceanColor={new THREE.Color("#172554")}
              continentColor={new THREE.Color(globeColor)}
              hoverPosition={new THREE.Vector3(0, 0, 0)}
              hoverRadius={0.0}
              glowIntensity={0.25}
              interactionStrength={0}
            />
          </mesh>

          {/* Dynamic atmosphere glow */}
          {enableAtmosphere && (
            <>
              {/* Inner atmosphere layer */}
              <mesh>
                <sphereGeometry args={[1.02 * size, 48, 48]} />
                <atmosphereMaterial
                  ref={atmosphereMaterialRef}
                  glowColor={new THREE.Color(atmosphereColor)}
                  glowFalloff={4.0}
                  transparent
                  depthWrite={false}
                  side={THREE.BackSide}
                />
              </mesh>

              {/* Outer atmosphere layer for softer edge */}
              <mesh>
                <sphereGeometry args={[1.2 * size, 32, 32]} />
                <meshStandardMaterial
                  color={atmosphereColor}
                  transparent
                  opacity={0.03}
                  side={THREE.BackSide}
                  depthWrite={false}
                />
              </mesh>
            </>
          )}

          {/* Marker with improved interactivity */}
          <mesh
            ref={markerRef}
            position={[markerPos.x, markerPos.y, markerPos.z]}
          >
            <sphereGeometry args={[effectiveMarkerSize, 16, 16]} />
            <meshStandardMaterial
              color={pulseColor}
              emissive={pulseColor}
              emissiveIntensity={1}
            />

            {/* 3D HTML label that follows the marker */}
            {markerVisibility && (
              <Html
                position={[0, effectiveMarkerSize * 2, 0]}
                center
                distanceFactor={10}
                occlude={[]}
                zIndexRange={[100, 0]}
                sprite
              >
                <div
                  className="whitespace-nowrap rounded-full bg-accent-500 px-3 py-1 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:bg-accent-600"
                  style={{
                    transform: `scale(${labelSize * 0.25})`,
                    transformOrigin: "center center",
                    opacity: isHoveringMarker ? 1 : 0.8,
                  }}
                >
                  {markerLabel}
                </div>
              </Html>
            )}
          </mesh>

          {/* Enhanced marker pulse glow */}
          {enablePulse && (
            <mesh
              ref={pulseMeshRef}
              position={[markerPos.x, markerPos.y, markerPos.z]}
            >
              <planeGeometry
                args={[effectiveMarkerSize * 4, effectiveMarkerSize * 4]}
              />
              <markerPulseMaterial
                ref={markerPulseMaterialRef}
                color={new THREE.Color(pulseColor)}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Marker glow */}
          <mesh position={[markerPos.x, markerPos.y, markerPos.z]}>
            <sphereGeometry args={[effectiveMarkerSize * 1.33, 16, 16]} />
            <meshStandardMaterial
              color="#C4B5FD" // Accent-300
              transparent
              opacity={0.5}
              emissive={pulseColor}
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Enhanced connection line from marker to center */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([
                    0,
                    0,
                    0,
                    markerPos.x,
                    markerPos.y,
                    markerPos.z,
                  ]),
                  3, // itemSize
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={pulseColor}
              transparent
              opacity={0.4 + interactionStrength * 0.3}
              linewidth={1}
            />
          </line>
        </group>
      </group>
    </>
  );
};

export default InteractiveGlobe;
