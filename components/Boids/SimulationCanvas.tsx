import React, { useEffect, useRef, useCallback } from 'react';
import { SimulationParams, Boid, Vector2D } from './types';
import { COLORS } from './constants';

interface SimulationCanvasProps {
  params: SimulationParams;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const boidsRef = useRef<Boid[]>([]);

  // Helper to create random vector
  const randomVector = (width: number, height: number): Vector2D => ({
    x: Math.random() * width,
    y: Math.random() * height
  });

  const randomVelocity = (speed: number): Vector2D => {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
  };

  // Initialize Boids
  const initBoids = useCallback((width: number, height: number, count: number) => {
    const newBoids: Boid[] = [];
    for (let i = 0; i < count; i++) {
      newBoids.push({
        id: i,
        position: randomVector(width, height),
        velocity: randomVelocity(params.speed),
        acceleration: { x: 0, y: 0 }
      });
    }
    boidsRef.current = newBoids;
  }, [params.speed]);

  const updateBoids = (width: number, height: number) => {
    const boids = boidsRef.current;
    const { separation, alignment, cohesion, perceptionRadius, speed } = params;
    
    // Spatial optimization: Simple grid could be used here, but for <1000 particles 
    // on modern devices, a direct loop is often sufficient and smoother if optimized.
    // To ensure "More is Different" scale, we optimize inner loop math.

    const perceptionSquared = perceptionRadius * perceptionRadius;

    for (let i = 0; i < boids.length; i++) {
      const boid = boids[i];
      let steeringSeparation = { x: 0, y: 0 };
      let steeringAlignment = { x: 0, y: 0 };
      let steeringCohesion = { x: 0, y: 0 };
      let total = 0;

      // Check neighbors
      for (let j = 0; j < boids.length; j++) {
        if (i === j) continue;
        const other = boids[j];
        
        const dx = other.position.x - boid.position.x;
        const dy = other.position.y - boid.position.y;
        const distSquared = dx * dx + dy * dy;

        // Wrap around distance check (for seamless torus topology)
        // Note: For pure visual simplicity, sometimes avoiding torus calc in distance 
        // yields more organic "swarms" that leave and enter, but accurate torus is better for flow.
        // We will stick to simple euclidean for the local perception to create "flocks" that can separate.
        
        if (distSquared < perceptionSquared && distSquared > 0) {
          const dist = Math.sqrt(distSquared);

          // Separation: Steer away
          const diff = { x: boid.position.x - other.position.x, y: boid.position.y - other.position.y };
          steeringSeparation.x += diff.x / dist; // Weight by distance
          steeringSeparation.y += diff.y / dist;

          // Alignment: Average velocity
          steeringAlignment.x += other.velocity.x;
          steeringAlignment.y += other.velocity.y;

          // Cohesion: Average position
          steeringCohesion.x += other.position.x;
          steeringCohesion.y += other.position.y;

          total++;
        }
      }

      if (total > 0) {
        // Average out
        steeringAlignment.x /= total;
        steeringAlignment.y /= total;
        // Normalize alignment and scale to max speed
        const alignMag = Math.hypot(steeringAlignment.x, steeringAlignment.y);
        if (alignMag > 0) {
            steeringAlignment.x = (steeringAlignment.x / alignMag) * speed;
            steeringAlignment.y = (steeringAlignment.y / alignMag) * speed;
            // Steering force = Desired - Current
            steeringAlignment.x -= boid.velocity.x;
            steeringAlignment.y -= boid.velocity.y;
        }

        steeringCohesion.x /= total;
        steeringCohesion.y /= total;
        // Seek target (average position)
        const desiredCohesionX = steeringCohesion.x - boid.position.x;
        const desiredCohesionY = steeringCohesion.y - boid.position.y;
        const cohMag = Math.hypot(desiredCohesionX, desiredCohesionY);
        let cohForceX = 0, cohForceY = 0;
        if (cohMag > 0) {
             const cohNormX = (desiredCohesionX / cohMag) * speed;
             const cohNormY = (desiredCohesionY / cohMag) * speed;
             cohForceX = cohNormX - boid.velocity.x;
             cohForceY = cohNormY - boid.velocity.y;
        }
        steeringCohesion.x = cohForceX;
        steeringCohesion.y = cohForceY;
        
        // Normalize separation
        const sepMag = Math.hypot(steeringSeparation.x, steeringSeparation.y);
        if (sepMag > 0) {
            steeringSeparation.x = (steeringSeparation.x / sepMag) * speed;
            steeringSeparation.y = (steeringSeparation.y / sepMag) * speed;
            steeringSeparation.x -= boid.velocity.x;
            steeringSeparation.y -= boid.velocity.y;
        }
      }

      // Apply forces with weights
      boid.acceleration.x += (steeringSeparation.x * separation) + (steeringAlignment.x * alignment) + (steeringCohesion.x * cohesion);
      boid.acceleration.y += (steeringSeparation.y * separation) + (steeringAlignment.y * alignment) + (steeringCohesion.y * cohesion);
    }

    // Update Physics
    for (let i = 0; i < boids.length; i++) {
        const boid = boids[i];
        
        boid.velocity.x += boid.acceleration.x;
        boid.velocity.y += boid.acceleration.y;

        // Limit speed
        const speedMag = Math.hypot(boid.velocity.x, boid.velocity.y);
        if (speedMag > speed) {
            boid.velocity.x = (boid.velocity.x / speedMag) * speed;
            boid.velocity.y = (boid.velocity.y / speedMag) * speed;
        }

        boid.position.x += boid.velocity.x;
        boid.position.y += boid.velocity.y;

        // Reset acceleration
        boid.acceleration.x = 0;
        boid.acceleration.y = 0;

        // Wrap borders (Torus)
        if (boid.position.x > width) boid.position.x = 0;
        else if (boid.position.x < 0) boid.position.x = width;
        if (boid.position.y > height) boid.position.y = 0;
        else if (boid.position.y < 0) boid.position.y = height;
    }
  };

  const drawBoids = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Trail effect: Instead of clearing, draw a semi-transparent rect over the previous frame
    // The alpha value determines the length of the trails.
    ctx.fillStyle = `rgba(2, 6, 23, ${params.trailLength})`; 
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'lighter'; // Makes overlapping particles glow
    
    const boids = boidsRef.current;
    
    // Batch drawing for performance
    ctx.beginPath();
    for (const boid of boids) {
      // Draw simple glowing dots or short lines based on velocity
      const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
      const headX = boid.position.x + Math.cos(angle) * 4;
      const headY = boid.position.y + Math.sin(angle) * 4;
      const tailX = boid.position.x - Math.cos(angle) * 4;
      const tailY = boid.position.y - Math.sin(angle) * 4;

      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
    }
    
    ctx.strokeStyle = `rgba(${COLORS.particle}, 0.6)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Add a second pass for the "head" to make it brighter
    ctx.beginPath();
    ctx.fillStyle = `rgba(${COLORS.particle}, 1)`;
    for (const boid of boids) {
        ctx.moveTo(boid.position.x, boid.position.y);
        ctx.arc(boid.position.x, boid.position.y, 0.8, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // alpha: false for performance since we draw bg
    if (!ctx) return;

    // Handle Resize
    const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current && canvas) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            // Handle HiDPI displays
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            // Re-init boids to fit new screen if count changed significantly or first load
            if (boidsRef.current.length !== params.particleCount) {
                 initBoids(width, height, params.particleCount);
            }
        }
    });

    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }

    // Animation Loop
    const animate = () => {
      if (containerRef.current) {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          
          // Re-init if particle count changed from external controls
          if (Math.abs(boidsRef.current.length - params.particleCount) > 10) {
             initBoids(width, height, params.particleCount);
          }

          updateBoids(width, height);
          drawBoids(ctx, width, height);
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      resizeObserver.disconnect();
    };
  }, [params, initBoids]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 bg-slate-950">
      <canvas ref={canvasRef} className="block" />
      
      {/* Subtle overlay vignette for depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.6)_100%)]" />
    </div>
  );
};

export default SimulationCanvas;