import React from 'react';

const QuantumParticlesBackground: React.FC = () => {
  // Generate random particles with varying blur and size
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 150 + 10, // Varied sizes for bokeh
    blur: Math.random() * 10 + 2,
    duration: Math.random() * 20 + 15, // Slow movement
    delay: Math.random() * -20,
    opacity: Math.random() * 0.15 + 0.02
  }));

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-950 z-0">
       <div className="absolute inset-0 bg-gradient-to-tr from-navy-950 via-navy-900 to-[#051025] z-0" />
      
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-slate-light animate-float"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            filter: `blur(${p.blur}px)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      
       {/* The Observer Effect / Wave Function center */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 z-0">
          <div className="absolute inset-0 rounded-full border border-slate-light/5 blur-md animate-pulse-slow transform scale-150"></div>
          <div className="absolute inset-10 rounded-full border border-slate-light/10 blur-sm animate-spin-slow opacity-30"></div>
       </div>
    </div>
  );
};

export default QuantumParticlesBackground;