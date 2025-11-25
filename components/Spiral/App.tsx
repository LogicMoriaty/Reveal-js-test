import React, { useEffect, useRef, useState, useCallback } from 'react';

// --- Constants & Types ---

const COLORS = {
  bg: '#0a192f', // Deep Navy Blue
  particle: 'rgba(100, 255, 218, 0.4)', // Faint Cyan for path
  particleHighlight: 'rgba(100, 255, 218, 0.8)',
  line: 'rgba(100, 255, 218, 0.1)', // Very subtle connection lines
  hero: '#ffffff', // Bright white for the "Science" point
  heroGlow: 'rgba(100, 255, 218, 0.6)',
  // Star colors (will be used in array)
  artifact: 'rgba(136, 146, 176, 0.25)', // Slate/Blue-grey
  artifactLine: 'rgba(136, 146, 176, 0.15)', 
  gridWarp: 'rgba(100, 255, 218, 0.08)', 
  // Formula color split for SVG fill usage
  formulaHex: '#a8b2d1', 
  formulaAlpha: 0.15, // Reduced for subtlety
};

// Realistic Stellar Colors (approximate hex/rgba for O, B, A, F, G, K, M class stars)
const STAR_PALETTE = [
  'rgba(155, 176, 255, 0.95)', // O-type (Blue) - Rare, bright
  'rgba(170, 191, 255, 0.9)',  // B-type (Blue-white)
  'rgba(202, 215, 255, 0.9)',  // A-type (White-Blue)
  'rgba(248, 247, 255, 0.9)',  // F-type (White)
  'rgba(255, 244, 234, 0.9)',  // G-type (Yellow-White) - Sun-like
  'rgba(255, 221, 180, 0.9)',  // K-type (Orange)
  'rgba(255, 204, 111, 0.85)', // M-type (Red)
];

interface Point {
  id: number;
  y: number;        // World Y position (relative to helix loop)
  angleOffset: number; 
  radiusOffset: number; 
  opacity: number;
}

type ArtifactType = 'node' | 'arc' | 'line' | 'grid' | 'crystal' | 'dust' | 'formula';

interface Artifact {
  id: number;
  type: ArtifactType;
  x: number;
  y: number;
  z: number; // Depth scale factor (0.5 - 1.5)
  speed: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
  
  // Type specific properties
  connections?: number[]; // IDs of other nodes to connect to
  points?: {x: number, y: number}[]; // For Grids and Crystals relative to center
  arcStart?: number;
  arcEnd?: number;
  lineLength?: number;
  text?: string; // For formulas (stores the LaTeX key)
}

interface Star {
  x: number;
  y: number; 
  z: number; // Parallax depth factor (0.1 = far/slow, 1.0 = near/fast)
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  opacityOffset: number;
  color: string; 
}

// Full LaTeX Formula List
const FORMULAS_LATEX = [
  "F = ma",
  "\\nabla^2 \\phi = 4\\pi G\\rho",
  "R_{\\mu\\nu} - \\frac{1}{2}Rg_{\\mu\\nu} = \\kappa T_{\\mu\\nu}",
  "E = mc^2",
  "\\rho \\left(\\frac{\\partial \\mathbf{v}}{\\partial t} + \\mathbf{v} \\cdot \\nabla \\mathbf{v}\\right) = -\\nabla p + \\mu \\nabla^2 \\mathbf{v} + \\mathbf{f}",
  "\\oint_{\\partial \\Omega} \\mathbf{E} \\cdot d\\mathbf{l} = - \\frac{d}{dt} \\int_{\\Omega} \\mathbf{B} \\cdot d\\mathbf{S}",
  "(i\\gamma^\\mu\\partial_\\mu - m)\\psi = 0",
  "K(b,a) = \\int_{a}^{b} \\mathcal{D}x(t) \\, \\exp\\left( \\frac{i}{\\hbar} S[x(t)] \\right)",
  "S = k_B \\ln \\Omega",
  "F = F_n + \\alpha |\\psi|^2 + \\frac{\\beta}{2} |\\psi|^4 + \\frac{1}{2m^*} |(-i\\hbar\\nabla - 2e\\mathbf{A})\\psi|^2",
  "|\\Psi_{BCS}\\rangle = \\prod_{\\mathbf{k}} (u_{\\mathbf{k}} + v_{\\mathbf{k}}c^\\dagger_{\\mathbf{k}\\uparrow}c^\\dagger_{-\\mathbf{k}\\downarrow}) |0\\rangle",
  "\\frac{d^2x^\\mu}{d\\tau^2} + \\Gamma^\\mu_{\\alpha\\beta} \\frac{dx^\\alpha}{d\\tau} \\frac{dx^\\beta}{d\\tau} = 0",
  "\\int_{\\partial \\Omega} \\omega = \\int_{\\Omega} d\\omega",
  "\\mathcal{L} = -\\frac{1}{4}F_{\\mu\\nu}F^{\\mu\\nu} + i\\bar{\\psi}\\not{D}\\psi + h.c. + \\psi_i y_{ij} \\psi_j \\phi + h.c. + |D_\\mu\\phi|^2 - V(\\phi)",
  "\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} \\,dx",
  "\\frac{\\partial g}{\\partial \\ln \\mu} = \\beta(g)",
  "i\\hbar\\frac{\\partial}{\\partial t}\\psi = \\hat{H}\\psi",
  "[x, p] = i\\hbar",
  "H = -t \\sum_{\\langle i,j \\rangle} c_i^\\dagger c_j",
  "\\int_{a}^{b} f(x) dx",
  "G \\cong S_n",
  "e^{i\\pi} + 1 = 0",
  "\\sigma_x \\sigma_p \\ge \\frac{\\hbar}{2}",
  "Z = \\sum_{i} e^{-\\beta E_i}",
  "\\frac{\\partial^2 u}{\\partial t^2} = c^2 \\nabla^2 u",
  "H(X) = -\\sum_{i=1}^n P(x_i) \\log_2 P(x_i)",
  "\\partial_\\mu j^\\mu = 0",
  "x_{n+1} = r x_n (1 - x_n)",
  "F_{\\mu\\nu}^a = \\partial_\\mu A_\\nu^a - \\partial_\\nu A_\\mu^a + g f^{abc} A_\\mu^b A_\\nu^c",
  "f(a) = \\frac{1}{2\\pi i} \\oint_\\gamma \\frac{f(z)}{z-a} dz",
  "PV = nRT",
  "\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s}",
  "t' = \\gamma (t - \\frac{vx}{c^2})"
];

// --- Helper Functions ---

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Pick a random star color, weighted slightly towards common types (White/Orange) over rare types (Blue/Red)
const getRandomStarColor = () => {
  const r = Math.random();
  if (r > 0.95) return STAR_PALETTE[0]; // O - Blue (Rare)
  if (r > 0.85) return STAR_PALETTE[6]; // M - Red 
  if (r > 0.70) return STAR_PALETTE[1]; // B - Blue White
  if (r > 0.50) return STAR_PALETTE[5]; // K - Orange
  return STAR_PALETTE[Math.floor(Math.random() * 3) + 2]; // A, F, G (Whites/Yellows)
};

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation State
  const [phase, setPhase] = useState<'ground' | 'ascending' | 'space' | 'descending'>('ground');
  
  // Logic State
  const cameraY = useRef(0); 
  const targetCameraY = useRef(0);
  
  const groundPoints = useRef<Point[]>([]); // The Helix
  const artifacts = useRef<Artifact[]>([]); // The Background Knowledge/History
  const stars = useRef<Star[]>([]);         // The Destination

  // Formula rendering cache
  const formulasRendered = useRef<Record<string, HTMLImageElement>>({});
  const [formulasReady, setFormulasReady] = useState(false);

  const timeRef = useRef(0);
  const animationFrameId = useRef<number>(0);
  
  // Helix Config
  const HELIX_TWIST = 0.01; 
  const HELIX_SPEED = 0.01; 
  const HELIX_RADIUS_RATIO = 0.22; 
  const SCROLL_SPEED = 1.2; 

  // --- Initialization ---

  // 1. Pre-render MathJax Formulas to Images
  useEffect(() => {
    let attempts = 0;
    const renderFormulas = async () => {
      // Check if MathJax is loaded
      // @ts-ignore
      if (window.MathJax && window.MathJax.tex2svg) {
        const cache: Record<string, HTMLImageElement> = {};
        const promises = FORMULAS_LATEX.map((tex) => {
          return new Promise<void>((resolve) => {
            try {
              // @ts-ignore
              const svg = window.MathJax.tex2svg(tex, {
                display: true,
                em: 16,
                ex: 8,
                containerWidth: 500
              }).querySelector('svg');

              if (!svg) {
                resolve();
                return;
              }

              // Inject color
              svg.setAttribute('fill', COLORS.formulaHex);
              svg.style.color = COLORS.formulaHex;
              
              // Serialize to string
              const xml = new XMLSerializer().serializeToString(svg);
              const src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
              
              const img = new Image();
              img.onload = () => {
                cache[tex] = img;
                resolve();
              };
              img.onerror = () => resolve(); // Fail gracefully
              img.src = src;
            } catch (e) {
              console.warn("MathJax render error", e);
              resolve();
            }
          });
        });

        await Promise.all(promises);
        formulasRendered.current = cache;
        setFormulasReady(true);
      } else {
        attempts++;
        if (attempts < 20) setTimeout(renderFormulas, 200);
      }
    };

    renderFormulas();
  }, []);

  const initScene = useCallback((width: number, height: number) => {
    // 1. Create Spiral Path Points
    const numPoints = 200; 
    const points: Point[] = [];
    
    for (let i = 0; i < numPoints; i++) {
      points.push({
        id: i,
        y: randomRange(-height * 0.5, height * 1.5), 
        angleOffset: randomRange(-0.1, 0.1), 
        radiusOffset: randomRange(-5, 5), 
        opacity: randomRange(0.4, 0.8),
      });
    }
    groundPoints.current = points;

    // 2. Create Artifacts
    const artData: Artifact[] = [];
    let artId = 0;

    // A. Nodes
    const numNodes = 60; 
    const nodes: Artifact[] = [];
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        id: artId++,
        type: 'node',
        x: randomRange(0, width),
        y: randomRange(-height, height * 2),
        z: randomRange(0.8, 1.2),
        speed: randomRange(0.5, 1.5),
        rotation: 0,
        rotationSpeed: 0,
        size: randomRange(1.5, 3.5),
        opacity: randomRange(0.4, 0.8),
        connections: []
      });
    }
    nodes.forEach((node, i) => {
      const numConnections = Math.random() > 0.7 ? 2 : 1;
      for(let k=0; k<numConnections; k++){
         const target = Math.floor(Math.random() * numNodes);
         if (target !== i && !node.connections?.includes(target)) {
             node.connections?.push(target);
         }
      }
    });
    artData.push(...nodes);

    // B. Geometric Arcs
    for (let i = 0; i < 20; i++) {
      artData.push({
        id: artId++,
        type: 'arc',
        x: randomRange(0, width),
        y: randomRange(-height, height * 2),
        z: randomRange(0.5, 1.0),
        speed: randomRange(0.8, 1.8),
        rotation: randomRange(0, Math.PI * 2),
        rotationSpeed: randomRange(-0.01, 0.01),
        size: randomRange(20, 80), 
        opacity: randomRange(0.3, 0.6),
        arcStart: randomRange(0, Math.PI),
        arcEnd: randomRange(Math.PI, Math.PI * 2)
      });
    }

    // C. Floating Lines
    for (let i = 0; i < 25; i++) {
      artData.push({
        id: artId++,
        type: 'line',
        x: randomRange(0, width),
        y: randomRange(-height, height * 2),
        z: randomRange(0.6, 1.1),
        speed: randomRange(1.0, 2.0),
        rotation: randomRange(0, Math.PI * 2),
        rotationSpeed: randomRange(-0.005, 0.005),
        size: 1,
        opacity: randomRange(0.2, 0.5),
        lineLength: randomRange(40, 150)
      });
    }

    // D. Warping Grids
    for (let i = 0; i < 10; i++) {
      const rows = 5;
      const cols = 5;
      const spacing = 20;
      const gridPoints = [];
      const offsetX = (cols - 1) * spacing * 0.5;
      const offsetY = (rows - 1) * spacing * 0.5;
      
      for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
          gridPoints.push({ x: c * spacing - offsetX, y: r * spacing - offsetY });
        }
      }

      artData.push({
        id: artId++,
        type: 'grid',
        x: randomRange(0, width),
        y: randomRange(-height, height * 2),
        z: randomRange(0.4, 0.8),
        speed: randomRange(0.4, 1.0),
        rotation: randomRange(-0.2, 0.2),
        rotationSpeed: randomRange(-0.002, 0.002),
        size: 1,
        opacity: randomRange(0.15, 0.4),
        points: gridPoints
      });
    }

    // E. Crystals
    for (let i = 0; i < 18; i++) {
      const numShards = Math.floor(randomRange(3, 7));
      const radius = randomRange(15, 35);
      const shards = [];
      for(let k=0; k<numShards; k++) {
        const angle = (k / numShards) * Math.PI * 2;
        shards.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
      }

      artData.push({
        id: artId++,
        type: 'crystal',
        x: randomRange(0, width),
        y: randomRange(-height, height * 2),
        z: randomRange(0.7, 1.3),
        speed: randomRange(0.6, 1.4),
        rotation: randomRange(0, Math.PI * 2),
        rotationSpeed: randomRange(-0.02, 0.02),
        size: radius,
        opacity: randomRange(0.3, 0.6),
        points: shards
      });
    }
    
    // F. Formulas (MathJax)
    // 15 formulas as requested
    for (let i = 0; i < 15; i++) { 
      artData.push({
        id: artId++,
        type: 'formula',
        x: randomRange(0, width),
        y: randomRange(-height, height * 2),
        z: randomRange(0.6, 1.2), // Varied depth
        speed: randomRange(0.5, 1.3),
        rotation: randomRange(-0.05, 0.05),
        rotationSpeed: randomRange(-0.0005, 0.0005), 
        size: randomRange(20, 35), // Scale factor for the image
        opacity: randomRange(0.2, 0.5), 
        text: FORMULAS_LATEX[i % FORMULAS_LATEX.length]
      });
    }

    // G. Dust
    for (let i = 0; i < 150; i++) {
      artData.push({
        id: artId++,
        type: 'dust',
        x: randomRange(0, width),
        y: randomRange(-height, height * 2),
        z: randomRange(0.2, 1.5), 
        speed: randomRange(0.2, 2.0),
        rotation: 0,
        rotationSpeed: 0,
        size: randomRange(0.5, 1.5),
        opacity: randomRange(0.1, 0.4),
      });
    }

    artifacts.current = artData;

    // 3. Create Stars (Massively Enhanced for "Milky Way" feel)
    // Density: 0.0025 (approx 5000 stars on 1080p)
    const starDensity = 0.0025; 
    const numStars = Math.floor(width * height * starDensity); 
    const starData: Star[] = [];

    for (let i = 0; i < numStars; i++) {
      // Depth distribution: 
      // Lots of small background stars (0.1 - 0.4)
      // Some mid stars (0.5 - 0.8)
      // Few foreground bright stars (0.9 - 1.2)
      const zRoll = Math.random();
      let z = 0.1; 
      
      if (zRoll > 0.98) z = 1.3;      // Very close (Fast)
      else if (zRoll > 0.90) z = 0.9; // Close
      else if (zRoll > 0.60) z = 0.5; // Mid
      else z = randomRange(0.05, 0.3); // Far background dust
      
      // Color Variation: Pick from Palette
      const color = getRandomStarColor();

      // Base Opacity
      // Far stars are dimmer, close stars are brighter
      let baseOpacity = randomRange(0.1, 0.5);
      if (z > 0.8) baseOpacity = randomRange(0.7, 1.0);

      // Size
      // Far stars are tiny (0.5), close stars larger (up to 2.5)
      const size = z > 0.5 ? randomRange(1.0, 2.8) : randomRange(0.3, 0.9);

      starData.push({
        x: randomRange(0, width),
        // Place stars primarily "above" the screen so they scroll down into view.
        // Extended range for long scroll.
        y: randomRange(-height * 4, height * 0.2), 
        z: z,
        size: size,
        baseOpacity: baseOpacity,
        twinkleSpeed: randomRange(0.02, 0.08),
        opacityOffset: Math.random() * Math.PI * 2,
        color: color,
      });
    }
    stars.current = starData;

    // Reset Camera
    cameraY.current = 0;
    targetCameraY.current = 0;
  }, []);

  // --- Animation Loop ---

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background Clear
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    const t = timeRef.current;
    const camY = cameraY.current;
    const centerX = width / 2;
    const helixCenterY = height * 0.5; 
    const helixRadius = Math.min(width, height) * HELIX_RADIUS_RATIO;
    
    // --- TRANSITION LOGIC ---
    // We want ground elements to fade out *early* in the ascent so the stars take over completely.
    // Transition Height: height * 0.8 (It fades completely by the time camera moves 0.8 screens up)
    const fadeHeight = height * 0.8;
    const rawProgress = Math.min(1, Math.max(0, camY / fadeHeight));
    // Smoothstep: 3x^2 - 2x^3 for easing
    const groundLayerOpacity = 1 - (rawProgress * rawProgress * (3 - 2 * rawProgress));
    
    // Space Atmosphere (Subtle Nebula Glow)
    // As we ascend (camY increases), we fade in a subtle gradient to make space feel "deep"
    const spaceAtmosphereOpacity = Math.min(1, Math.max(0, (camY - height * 0.5) / height));
    if (spaceAtmosphereOpacity > 0) {
        // Add a radial gradient near the center-top to simulate deep space glow
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
        gradient.addColorStop(0, 'rgba(20, 30, 60, 0.4)'); // Slightly lighter navy/purple
        gradient.addColorStop(1, 'rgba(10, 25, 47, 0)');
        ctx.globalAlpha = spaceAtmosphereOpacity * 0.5;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;
    }

    // --- PHASE 1: BACKGROUND ARTIFACTS ---
    // Only draw if we can still see them
    if (groundLayerOpacity > 0.01) {
      artifacts.current.forEach((art) => {
        // Movement
        art.y += art.speed + (phase === 'ground' ? 0.2 : 0); 
        art.rotation += art.rotationSpeed;

        // Wrap only if in ground phase to keep scene busy
        if (phase === 'ground' && art.y > height + 200) {
          art.y = -200;
          art.x = randomRange(0, width);
        }

        const visualY = art.y + camY * 0.5; 
        
        // Culling
        if (visualY > -300 && visualY < height + 300) {
          // Individual vertical fade for scrolling + Global transition fade
          const edgeFade = 1.0 - Math.min(1, Math.max(0, (visualY - height * 0.85) / (height * 0.15)));
          const finalOpacity = art.opacity * edgeFade * groundLayerOpacity;
          
          if (finalOpacity <= 0) return;

          ctx.globalAlpha = finalOpacity;
          
          if (art.type === 'formula') {
            ctx.globalAlpha = finalOpacity * COLORS.formulaAlpha; 
          } else {
            ctx.fillStyle = COLORS.artifact;
            ctx.strokeStyle = COLORS.artifactLine;
          }

          ctx.save();
          ctx.translate(art.x, visualY);
          ctx.scale(art.z, art.z); 
          ctx.rotate(art.rotation);

          // --- RENDER ARTIFACT TYPES ---
          if (art.type === 'node') {
             ctx.fillStyle = COLORS.artifact;
             ctx.beginPath();
             ctx.arc(0, 0, art.size, 0, Math.PI * 2);
             ctx.fill();
             ctx.beginPath();
             ctx.arc(0, 0, art.size * 2, 0, Math.PI * 2);
             ctx.strokeStyle = 'rgba(136, 146, 176, 0.1)';
             ctx.stroke();
          } 
          else if (art.type === 'dust') {
            ctx.fillStyle = COLORS.artifact;
            ctx.beginPath();
            ctx.arc(0, 0, art.size, 0, Math.PI * 2);
            ctx.fill();
          }
          else if (art.type === 'formula') {
            if (art.text && formulasReady) {
              const img = formulasRendered.current[art.text];
              if (img && img.complete && img.naturalWidth > 0) {
                const scale = art.size / 20; 
                const w = img.naturalWidth * scale;
                const h = img.naturalHeight * scale;
                ctx.globalAlpha = Math.min(1, finalOpacity * 0.4); 
                ctx.drawImage(img, -w/2, -h/2, w, h);
              }
            } else if (art.text) {
              ctx.font = `italic ${art.size/2}px serif`;
              ctx.fillStyle = COLORS.formulaHex;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText("...", 0, 0);
            }
          }
          else if (art.type === 'arc') {
             ctx.strokeStyle = COLORS.artifactLine;
             ctx.lineWidth = 1.5;
             ctx.beginPath();
             ctx.arc(0, 0, art.size, art.arcStart || 0, art.arcEnd || Math.PI);
             ctx.stroke();
             if (art.arcStart !== undefined) {
               ctx.fillStyle = COLORS.artifactLine;
               const x = Math.cos(art.arcStart) * art.size;
               const y = Math.sin(art.arcStart) * art.size;
               ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill();
             }
          }
          else if (art.type === 'line') {
             const len = art.lineLength || 50;
             ctx.strokeStyle = COLORS.artifactLine;
             ctx.lineWidth = 1;
             ctx.beginPath();
             ctx.moveTo(-len/2, 0);
             ctx.lineTo(len/2, 0);
             ctx.stroke();
             ctx.fillStyle = COLORS.artifactLine;
             ctx.beginPath();
             ctx.arc(-len/2, 0, 2, 0, Math.PI*2);
             ctx.arc(len/2, 0, 2, 0, Math.PI*2);
             ctx.fill();
          }
          else if (art.type === 'grid') {
             ctx.strokeStyle = COLORS.gridWarp;
             ctx.lineWidth = 1;
             if (art.points) {
                const warpFactor = 8; 
                const warpSpeed = 0.03;
                for(let c=0; c<5; c++) {
                   ctx.beginPath();
                   for(let r=0; r<5; r++) {
                      const idx = r*5 + c;
                      if (idx >= art.points.length) break;
                      const pt = art.points[idx];
                      const wy = pt.y + Math.sin(t * warpSpeed + pt.x * 0.15) * warpFactor;
                      if (r===0) ctx.moveTo(pt.x, wy);
                      else ctx.lineTo(pt.x, wy);
                   }
                   ctx.stroke();
                }
                for(let r=0; r<5; r++) {
                   ctx.beginPath();
                   for(let c=0; c<5; c++) {
                      const idx = r*5 + c;
                      if (idx >= art.points.length) break;
                      const pt = art.points[idx];
                      const wy = pt.y + Math.sin(t * warpSpeed + pt.x * 0.15) * warpFactor;
                      if (c===0) ctx.moveTo(pt.x, wy);
                      else ctx.lineTo(pt.x, wy);
                   }
                   ctx.stroke();
                }
             }
          }
          else if (art.type === 'crystal') {
             ctx.fillStyle = COLORS.artifact;
             ctx.beginPath();
             ctx.arc(0, 0, 2, 0, Math.PI * 2);
             ctx.fill();
             ctx.strokeStyle = COLORS.artifactLine;
             ctx.lineWidth = 1;
             if (art.points) {
                ctx.beginPath();
                art.points.forEach(p => {
                   ctx.moveTo(0, 0);
                   ctx.lineTo(p.x, p.y);
                   ctx.rect(p.x - 1.5, p.y - 1.5, 3, 3);
                });
                ctx.stroke();
                ctx.beginPath();
                art.points.forEach((p, i) => {
                   if (i===0) ctx.moveTo(p.x, p.y);
                   else ctx.lineTo(p.x, p.y);
                });
                ctx.closePath();
                ctx.stroke();
             }
          }

          ctx.restore();
        }
      });
      ctx.globalAlpha = 1.0;
      
      // --- Draw "Network" Connections (Fading with Ground Layer) ---
      ctx.strokeStyle = COLORS.artifactLine;
      ctx.lineWidth = 0.8; 
      
      const nodes = artifacts.current.filter(a => a.type === 'node');
      
      nodes.forEach(node => {
          const visualY = node.y + camY * 0.5;
          if (visualY > -50 && visualY < height + 50 && node.connections) {
             const nodeAlpha = 1.0 - Math.min(1, Math.max(0, (visualY - height * 0.8) / (height * 0.2)));
             ctx.globalAlpha = node.opacity * nodeAlpha * 0.8 * groundLayerOpacity; // Apply ground opacity
             
             if (ctx.globalAlpha <= 0) return;

             node.connections.forEach(targetIdx => {
                const target = artifacts.current[targetIdx]; 
                if (target && target.type === 'node') {
                    const targetVisualY = target.y + camY * 0.5;
                    const dx = node.x - target.x;
                    const dy = visualY - targetVisualY;
                    if (dx*dx + dy*dy < 40000) { 
                        ctx.beginPath();
                        ctx.moveTo(node.x, visualY);
                        ctx.lineTo(target.x, targetVisualY);
                        ctx.stroke();
                    }
                }
             });
          }
      });
      ctx.globalAlpha = 1.0;
    }

    // --- PHASE 1: THE HELIX (Fading with Ground Layer) ---
    if (groundLayerOpacity > 0.01) {
      const projectedPoints: { x: number; y: number; z: number; pt: Point }[] = [];

      groundPoints.current.forEach((p) => {
        p.y += SCROLL_SPEED;
        const totalHeight = height * 2;
        if (p.y > height * 1.5) {
           p.y -= totalHeight;
        }

        const relativeY = p.y; 
        const helixPhase = (relativeY * HELIX_TWIST) + (t * HELIX_SPEED); 
        const r = helixRadius + p.radiusOffset;
        
        const x = centerX + Math.cos(helixPhase + p.angleOffset) * r;
        const z = Math.sin(helixPhase + p.angleOffset); 
        
        const visualY = p.y + camY; 

        if (visualY > -100 && visualY < height + 100) {
            projectedPoints.push({ x, y: visualY, z, pt: p });
        }
      });

      // Draw Lines
      ctx.lineWidth = 1.5; 
      projectedPoints.forEach((p1, i) => {
        for (let j = i + 1; j < projectedPoints.length; j++) {
           const p2 = projectedPoints[j];
           const dy = Math.abs(p1.y - p2.y);
           if (dy > 40) continue; 

           const dx = p1.x - p2.x;
           if (dx * dx + dy * dy < 2500) {
             const alpha = (1 - (dx*dx + dy*dy) / 2500) * 0.25; 
             ctx.strokeStyle = COLORS.line;
             ctx.globalAlpha = alpha * groundLayerOpacity; // Apply fade
             ctx.beginPath();
             ctx.moveTo(p1.x, p1.y);
             ctx.lineTo(p2.x, p2.y);
             ctx.stroke();
           }
        }
      });
      ctx.globalAlpha = 1.0;

      // Draw Particles
      projectedPoints.forEach(({ x, y, z, pt }) => {
        const scale = 1 + z * 0.3; 
        const depthOpacity = 0.4 + (z + 1) * 0.3; 

        ctx.fillStyle = COLORS.particle;
        ctx.globalAlpha = pt.opacity * depthOpacity * groundLayerOpacity; // Apply fade
        ctx.beginPath();
        ctx.arc(x, y, 2.5 * scale, 0, Math.PI * 2); 
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw THE HERO POINT
      const heroScreenY = helixCenterY; 
      const heroPhase = (heroScreenY * HELIX_TWIST) + (t * HELIX_SPEED);
      const heroX = centerX + Math.cos(heroPhase) * helixRadius;
      const heroZ = Math.sin(heroPhase);
      const heroVisualY = heroScreenY + camY; 
      
      if (heroVisualY < height + 100) {
          const heroScale = 1 + heroZ * 0.4;
          const gradient = ctx.createRadialGradient(heroX, heroVisualY, 0, heroX, heroVisualY, 25 * heroScale);
          gradient.addColorStop(0, COLORS.heroGlow);
          gradient.addColorStop(0.5, 'rgba(100, 255, 218, 0.1)');
          gradient.addColorStop(1, 'rgba(100, 255, 218, 0)');
          
          // Hero fades out slightly slower to lead the eye
          const heroOpacity = Math.max(0, groundLayerOpacity); 
          
          ctx.globalAlpha = heroOpacity;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(heroX, heroVisualY, 30 * heroScale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = COLORS.hero;
          ctx.beginPath();
          ctx.arc(heroX, heroVisualY, 5 * heroScale, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
      }
    }

    // --- PHASE 2: STARS (Enhanced) ---
    // Stars are always drawn, but their position depends on camera with Parallax
    stars.current.forEach((s) => {
      // Parallax Y calculation: 
      // Stars are at negative world coordinates. Camera Y is positive addition.
      // High Z (close) moves faster down as camera goes up.
      const parallaxY = s.y + camY * (0.1 + s.z * 1.5); 
      
      if (parallaxY < -20 || parallaxY > height + 20) return;

      const twinkle = Math.sin(t * s.twinkleSpeed + s.opacityOffset);
      const opacity = s.baseOpacity + 0.3 * twinkle;
      
      // Let's boost opacity slightly as we ascend to make them "appear" from the atmosphere.
      const ascentBoost = Math.min(1, camY / height); 
      const finalStarOpacity = Math.min(1, Math.max(0, opacity * (0.5 + 0.5 * ascentBoost)));

      ctx.globalAlpha = finalStarOpacity;
      
      // Star Glow/Shadow
      if (s.size > 1.5) {
        ctx.shadowBlur = s.size * 2;
        ctx.shadowColor = s.color;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = s.color;
      
      // Main Body
      ctx.beginPath();
      ctx.arc(s.x, parallaxY, s.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0; // Reset
      ctx.globalAlpha = 1.0;
    });

  }, [formulasReady]); // Re-bind when formulas are ready

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 1;

    // Smooth Camera - Slightly tuned for silkier feel
    const dest = targetCameraY.current;
    const diff = dest - cameraY.current;
    if (Math.abs(diff) > 0.5) {
      // Adjusted lerp factor for smoother but reasonably fast transition
      cameraY.current += diff * 0.02; 
    } else {
      cameraY.current = dest;
    }

    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;

    draw(ctx, logicalWidth, logicalHeight);
    animationFrameId.current = requestAnimationFrame(animate);
  }, [draw]);

  // --- Handling Resize & Setup ---
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = clientWidth * dpr;
        canvasRef.current.height = clientHeight * dpr;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
        initScene(clientWidth, clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [animate, initScene]);

  // --- Interaction ---

  const handleAscend = () => {
    if (containerRef.current) {
      setPhase('ascending');
      targetCameraY.current = containerRef.current.clientHeight * 2.5; // Target deeper into space
      setTimeout(() => {
        setPhase('space');
      }, 4000); 
    }
  };

  const handleReturn = () => {
    setPhase('descending');
    targetCameraY.current = 0; 
    setTimeout(() => {
      setPhase('ground');
    }, 4000);
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#0a192f]">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 block w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <div 
          className={`absolute flex flex-col items-center transition-all duration-[2000ms] ease-in-out transform ${
            phase === 'ground' ? 'opacity-100 translate-y-0 scale-100' : 
            phase === 'descending' ? 'opacity-50 translate-y-0' :
            'opacity-0 translate-y-20 scale-95 pointer-events-none'
          }`}
          style={{ top: '20%' }} 
        >
          <div className="mb-8 pointer-events-auto text-center">
             <div className="w-12 h-[1px] bg-teal-500/50 mx-auto mb-6"></div>
             <h1 className="text-teal-100/80 text-sm tracking-[0.4em] font-light uppercase mb-2">
               Helix Construct
             </h1>
             <p className="text-teal-200/40 text-[10px] font-mono tracking-widest uppercase">
               Accumulating Knowledge
             </p>
          </div>
          
          <button
            onClick={handleAscend}
            disabled={phase !== 'ground'}
            className="pointer-events-auto px-8 py-3 border border-teal-500/30 rounded-full 
                       text-teal-100/80 text-xs font-light tracking-[0.2em] hover:bg-teal-900/20 
                       hover:border-teal-400/60 transition-all duration-500 backdrop-blur-sm group"
          >
            <span className="group-hover:text-white transition-colors">INITIATE ASCENT</span>
          </button>
        </div>

        <div 
          className={`absolute flex flex-col items-center justify-center transition-all duration-[3000ms] ease-out transform ${
            phase === 'space' ? 'opacity-100 translate-y-0' : 
            phase === 'ascending' ? 'opacity-50 translate-y-10' :
            'opacity-0 -translate-y-10 pointer-events-none'
          }`}
        >
          <div className="absolute w-[400px] h-[400px] border border-slate-600/10 rounded-full animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute w-[300px] h-[300px] border border-slate-600/5 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>

          <h2 className="text-white/90 text-3xl md:text-4xl font-light tracking-[0.2em] mb-4 text-center font-serif">
            循此苦旅
          </h2>
          <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-blue-400/50 to-transparent my-4"></div>
          <h2 className="text-white/90 text-3xl md:text-4xl font-light tracking-[0.2em] mt-4 text-center font-serif">
            直抵群星
          </h2>
          
          <p className="mt-10 text-blue-200/40 text-[10px] tracking-[0.4em] uppercase font-sans mb-12">
            Ad Astra Per Aspera
          </p>

          <button
            onClick={handleReturn}
            disabled={phase !== 'space'}
            className="pointer-events-auto px-6 py-2 border border-slate-600/30 rounded-full 
                       text-slate-400 text-[10px] font-light tracking-widest hover:bg-slate-800/30 
                       hover:border-slate-400 transition-all duration-500 backdrop-blur-sm group"
          >
             RETURN TO EARTH
          </button>
        </div>
      </div>

      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
};

export default App;