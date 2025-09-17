import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

function FloatingGeometry({ position, geometry, color, rotationSpeed }: {
  position: [number, number, number];
  geometry: 'sphere' | 'box' | 'torus';
  color: string;
  rotationSpeed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Rotation
    meshRef.current.rotation.x += rotationSpeed;
    meshRef.current.rotation.y += rotationSpeed * 0.7;
    
    // Floating animation
    meshRef.current.position.y = initialY + Math.sin(state.clock.getElapsedTime() * 2 + position[0]) * 0.5;
  });

  const GeometryComponent = {
    sphere: Sphere,
    box: Box,
    torus: Torus,
  }[geometry];

  return (
    <GeometryComponent
      ref={meshRef}
      position={position}
      args={geometry === 'torus' ? [1, 0.4, 16, 100] : [1, 1, 1]}
    >
      <meshPhongMaterial 
        color={color} 
        transparent 
        opacity={0.4}
        wireframe={geometry === 'torus'}
      />
    </GeometryComponent>
  );
}

function BackgroundGradient() {
  const meshRef = useRef<THREE.Mesh>(null);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      vec3 color1 = vec3(0.15, 0.2, 0.4); // Deep blue
      vec3 color2 = vec3(0.05, 0.05, 0.2); // Dark purple
      vec3 color3 = vec3(0.1, 0.15, 0.3); // Medium blue
      
      float noise = sin(uv.x * 10.0 + time * 0.5) * sin(uv.y * 10.0 + time * 0.3) * 0.1;
      vec3 finalColor = mix(color1, color2, uv.y + noise);
      finalColor = mix(finalColor, color3, sin(time * 0.2) * 0.1 + 0.5);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0 },
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -10]} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function Scene3D() {
  return (
    <div className="scene-fixed">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <BackgroundGradient />
        
        {/* Ambient lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4A90E2" />
        
        {/* Floating geometries */}
        <FloatingGeometry
          position={[-4, 2, -2]}
          geometry="sphere"
          color="#4A90E2"
          rotationSpeed={0.005}
        />
        <FloatingGeometry
          position={[4, -1, -3]}
          geometry="box"
          color="#7B68EE"
          rotationSpeed={0.003}
        />
        <FloatingGeometry
          position={[0, 3, -4]}
          geometry="torus"
          color="#20B2AA"
          rotationSpeed={0.007}
        />
        <FloatingGeometry
          position={[-3, -2, -1]}
          geometry="sphere"
          color="#FF6B6B"
          rotationSpeed={0.004}
        />
        <FloatingGeometry
          position={[3, 1, -5]}
          geometry="box"
          color="#4ECDC4"
          rotationSpeed={0.006}
        />
        
        {/* Interactive controls (disabled for background) */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}