import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh } from 'three';

interface Button3DProps {
  position: [number, number, number];
  label: string;
  color?: string;
}

export function Button3D({ position, label, color = '#3b82f6' }: Button3DProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[2, 0.6, 0.3]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      <Text
        position={[position[0], position[1], position[2] + 0.2]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {label}
      </Text>
    </group>
  );
}
