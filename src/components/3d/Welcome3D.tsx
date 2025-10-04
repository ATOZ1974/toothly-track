import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh } from 'three';

interface Welcome3DProps {
  userName: string;
}

export function Welcome3D({ userName }: Welcome3DProps) {
  const toothRef = useRef<Mesh>(null);
  const sparkles = useRef<Mesh[]>([]);

  useFrame((state) => {
    if (toothRef.current) {
      toothRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      toothRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }

    sparkles.current.forEach((sparkle, i) => {
      if (sparkle) {
        const time = state.clock.elapsedTime;
        sparkle.position.x = Math.cos(time + i * 2) * 2;
        sparkle.position.y = Math.sin(time * 1.5 + i * 2) * 1.5;
        sparkle.rotation.z = time * (i + 1);
        sparkle.scale.setScalar(0.3 + Math.sin(time * 2 + i) * 0.15);
      }
    });
  });

  return (
    <group>
      {/* Central Tooth */}
      <mesh ref={toothRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshStandardMaterial
          color="#f0f9ff"
          roughness={0.1}
          metalness={0.5}
          emissive="#3b82f6"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Sparkle particles */}
      {[...Array(6)].map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) sparkles.current[i] = el;
          }}
          position={[
            Math.cos(i * 1.5) * 2,
            Math.sin(i * 1.5) * 1.5,
            -1
          ]}
        >
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial
            color={`hsl(${200 + i * 30}, 80%, 60%)`}
            emissive={`hsl(${200 + i * 30}, 80%, 60%)`}
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Welcome Text */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.5}
        color="#3b82f6"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        Welcome Back!
      </Text>

      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color="#60a5fa"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {userName}
      </Text>

      {/* Lights */}
      <pointLight position={[3, 3, 3]} intensity={2} color="#60a5fa" />
      <pointLight position={[-3, 3, 3]} intensity={2} color="#3b82f6" />
      <ambientLight intensity={0.5} />
    </group>
  );
}
