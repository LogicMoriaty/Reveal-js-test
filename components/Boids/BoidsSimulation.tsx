import React, { useState } from 'react';
import SimulationCanvas from './SimulationCanvas';
import Controls from './Controls';
import { DEFAULT_PARAMS } from './constants';
import { SimulationParams } from './types';

const BoidsSimulation: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [showControls, setShowControls] = useState(true);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 text-slate-200 selection:bg-cyan-500/30 rounded-xl border border-slate-700/50">
      
      {/* Simulation Layer */}
      <SimulationCanvas params={params} />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
        
        {/* Header */}
        <header className="flex justify-between items-start animate-fade-in pointer-events-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tighter text-white/90 mb-1">
              Emergence
            </h1>
            <p className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase">
              More Is Different
            </p>
          </div>
          <button 
            onClick={() => setShowControls(!showControls)}
            className="group flex flex-col gap-1.5 p-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
          >
            <div className={`w-6 h-px bg-white transition-transform ${showControls ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-6 h-px bg-white transition-opacity ${showControls ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-px bg-white transition-transform ${showControls ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </button>
        </header>

        {/* Quote / Info */}
        <div className="w-full max-w-md pointer-events-none opacity-60 hidden md:block">
          <blockquote className="text-sm font-light italic leading-relaxed border-l-2 border-cyan-900/50 pl-4 text-slate-400">
            "将一切还原为简单的基本定律的能力，并不意味着我们有能力从这些定律出发重建宇宙……在每一个复杂性层级上，全新的性质都会涌现出来。"
          </blockquote>
          <cite className="block mt-2 text-xs font-mono tracking-wider uppercase text-slate-500 not-italic">
            — P.W. Anderson, 1972
          </cite>
        </div>
      </div>

      {/* Right Sidebar Controls */}
      <div className={`absolute top-0 right-0 h-full transition-transform duration-500 ease-in-out transform z-20 ${showControls ? 'translate-x-0' : 'translate-x-full'}`}>
        <Controls 
          params={params} 
          setParams={setParams} 
          onReset={() => setParams(DEFAULT_PARAMS)} 
        />
      </div>
    </div>
  );
};

export default BoidsSimulation;