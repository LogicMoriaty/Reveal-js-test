import React from 'react';

const WarpGridBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-900 z-0 perspective-1000">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-[#0d1b35] to-navy-900 opacity-90" />
        
        {/* The Grid Container with 3D Tilt */}
        <div className="absolute inset-[-50%] w-[200%] h-[200%] animate-float">
            <svg className="w-full h-full opacity-10" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" style={{ transformOrigin: 'center', transform: 'scale(1.5) rotateX(60deg)' }} />
            </svg>
        </div>

        {/* Curvature Representation lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="none">
            {/* Gentle Curves simulating spacetime bending */}
            <path d="M 0 400 C 300 400, 600 600, 1200 400" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="5 5" />
            <path d="M 0 450 C 300 450, 600 650, 1200 450" stroke="white" strokeWidth="0.3" fill="none" />
            <path d="M 0 350 C 300 350, 600 550, 1200 350" stroke="white" strokeWidth="0.3" fill="none" />
            
            <path d="M 600 0 C 600 200, 800 400, 600 800" stroke="white" strokeWidth="0.3" fill="none" opacity="0.5"/>
            <path d="M 500 0 C 500 200, 700 400, 500 800" stroke="white" strokeWidth="0.3" fill="none" opacity="0.3"/>
        </svg>

         {/* Gravity Well Glow */}
         <div className="absolute top-1/2 left-1/2 w-[50vmax] h-[50vmax] -translate-x-1/2 -translate-y-1/2 bg-navy-800 rounded-full blur-[120px] opacity-40 mix-blend-overlay"></div>
    </div>
  );
};

export default WarpGridBackground;