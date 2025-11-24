
import React, { useEffect, useRef, useCallback } from 'react';
import { Particle, SimulationConfig } from './types';

interface SimulationCanvasProps {
  config: SimulationConfig;
  width: number;
  height: number;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ config, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Initialize Particles
  useEffect(() => {
    const initParticles = () => {
      const particles: Particle[] = [];
      for (let i = 0; i < config.particleCount; i++) {
        particles.push({
          id: i,
          pos: {
            x: Math.random() * width,
            y: Math.random() * height,
          },
          vel: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
          },
          acc: { x: 0, y: 0 },
          pairId: null,
          colorOffset: Math.random(),
          mass: 1,
        });
      }
      particlesRef.current = particles;
    };

    initParticles();
  }, [config.particleCount, width, height]);

  // Physics Engine
  const updatePhysics = useCallback(() => {
    const particles = particlesRef.current;
    const { temperature, couplingRange, couplingStrength, friction } = config;
    
    // Grid spatial hashing for performance optimization
    const gridSize = couplingRange * 1.5;
    const grid: Map<string, number[]> = new Map();
    
    const getGridKey = (x: number, y: number) => {
      return `${Math.floor(x / gridSize)},${Math.floor(y / gridSize)}`;
    };

    // Populate grid
    particles.forEach((p, idx) => {
      const key = getGridKey(p.pos.x, p.pos.y);
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key)!.push(idx);
    });

    // Main Update Loop
    particles.forEach((p, i) => {
      // 1. Thermal Noise (Brownian motion based on Temperature)
      const noiseMagnitude = temperature * 0.2;
      p.acc.x += (Math.random() - 0.5) * noiseMagnitude;
      p.acc.y += (Math.random() - 0.5) * noiseMagnitude;

      // 2. Coherence Force (Emergence)
      if (temperature < 0.3) {
        // A gentle flow field to represent macroscopic state
        const flowX = 1; // Slight rightward drift
        const flowY = Math.sin(p.pos.x * 0.01) * 0.5;
        const coherenceStrength = (1 - temperature) * 0.02;
        
        p.acc.x += flowX * coherenceStrength;
        p.acc.y += flowY * coherenceStrength;
      }

      // 3. Pairing Logic (Cooper Pairs)
      const criticalTemp = 0.6;
      
      if (p.pairId !== null) {
        // ALREADY PAIRED
        const partner = particles[p.pairId];
        
        // Break pair if temp is too high or partner is lost/far
        const dx = partner.pos.x - p.pos.x;
        const dy = partner.pos.y - p.pos.y;
        const distSq = dx * dx + dy * dy;
        const breakDist = couplingRange * 3;

        if (temperature > criticalTemp || distSq > breakDist * breakDist) {
            // Break the bond
            p.pairId = null;
            partner.pairId = null;
        } else {
            // Spring force (Hooke's Law)
            const dist = Math.sqrt(distSq);
            const force = (dist - couplingRange * 0.5) * couplingStrength; // Want to be closer
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            p.acc.x += fx;
            p.acc.y += fy;
            
            // Damping relative velocity
            p.vel.x = p.vel.x * 0.95 + partner.vel.x * 0.05;
            p.vel.y = p.vel.y * 0.95 + partner.vel.y * 0.05;
        }

      } else if (temperature < criticalTemp) {
        // ATTEMPT TO PAIR
        // Search neighbors in grid
        const gx = Math.floor(p.pos.x / gridSize);
        const gy = Math.floor(p.pos.y / gridSize);

        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
             const key = `${gx + x},${gy + y}`;
             const neighbors = grid.get(key);
             if (!neighbors) continue;

             for (const neighborIdx of neighbors) {
               if (neighborIdx === i) continue;
               const potentialPartner = particles[neighborIdx];

               if (potentialPartner.pairId === null) {
                 const dx = potentialPartner.pos.x - p.pos.x;
                 const dy = potentialPartner.pos.y - p.pos.y;
                 const distSq = dx * dx + dy * dy;

                 if (distSq < couplingRange * couplingRange) {
                   // Form Pair
                   p.pairId = neighborIdx;
                   potentialPartner.pairId = i;
                   break; // Found a partner, stop looking
                 }
               }
             }
             if (p.pairId !== null) break; 
          }
          if (p.pairId !== null) break;
        }
      }

      // 4. Update Position
      const currentFriction = temperature > 0.5 ? friction : friction * 1.5;

      p.vel.x += p.acc.x;
      p.vel.y += p.acc.y;
      p.vel.x *= (1 - currentFriction);
      p.vel.y *= (1 - currentFriction);

      p.pos.x += p.vel.x;
      p.pos.y += p.vel.y;

      // Reset Acc
      p.acc.x = 0;
      p.acc.y = 0;

      // Wrap around screen
      if (p.pos.x < 0) p.pos.x = width;
      if (p.pos.x > width) p.pos.x = 0;
      if (p.pos.y < 0) p.pos.y = height;
      if (p.pos.y > height) p.pos.y = 0;
    });

  }, [config, width, height]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#020611'; 
    ctx.fillRect(0, 0, width, height);

    const particles = particlesRef.current;
    
    // Draw Connections (Cooper Pairs)
    ctx.lineWidth = 1;
    particles.forEach(p => {
        if (p.pairId !== null && p.id < p.pairId) { 
            const partner = particles[p.pairId];
            
            // Handle wrap-around rendering for lines
            const dx = Math.abs(p.pos.x - partner.pos.x);
            const dy = Math.abs(p.pos.y - partner.pos.y);
            
            if (dx < width / 2 && dy < height / 2) {
                ctx.beginPath();
                ctx.moveTo(p.pos.x, p.pos.y);
                ctx.lineTo(partner.pos.x, partner.pos.y);
                
                const opacity = 0.15 + (1 - config.temperature) * 0.2;
                ctx.strokeStyle = `rgba(91, 192, 190, ${opacity})`; 
                ctx.stroke();
            }
        }
    });

    // Draw Particles
    particles.forEach(p => {
        ctx.beginPath();
        const radius = p.pairId !== null ? 1.5 : 1.0; 
        ctx.arc(p.pos.x, p.pos.y, radius, 0, Math.PI * 2);
        
        if (p.pairId !== null) {
             ctx.fillStyle = `rgba(200, 220, 230, ${0.4 + Math.random() * 0.1})`;
        } else {
             ctx.fillStyle = `rgba(100, 116, 139, 0.3)`;
        }
        ctx.fill();
    });

  }, [config.temperature, width, height]);

  useEffect(() => {
    let animationId: number;

    const loop = () => {
      updatePhysics();
      draw();
      animationId = requestAnimationFrame(loop);
    };
    
    loop();

    return () => cancelAnimationFrame(animationId);
  }, [updatePhysics, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default SimulationCanvas;
