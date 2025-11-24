
import React, { useEffect, useRef, useState, useCallback } from 'react';

// --- Utils embedded to keep component self-contained ---
export type OrbitalType = '1s' | '2s' | '2p' | '3d';

function generateQuantumPoint(type: OrbitalType, scale: number) {
  let x, y, z, prob;
  let iter = 0;
  // Rejection sampling for orbital shapes
  do {
      // Random point in box [-10, 10]
      x = (Math.random() - 0.5) * 20;
      y = (Math.random() - 0.5) * 20;
      z = (Math.random() - 0.5) * 20;
      const r = Math.sqrt(x*x + y*y + z*z);
      
      // Probability Density Functions (Simplified for visual probability)
      switch(type) {
          case '1s': 
              // Simple exponential decay
              prob = Math.exp(-2 * r); 
              break;
          case '2s': 
              // Radial node at r=2
              prob = Math.pow((2 - r) * Math.exp(-r/2), 2); 
              break;
          case '2p': 
              // Angular dependence (dumbbell along z)
              prob = Math.pow(z * Math.exp(-r/2), 2); 
              break;
          case '3d': 
              // Complex angular dependence
              prob = Math.pow((3*z*z - r*r) * Math.exp(-r/3), 2); 
              break;
          default: 
              prob = 0;
      }
      iter++;
  } while (Math.random() > prob && iter < 100); // Safety break

  return { x: x * scale, y: y * scale, z: z * scale };
}

// --- Types ---
interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  alpha: number;
  targetAlpha: number;
  lifeSpeed: number;
  size: number;
  phaseOffset: number; // For wave motion
}

interface Point2D {
  x: number;
  y: number;
}

// --- Configuration Constants ---
const PARTICLE_COUNT = 5500; 
const TRAIL_LENGTH = 30; 

const COLOR_PALETTE = {
  bg: '#02040a', // Deepest Navy/Black
  particle: '100, 149, 237', // Cornflower Blue
  particleHot: '0, 255, 255', // Cyan/Electric for collapsed state
  core: '255, 255, 255',
};

const QuantumOrbitals: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  // Single Electron State (Collapsed)
  const electronRef = useRef({ 
    angle: 0, 
    phi: 0, 
    radius: 100,
    speed: 0.1,
    trail: [] as Point2D[]
  });
  
  // Interaction State
  const [orbital, setOrbital] = useState<OrbitalType>('1s');
  const [isHovering, setIsHovering] = useState(false);
  
  // Rotation State for smooth camera
  const rotationRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });

  // --- Particle System Initialization ---
  const initParticles = useCallback(() => {
    const particles: Particle[] = [];
    const scale = orbital === '3d' ? 45 : 35;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const pos = generateQuantumPoint(orbital, scale);
      particles.push({
        x: pos.x,
        y: pos.y,
        z: pos.z,
        baseX: pos.x,
        baseY: pos.y,
        baseZ: pos.z,
        alpha: Math.random() * Math.PI, 
        targetAlpha: Math.random() * 0.4 + 0.1, 
        lifeSpeed: Math.random() * 0.02 + 0.01,
        size: Math.random() > 0.9 ? 1.4 : 0.8, 
        phaseOffset: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;
  }, [orbital]);

  useEffect(() => {
    initParticles();
    electronRef.current.trail = [];
  }, [initParticles]);

  // --- Animation Loop ---
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Canvas Resize based on parent container
    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : window.innerWidth;
    const height = parent ? parent.clientHeight : window.innerHeight;
    
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Clear
    ctx.fillStyle = COLOR_PALETTE.bg;
    ctx.fillRect(0, 0, width, height);

    // Update Rotation (Smooth damping)
    const autoRotateSpeed = 0.002; 
    targetRotationRef.current.y += autoRotateSpeed;
    
    // Mouse influence on camera
    const damp = 0.05;
    if (isHovering) {
       targetRotationRef.current.x = (mouseRef.current.y * 0.0002);
       targetRotationRef.current.y += (mouseRef.current.x * 0.0002);
    }

    rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * damp;
    rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * damp;

    const cosY = Math.cos(rotationRef.current.y);
    const sinY = Math.sin(rotationRef.current.y);
    const cosX = Math.cos(rotationRef.current.x);
    const sinX = Math.sin(rotationRef.current.x);

    const centerX = width / 2;
    const centerY = height / 2;

    const cameraDistance = 1200; 
    const focalLength = 800; 

    // Helper for 3D Projection
    const project = (x: number, y: number, z: number) => {
      // Rotation
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;
      const y1 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      // Projection
      const depth = cameraDistance + z2;
      if (depth < 10) return null; // Clipping

      const scale = focalLength / depth;
      return {
        x: centerX + x1 * scale,
        y: centerY + y1 * scale,
        scale,
        depth
      };
    };

    // --- RENDER LOGIC ---

    if (isHovering) {
      // === COLLAPSED STATE (Single Electron) ===
      
      const el = electronRef.current;
      
      // Update Physics (Slower Orbit)
      el.angle += 0.05; 
      el.phi += 0.03;   
      
      // Calculate 3D position of the "Particle"
      const orbitScale = 200;
      const ex = Math.sin(el.angle) * orbitScale;
      const ey = Math.cos(el.angle) * Math.sin(el.phi) * orbitScale;
      const ez = Math.cos(el.phi) * orbitScale;

      const p = project(ex, ey, ez);

      if (p) {
        // Apply Heisenberg Uncertainty Jitter
        const uncertaintyFactor = 20; 
        const jitterX = (Math.random() - 0.5) * uncertaintyFactor;
        const jitterY = (Math.random() - 0.5) * uncertaintyFactor;
        
        const finalX = p.x + jitterX;
        const finalY = p.y + jitterY;

        // Add to Trail
        el.trail.push({ x: finalX, y: finalY });
        if (el.trail.length > TRAIL_LENGTH) {
          el.trail.shift();
        }

        // Draw Trail
        ctx.beginPath();
        if (el.trail.length > 0) {
            ctx.moveTo(el.trail[0].x, el.trail[0].y);
            for (let i = 1; i < el.trail.length; i++) {
                ctx.lineTo(el.trail[i].x + (Math.random()-0.5)*2, el.trail[i].y + (Math.random()-0.5)*2);
            }
        }
        ctx.strokeStyle = `rgba(${COLOR_PALETTE.particleHot}, 0.5)`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Draw The Electron
        const glowSize = 10 * p.scale;
        const coreSize = 3 * p.scale;

        // Glow
        const grad = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, glowSize);
        grad.addColorStop(0, `rgba(${COLOR_PALETTE.particleHot}, 1)`);
        grad.addColorStop(1, `rgba(${COLOR_PALETTE.particleHot}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(finalX, finalY, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(finalX, finalY, coreSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw Measurement Text near electron
        ctx.fillStyle = `rgba(${COLOR_PALETTE.particleHot}, 0.8)`;
        ctx.font = '10px monospace';
        ctx.fillText(`ΔxΔp ≥ ℏ/2`, finalX + 15, finalY - 15);
      }

    } else {
      // === WAVEFUNCTION STATE (Cloud) ===
      
      const t = time * 0.001; 

      particlesRef.current.forEach(p => {
        p.alpha += p.lifeSpeed;
        
        const vibrationScale = 1.5;
        const vx = p.baseX + Math.sin(t * 2 + p.phaseOffset) * vibrationScale;
        const vy = p.baseY + Math.cos(t * 3 + p.phaseOffset) * vibrationScale;
        const vz = p.baseZ + Math.sin(t * 4 + p.phaseOffset) * vibrationScale;

        const proj = project(vx, vy, vz);
        if (!proj) return;

        let currentOpacity = (Math.sin(p.alpha) + 1) / 2 * p.targetAlpha;
        
        if (currentOpacity > 0.01 && proj.scale > 0) {
           const r = Math.max(0.1, p.size * proj.scale);
           
           ctx.beginPath();
           ctx.fillStyle = `rgba(${COLOR_PALETTE.particle}, ${currentOpacity})`;
           ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
           ctx.fill();
        }
      });
    }

    // --- Draw Nucleus ---
    const nucleusGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
    nucleusGlow.addColorStop(0, `rgba(200, 220, 255, 0.2)`);
    nucleusGlow.addColorStop(1, `rgba(200, 220, 255, 0)`);
    ctx.fillStyle = nucleusGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, 0.95)`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#fff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    requestRef.current = requestAnimationFrame(animate);
  }, [orbital, isHovering]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // --- Interaction Handlers ---
  const handleMouseMove = (e: React.MouseEvent) => {
    // Fix: Use parent bounding box for mouse coordinates relative to center
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left - bounds.width / 2;
    const y = e.clientY - bounds.top - bounds.height / 2;
    mouseRef.current = { x, y };
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div 
      className="relative w-full h-full bg-[#02040a] overflow-hidden font-sans selection:bg-slate-700 rounded-xl border border-slate-700/50 shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const x = e.touches[0].clientX - bounds.left - bounds.width / 2;
        const y = e.touches[0].clientY - bounds.top - bounds.height / 2;
        mouseRef.current = { x, y };
        setIsHovering(true);
      }}
      onTouchEnd={() => setIsHovering(false)}
    >
      {/* Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 cursor-crosshair"
      />

      {/* Grain overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.04] mix-blend-overlay"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }}
      />

      {/* Minimalist UI Layer */}
      <div className="absolute z-20 top-8 left-8 flex flex-col gap-6 mix-blend-screen text-slate-400 pointer-events-none">
        <div className="space-y-1">
          <h1 className="text-xs font-medium tracking-[0.25em] uppercase opacity-80 text-blue-100">
            {isHovering ? "Wavefunction Collapsed" : "Probability Density"}
          </h1>
          <div className={`h-px transition-all duration-300 ${isHovering ? "w-24 bg-cyan-400" : "w-8 bg-blue-500/50"}`}></div>
          <p className="text-[10px] tracking-widest opacity-60 uppercase">
             {isHovering ? "Particle State • Trajectory Uncertain" : `Hydrogen • ${orbital === '1s' ? 'Ground State' : 'Excited State'}`}
          </p>
        </div>
      </div>

      <div className="absolute z-20 bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-10 mix-blend-screen">
        {(['1s', '2s', '2p', '3d'] as OrbitalType[]).map((type) => (
          <button
            key={type}
            onClick={(e) => { e.stopPropagation(); setOrbital(type); }}
            className={`group relative py-2 px-1 outline-none transition-all duration-700 ease-out`}
          >
            {/* Minimalist Text */}
            <span className={`text-[11px] tracking-[0.3em] uppercase transition-colors duration-500 ${
              orbital === type ? 'text-blue-100 font-bold shadow-[0_0_15px_rgba(100,200,255,0.5)]' : 'text-slate-600 group-hover:text-slate-300'
            }`}>
              {type}
            </span>
            
            {/* Active Indicator Dot */}
            <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 h-[3px] w-[3px] rounded-full bg-blue-400 blur-[1px] transition-all duration-500 ${
              orbital === type ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`} />
          </button>
        ))}
      </div>

      <div className="absolute z-20 bottom-8 right-8 text-right opacity-40 pointer-events-none hidden md:block">
        <p className={`text-[9px] tracking-[0.2em] font-light transition-colors duration-300 ${isHovering ? "text-cyan-300" : "text-blue-200/50"}`}>
          {isHovering ? "OBSERVATION ACTIVE" : "SUPERPOSITION ACTIVE"}
        </p>
        <p className="text-[8px] tracking-[0.1em] text-slate-600 mt-1">
          {isHovering ? "Heisenberg Uncertainty Principle" : "Schrödinger Equation Ψ(r,t)"}
        </p>
      </div>

    </div>
  );
};

export default QuantumOrbitals;
