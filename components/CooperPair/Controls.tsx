
import React from 'react';

interface ControlsProps {
  temperature: number;
  setTemperature: (val: number) => void;
  count: number;
}

const Controls: React.FC<ControlsProps> = ({ temperature, setTemperature, count }) => {
  // Determine state label
  let stateLabel = "Normal State (Fermi Gas)";
  if (temperature < 0.3) stateLabel = "Macroscopic Quantum State (Condensate)";
  else if (temperature < 0.6) stateLabel = "Transition Region (Pairing Fluctuations)";

  return (
    <div className="absolute bottom-12 left-0 w-full flex justify-center z-10 pointer-events-none">
      <div className="bg-navy-800/80 backdrop-blur-md border border-navy-700 p-6 rounded-sm w-full max-w-2xl mx-6 pointer-events-auto shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          
          <div className="flex-1 w-full">
             <div className="flex justify-between mb-2">
                <span className="text-xs uppercase tracking-widest text-slate-500 font-sans">System Temperature</span>
                <span className="text-xs font-mono text-science-highlight">{temperature.toFixed(2)} T/Tc</span>
             </div>
             <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1 bg-navy-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-sans">
                <span>Absolute Zero (Order)</span>
                <span>Critical Temp (Tc)</span>
                <span>High Energy (Chaos)</span>
            </div>
          </div>

          <div className="text-right border-l border-navy-700 pl-6 hidden md:block min-w-[200px]">
             <h3 className="text-slate-200 text-sm font-light mb-1">{stateLabel}</h3>
             <p className="text-slate-500 text-xs leading-relaxed">
               {count} electrons active. <br/>
               {temperature < 0.6 ? "Symmetry breaking observed." : "Random thermal motion dominant."}
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Controls;
