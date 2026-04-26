'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Bottle3D } from './Bottle3D';
import type { BottleInstance } from '@/lib/types';

interface WineFridge3DProps {
  bottles: BottleInstance[];
  onBottleClick: (bottle: BottleInstance) => void;
}

export function WineFridge3D({ bottles, onBottleClick }: WineFridge3DProps) {
  const getBottlePosition = (slotNumber: number): [number, number, number] => {
    const row = Math.floor((slotNumber - 1) / 4);
    const col = (slotNumber - 1) % 4;

    const x = (col - 1.5) * 0.8;
    const y = (2.5 - row) * 0.8;
    const z = 0;

    return [x, y, z];
  };

  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2}
        />

        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.3} />

        <Suspense fallback={null}>
          {bottles.map((bottle) => (
            <Bottle3D
              key={bottle.id}
              bottle={bottle}
              position={getBottlePosition(bottle.slot_position)}
              onClick={() => onBottleClick(bottle)}
            />
          ))}
        </Suspense>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.8} />
        </mesh>
      </Canvas>
    </div>
  );
}
