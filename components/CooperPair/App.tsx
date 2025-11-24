import React, { useState, useEffect } from 'react';
import SimulationCanvas from './SimulationCanvas';
import Controls from './Controls';
import { SimulationConfig } from './types';

const App: React.FC = () => {
  const [temperature, setTemperature] = useState(0.8);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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

  const config: SimulationConfig = {
    particleCount: 800,
    temperature: temperature,
    couplingRange: 60,
    couplingStrength: 0.05,
    friction: 0.02,
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-navy-900 text-slate-200">
      <SimulationCanvas config={config} width={windowSize.width} height={windowSize.height} />
      
      <div className="absolute top-0 left-0 w-full p-8 md:p-12 z-10 pointer-events-none">
        <h1 className="text-3xl md:text-5xl font-serif text-slate-200 opacity-90 tracking-tight mb-2">
          Cooper Pair Simulation
        </h1>
        <div className="h-px w-24 bg-cyan-400/50 mb-4"></div>
      </div>

      <Controls 
        temperature={temperature} 
        setTemperature={setTemperature} 
        count={config.particleCount} 
      />
    </div>
  );
};

export default App;