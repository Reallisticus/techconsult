"use client";
import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useTexture,
  shaderMaterial,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";

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

// Custom Earth shader material
const EarthMaterial = shaderMaterial(
  {
    earthMap: null,
    earthBump: null,
    outlineColor: new THREE.Color("#2563EB"), // Primary color
    oceanColor: new THREE.Color("#172554"), // Primary-950
    time: 0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform sampler2D earthMap;
    uniform sampler2D earthBump;
    uniform vec3 outlineColor;
    uniform vec3 oceanColor;
    uniform float time;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vec4 texColor = texture2D(earthMap, vUv);
      vec3 normal = normalize(vNormal);
      
      // Basic lighting
      float diffuse = max(0.0, dot(normal, vec3(1.0, 1.0, 1.0)));
      
      // Add grid pattern for country outlines
      vec2 grid = abs(fract(vUv * 20.0 - 0.5) - 0.5) / fwidth(vUv * 20.0);
      float line = min(grid.x, grid.y);
      float gridFactor = 1.0 - min(line, 1.0);
      
      // Mix continent color with grid lines
      vec3 color = mix(texColor.rgb, outlineColor, gridFactor * 0.3);
      
      // Oceans get a special color
      if (texColor.r < 0.1 && texColor.g < 0.1 && texColor.b < 0.1) {
        color = oceanColor;
      }
      
      // Apply lighting
      color *= 0.2 + diffuse * 0.8;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
);

// Register the custom shader
extend({ EarthMaterial });

// Add the type for the custom shader
declare global {
  namespace JSX {
    interface IntrinsicElements {
      earthMaterial: any;
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
  markerSize = 0.03, // Default marker size (relative to globe size)
  labelSize = 1, // Default label size scale (1 = 100%)
  highQuality = true,
}) => {
  // Calculate actual marker size - ensure it's a visible size
  // We apply a non-linear scaling to allow for very small values
  const effectiveMarkerSize = Math.max(0.001, Math.pow(markerSize, 0.5)) * size;
  const globeRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Mesh>(null);
  const earthMaterialRef = useRef<any>(null);
  const { viewport, gl, camera } = useThree();

  // Use reasonable defaults for mobile quality
  const quality = highQuality !== false ? true : false;
  const segmentCount = quality ? 64 : 32;

  // Load textures
  const [earthMap, earthBump] = useTexture([
    "/textures/earth-map.jpg",
    "/textures/bump-map.jpg",
  ]);

  // Set textures to repeat and proper filtering
  useEffect(() => {
    [earthMap, earthBump].forEach((texture) => {
      if (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
      }
    });
  }, [earthMap, earthBump]);

  // Convert marker position to 3D
  const markerPos = latLongToVector3(
    markerPosition[0],
    markerPosition[1],
    1.02 * size,
  );

  // State tracking for visibility of marker label
  const [markerVisibility, setMarkerVisibility] = React.useState(true);

  // Handle animations and check marker visibility
  useFrame((state, delta) => {
    // Update shader time uniform
    if (earthMaterialRef.current) {
      earthMaterialRef.current.time = state.clock.elapsedTime;
    }

    // Auto-rotate the globe
    if (autoRotate && globeRef.current) {
      globeRef.current.rotation.y -= delta * autoRotateSpeed * 0.2;
    }

    // Animate the marker
    if (markerRef.current) {
      markerRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.1,
      );

      // Check if marker is facing the camera
      // Get the normalized direction from camera to marker
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
      setMarkerVisibility(angle > 0);
    }
  });

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

  return (
    <>
      <OrbitControls
        enableZoom={enableZoom}
        enablePan={false}
        enableRotate={true}
        autoRotate={false} // We handle rotation ourselves
        minDistance={1.5 * size}
        maxDistance={4 * size}
        rotateSpeed={0.5}
        zoomSpeed={0.7}
        enableDamping
        dampingFactor={0.1}
      />

      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <directionalLight position={[5, 3, 5]} intensity={0.5} />

      <group
        ref={globeRef}
        rotation={[initialRotation[0], initialRotation[1], initialRotation[2]]}
      >
        {/* Earth base with custom shader */}
        <mesh>
          <sphereGeometry args={[1 * size, segmentCount, segmentCount]} />
          <earthMaterial
            ref={earthMaterialRef}
            earthMap={earthMap}
            earthBump={earthBump}
            outlineColor={new THREE.Color("#2563EB")}
            oceanColor={new THREE.Color("#172554")}
          />
        </mesh>

        {/* Atmosphere glow */}
        <mesh>
          <sphereGeometry args={[1.02 * size, 32, 32]} />
          <meshStandardMaterial
            color="#93C5FD" // Primary-300
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Sofia marker */}
        <mesh
          ref={markerRef}
          position={[markerPos.x, markerPos.y, markerPos.z]}
        >
          <sphereGeometry args={[effectiveMarkerSize, 16, 16]} />
          <meshStandardMaterial
            color="#7C3AED" // Accent-500
            emissive="#7C3AED"
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
                className="whitespace-nowrap rounded-full bg-accent-500 px-3 py-1 text-sm font-medium text-white"
                style={{
                  transform: `scale(${labelSize * 0.25})`,
                  transformOrigin: "center center",
                }}
              >
                {markerLabel}
              </div>
            </Html>
          )}
        </mesh>

        {/* Marker glow */}
        <mesh position={[markerPos.x, markerPos.y, markerPos.z]}>
          <sphereGeometry args={[effectiveMarkerSize * 1.33, 16, 16]} />
          <meshStandardMaterial
            color="#C4B5FD" // Accent-300
            transparent
            opacity={0.5}
            emissive="#7C3AED"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Connection line from marker to center */}
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
            color="#7C3AED" // Accent-500
            transparent
            opacity={0.4}
          />
        </line>
      </group>
    </>
  );
};

export default InteractiveGlobe;
