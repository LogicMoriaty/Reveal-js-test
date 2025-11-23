import React from 'react';

const OrbitBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-900 flex items-center justify-center z-0">
       {/* Subtle Radial Gradient for Depth */}
       <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-navy-700 via-navy-900 to-black" />
      
      <svg className="w-[140vmax] h-[140vmax] absolute opacity-20" viewBox="0 0 1000 1000">
        <g className="origin-center animate-spin-slow">
          {/* Main Orbit */}
          <circle cx="500" cy="500" r="300" fill="none" stroke="white" strokeWidth="0.3" opacity="0.5" />
          <circle cx="500" cy="500" r="302" fill="none" stroke="white" strokeWidth="0.1" opacity="0.3" />
        </g>
        
        <g className="origin-center animate-spin-reverse-slow">
           {/* Dashed Technical Orbit */}
           <circle cx="500" cy="500" r="450" fill="none" stroke="white" strokeWidth="0.3" strokeDasharray="10 20" opacity="0.4" />
           <circle cx="500" cy="500" r="200" fill="none" stroke="white" strokeWidth="0.2" strokeDasharray="2 5" opacity="0.6" />
        </g>

        {/* Static Geometry */}
        <line x1="0" y1="500" x2="1000" y2="500" stroke="white" strokeWidth="0.1" opacity="0.3" />
        <line x1="500" y1="0" x2="500" y2="1000" stroke="white" strokeWidth="0.1" opacity="0.3" />
        
        {/* Decorative Arcs */}
        <path d="M 500 100 A 400 400 0 0 1 900 500" fill="none" stroke="white" strokeWidth="0.2" opacity="0.3" />
        <path d="M 500 900 A 400 400 0 0 1 100 500" fill="none" stroke="white" strokeWidth="0.2" opacity="0.3" />
      </svg>

      {/* Floating Elements */}
      <div className="absolute w-2 h-2 bg-white rounded-full opacity-40 animate-float top-1/4 left-1/4 blur-[1px]"></div>
      <div className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-float-delayed bottom-1/3 right-1/4"></div>
      
      {/* Minimalist Technical Labels */}
      <div className="absolute top-12 left-12 text-[9px] font-mono text-slate-dim/40 tracking-[0.3em] uppercase">
        System: Classical<br/>
        State: Deterministic
      </div>
    </div>
  );
};

export default OrbitBackground;