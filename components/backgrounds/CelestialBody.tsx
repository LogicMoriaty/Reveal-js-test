import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import '@/types';

interface CelestialBodyProps {
  warpIntensity: number; // The mass of the center
  bodyMass: number;      // The mass of this body
  positionRef: React.MutableRefObject<THREE.Vector3>; // Shared ref to communicate position to the grid
}

export const CelestialBody: React.FC<CelestialBodyProps> = ({ warpIntensity, bodyMass, positionRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Physics state
  // Start at a distance with some tangential velocity to create an orbit
  const [velocity] = useState(new THREE.Vector3(0.15, 0, 0.08)); 
  
  useFrame((state, delta) => {
    if (!meshRef.current || !positionRef.current) return;

    const pos = positionRef.current;
    
    // Calculate distance from center in the XZ plane
    const distSquared = pos.x * pos.x + pos.z * pos.z;
    const distToCenter = Math.sqrt(distSquared);
    
    // 1. Singularity Limit (Inner Boundary)
    // If it falls into the black hole (radius < 1), respawn it at the edge
    if (distToCenter < 1.0) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 22; // Spawn just inside the outer boundary
        pos.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        
        // Reset velocity to a stable orbit speed
        const speed = 0.2 + Math.random() * 0.1;
        velocity.set(-Math.sin(angle) * speed, 0, Math.cos(angle) * speed);
        
        // Update mesh immediately to prevent interpolation glitches
        meshRef.current.position.copy(pos);
        return;
    }

    // 2. Outer Boundary (Grid Edge Limit)
    // The grid is 50x50, so radius ~25. We clamp at 24 to keep it visible.
    const MAX_RADIUS = 24.0;
    if (distToCenter > MAX_RADIUS) {
        // Calculate normal vector pointing outwards
        const normalX = pos.x / distToCenter;
        const normalZ = pos.z / distToCenter;

        // Reflect velocity if moving outwards
        const dot = velocity.x * normalX + velocity.z * normalZ;
        if (dot > 0) {
            // v' = v - 2(v.n)n (Simple reflection)
            // We add a damping factor (0.6) to simulate energy loss on impact
            velocity.x = (velocity.x - 2 * dot * normalX) * 0.6;
            velocity.z = (velocity.z - 2 * dot * normalZ) * 0.6;
            
            // Push it slightly inwards to prevent sticking
            // Add a small nudging force towards center
            velocity.x -= normalX * 0.05;
            velocity.z -= normalZ * 0.05;
        }

        // Hard clamp position to boundary
        pos.x = normalX * MAX_RADIUS;
        pos.z = normalZ * MAX_RADIUS;
    }

    // 3. Gravity Physics
    // F = G * M / r^2 (simplified)
    // We add a small epsilon to distance to prevent division by zero logic, though handled by respawn above.
    const forceMagnitude = (warpIntensity * 0.08) / (distSquared + 0.1); 
    const forceX = -pos.x / distToCenter * forceMagnitude;
    const forceZ = -pos.z / distToCenter * forceMagnitude;

    // Apply Force to Velocity
    velocity.x += forceX;
    velocity.z += forceZ;

    // Apply Drag (simulating gravitational wave energy loss or friction)
    velocity.multiplyScalar(0.9995);

    // Update Position
    pos.x += velocity.x;
    pos.z += velocity.z;
    
    // Strict Plane Constraint (Y=0)
    pos.y = 0;

    // Sync React Ref and Mesh
    meshRef.current.position.copy(pos);
  });

  return (
    <mesh ref={meshRef} position={[15, 0, 0]}>
      <sphereGeometry args={[0.4 + bodyMass * 0.1, 32, 32]} />
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#a7f3d0" // Emerald-ish glow
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
      />
      <pointLight distance={8} intensity={3} color="#a7f3d0" decay={2} />
    </mesh>
  );
};