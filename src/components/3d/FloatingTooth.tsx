import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function FloatingTooth() {
  const toothRef = useRef<Mesh>(null);
  const rootRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (toothRef.current) {
      toothRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      toothRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
    }
    if (rootRef.current) {
      rootRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      rootRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.2 - 0.8;
    }
  });

  return (
    <group>
      {/* Tooth Crown */}
      <mesh ref={toothRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 1.8, 1.2]} />
        <meshStandardMaterial 
          color="#f0f9ff" 
          roughness={0.2}
          metalness={0.3}
          emissive="#3b82f6"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Tooth Root */}
      <mesh ref={rootRef} position={[0, -0.8, 0]}>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshStandardMaterial 
          color="#e0f2fe" 
          roughness={0.3}
          metalness={0.2}
          emissive="#3b82f6"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Shine effect */}
      <pointLight position={[2, 2, 2]} intensity={1} color="#60a5fa" />
    </group>
  );
}
