
import React, { useEffect, useRef } from 'react';

const NetworkBackground: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimization
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(80, (w * h) / 15000); 

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animationId = 0;

    const animate = () => {
      // Optimization: No need to check if ctx exists every frame if we checked initially
      ctx.fillStyle = '#020c1b'; // Clear with solid color is faster than clearRect if we redraw bg
      ctx.fillRect(0,0,w,h);
      
      // Gradient background - draw once per frame
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#020c1b');
      gradient.addColorStop(0.6, '#0a192f');
      gradient.addColorStop(1, '#112240');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.fillStyle = `rgba(204, 214, 246, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          // Optimization: Squared distance check avoids expensive Math.sqrt()
          const distSq = dx * dx + dy * dy;

          if (distSq < 32400) { // 180 * 180
            // Calculate opacity based on distance
            const alpha = 0.1 * (1 - distSq / 32400);
            if (alpha > 0) {
                ctx.strokeStyle = `rgba(136, 146, 176, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
});

export default NetworkBackground;
