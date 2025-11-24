
import React, { useState, useEffect, useRef } from 'react';
import SimulationCanvas from './SimulationCanvas';
import Controls from './Controls';
import { SimulationConfig } from './types';

const CooperPairSimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  const [temperature, setTemperature] = useState(0.8);

  const config: SimulationConfig = {
    particleCount: 800, 
    temperature: temperature,
    couplingRange: 60,
    couplingStrength: 0.05,
    friction: 0.02,
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWindowSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    // Initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-navy-900 overflow-hidden font-sans selection:bg-cyan-500/20 rounded-xl border border-slate-700/50">
      
      {/* Background/Canvas Layer */}
      {windowSize.width > 0 && (
          <SimulationCanvas 
            config={config} 
            width={windowSize.width} 
            height={windowSize.height} 
          />
      )}

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 md:p-12 z-10 pointer-events-none">
        <h1 className="text-3xl md:text-5xl font-serif text-slate-200 opacity-90 tracking-tight mb-2" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          More is Different
        </h1>
        <div className="h-px w-24 bg-cyan-500/50 mb-4"></div>
        <p className="max-w-md text-sm md:text-base text-slate-400 font-light leading-relaxed opacity-80">
          “事实证明，基本粒子的大量复杂聚集体的行为，不能简单地通过外推少数粒子的性质来理解。”
        </p>
        <p className="mt-2 text-xs text-slate-500 uppercase tracking-widest opacity-60">
          — P.W. Anderson, 1972
        </p>
      </div>

      {/* Info Tag */}
      <div className="absolute top-8 right-8 text-right hidden md:block z-10 opacity-40 hover:opacity-100 transition-opacity duration-500 pointer-events-auto">
         <div className="text-xs text-cyan-400 font-mono border border-cyan-400/30 px-3 py-1 rounded-full bg-navy-950/50 backdrop-blur">
            BCS Theory Visualization
         </div>
      </div>

      {/* Controls */}
      <Controls 
        temperature={temperature} 
        setTemperature={setTemperature}
        count={config.particleCount}
      />

    </div>
  );
}

export default CooperPairSimulation;
