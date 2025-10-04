import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function AnimatedBackground() {
  const spheres = useRef<Mesh[]>([]);

  useFrame((state) => {
    spheres.current.forEach((sphere, i) => {
      if (sphere) {
        const time = state.clock.elapsedTime;
        sphere.position.y = Math.sin(time * 0.5 + i * 0.5) * 2;
        sphere.position.x = Math.cos(time * 0.3 + i * 0.7) * 3;
        sphere.rotation.x = time * 0.2;
        sphere.rotation.y = time * 0.3;
        sphere.scale.setScalar(0.5 + Math.sin(time + i) * 0.2);
      }
    });
  });

  return (
    <group>
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) spheres.current[i] = el;
          }}
          position={[
            Math.cos(i * 1.5) * 3,
            Math.sin(i * 1.5) * 2,
            -5 - i * 0.5
          ]}
        >
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={`hsl(${200 + i * 20}, 70%, 60%)`}
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      ))}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#60a5fa" />
    </group>
  );
}
