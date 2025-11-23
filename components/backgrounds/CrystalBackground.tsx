import React from 'react';

const CrystalBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-900 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 opacity-80" />

        <svg className="absolute inset-0 w-full h-full opacity-10 animate-float" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>
            </defs>
            
            {/* Low Poly Shapes */}
            <path d="M 20 20 L 40 10 L 50 30 Z" fill="url(#crystalGrad)" stroke="white" strokeWidth="0.1" />
            <path d="M 50 30 L 80 20 L 60 50 Z" fill="url(#crystalGrad)" stroke="white" strokeWidth="0.1" />
            <path d="M 60 50 L 90 60 L 70 90 Z" fill="url(#crystalGrad)" stroke="white" strokeWidth="0.1" />
            <path d="M 20 20 L 10 50 L 40 60 Z" fill="url(#crystalGrad)" stroke="white" strokeWidth="0.1" />
            <path d="M 40 60 L 60 50 L 50 80 Z" fill="url(#crystalGrad)" stroke="white" strokeWidth="0.1" />
            
            {/* Connecting Lines (Network of emergent behavior) */}
            <line x1="50" y1="30" x2="60" y2="50" stroke="white" strokeWidth="0.05" />
            <line x1="40" y1="60" x2="60" y2="50" stroke="white" strokeWidth="0.05" />
        </svg>
        
        {/* Floating small crystals */}
        <div className="absolute top-1/4 right-1/4 w-16 h-16 border border-white/10 rotate-45 opacity-30 animate-float-delayed blur-[1px]"></div>
        <div className="absolute bottom-1/3 left-1/3 w-24 h-24 border border-white/5 rotate-12 opacity-20 animate-float blur-[2px]"></div>
    </div>
  );
};

export default CrystalBackground;