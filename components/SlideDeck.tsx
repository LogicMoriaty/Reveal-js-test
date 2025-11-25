
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Circle, Disc, Share2, Layers, Download, Cpu, Microscope, BrainCircuit, List, ArrowRight, Eye, ArrowDown, RefreshCw } from 'lucide-react';
import PptxGenJS from 'pptxgenjs';
import { Canvas } from '@react-three/fiber';
import { SlideType, SlideData, CelestialBody, CanvasSize } from '../types';

// Backgrounds
import NetworkBackground from './backgrounds/NetworkBackground';
import OrbitBackground from './backgrounds/OrbitBackground';
import WarpGridBackground from './backgrounds/WarpGridBackground';
import QuantumParticlesBackground from './backgrounds/QuantumParticlesBackground';
import CrystalBackground from './backgrounds/CrystalBackground';
import { Scene } from './backgrounds/Scene';
import { UIOverlay } from './backgrounds/UIOverlay';
import QuantumOrbitals from './QuantumOrbitals';
import BoidsSimulation from './Boids/BoidsSimulation';
import CooperPairSimulation from './CooperPair/CooperPairSimulation';
import SpiralSimulation from './Spiral/SpiralSimulation';

// Images
// Using absolute paths from root for static assets to avoid module resolution issues
const newton1Img = 'https://image.logicmoriaty.top/Newton11.webp';
const newton5Img = 'https://image.logicmoriaty.top/Newton5.webp';
const newton2Img = 'https://image.logicmoriaty.top/Newton2.webp';
const einsteinImg = 'https://image.logicmoriaty.top/Einstein11.webp';
const andersonImg = 'https://image.logicmoriaty.top/Anderson1.webp';

// --- MATH HELPERS ---
const MathFormula: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`font-serif italic text-cyan-200/90 my-3 text-lg md:text-xl lg:text-2xl tracking-wide ${className}`} style={{ fontFamily: '"Times New Roman", Times, serif' }}>
    {children}
  </div>
);

const Vec: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-bold not-italic">{children}</span>
);

const Frac: React.FC<{ num: React.ReactNode, den: React.ReactNode }> = ({ num, den }) => (
  <div className="inline-flex flex-col items-center mx-1 text-[0.85em] align-middle -translate-y-[0.3em]">
    <span className="border-b border-current w-full text-center pb-[1px] mb-[1px] leading-none">{num}</span>
    <span className="w-full text-center pt-[1px] leading-none">{den}</span>
  </div>
);

// --- GRAVITY VISUALIZATION & OVERLAY ---

const PLANET_PALETTE = [
  '#06b6d4', // Cyan (Ice Giant)
  '#f59e0b', // Amber (Gas Giant)
  '#10b981', // Emerald (Habitable)
  '#ec4899', // Pink (High Energy)
  '#8b5cf6', // Violet (Mystery)
  '#64748b', // Slate (Rocky)
];

const G_CONST = 0.8; 
const SUN_MASS = 2000;
const TRAIL_LENGTH = 300;

const GravityVisual: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<CanvasSize>({ width: window.innerWidth, height: window.innerHeight });
  
  const bodiesRef = useRef<CelestialBody[]>([]);
  const animationRef = useRef<number>(0);

  // Initialize the Solar System
  const initSystem = (width: number, height: number) => {
    const cx = width / 2;
    const cy = height / 2;
    const bodies: CelestialBody[] = [];

    // 1. The Sun
    bodies.push({
      id: 0,
      mass: SUN_MASS,
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      radius: 20,
      color: '#fbbf24',
      trail: [],
      label: 'SOL-SYS'
    });

    // 2. Generating Planets
    const planetCount = 6;
    const minDist = 90;
    const maxDist = Math.min(width, height) * 0.35;

    for (let i = 0; i < planetCount; i++) {
      const dist = minDist + (maxDist - minDist) * ((i + 1) / planetCount);
      const angle = Math.random() * Math.PI * 2;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;

      const eccentricityModifier = 0.92;
      const vMagnitude = Math.sqrt((G_CONST * SUN_MASS) / dist) * eccentricityModifier;
      
      const vx = -Math.sin(angle) * vMagnitude;
      const vy = Math.cos(angle) * vMagnitude;
      const baseColor = PLANET_PALETTE[i % PLANET_PALETTE.length];

      bodies.push({
        id: i + 1,
        mass: Math.random() * 5 + 1,
        x,
        y,
        vx,
        vy,
        radius: Math.random() * 3 + 3,
        color: baseColor,
        trail: [],
        dashed: Math.random() > 0.7,
        label: `OBJ-${(i + 1).toString().padStart(2, '0')}`
      });
    }

    // 3. Generating Comets
    const cometCount = 1;
    for (let i = 0; i < cometCount; i++) {
        const aphelionDist = Math.min(width, height) * 0.6 + (Math.random() * 100);
        const perihelionDist = 60 + Math.random() * 40;
        const a = (aphelionDist + perihelionDist) / 2;
        const vAphelion = Math.sqrt(G_CONST * SUN_MASS * (2/aphelionDist - 1/a));

        const angle = Math.random() * Math.PI * 2;
        const x = cx + Math.cos(angle) * aphelionDist;
        const y = cy + Math.sin(angle) * aphelionDist;

        const dir = Math.random() > 0.5 ? 1 : -1;
        const vx = -Math.sin(angle) * vAphelion * dir;
        const vy = Math.cos(angle) * vAphelion * dir;

        bodies.push({
            id: 100 + i,
            mass: 0.5,
            x,
            y,
            vx,
            vy,
            radius: 2,
            color: '#e2e8f0',
            trail: [],
            dashed: true,
            label: `CMT-${i+1}`,
            maxTrailLength: 500
        });
    }

    bodiesRef.current = bodies;
  };

  useEffect(() => {
    const handleResize = () => {
      // Use parent element size if possible, otherwise window
      if (canvasRef.current?.parentElement) {
          setSize({ width: canvasRef.current.parentElement.clientWidth, height: canvasRef.current.parentElement.clientHeight });
          initSystem(canvasRef.current.parentElement.clientWidth, canvasRef.current.parentElement.clientHeight);
      } else {
          setSize({ width: window.innerWidth, height: window.innerHeight });
          initSystem(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Init immediately

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    const animate = () => {
      const bodies = bodiesRef.current;
      const { width, height } = size;

      // Physics
      for (let i = 1; i < bodies.length; i++) {
        const p = bodies[i];
        const sun = bodies[0];

        const dx = sun.x - p.x;
        const dy = sun.y - p.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        const forceMagnitude = (G_CONST * sun.mass) / distSq;
        const ax = forceMagnitude * (dx / dist);
        const ay = forceMagnitude * (dy / dist);

        p.vx += ax;
        p.vy += ay;
        p.x += p.vx;
        p.y += p.vy;

        p.trail.push({ x: p.x, y: p.y });
        const limit = p.maxTrailLength || TRAIL_LENGTH;
        if (p.trail.length > limit) p.trail.shift();
      }

      // Render
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      
      bodies.forEach((body, index) => {
        const isSun = index === 0;

        // Trails
        if (!isSun && body.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(body.trail[0].x, body.trail[0].y);
          for (let t = 1; t < body.trail.length; t++) {
             const p0 = body.trail[t-1];
             const p1 = body.trail[t];
             const midX = (p0.x + p1.x) / 2;
             const midY = (p0.y + p1.y) / 2;
             ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          }
          ctx.strokeStyle = body.color; 
          ctx.globalAlpha = 0.2;
          ctx.lineWidth = 1.5;
          if (body.dashed) ctx.setLineDash([5, 5]);
          else ctx.setLineDash([]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1.0;
        }

        // Radius Vector
        if (!isSun) {
           ctx.beginPath();
           ctx.moveTo(bodies[0].x, bodies[0].y);
           ctx.lineTo(body.x, body.y);
           ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
           ctx.lineWidth = 0.5;
           ctx.stroke();
        }

        // Body
        ctx.beginPath();
        if (isSun) {
            ctx.arc(body.x, body.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#050914';
            ctx.fill();
            ctx.strokeStyle = body.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(body.x, body.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = body.color;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(body.x, body.y, 22, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
            ctx.setLineDash([2, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#050914';
            ctx.fill();
            ctx.lineWidth = body.radius < 3 ? 1.5 : 2;
            ctx.strokeStyle = body.color; 
            ctx.stroke();

            const scale = 10;
            ctx.beginPath();
            ctx.moveTo(body.x, body.y);
            ctx.lineTo(body.x + body.vx * scale, body.y + body.vy * scale);
            ctx.strokeStyle = body.color; 
            ctx.globalAlpha = 0.6;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            ctx.fillStyle = body.color;
            ctx.globalAlpha = 0.8;
            ctx.font = '400 9px monospace';
            ctx.fillText(`${body.label}`, body.x + 8, body.y - 8);
            ctx.globalAlpha = 1.0;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

const GravityOverlay: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-12 text-slate-200">
      {/* Top Right: Tex-style Gravity Formula */}
      <div className="absolute top-32 right-8 md:right-24 opacity-80">
        <div className="flex items-center gap-3 font-serif italic text-2xl tracking-wider text-blue-100">
            <span>F</span>
            <span className="not-italic opacity-70">=</span>
            <span>G</span>
            <div className="flex flex-col items-center justify-center leading-none text-lg mx-1">
            <div className="border-b border-blue-200/50 pb-1 mb-1">
                m<sub className="not-italic text-xs opacity-70">1</sub>m<sub className="not-italic text-xs opacity-70">2</sub>
            </div>
            <div>
                r<sup className="not-italic text-xs opacity-70">2</sup>
            </div>
            </div>
        </div>
      </div>
      
      {/* Bottom Right: Minimal Status */}
      <div className="absolute bottom-12 right-12 text-right opacity-40 hidden md:block">
        <div className="flex flex-col items-end gap-1">
          <div className="text-[9px] font-mono tracking-widest text-slate-400">
            SIM.ACTIVE
          </div>
          <div className="text-[9px] font-mono tracking-widest text-slate-500">
            t = {new Date().toISOString().split('T')[0]}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- EXISTING VISUALIZATION COMPONENTS ---

const EinsteinVisual: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    
    let frameId = 0;
    let time = 0;

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      
      const cx = w / 2;
      const cy = h / 2;
      
      const gridSize = 25; 
      const cols = Math.floor(w / gridSize);
      const rows = Math.floor(h / gridSize);

      const mx = cx + Math.sin(time * 0.5) * 40;
      const my = cy + Math.cos(time * 0.3) * 20;
      const massStrength = 8000;

      ctx.strokeStyle = 'rgba(100, 255, 218, 0.2)'; 
      ctx.lineWidth = 0.5;

      const drawStep = 20; 

      // Vertical Lines
      ctx.beginPath();
      for (let i = 0; i <= cols; i++) {
        let x = i * gridSize;
        for (let j = 0; j <= h; j+=drawStep) {
           const dy = j - my;
           const dx = x - mx;
           const distSq = dx*dx + dy*dy;
           const warp = massStrength / (distSq + 1000);
           const drawX = x - (dx * warp * 0.05); 
           const drawY = j - (dy * warp * 0.05);
           
           if(j===0) ctx.moveTo(drawX, drawY);
           else ctx.lineTo(drawX, drawY);
        }
      }
      ctx.stroke();

      // Horizontal Lines
      ctx.beginPath();
      for (let j = 0; j <= rows; j++) {
        let y = j * gridSize;
        for (let i = 0; i <= w; i+=drawStep) {
           const dx = i - mx;
           const dy = y - my;
           const distSq = dx*dx + dy*dy;
           const warp = massStrength / (distSq + 1000);
           const drawX = i - (dx * warp * 0.05);
           const drawY = y - (dy * warp * 0.05);

           if(i===0) ctx.moveTo(drawX, drawY);
           else ctx.lineTo(drawX, drawY);
        }
      }
      ctx.stroke();

      // Mass
      ctx.fillStyle = '#CCD6F6';
      ctx.beginPath();
      ctx.arc(mx, my, 12, 0, Math.PI * 2);
      ctx.fill();

      // Light Particle
      const lx = (time * 100) % (w + 200) - 100;
      const lyBase = cy - 60;
      const distToMassX = lx - mx;
      const distToMassY = lyBase - my;
      const d2 = distToMassX*distToMassX + distToMassY*distToMassY;
      const bend = 6000 / (d2 + 100);
      const ly = lyBase + bend;

      ctx.fillStyle = '#FF5555';
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI*2);
      ctx.fill();

      time += 0.03;
      frameId = requestAnimationFrame(animate);
    };
    
    const resize = () => {
        const parent = canvas.parentElement;
        if(parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }
    };
    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(frameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full rounded-xl bg-navy-800/50 backdrop-blur-sm border border-slate-700/50" />;
};

const QuantumVisual: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    
    let frameId = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      for(let i=0; i<8; i++) {
        const angle = Math.random() * Math.PI * 2;
        let r = 40 + (Math.random() - 0.5) * 20; 
        if(Math.random() > 0.6) r = 80 + (Math.random() - 0.5) * 30;

        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        ctx.fillStyle = Math.random() > 0.5 ? '#64FFDA' : '#8892B0';
        const size = Math.random() * 2 + 0.5;
        
        ctx.globalAlpha = Math.random() * 0.6 + 0.2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI*2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI*2);
      ctx.stroke();

      frameId = requestAnimationFrame(animate);
    };
    
    const resize = () => {
        const parent = canvas.parentElement;
        if(parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }
    };
    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(frameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full rounded-xl bg-navy-800/50 backdrop-blur-sm border border-slate-700/50" />;
};

const AndersonVisual: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    
    interface Particle {
        x: number, y: number, vx: number, vy: number, angle: number
    }
    
    let particles: Particle[] = [];
    let state = 'CHAOS'; 
    let timer = 0;

    const init = () => {
        particles = [];
        for(let i=0; i<40; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                angle: Math.random() * Math.PI * 2
            });
        }
    };

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      
      timer++;
      if(timer > 200) {
          state = state === 'CHAOS' ? 'ORDER' : 'CHAOS';
          timer = 0;
      }

      ctx.fillStyle = state === 'ORDER' ? 'rgba(100, 255, 218, 0.8)' : 'rgba(136, 146, 176, 0.5)';
      
      const orderVx = 1.5;
      const orderVy = 0.5;

      particles.forEach(p => {
          if(state === 'CHAOS') {
              p.x += p.vx;
              p.y += p.vy;
              if(p.x < 0 || p.x > w) p.vx *= -1;
              if(p.y < 0 || p.y > h) p.vy *= -1;
              p.angle += 0.1;
          } else {
              p.vx += (orderVx - p.vx) * 0.05;
              p.vy += (orderVy - p.vy) * 0.05;
              p.x += p.vx;
              p.y += p.vy;

              if(p.x > w) p.x = 0;
              if(p.x < 0) p.x = w;
              if(p.y > h) p.y = 0;
              if(p.y < 0) p.y = h;
              
              const targetAngle = Math.atan2(orderVy, orderVx);
              p.angle += (targetAngle - p.angle) * 0.1;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          const drawAngle = state === 'CHAOS' ? p.angle : Math.atan2(p.vy, p.vx);
          ctx.rotate(drawAngle);
          
          ctx.beginPath();
          ctx.moveTo(6, 0);
          ctx.lineTo(-4, 3);
          ctx.lineTo(-4, -3);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
      });

      ctx.fillStyle = '#fff';
      ctx.font = '12px "JetBrains Mono"';
      ctx.fillText(state === 'CHAOS' ? "STATE: SYMMETRY (DISORDER)" : "STATE: BROKEN SYMMETRY (ORDER)", 20, 30);

      requestAnimationFrame(animate);
    };
    
    const resize = () => {
        const parent = canvas.parentElement;
        if(parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
            init();
        }
    };
    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
        window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full rounded-xl bg-navy-800/50 backdrop-blur-sm border border-slate-700/50" />;
};

// --- RELATIVITY DEMO COMPONENT ---
const RelativityDemo: React.FC = () => {
  const [warpIntensity, setWarpIntensity] = useState(2.0);
  const [fluidity, setFluidity] = useState(0.2);
  const [bodyMass, setBodyMass] = useState(1.0);

  return (
    <div className="relative w-full h-[60vh] md:h-[65vh] rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl bg-black/40 backdrop-blur-sm">
        <div className="absolute inset-0 z-0">
             <Canvas camera={{ position: [0, 20, 25], fov: 45 }}>
                <Scene warpIntensity={warpIntensity} fluidity={fluidity} bodyMass={bodyMass} />
             </Canvas>
        </div>
        <UIOverlay 
            warpIntensity={warpIntensity} 
            setWarpIntensity={setWarpIntensity}
            fluidity={fluidity}
            setFluidity={setFluidity}
            bodyMass={bodyMass}
            setBodyMass={setBodyMass}
        />
    </div>
  );
};


// --- DATA SOURCE ---
const slides: SlideData[] = [
  // 1. COVER
  {
    id: SlideType.COVER,
    title: "自然观、科学认识方法与科学认识",
    subtitle: "从牛顿、爱因斯坦、哥本哈根学派到安德森",
    description: "探究人类自然观、科学方法与科学知识之间深刻的辩证演化关系。",
    person: "董玉豪 自然辩证法第三组（63-93）"
  },
  // 2. TOC
  {
    id: SlideType.TOC,
    title: "目录",
    subtitle: "TABLE OF CONTENTS",
    details: [
      { label: "01", value: "引言：核心范畴定义" },
      { label: "02", value: "牛顿：机械决定论的宇宙" },
      { label: "03", value: "爱因斯坦：几何与相对论" },
      { label: "04", value: "哥本哈根学派：概率与不确定性" },
      { label: "05", value: "菲利普·安德森：涌现与复杂性" },
      { label: "06", value: "总结：演进螺旋" }
    ]
  },
  // 3. INTRO - CONCEPTS
  {
    id: SlideType.CONCEPTS,
    title: "核心范畴定义",
    subtitle: "INTRODUCTION",
    description: "理解科学活动的三大维度：本体论、方法论与认识论。"
  },
  
  // --- CHAPTER 1: NEWTON ---
  {
    id: SlideType.NEWTON,
    title: "第一章",
    subtitle: "CLASSICAL MECHANICS",
    description: "机械自然观与绝对时空",
    isChapterTitle: true
  },
  {
    id: SlideType.NEWTON,
    title: "牛顿：机械自然观",
    subtitle: "NEWTONIAN WORLDVIEW",
    person: "Isaac Newton (1643–1727)",
    image: newton1Img,
    details: [
      { label: "机械论", value: "整个宇宙及其万物都像一台由上帝创造并上好发条的钟表，按照严格的、确定的力学规律运行。" },
      { label: "绝对时空观", value: "时间和空间是绝对的、均匀流逝的、与物质及其运动无关的独立背景和舞台。" },
      { label: "因果决定论", value: "一切运动都有确定的原因和结果。知晓初始状态和规律即可预测未来（拉普拉斯妖）。" },
      { label: "还原论 & 原子论", value: "复杂的整体可还原为简单的部分；万物本质上由坚硬不可毁灭的粒子组成。" }
    ]
  },
  // Inserted Slide: Universal Gravitation with Animation
  {
    id: SlideType.NEWTON,
    title: "牛顿：万有引力定律",
    subtitle: "LAW OF UNIVERSAL GRAVITATION",
    person: "",
    // Empty details to trigger full screen animation mode
    details: []
  },
  {
    id: SlideType.NEWTON,
    title: "牛顿：科学认识方法",
    subtitle: "NEWTONIAN METHODOLOGY",
    person: "“Hypotheses non fingo”",
    image: newton5Img,
    imageCaption: "《自然哲学的数学原理》 (1687)",
    details: [
      { label: "公理演绎与数学推导", value: "模仿欧几里得，建立公理系统。以三大定律为公理，通过微积分推导万物规律。" },
      { label: "分析与综合", value: [
        "分析：从复杂现象中推导出普遍原理（从结果到原因）。",
        "综合：从普遍原理推演并解释广泛现象（从原因到结果）。"
      ]},
      { label: "我不杜撰假说", value: "主张通过观察和实验描述现象背后的数学规律（How），而非臆测不可验证的形而上原因（Why）。" },
      { label: "数学与实验验证", value: "理论必须回归物理世界，通过实验观测验证，理论的正确性取决于与数据的精确符合。" }
    ]
  },
  // Newton's Summary Slides
  {
    id: SlideType.NEWTON,
    title: "牛顿：主要科学成就",
    subtitle: "SCIENTIFIC ACHIEVEMENTS",
    details: [
      { 
        label: "经典力学体系", 
        value: (
          <div className="space-y-6">
             <div className="group/item">
               <strong className="text-cyan-100 block mb-2 text-lg font-medium tracking-wide">牛顿第一定律：惯性定律</strong>
               <MathFormula className="pl-2 border-l-2 border-slate-700/50">
                 <span className="mr-3">∑<sub className="not-italic text-[0.7em]">i</sub> <Vec>F</Vec><sub className="not-italic text-[0.7em]">i</sub> = 0</span>
                 <span className="mx-3">⇒</span>
                 <Frac num={<>d<Vec>v</Vec></>} den={<>dt</>} /> = 0
               </MathFormula>
             </div>
             <div className="group/item">
               <strong className="text-cyan-100 block mb-2 text-lg font-medium tracking-wide">牛顿第二定律：加速度定律</strong>
               <MathFormula className="pl-2 border-l-2 border-slate-700/50">
                 <Vec>F</Vec> = m<Vec>a</Vec>
               </MathFormula>
             </div>
             <div className="group/item">
               <strong className="text-cyan-100 block mb-2 text-lg font-medium tracking-wide">牛顿第三定律：作用力与反作用力定律</strong>
               <MathFormula className="pl-2 border-l-2 border-slate-700/50">
                 ∑<Vec>F</Vec><sub className="not-italic text-[0.7em]">A,B</sub> = -∑<Vec>F</Vec><sub className="not-italic text-[0.7em]">B,A</sub>
               </MathFormula>
             </div>
          </div>
        ),
        pptValue: "牛顿第一定律(F=0); 牛顿第二定律(F=ma); 牛顿第三定律(F_ab = -F_ba)"
      },
      { 
        label: "万有引力定律", 
        value: (
            <div className="space-y-6 h-full flex flex-col">
                <p className="text-lg leading-relaxed text-slate-300">宇宙中任意两个质点彼此之间相互吸引，且作用力与它们的质量乘积成正比，并与它们之间的距离平方成反比。</p>
                <div className="flex justify-center items-center py-6 flex-grow bg-navy-950/30 rounded-lg">
                    <MathFormula className="text-center scale-110">
                        F = G <Frac num={<>m<sub className="not-italic text-[0.7em]">1</sub>m<sub className="not-italic text-[0.7em]">2</sub></>} den={<>r<sup className="not-italic text-[0.7em]">2</sup></>} />
                    </MathFormula>
                </div>
            </div>
        ),
        pptValue: "宇宙中任意两个质点彼此之间相互吸引，且作用力与它们的质量乘积成正比，并与它们之间的距离平方成反比. F = G(m1m2)/r^2"
      },
      { 
        label: "光学的探索", 
        value: (
            <div className="flex flex-col h-full gap-4">
                <p className="text-lg leading-relaxed text-slate-300">通过三棱镜实验揭示了光的色散现象（七色光谱），并提出了光的微粒说理论。</p>
                <div className="rounded-lg overflow-hidden border border-slate-700/50 shadow-lg flex-grow relative min-h-[160px] group">
                    <img src={newton2Img} alt="Newton Optics" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent opacity-60"></div>
                </div>
            </div>
        ),
        pptValue: "通过三棱镜实验揭示了光的色散现象（七色光谱），并提出了光的微粒说理论。"
      }
    ]
  },
  {
    id: SlideType.NEWTON,
    title: "牛顿：演化闭环",
    subtitle: "EVOLUTIONARY LOOP",
    details: [
      { 
        label: "自然观 → 科学认识方法", 
        value: "正因为牛顿持有“宇宙是机器”的自然观，他才坚信可以采用“分析与综合”这种方法来研究它。你不会试图去跟一台机器“对话”或理解它的“目的”，你只会去拆解、测量、计算它的零件和动力。" 
      },
      { 
        label: "科学认识方法 → 科学认识", 
        value: "正是通过严谨的“分析与综合”方法，结合数学推导和实验验证，牛顿才得以建立起他的力学定律和万有引力定律这一庞大的科学认识体系。" 
      },
      { 
        label: "科学认识 → 巩固和强化自然观", 
        value: "牛顿力学在解释世界方面取得的空前成功（如精确预测海王星、解释潮汐等），使得他的科学认识成为了其自然观最有力的证据。人们普遍认为，世界确实就是一台遵循机械规律的、决定论的大钟表。" 
      }
    ]
  },

  // --- CHAPTER 2: EINSTEIN ---
  {
    id: SlideType.EINSTEIN,
    title: "第二章",
    subtitle: "RELATIVITY",
    description: "几何化的宇宙与新自然观",
    isChapterTitle: true
  },
  {
    id: SlideType.EINSTEIN,
    title: "爱因斯坦：自然观",
    subtitle: "EINSTEIN'S WORLDVIEW",
    person: "Albert Einstein (1879–1955)",
    image: einsteinImg,
    details: [
      { label: "统一性与协变性", value: "自然法则必须普适。无论观察者运动状态如何，物理定律形式应保持不变（协变性）。" },
      { label: "因果决定论", value: "“上帝不掷骰子”。宇宙有严格逻辑秩序，不存在纯粹偶然，遵循严格因果律（斯宾诺莎的神）。" },
      { label: "逻辑简单性", value: "自然深层规律在数学上是简单优美的。逻辑冗余的理论往往是错误的。" },
      { label: "马赫的关系论", value: "没有物质就没有空间。时空不能独立存在，必须依附于物质及其运动关系。" }
    ]
  },
  {
    id: SlideType.EINSTEIN,
    title: "爱因斯坦：方法论",
    subtitle: "METHODOLOGY OF RELATIVITY",
    person: "思维的飞跃",
    details: [
      { label: "思想实验", value: "在思维中构建理想模型（如追光实验、升降机），逻辑推演以检验前提、发现矛盾。" },
      { label: "原理演绎", value: "从少数普遍性基本假设（如光速不变）出发，演绎构建完整理论体系。" },
      { label: "概念批判", value: "对“同时性”、“时间”等被视为不言自明的基本概念进行批判性分析。" },
      { label: "逻辑简单性", value: "以理论前提的简洁性作为评价核心标准。" }
    ]
  },
  // --- NEW INTERACTIVE SLIDE ---
  {
    id: SlideType.EINSTEIN,
    title: "时空弯曲与引力交互",
    subtitle: "INTERACTIVE GRAVITY",
    description: "直观体验广义相对论：大质量天体如何弯曲时空网络，以及引力如何作为几何效应呈现。",
    isInteractive: true
  },
  // -----------------------------
  {
    id: SlideType.EINSTEIN,
    title: "爱因斯坦：认识与新自然观",
    subtitle: "NEW REALITY",
    person: "时空革命",
    details: [
      { label: "相对论时空观", value: "否定绝对时空。时间间隔与空间长度取决于观测者。三维空间+一维时间=四维时空。" },
      { label: "引力几何化", value: "引力不是超距力，而是物质与能量导致的“时空弯曲”。物质告诉时空如何弯曲，时空告诉物质如何运动。" },
      { label: "质能关系 & 光量子", value: "E=mc² 揭示质量与能量的统一；光量子论揭示光的波粒二象性。" },
      { label: "新自然观总结", value: "从牛顿的“刚性容器”转变为动态的、与物质不可分割的“几何场”。" }
    ]
  },

  // --- CHAPTER 3: QUANTUM ---
  {
    id: SlideType.QUANTUM,
    title: "第三章",
    subtitle: "QUANTUM MECHANICS",
    description: "概率、不确定性与实在的消解",
    isChapterTitle: true
  },
  {
    id: SlideType.QUANTUM,
    title: "哥本哈根学派：群星璀璨",
    subtitle: "THE QUANTUM ARCHITECTS",
    description: "20世纪20年代，以尼尔斯·玻尔为精神领袖，海森堡、泡利、狄拉克等一群杰出的年轻物理学家在哥本哈根汇聚。他们通过激烈的思想交锋与紧密合作，共同构建了量子力学的数学形式与物理诠释（哥本哈根诠释）。这一学派不仅确立了量子力学的正统地位，更通过引入概率性、互补性和不确定性，彻底颠覆了经典物理学延续数百年的严格决定论世界观。",
    details: [
      { label: "Niels Bohr", value: "https://image.logicmoriaty.top/Copenhagen-Bohr1.webp", pptValue: "互补原理" },
      { label: "Max Born", value: "https://image.logicmoriaty.top/Copenhagen-Born.webp", pptValue: "概率诠释" },
      { label: "Werner Heisenberg", value: "https://image.logicmoriaty.top/Copenhagen-Heisenberg.webp", pptValue: "矩阵力学 / 测不准原理" },
      { label: "Paul Dirac", value: "https://image.logicmoriaty.top/Copenhagen-Dirac.webp", pptValue: "量子方程" },
      { label: "Wolfgang Pauli", value: "https://image.logicmoriaty.top/Copenhagen-Pauli.webp", pptValue: "不相容原理" },
    ]
  },
  {
    id: SlideType.QUANTUM,
    title: "哥本哈根：变革前夜",
    subtitle: "THE QUANTUM CRISIS",
    person: "经典物理的乌云",
    details: [
      { 
        label: "紫外灾难", 
        value: (
          <div className="flex flex-col gap-6 h-full">
            <p className="leading-relaxed font-light text-xl">经典理论预言黑体辐射高频能量无穷大，意味着能量连续观念在原子尺度失效。</p>
            <div className="mt-auto rounded-lg overflow-hidden bg-white/5 p-4 h-64 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
               <img src="https://image.logicmoriaty.top/Blackbody.svg" className="max-w-full max-h-full object-contain" alt="Ultraviolet Catastrophe" />
            </div>
          </div>
        )
      },
      { 
        label: "光电效应", 
        value: (
          <div className="flex flex-col gap-6 h-full">
            <p className="leading-relaxed font-light text-xl">光的能量取决于频率而非强度，暗示光以离散“量子”形式传递。</p>
            <div className="mt-auto rounded-lg overflow-hidden bg-white/5 p-4 h-64 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
               <img src="https://image.logicmoriaty.top/Photoelectric.svg" className="max-w-full max-h-full object-contain" alt="Photoelectric Effect" />
            </div>
          </div>
        )
      },
      { 
        label: "原子光谱", 
        value: (
          <div className="flex flex-col gap-6 h-full">
            <p className="leading-relaxed font-light text-xl">原子的分立线状谱与经典电磁理论（预言原子坍缩）完全矛盾。</p>
            <div className="mt-auto rounded-lg overflow-hidden bg-white/5 p-4 h-64 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
               <img src="https://image.logicmoriaty.top/HydrogenSpectra.webp" className="max-w-full max-h-full object-contain" alt="Atomic Spectra" />
            </div>
          </div>
        )
      },
      { 
        label: "电子衍射", 
        value: (
          <div className="flex flex-col gap-6 h-full">
            <p className="leading-relaxed font-light text-xl">实物粒子（电子）穿过晶体产生衍射，证明粒子也具有波动性。</p>
            <div className="mt-auto rounded-lg overflow-hidden bg-white/5 p-4 h-64 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
               <img src="https://image.logicmoriaty.top/ZADP.webp" className="max-w-full max-h-full object-contain" alt="Electron Diffraction" />
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: SlideType.QUANTUM,
    title: "哥本哈根：方法论",
    subtitle: "COPENHAGEN SPIRIT",
    person: "Bohr, Heisenberg, Born",
    details: [
      { label: "唯象实证", value: "摒弃不可观测的直观图像（如电子轨道），只构建连接可观测量的数学形式体系。" },
      { label: "概率诠释", value: "物理学从因果确定性描述转变为系统状态的统计概率性描述。" },
      { label: "对应原理", value: "新理论在宏观极限下必须渐进回归到经典物理规律。" },
      { label: "互补逻辑", value: "互斥的经典概念（如波与粒）是描述同一现象互补的侧面，共存才能完整描述。" }
    ]
  },
  // --- NEW HYDROGEN ATOM SLIDE ---
  {
    id: SlideType.QUANTUM,
    title: "氢原子电子云",
    subtitle: "ELECTRON PROBABILITY CLOUD",
    description: "直观体验波函数坍缩与概率密度分布。点击不同轨道查看电子在不同能级下的概率分布形态。",
    isInteractive: true,
  },
  // -------------------------------
  {
    id: SlideType.QUANTUM,
    title: "哥本哈根：认识与新自然观",
    subtitle: "PROBABILISTIC UNIVERSE",
    person: "上帝掷骰子吗？",
    details: [
      { label: "核心发现", value: [
        "不确定性原理：位置与动量精度存在极限。",
        "波函数坍缩：观测行为导致概率云坍缩为确定态。",
        "态叠加原理：测量前系统处于所有可能状态的叠加。"
      ]},
      { label: "自然观剧变", value: [
        "概率即根本：微观规律本质是概率性的。",
        "现象即实在：没有独立于观测的“客观实在”，观测创造现实。",
        "互补性：自然拒绝被单一的经典图像完整描绘。"
      ]}
    ]
  },

  // --- CHAPTER 4: ANDERSON ---
  {
    id: SlideType.ANDERSON,
    title: "第四章",
    subtitle: "COMPLEXITY & EMERGENCE",
    description: "层级涌现与还原论的终结",
    isChapterTitle: true
  },
  {
    id: SlideType.ANDERSON,
    title: "菲利普·安德森",
    subtitle: "MORE IS DIFFERENT",
    person: "Philip W. Anderson (1923–2020)",
    image: andersonImg,
    imageCaption: "1977 Nobel Laureate in Physics",
    details: [
      { 
        label: "多者异也 (More is Different)", 
        value: "1972年，安德森在《Science》发表了这篇划时代的文章。他指出：“将万物还原为简单基本定律的能力，并不意味着我们有能力从这些定律出发重建宇宙。”" 
      },
      { 
        label: "层级涌现", 
        value: "随着物质系统复杂度的增加（More），全新的性质会涌现出来（Different）。心理学不仅仅是生物学，生物学不仅仅是化学，化学不仅仅是物理学。每个层级都有其独立的基本规律。" 
      },
      { 
        label: "反构建主义", 
        value: "他有力地批判了极端还原论，强调我们不能单纯依靠粒子物理学来理解宏观世界（如生命、意识或超导现象）。这一思想奠定了现代凝聚态物理与复杂性科学的哲学基础。" 
      }
    ]
  },
  {
    id: SlideType.ANDERSON,
    title: "安德森：复杂性的挑战",
    subtitle: "MORE IS DIFFERENT",
    person: "P.W. Anderson (1923–2020)",
    details: [
      { label: "宏观量子现象", value: "超导与超流展示了无法通过简单叠加微观粒子性质解释的宏观集体行为。" },
      { label: "对称性破缺事实", value: "微观定律完全对称，但宏观物质（磁铁、晶体）却自发选择特定方向，丧失对称性。" },
      { label: "多体计算灾难", value: "面对10²³个粒子，直接演算薛定谔方程在数学上不可解，还原论在实践中失效。" },
      { label: "临界普适性", value: "完全不同的物理系统（液气、铁磁）在临界点遵循完全相同的幂律，暗示存在高层级法则。" }
    ]
  },
  {
    id: SlideType.ANDERSON,
    title: "安德森：涌现自然观",
    subtitle: "PHILOSOPHY OF EMERGENCE",
    person: "层级论",
    details: [
      { label: "层级涌现", value: "整体不等于部分之和。量的积累引发质变，涌现出微观层面不存在的全新性质。" },
      { label: "反构建主义", value: "承认还原论（分解），但否定构建论。高层规律无法被低层定律简单推导。" },
      { label: "对称性破缺机制", value: "物质产生结构、有序态的根本原因在于系统原有对称性的自发丧失。" },
      { label: "定律层级性", value: "每个层级（粒子、化学、生物）都有其自身独立的、基础的有效定律。" }
    ]
  },
  // --- NEW BOIDS SIMULATION SLIDE ---
  {
    id: SlideType.ANDERSON,
    title: "群体智能涌现",
    subtitle: "EMERGENCE SIMULATION",
    description: "直观体验“多者异也”：基于简单的局部规则（分离、对齐、凝聚），复杂的群体行为自发涌现，无序中诞生有序。",
    isInteractive: true,
  },
  // --- NEW COOPER PAIR SIMULATION SLIDE ---
  {
    id: SlideType.ANDERSON,
    title: "超导现象与库珀对",
    subtitle: "MACROSCOPIC QUANTUM STATE",
    description: "直观体验BCS理论：电子在低温下通过晶格畸变克服库仑排斥，两两配对（库珀对）并凝聚成宏观量子态（超导态）。",
    isInteractive: true,
  },
  // ----------------------------------
  {
    id: SlideType.ANDERSON,
    title: "安德森：方法与认识",
    subtitle: "COMPLEXITY TOOLKIT",
    person: "驯服复杂性",
    details: [
      { label: "新方法论", value: [
        "模型哈密顿量：舍弃细节，构建简化抽象模型捕捉核心机制。",
        "准粒子近似：将复杂集体运动等效为弱相互作用的独立实体。",
        "有效场论：忽略高能细节（粗粒化），专注于宏观能标下的有效理论。"
      ]},
      { label: "主要认识", value: [
        "安德森局域化：无序可导致波函数锁定，金属变绝缘体。",
        "希格斯机制：规范对称性破缺赋予粒子质量。",
        "普适类：宏观规律独立于微观细节。"
      ]}
    ]
  },

  // --- SUMMARY & ENDING ---
  {
    id: SlideType.SUMMARY,
    title: "演进螺旋",
    subtitle: "THE EVOLUTIONARY SPIRAL",
    description: "科学不仅是知识的积累，更是世界观的不断重塑。"
  },
  // --- NEW SPIRAL SIMULATION SLIDE ---
  {
      id: SlideType.SPIRAL,
      title: "循此苦旅，直抵群星",
      subtitle: "AD ASTRA PER ASPERA",
      description: "科学并非简单的圆周循环，而是永无止境的螺旋上升。",
      isInteractive: true
  },
  {
    id: SlideType.ENDING,
    title: "致谢与交流",
    subtitle: "Q & A",
    description: "科学探索永无止境"
  }
];

// --- BACKGROUND LAYER MANAGER ---
// This component ensures backgrounds are singletons and only toggle opacity,
// preventing heavy unmount/remount operations.
const BackgroundLayers: React.FC<{ currentId: SlideType }> = React.memo(({ currentId }) => {
  
  // Determine active background type based on current slide
  let activeType = 'NETWORK';
  switch (currentId) {
      case SlideType.COVER: 
      case SlideType.TOC:
      case SlideType.CONCEPTS: 
      case SlideType.ENDING:
          activeType = 'NETWORK'; break;
      case SlideType.NEWTON: activeType = 'ORBIT'; break;
      case SlideType.EINSTEIN: activeType = 'WARP'; break;
      case SlideType.QUANTUM: activeType = 'QUANTUM'; break;
      case SlideType.ANDERSON: activeType = 'CRYSTAL'; break;
      case SlideType.SUMMARY: activeType = 'ORBIT'; break;
      case SlideType.SPIRAL: activeType = 'NONE'; break; // Disable others for spiral
      default: activeType = 'NETWORK';
  }

  // Styles for transitions
  const getStyle = (type: string) => ({
      opacity: activeType === type ? 1 : 0,
      transition: 'opacity 1.5s ease-in-out',
      pointerEvents: 'none' as const,
      position: 'absolute' as const,
      inset: 0,
      zIndex: activeType === type ? 1 : 0
  });

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-900 pointer-events-none">
       <div style={getStyle('NETWORK')}><NetworkBackground /></div>
       <div style={getStyle('ORBIT')}><OrbitBackground /></div>
       <div style={getStyle('WARP')}><WarpGridBackground /></div>
       <div style={getStyle('QUANTUM')}><QuantumParticlesBackground /></div>
       <div style={getStyle('CRYSTAL')}><CrystalBackground /></div>
    </div>
  );
});

const SlideDeck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Keyboard navigation
  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 800);
    }
  }, [currentSlide, isTransitioning]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 800);
    }
  }, [currentSlide, isTransitioning]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent navigation when interacting with sliders/inputs
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
          return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // PPT Generation
  const generatePPTX = async () => {
    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_16x9';
    pres.author = 'AI Science Assistant';
    pres.title = slides[0].title;
    
    // Define Color Palette
    const colors = {
      bg: "020C1B",       // navy-950/900 mix
      bgGradient: "0A192F",
      cardBg: "112240",   // navy-700
      accent: "64FFDA",   // cyan/teal
      textMain: "CCD6F6", // slate-light
      textDim: "8892B0",  // slate-dim
      white: "FFFFFF",
      border: "233554"
    };

    const fontMain = "Microsoft YaHei";
    const fontMono = "Consolas";

    // Use for...of loop to handle async image fetching
    for (const slide of slides) {
      const pptxSlide = pres.addSlide();
      pptxSlide.background = { color: colors.bg };
      pptxSlide.addShape(pres.ShapeType.ellipse, {
          x: 9, y: -2, w: 10, h: 10,
          fill: { color: colors.bgGradient, transparency: 80 },
          line: { color: "FFFFFF", width: 0, transparency: 100 }
      });

      pptxSlide.addText(`${slide.id}  |  ${slide.subtitle}`, { 
          x: 0.3, y: 7.2, w: "50%", fontSize: 9, color: "303C55", fontFace: fontMono 
      });

      if (slide.id === SlideType.COVER) {
        pptxSlide.addText(slide.title, { 
            x: 0.5, y: 2.5, w: 9, align: "center", 
            fontSize: 44, color: colors.white, bold: true, fontFace: fontMain
        });
        if (slide.description) {
            pptxSlide.addText(slide.description, { 
                x: 2, y: 5.5, w: 6, align: "center", 
                fontSize: 16, color: colors.textDim, fontFace: fontMain 
            });
        }
      } 
      else if (slide.isChapterTitle) {
          pptxSlide.addText(slide.title, { 
              x: 0.5, y: 2.5, w: 9, align: "center", 
              fontSize: 48, color: colors.accent, bold: true, fontFace: fontMain
          });
          pptxSlide.addText(slide.subtitle, { 
              x: 0.5, y: 4, w: 9, align: "center", 
              fontSize: 24, color: colors.white, fontFace: fontMono
          });
          if (slide.description) {
              pptxSlide.addText(slide.description, { 
                  x: 1, y: 5.5, w: 8, align: "center", 
                  fontSize: 18, color: colors.textDim, fontFace: fontMain, italic: true
              });
          }
      }
      else if (slide.id === SlideType.TOC) {
        pptxSlide.addText(slide.title, { x: 0.5, y: 0.5, fontSize: 36, color: colors.white, bold: true, fontFace: fontMain });
        slide.details?.forEach((item, idx) => {
             const yPos = 2.0 + (Math.floor(idx / 2) * 1.5);
             const xPos = (idx % 2) === 0 ? 0.8 : 5.5;
             const valText = item.pptValue || (typeof item.value === 'string' ? item.value : Array.isArray(item.value) ? item.value.join(", ") : "");
             pptxSlide.addText(item.label + " " + valText, { 
                 x: xPos, y: yPos, w: 4, fontSize: 18, color: colors.textMain, fontFace: fontMain 
             });
        });
      }
      else {
        pptxSlide.addText(slide.title, { x: 0.5, y: 0.8, fontSize: 36, color: colors.white, bold: true, fontFace: fontMain });
        
        // Add Image if present
        if (slide.image) {
            try {
                // Determine full URL for fetching
                // If it starts with '/', append origin. Otherwise assume it's a full URL or relative to page.
                const imgUrl = slide.image.startsWith('/') 
                    ? window.location.origin + slide.image 
                    : slide.image;

                // Fetch image and convert to blob -> base64
                const response = await fetch(imgUrl);
                const blob = await response.blob();
                
                // Convert blob to base64
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });

                pptxSlide.addImage({ 
                    data: base64Data, 
                    x: 6.5, y: 1.5, w: 3, h: 3.5,
                    sizing: { type: 'contain', w: 3, h: 3.5 }
                });
            } catch (error) {
                console.error("Failed to load image for PPT:", slide.image, error);
                // Fallback: try adding by path anyway if fetch fails (unlikely to work if local relative path)
                pptxSlide.addImage({ 
                    path: slide.image, 
                    x: 6.5, y: 1.5, w: 3, h: 3.5,
                    sizing: { type: 'contain', w: 3, h: 3.5 }
                });
            }
        }

        if (slide.details && slide.details.length > 0) {
            slide.details.forEach((item, idx) => {
                 pptxSlide.addText(item.label, { x: 0.5, y: 2 + idx, w: 3, fontSize: 14, color: colors.accent, bold: true, fontFace: fontMain });
                 
                 let valText = "";
                 if (item.pptValue) {
                     valText = item.pptValue;
                 } else if (typeof item.value === 'string') {
                     valText = item.value;
                 } else if (Array.isArray(item.value)) {
                     valText = item.value.join("; ");
                 }

                 if(valText) {
                     pptxSlide.addText(valText, { x: 3.6, y: 2 + idx, w: slide.image ? 2.5 : 5, fontSize: 12, color: colors.textMain, fontFace: fontMain });
                 }
            });
        }
      }
    }

    pres.writeFile({ fileName: "Science_Evolution_Immersive.pptx" });
  };

  const renderCover = (data: SlideData) => (
    <div className="flex flex-col items-center text-center px-4 max-w-6xl">
      <h2 className="text-slate-dim/60 text-sm md:text-base tracking-[0.4em] font-mono mb-12 uppercase animate-[fadeInUp_1s_ease-out_0.3s_forwards] opacity-0">
        SCIENTIFIC EVOLUTION
      </h2>
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-thin tracking-tight text-slate-100 mb-8 leading-tight drop-shadow-2xl animate-[fadeInUp_1.2s_ease-out_0.5s_forwards] opacity-0">
        {data.title}
      </h1>
      <p className="text-cyan-300/80 text-xl md:text-3xl font-light tracking-wider mb-10 animate-[fadeInUp_1s_ease-out_0.7s_forwards] opacity-0">
        {data.subtitle}
      </p>
      <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-12 animate-[widthGrow_1s_ease-out_0.8s_forwards] opacity-0"></div>
      <p className="text-slate-dim text-xl md:text-3xl font-light max-w-4xl mx-auto leading-relaxed animate-[fadeInUp_1s_ease-out_1s_forwards] opacity-0">
        {data.description}
      </p>
      <div className="mt-16 text-xl md:text-2xl font-mono text-slate-dim/60 animate-[fadeInUp_1s_ease-out_1.5s_forwards] opacity-0">
        {data.person}
      </div>
    </div>
  );

  const renderChapterTitle = (data: SlideData) => (
      <div className="flex flex-col items-center justify-center text-center w-full h-full max-w-5xl px-8">
          <div className="relative mb-12 animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0">
               <div className="absolute inset-0 bg-cyan-500 blur-[80px] opacity-20 rounded-full"></div>
               <h1 className="relative text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-500 tracking-tight leading-none">
                   {data.title}
               </h1>
          </div>
          
          <div className="w-24 h-1 bg-cyan-500 mb-12 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.6)] animate-[widthGrow_1s_ease-out_0.5s_forwards] opacity-0"></div>

          <h2 className="text-3xl md:text-5xl font-thin text-white mb-6 tracking-[0.2em] uppercase animate-[fadeInUp_1s_ease-out_0.6s_forwards] opacity-0">
              {data.subtitle}
          </h2>
          
          <p className="text-xl md:text-2xl text-slate-400 font-light italic max-w-3xl animate-[fadeInUp_1s_ease-out_0.8s_forwards] opacity-0">
              {data.description}
          </p>
      </div>
  );

  const renderTOC = (data: SlideData) => (
    <div className="w-full max-w-7xl px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-2 animate-fade-in-up">{data.title}</h1>
        <p className="text-slate-dim font-mono text-sm tracking-widest uppercase">{data.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-12">
        {data.details?.map((item, idx) => (
          <div key={idx} className="flex items-center group cursor-default" style={{ animation: `fadeInUp 0.8s ease-out ${0.2 + (idx * 0.1)}s forwards`, opacity: 0 }}>
            <div className="text-6xl font-thin text-slate-700 mr-8 font-mono group-hover:text-cyan-400 transition-colors duration-300">{item.label}</div>
            <div className="h-px bg-slate-800 flex-grow mr-6 group-hover:bg-cyan-900 transition-colors"></div>
            <div className="text-2xl md:text-3xl text-slate-300 font-light group-hover:text-white transition-colors">
                {typeof item.value === 'string' ? item.value : 'Visual Content'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConcepts = (data: SlideData) => (
    <div className="w-full max-w-[90rem] px-4">
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-2 animate-fade-in-up">{data.title}</h1>
        <p className="text-slate-dim font-mono text-sm tracking-widest uppercase">{data.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { icon: Disc, title: "自然观", subtitle: "View of Nature", desc: "人们对自然界最根本的看法和观点，回答的是关于自然界“最本质”的问题。" },
          { icon: Share2, title: "科学方法", subtitle: "Methodology", desc: "为了获得客观真理而采用的一整套规则、程序、手段和技巧的总和（如：归纳、演绎、实验）。" },
          { icon: Layers, title: "科学认识", subtitle: "Scientific Knowledge", desc: "通过科学认识方法，对自然界进行研究获得的客观事实、理论、定律和模型。" }
        ].map((card, idx) => (
          <div key={idx} className="glass-panel p-12 rounded-xl border border-slate-light/5 hover:border-cyan-500/30 transition-all duration-500 group hover:-translate-y-2" style={{ animation: `fadeInUp 0.8s ease-out ${0.2 * idx}s forwards`, opacity: 0, transform: 'translateY(20px)' }}>
            <div className="mb-8 text-slate-light/80 group-hover:text-cyan-300 transition-colors">
              <card.icon size={48} strokeWidth={1} />
            </div>
            <h3 className="text-3xl text-slate-100 font-medium mb-2">{card.title}</h3>
            <div className="text-sm font-mono text-slate-dim/60 mb-8 uppercase tracking-wider">{card.subtitle}</div>
            <p className="text-slate-dim font-light leading-relaxed text-lg md:text-xl text-justify">
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewtonLoop = (data: SlideData) => (
    <div className="w-full max-w-[90rem] h-full flex flex-col items-center justify-center px-4">
        <div className="text-center mb-12 md:mb-20">
            <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-2 animate-fade-in-up">{data.title}</h1>
            <p className="text-slate-dim font-mono text-sm tracking-widest uppercase">{data.subtitle}</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full max-w-7xl">
            
            {/* 1. Natural View */}
            <div className="relative glass-panel p-8 rounded-2xl border-t-4 border-t-cyan-500/60 flex flex-col items-center text-center group animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] opacity-0 hover:-translate-y-2 transition-transform duration-300 bg-gradient-to-b from-navy-800/40 to-navy-950/40">
                <div className="bg-navy-950 p-4 rounded-full mb-6 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:scale-110 transition-transform duration-300">
                    <Disc size={32} className="text-cyan-400" />
                </div>
                <h3 className="text-xl md:text-2xl text-cyan-100 font-bold mb-3">机械自然观</h3>
                <p className="text-slate-300 font-light leading-relaxed text-sm md:text-base text-justify">
                    {data.details?.[0].value}
                </p>
                
                {/* Arrow 1->2 */}
                <div className="hidden md:flex absolute top-1/2 -right-10 z-20 text-cyan-500/30">
                    <ArrowRight size={40} className="animate-pulse" />
                </div>
                 <div className="md:hidden flex justify-center py-4 text-cyan-500/30">
                    <ArrowDown size={32} className="animate-pulse" />
                </div>
            </div>

             {/* 2. Method */}
             <div className="relative glass-panel p-8 rounded-2xl border-t-4 border-t-purple-500/60 flex flex-col items-center text-center group animate-[fadeInUp_0.8s_ease-out_0.4s_forwards] opacity-0 hover:-translate-y-2 transition-transform duration-300 bg-gradient-to-b from-navy-800/40 to-navy-950/40">
                <div className="bg-navy-950 p-4 rounded-full mb-6 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:scale-110 transition-transform duration-300">
                    <Cpu size={32} className="text-purple-400" />
                </div>
                <h3 className="text-xl md:text-2xl text-purple-100 font-bold mb-3">分析与综合</h3>
                <p className="text-slate-300 font-light leading-relaxed text-sm md:text-base text-justify">
                    {data.details?.[1].value}
                </p>

                 {/* Arrow 2->3 */}
                 <div className="hidden md:flex absolute top-1/2 -right-10 z-20 text-purple-500/30">
                    <ArrowRight size={40} className="animate-pulse" />
                </div>
                 <div className="md:hidden flex justify-center py-4 text-purple-500/30">
                    <ArrowDown size={32} className="animate-pulse" />
                </div>
            </div>

             {/* 3. Knowledge */}
             <div className="relative glass-panel p-8 rounded-2xl border-t-4 border-t-emerald-500/60 flex flex-col items-center text-center group animate-[fadeInUp_0.8s_ease-out_0.6s_forwards] opacity-0 hover:-translate-y-2 transition-transform duration-300 bg-gradient-to-b from-navy-800/40 to-navy-950/40">
                <div className="bg-navy-950 p-4 rounded-full mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:scale-110 transition-transform duration-300">
                    <Layers size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-xl md:text-2xl text-emerald-100 font-bold mb-3">科学认识</h3>
                <p className="text-slate-300 font-light leading-relaxed text-sm md:text-base text-justify">
                    {data.details?.[2].value}
                </p>
            </div>
        </div>
        
        {/* Bottom Feedback Arrow */}
        <div className="w-full max-w-7xl mt-10 hidden md:block relative h-20 animate-[fadeInUp_1s_ease-out_0.8s_forwards] opacity-0">
            <div className="absolute top-0 left-[16%] right-[16%] h-full border-b-2 border-l-2 border-r-2 border-slate-700/30 rounded-b-[3rem] flex justify-center items-end pb-6">
                 <div className="bg-navy-900 px-6 py-1 text-xs font-mono text-slate-400 tracking-[0.2em] uppercase translate-y-[50%] flex items-center gap-2 border border-slate-800 rounded-full">
                    <RefreshCw size={14} className="animate-spin-reverse-slow" />
                    Self-Reinforcing Cycle
                 </div>
            </div>
             {/* Arrow Heads for visual flow */}
             <div className="absolute -top-1 left-[16%] -translate-x-1/2 -translate-y-full text-slate-700/30">
                 <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-slate-700/30"></div>
             </div>
        </div>

    </div>
  );

  const renderArchitects = (data: SlideData) => (
    <div className="w-full max-w-[95rem] px-4 flex flex-col justify-center h-full">
      <div className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-2 animate-fade-in-up">{data.title}</h1>
          <p className="text-slate-dim font-mono text-sm tracking-widest uppercase mb-8">{data.subtitle}</p>
          
          {/* DESCRIPTION BLOCK */}
          {data.description && (
             <div className="max-w-4xl mx-auto mb-12 animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0">
                 <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed">
                   {data.description}
                 </p>
             </div>
          )}
      </div>
      
      {/* Architects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-[50vh] min-h-[400px]">
          {data.details?.map((item, idx) => (
              <div key={idx} 
                   className="relative group h-full rounded-xl overflow-hidden border border-slate-700/50 bg-navy-800/30 backdrop-blur-sm transition-all duration-500 hover:border-cyan-500/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-900/20"
                   style={{ animation: `fadeInUp 0.8s ease-out ${0.2 + idx * 0.15}s forwards`, opacity: 0, transform: 'translateY(30px)' }}>
                  
                  {/* Image Container */}
                  <div className="absolute inset-0 z-0">
                      <img 
                          src={item.value as string} 
                          alt={item.label} 
                          className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/50 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Text Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end h-full">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                           <div className="w-8 h-1 bg-cyan-500 mb-4 rounded-full group-hover:w-16 transition-all duration-500"></div>
                           <h3 className="text-xl md:text-2xl font-bold text-slate-100 mb-1 leading-tight">{item.label}</h3>
                           <p className="text-cyan-300/80 font-mono text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                               {item.pptValue}
                           </p>
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );

  const renderQuantumCrisis = (data: SlideData) => (
    <div className="w-full max-w-[95rem] px-4 flex flex-col h-full justify-center">
       {/* Header Section */}
       <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-2 animate-fade-in-up">{data.title}</h1>
          <p className="text-slate-dim font-mono text-sm tracking-widest uppercase mb-2">{data.subtitle}</p>
          <div className="text-xl text-cyan-200/80 font-light italic animate-[fadeInUp_1s_ease-out_0.3s_forwards] opacity-0">
              {data.person}
          </div>
       </div>

       {/* Grid Section */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full animate-[fadeInUp_1s_ease-out_0.5s_forwards] opacity-0">
          {data.details?.map((item, idx) => (
             <div key={idx} className="glass-panel p-8 rounded-xl border border-slate-light/10 hover:border-cyan-500/30 transition-all duration-300 group hover:-translate-y-2 flex flex-col h-full">
                <h3 className="text-2xl text-cyan-100 font-bold mb-4 pb-3 border-b border-slate-700/50 flex items-center gap-3">
                    <span className="text-cyan-500/50 text-sm font-mono">0{idx+1}</span>
                    {item.label}
                </h3>
                <div className="text-slate-300 font-light text-lg leading-relaxed flex-grow">
                    {item.value}
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderContentSlide = (data: SlideData) => {
    // 1. FULL-WIDTH VISUAL MODE (If no details are present)
    if ((!data.details || data.details.length === 0) && !data.isInteractive) {
        return (
            <div className="relative w-full h-full overflow-hidden">
                {/* Background Animation Layer */}
                <div className="absolute inset-0 z-0">
                    <GravityVisual />
                </div>
                
                {/* Overlay HUD - Formula top right, status bottom right */}
                <GravityOverlay />

                {/* Top Left Title Block */}
                <div className="absolute top-12 left-12 z-30 pointer-events-none text-left">
                     {/* The Scientific Kicker - positioned cleanly above */}
                    <div className="flex items-center gap-3 opacity-70 mb-4 animate-[fadeInUp_1s_ease-out_forwards]">
                         <div className="h-[1px] w-8 bg-cyan-500"></div>
                         <span className="font-mono text-[10px] md:text-xs font-medium tracking-[0.3em] text-cyan-400 uppercase">
                            Orbital Mechanics // Newtonian
                         </span>
                    </div>

                    {/* Main Title - Large and Clean */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-thin text-white tracking-tight drop-shadow-2xl animate-[fadeInUp_1s_ease-out_0.2s_forwards] mb-2 text-shadow-glow">
                        {data.title}
                    </h1>
                    
                     {/* Subtitle/English Title */}
                    <div className="text-sm md:text-lg font-light text-slate-400 animate-[fadeInUp_1s_ease-out_0.4s_forwards] tracking-widest uppercase pl-1">
                        {data.subtitle}
                    </div>
                </div>
            </div>
        );
    }

    // 2. SPECIAL LAYOUT: Newton Loop
    if (data.subtitle === "EVOLUTIONARY LOOP") {
       return renderNewtonLoop(data);
    }

    // 3. SPECIAL LAYOUT: Interactive
    if (data.isInteractive) {
        // === NEW HYDROGEN ATOM RENDERER ===
        if (data.subtitle === "ELECTRON PROBABILITY CLOUD") {
             return (
                <div className="w-full max-w-[95rem] px-4 flex flex-col justify-center h-full">
                    <div className="text-center mb-4">
                        <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-2 animate-fade-in-up">{data.title}</h1>
                        <p className="text-slate-dim font-mono text-sm tracking-widest uppercase mb-2">{data.subtitle}</p>
                         {data.description && (
                            <p className="text-slate-300 font-light max-w-3xl mx-auto animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0 text-base md:text-lg">
                                {data.description}
                            </p>
                        )}
                    </div>
                    <div className="w-full h-[60vh] md:h-[65vh] animate-[fadeInUp_1s_ease-out_0.5s_forwards] opacity-0">
                        <QuantumOrbitals />
                    </div>
                </div>
            );
        }

        // === NEW BOIDS SIMULATION ===
        if (data.subtitle === "EMERGENCE SIMULATION") {
             return (
                <div className="w-full max-w-[95rem] px-4 flex flex-col justify-center h-full">
                    <div className="w-full h-[80vh] animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0">
                        <BoidsSimulation />
                    </div>
                </div>
            );
        }

        // === NEW COOPER PAIR SIMULATION ===
        if (data.subtitle === "MACROSCOPIC QUANTUM STATE") {
            return (
               <div className="w-full max-w-[95rem] px-4 flex flex-col justify-center h-full">
                   <div className="w-full h-[80vh] animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0">
                       <CooperPairSimulation />
                   </div>
               </div>
           );
        }

        // === DEFAULT INTERACTIVE (GRAVITY) ===
        return (
            <div className="w-full max-w-[95rem] px-4 flex flex-col justify-center h-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-2 animate-fade-in-up">{data.title}</h1>
                    <p className="text-slate-dim font-mono text-sm tracking-widest uppercase mb-6">{data.subtitle}</p>
                    {data.description && (
                        <p className="text-slate-300 font-light max-w-3xl mx-auto mb-8 animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0 text-lg">
                            {data.description}
                        </p>
                    )}
                </div>
                <div className="w-full animate-[fadeInUp_1s_ease-out_0.5s_forwards] opacity-0">
                    <RelativityDemo />
                </div>
            </div>
        );
    }

    // 4. SPECIAL LAYOUT: Newton Achievements (3 Cards)
    if (data.subtitle === "SCIENTIFIC ACHIEVEMENTS") {
      return (
        <div className="w-full max-w-[90rem] px-4 flex flex-col justify-center h-full">
            <div className="text-center mb-12">
                 <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-2 animate-fade-in-up">{data.title}</h1>
                 <p className="text-slate-dim font-mono text-sm tracking-widest uppercase">{data.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch flex-grow max-h-[70vh]">
                {data.details?.map((item, idx) => (
                    <div key={idx} className="glass-panel p-8 rounded-xl border border-slate-light/10 hover:border-cyan-500/30 transition-all duration-300 group hover:-translate-y-2 flex flex-col h-full overflow-hidden" style={{ animation: `fadeInUp 0.8s ease-out ${0.2 * idx}s forwards`, opacity: 0, transform: 'translateY(20px)' }}>
                         <div className="text-6xl font-thin text-cyan-400/20 mb-4 group-hover:text-cyan-400/40 transition-colors">
                            0{idx+1}
                         </div>
                         <h3 className="text-2xl text-cyan-100 font-bold mb-4">{item.label}</h3>
                         <div className="h-px bg-slate-700/50 w-full mb-6"></div>
                         <div className="text-slate-300 font-light text-lg leading-relaxed text-justify flex-grow overflow-y-auto no-scrollbar">
                            {item.value}
                         </div>
                    </div>
                ))}
            </div>
        </div>
      );
    }

    // 5. SPECIAL LAYOUT: Quantum Architects
    if (data.subtitle === "THE QUANTUM ARCHITECTS") {
       return renderArchitects(data);
    }

    // 6. SPECIAL LAYOUT: Quantum Crisis
    if (data.subtitle === "THE QUANTUM CRISIS") {
        return renderQuantumCrisis(data);
    }

    // 7. STANDARD SPLIT LAYOUT
    let VisualComponent = null;
    if (data.id === SlideType.EINSTEIN && data.title.includes("自然观")) VisualComponent = EinsteinVisual;
    else if (data.id === SlideType.QUANTUM && data.title.includes("认识")) VisualComponent = QuantumVisual;
    else if (data.id === SlideType.ANDERSON && data.title.includes("复杂性")) VisualComponent = AndersonVisual;

    return (
    <div className="w-full max-w-[95rem] grid grid-cols-1 lg:grid-cols-12 gap-20 items-center content-center min-h-[70vh]">
      <div className="lg:col-span-4 text-left lg:sticky lg:top-32 flex flex-col h-full justify-center">
        <div className="inline-block self-start px-4 py-1.5 border border-slate-light/20 rounded-full text-sm font-mono text-slate-dim mb-8 animate-[fadeInUp_0.8s_ease-out_0.1s_forwards] opacity-0">
          {data.subtitle}
        </div>
        <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-tight animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0">
          {data.title.split('：').map((part, i) => (
              <span key={i} className={i===0 ? "block text-3xl opacity-70 mb-4" : "block"}>{part}</span>
          ))}
        </h1>
        {data.person && (
            <div className="text-2xl text-cyan-200/80 font-light italic mb-10 animate-[fadeInUp_1s_ease-out_0.3s_forwards] opacity-0 border-l-4 border-cyan-500/30 pl-6">
            {data.person}
            </div>
        )}
        
        {/* Render Image OR Visual Component */}
        {data.image ? (
            <div className="w-full mt-8 lg:mt-auto rounded-xl overflow-hidden shadow-2xl shadow-black/40 animate-[fadeInUp_1s_ease-out_0.5s_forwards] opacity-0 border border-slate-700/50 transform-gpu relative group">
                <img src={data.image} alt={data.title} className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                {data.imageCaption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 border-t border-slate-700/30">
                        <p className="text-sm text-slate-300 font-mono text-center">{data.imageCaption}</p>
                    </div>
                )}
            </div>
        ) : VisualComponent ? (
            <div className="w-full h-80 mt-8 lg:mt-auto rounded-xl overflow-hidden shadow-2xl shadow-black/40 animate-[fadeInUp_1s_ease-out_0.5s_forwards] opacity-0 border border-slate-700/50 transform-gpu">
                <VisualComponent />
            </div>
        ) : (
             <div className="hidden lg:block w-20 h-1.5 bg-slate-800 rounded animate-[fadeInUp_1s_ease-out_0.4s_forwards] opacity-0 mt-auto"></div>
        )}
      </div>

      <div className="lg:col-span-8 grid grid-cols-1 gap-10">
        {data.details?.map((item, idx) => (
          <div 
            key={idx} 
            className="glass-panel p-10 rounded-2xl border border-slate-light/5 hover:border-cyan-500/20 transition-colors"
            style={{ animation: `fadeInUp 0.8s ease-out ${0.4 + (idx * 0.1)}s forwards`, opacity: 0, transform: 'translateY(20px)' }}
          >
            <div className="flex items-center gap-5 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"></div>
                <div className="text-xl md:text-2xl font-bold text-cyan-100 uppercase tracking-wider">{item.label}</div>
            </div>
            
            {/* Conditional rendering for value - only render if value exists */}
            {item.value ? (
                <div className="text-slate-300 font-light text-xl md:text-2xl leading-loose pl-8 border-l border-slate-700/50 ml-[5px]">
                {Array.isArray(item.value) ? (
                    <ul className="space-y-4 mt-3">
                    {item.value.map((val, vIdx) => (
                        <li key={vIdx} className="flex items-start gap-4">
                        <ArrowRight size={22} className="mt-2 text-slate-500 flex-shrink-0" />
                        <span>{val}</span>
                        </li>
                    ))}
                    </ul>
                ) : (
                   typeof item.value === 'string' ? <p className="text-slate-300">{item.value}</p> : item.value
                )}
                </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
  };

  const renderSummary = (data: SlideData) => (
    <div className="flex flex-col items-center w-full max-w-[90rem] px-4">
      <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-24 animate-fade-in-up">{data.title}</h1>
      
      <div className="relative w-full grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent -z-10"></div>
        {[
          { step: "01", title: "自然观", desc: "决定了方法", sub: "Paradigm", icon: Microscope },
          { step: "02", title: "方法论", desc: "产出了知识", sub: "Method", icon: BrainCircuit },
          { step: "03", title: "科学认识", desc: "重塑了自然观", sub: "Knowledge", icon: Layers }
        ].map((item, i) => (
           <div key={i} className="relative flex flex-col items-center bg-navy-900/60 backdrop-blur-md border border-slate-700/50 p-12 rounded-2xl hover:bg-navy-800/60 transition-all duration-500 group min-h-[300px]"
                style={{ animation: `fadeInUp 0.8s ease-out ${0.3 + (i * 0.2)}s forwards`, opacity: 0 }}>
              <div className="absolute -top-7 bg-navy-950 border border-slate-700 text-cyan-400 font-mono text-base px-5 py-2 rounded-full shadow-lg shadow-cyan-900/20 group-hover:bg-cyan-900/20 group-hover:text-cyan-300 transition-colors">
                {item.step}
              </div>
              <div className="mb-8 text-slate-400 mt-4 group-hover:text-cyan-400 transition-colors">
                  <item.icon size={48} strokeWidth={1} />
              </div>
              <h3 className="text-3xl text-slate-100 mb-3 font-medium">{item.title}</h3>
              <div className="text-sm text-cyan-400/60 font-mono uppercase mb-8 tracking-widest">{item.sub}</div>
              <p className="text-center text-slate-400 text-xl font-light">{item.desc}</p>
           </div>
        ))}
      </div>

      <div className="mt-24 glass-panel px-16 py-12 rounded-2xl max-w-5xl text-center animate-[fadeInUp_1s_ease-out_1.5s_forwards] opacity-0 border-t-4 border-t-cyan-500/30">
         <p className="text-slate-200 text-3xl italic font-light leading-relaxed">
           “新知识迫使我们抛弃旧的世界观，从而开启新的循环。”
         </p>
      </div>
    </div>
  );

  const renderEnding = (data: SlideData) => (
    <div className="text-center px-4">
       <div className="mb-12 animate-spin-slow opacity-20">
         <Circle size={160} strokeWidth={0.5} className="text-white" />
       </div>
       <h1 className="text-6xl md:text-9xl font-thin text-white tracking-tighter mb-10 animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0">
         {data.title}
       </h1>
       <div className="text-3xl font-mono text-cyan-400 tracking-widest uppercase animate-[fadeInUp_1s_ease-out_0.5s_forwards] opacity-0">
         {data.subtitle}
       </div>
    </div>
  );

  const currentData = slides[currentSlide];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-navy-900 text-slate-light selection:bg-cyan-900/30 font-sans">
      
      {/* OPTIMIZED BACKGROUND LAYER */}
      <BackgroundLayers currentId={currentData.id} />

      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#020c1b_100%)] opacity-60"></div>

      {/* Content Layer */}
      {/* If SPIRAL, render full screen without padding */}
      {currentData.id === SlideType.SPIRAL ? (
         <div className="absolute inset-0 z-30 animate-fade-in-slow">
            <SpiralSimulation />
         </div>
      ) : (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 md:px-32 overflow-y-auto md:overflow-hidden no-scrollbar">
           <div key={currentSlide} className="w-full flex justify-center py-10 md:py-0 h-full items-center">
            {currentData.id === SlideType.COVER && renderCover(currentData)}
            {currentData.isChapterTitle && renderChapterTitle(currentData)}
            {!currentData.isChapterTitle && currentData.id === SlideType.TOC && renderTOC(currentData)}
            {!currentData.isChapterTitle && currentData.id === SlideType.CONCEPTS && renderConcepts(currentData)}
            {!currentData.isChapterTitle && (currentData.id === SlideType.NEWTON || 
              currentData.id === SlideType.EINSTEIN || 
              currentData.id === SlideType.QUANTUM || 
              currentData.id === SlideType.ANDERSON) && renderContentSlide(currentData)}
            {currentData.id === SlideType.SUMMARY && renderSummary(currentData)}
            {currentData.id === SlideType.ENDING && renderEnding(currentData)}
           </div>
        </div>
      )}

      {/* Controls */}
      <div className="fixed bottom-8 left-0 right-0 z-50 px-8 md:px-16 flex justify-between items-end pointer-events-none">
        
        <div className="hidden md:flex items-center space-x-6 text-slate-dim text-xs font-mono tracking-widest uppercase opacity-60 pointer-events-auto">
          <span>{currentSlide + 1} <span className="mx-2">/</span> {slides.length}</span>
          <div className="w-72 h-[2px] bg-slate-800 relative overflow-hidden rounded-full">
            <div 
              className="absolute top-0 left-0 h-full bg-cyan-400/50 transition-all duration-500 ease-out"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
          <span>{currentData.id}</span>
        </div>

        <div className="md:hidden text-xs font-mono text-slate-dim opacity-50 pointer-events-auto bg-navy-900/80 px-4 py-1.5 rounded-full backdrop-blur">
          {currentSlide + 1} / {slides.length}
        </div>

        <div className="flex items-center space-x-3 glass-panel rounded-full p-2 backdrop-blur-md bg-navy-900/40 border-slate-700/50 pointer-events-auto shadow-lg shadow-black/20">
           <button 
             onClick={handlePrev} 
             disabled={currentSlide === 0}
             className="p-3.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-20 text-slate-light"
           >
             <ChevronLeft size={24} strokeWidth={1.5} />
           </button>
           <button 
             onClick={handleNext} 
             disabled={currentSlide === slides.length - 1}
             className="p-3.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-20 text-slate-light"
           >
             <ChevronRight size={24} strokeWidth={1.5} />
           </button>
        </div>
        
        <div className="flex items-center space-x-3 pointer-events-auto">
            <button 
                onClick={generatePPTX}
                className="p-3.5 hover:bg-white/10 rounded-full transition-colors text-slate-dim hover:text-slate-light opacity-60 hover:opacity-100"
                title="导出 PPT"
            >
                <Download size={20} strokeWidth={1.5} />
            </button>
            <button onClick={toggleFullscreen} className="p-3.5 hover:bg-white/10 rounded-full transition-colors text-slate-dim hover:text-slate-light opacity-60 hover:opacity-100 hidden md:block">
            {isFullscreen ? <Minimize2 size={20} strokeWidth={1.5} /> : <Maximize2 size={20} strokeWidth={1.5} />}
            </button>
        </div>
      </div>

      <style>{`
        @keyframes widthGrow { from { width: 0; opacity: 0; } to { width: 8rem; opacity: 1; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .text-shadow-glow { text-shadow: 0 0 30px rgba(6, 182, 212, 0.4); }
      `}</style>
    </div>
  );
};

export default SlideDeck;
