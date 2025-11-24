import React, { useRef } from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { SpacetimeGrid } from './SpacetimeGrid';
import { CelestialBody } from './CelestialBody';
import '@/types';

interface SceneProps {
  warpIntensity: number;
  fluidity: number;
  bodyMass: number;
}

export const Scene: React.FC<SceneProps> = ({ warpIntensity, fluidity, bodyMass }) => {
  // We use a Ref to share the mutable position of the body between the physics component
  // and the grid visualizer without causing React re-renders on every frame.
  const bodyPositionRef = useRef(new THREE.Vector3(15, 0, 0));

  return (
    <>
      <color attach="background" args={['#020617']} />
      
      <ambientLight intensity={0.5} />
      
      {/* The main grid visualizer */}
      <SpacetimeGrid 
        warpIntensity={warpIntensity} 
        fluidity={fluidity} 
        bodyMass={bodyMass}
        bodyPositionRef={bodyPositionRef}
      />

      {/* The orbiting object with physics logic */}
      <CelestialBody 
        warpIntensity={warpIntensity} 
        bodyMass={bodyMass}
        positionRef={bodyPositionRef}
      />

      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minPolarAngle={Math.PI / 6} 
        maxPolarAngle={Math.PI / 1.5}
        minDistance={5}
        maxDistance={50}
        dampingFactor={0.05}
      />
    </>
  );
};