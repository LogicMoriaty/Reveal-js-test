import React, { useState, useEffect } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import Controls from './components/Controls';
import { SimulationConfig } from './types';

function App() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [temperature, setTemperature] = useState(0.8);

  const config: SimulationConfig = {
    particleCount: 800, // Balanced for performance and visual density
    temperature: temperature,
    couplingRange: 60,
    couplingStrength: 0.05,
    friction: 0.02,
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-screen bg-navy-900 overflow-hidden font-sans selection:bg-science-highlight/20">
      
      {/* Background/Canvas Layer */}
      <SimulationCanvas 
        config={config} 
        width={windowSize.width} 
        height={windowSize.height} 
      />

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 md:p-12 z-10 pointer-events-none">
        <h1 className="text-3xl md:text-5xl font-serif text-slate-200 opacity-90 tracking-tight mb-2">
          More is Different
        </h1>
        <div className="h-px w-24 bg-science-highlight/50 mb-4"></div>
        <p className="max-w-md text-sm md:text-base text-slate-400 font-light leading-relaxed opacity-80">
          “事实证明，基本粒子的大量复杂聚集体的行为，不能简单地通过外推少数粒子的性质来理解。”
        </p>
        <p className="mt-2 text-xs text-slate-500 uppercase tracking-widest opacity-60">
          — P.W. Anderson, 1972
        </p>
      </div>

      {/* Info Tag */}
      <div className="absolute top-8 right-8 text-right hidden md:block z-10 opacity-40 hover:opacity-100 transition-opacity duration-500">
         <div className="text-xs text-science-highlight font-mono border border-science-highlight/30 px-3 py-1 rounded-full">
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

export default App;