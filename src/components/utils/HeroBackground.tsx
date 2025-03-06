// src/components/canvas/HeroBackground.tsx
import { useRef, useEffect } from "react";
import * as THREE from "three";

export const HeroBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create points
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 200;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Use our unified color palette
    const colorOptions = [
      new THREE.Color("#7C3AED"), // accent-500 (violet)
      new THREE.Color("#A78BFA"), // accent-400 (lighter violet)
      new THREE.Color("#60A5FA"), // primary-400 (blue)
      new THREE.Color("#34D399"), // secondary-400 (green)
    ];

    for (let i = 0; i < count; i++) {
      // Distribute points in a spherical pattern
      const radius = 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) - 5; // Offset downward
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Random color from options
      const color =
        colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = color!.r;
      colors[i * 3 + 1] = color!.g;
      colors[i * 3 + 2] = color!.b;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3),
    );

    // Use built-in materials instead of custom shaders
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.3,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Add connections between points
    const linesGeometry = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    const lineColors: number[] = [];

    // Connect points that are close to each other
    const connectionDistance = 4;
    for (let i = 0; i < count; i++) {
      const p1 = new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
      );

      for (let j = i + 1; j < count; j++) {
        const p2 = new THREE.Vector3(
          positions[j * 3],
          positions[j * 3 + 1],
          positions[j * 3 + 2],
        );

        const distance = p1.distanceTo(p2);

        if (distance < connectionDistance) {
          // Line consists of two points
          linePositions.push(p1.x, p1.y, p1.z);
          linePositions.push(p2.x, p2.y, p2.z);

          // Use accent and secondary colors for lines (violet to green)
          const color = new THREE.Color("#7C3AED").lerp(
            new THREE.Color("#34D399"),
            Math.random(),
          );

          lineColors.push(color.r, color.g, color.b);
          lineColors.push(color.r, color.g, color.b);
        }
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

    const linesMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(lines);

    camera.position.z = 10;

    // Animation
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      particles.rotation.y = elapsedTime * 0.05;
      lines.rotation.y = elapsedTime * 0.05;

      particles.rotation.x = elapsedTime * 0.03;
      lines.rotation.x = elapsedTime * 0.03;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-10">
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Use primary color in the gradient overlay */}
      <div className="via-primary-900/30 pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />
    </div>
  );
};
