'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh } from 'three';
import { getWineColor } from '@/lib/utils';
import type { BottleInstance } from '@/lib/types';

interface Bottle3DProps {
  bottle: BottleInstance;
  position: [number, number, number];
  onClick: () => void;
}

export function Bottle3D({ bottle, position, onClick }: Bottle3DProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const wine = bottle.wine;
  if (!wine) return null;

  const color = getWineColor(wine.type);

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.15, 0.3, 16]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>

      <Text
        position={[0, 0, 0.16]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.25}
      >
        {wine.winery}
      </Text>
    </group>
  );
}
