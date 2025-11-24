import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import '@/types';

// Vertex Shader: Handles the displacement (Z-axis) based on gravity wells
const vertexShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uFluidity;
  
  // New uniforms for the moving body
  uniform vec2 uBodyPosition;
  uniform float uBodyMass;

  varying float vElevation;

  void main() {
    vec3 pos = position;

    // 1. Central Singularity (Main Gravity Well)
    float dist = distance(pos.xy, vec2(0.0));
    float gravityWell = -uIntensity * 2.0 * exp(-dist * 0.25);
    
    // 2. Moving Celestial Body (Secondary Gravity Well)
    float bodyDist = distance(pos.xy, uBodyPosition);
    // Sharper, smaller well for the orbiting body
    float bodyWell = -uBodyMass * 1.5 * exp(-bodyDist * 1.0);

    // 3. Fluidity / Quantum Fluctuations
    float wave = sin(pos.x * 0.5 + uTime * 0.5) * cos(pos.y * 0.5 + uTime * 0.3) * uFluidity;

    // Combine all displacements
    pos.z += gravityWell + bodyWell + wave;

    vElevation = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment Shader: Handles the coloring
const fragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;
  
  varying float vElevation;

  void main() {
    // Color variation based on depth
    // Deep parts get brighter or slightly shifted to emphasize the well
    float depthFactor = smoothstep(-15.0, 2.0, vElevation);
    
    // Mix between a darker deep color and the main grid color
    vec3 deepColor = uColor * 0.3;
    vec3 surfColor = uColor;
    vec3 finalColor = mix(deepColor, surfColor, depthFactor);

    // Add a subtle rim highlight for the wireframe
    float alpha = uOpacity;
    
    // Make the deepest parts slightly more opaque to hide background stars clipping oddly
    alpha += (1.0 - depthFactor) * 0.2;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface SpacetimeGridProps {
  warpIntensity: number;
  fluidity: number;
  bodyMass: number;
  bodyPositionRef: React.MutableRefObject<THREE.Vector3>;
}

export const SpacetimeGrid: React.FC<SpacetimeGridProps> = ({ 
  warpIntensity, 
  fluidity, 
  bodyMass,
  bodyPositionRef 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: warpIntensity },
      uFluidity: { value: fluidity },
      uBodyPosition: { value: new THREE.Vector2(10, 0) },
      uBodyMass: { value: bodyMass },
      uColor: { value: new THREE.Color('#3b82f6') }, // Blue-500
      uOpacity: { value: 0.25 },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
        const material = meshRef.current.material as THREE.ShaderMaterial;
        
        material.uniforms.uTime.value = state.clock.getElapsedTime();
        material.uniforms.uIntensity.value = warpIntensity;
        material.uniforms.uFluidity.value = fluidity;
        material.uniforms.uBodyMass.value = bodyMass;

        // Sync shader with the physics body position
        if (bodyPositionRef.current) {
            // Coordinate Mapping:
            // Grid is rotated [-90, 0, 0].
            // Grid Local X = World X.
            // Grid Local Y (texture V) points to World -Z.
            // We must map the World Z of the body to the Local Y of the grid.
            material.uniforms.uBodyPosition.value.set(
                bodyPositionRef.current.x,
                -bodyPositionRef.current.z
            );
        }
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Increased segments for smoother local deformation around the small body */}
      <planeGeometry args={[50, 50, 120, 120]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        wireframe={true}
        side={THREE.DoubleSide}
        depthWrite={false} // Helps with wireframe blending
      />
    </mesh>
  );
};