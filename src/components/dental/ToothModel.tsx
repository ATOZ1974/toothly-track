import { useRef, useState } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { ToothStatus } from '@/types/dental';

interface ToothModelProps {
  toothNumber: number;
  position: [number, number, number];
  isSelected: boolean;
  state?: ToothStatus;
  onClick: (tooth: number) => void;
}

export function ToothModel({ 
  toothNumber, 
  position, 
  isSelected, 
  state = 'healthy',
  onClick 
}: ToothModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const getColor = () => {
    if (state === 'missing') return '#6b7280';
    if (state === 'problem') return '#eab308';
    if (state === 'treated') return '#3b82f6';
    return '#22c55e';
  };

  const scale = isSelected ? 1.3 : hovered ? 1.15 : 1;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={[scale, scale, scale]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(toothNumber);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Tooth Crown */}
        <boxGeometry args={[0.6, 1, 0.6]} />
        <meshStandardMaterial 
          color={getColor()} 
          roughness={0.3}
          metalness={0.1}
          emissive={isSelected ? getColor() : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>

      {/* Tooth Root */}
      {state !== 'missing' && (
        <mesh position={[0, -0.8, 0]} scale={[scale, scale, scale]}>
          <coneGeometry args={[0.3, 0.6, 8]} />
          <meshStandardMaterial 
            color="#f5f5f5" 
            roughness={0.5}
          />
        </mesh>
      )}

      {/* Tooth Number Label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color={isSelected ? '#3b82f6' : '#64748b'}
        anchorX="center"
        anchorY="middle"
      >
        {toothNumber}
      </Text>
    </group>
  );
}
