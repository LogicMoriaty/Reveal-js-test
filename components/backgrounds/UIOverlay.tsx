import React from 'react';
import { Sliders, Activity, CircleDot } from 'lucide-react';

interface UIOverlayProps {
  warpIntensity: number;
  setWarpIntensity: (val: number) => void;
  fluidity: number;
  setFluidity: (val: number) => void;
  bodyMass: number;
  setBodyMass: (val: number) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  warpIntensity,
  setWarpIntensity,
  fluidity,
  setFluidity,
  bodyMass,
  setBodyMass,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <header className="flex flex-col items-start opacity-80">
        <h1 className="text-white font-thin text-2xl tracking-[0.2em] uppercase">Spacetime</h1>
        <p className="text-blue-200 text-xs font-light tracking-widest mt-1 opacity-60">
          General Relativity Visualization
        </p>
      </header>

      {/* Footer / Controls */}
      <footer className="pointer-events-auto flex flex-col md:flex-row gap-6 items-end md:items-center w-full max-w-4xl mx-auto backdrop-blur-sm bg-slate-900/20 p-6 rounded-lg border border-slate-800/30 shadow-2xl">
        
        {/* Main Mass / Curvature Control */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center text-blue-100/80 text-xs tracking-wider uppercase">
            <span className="flex items-center gap-2">
              <Activity size={14} className="opacity-70" /> Center Mass
            </span>
            <span className="font-mono opacity-50">{warpIntensity.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.1"
            value={warpIntensity}
            onChange={(e) => setWarpIntensity(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer hover:bg-slate-700 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        {/* Celestial Body Mass */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center text-blue-100/80 text-xs tracking-wider uppercase">
            <span className="flex items-center gap-2">
              <CircleDot size={14} className="opacity-70" /> Orbiting Mass
            </span>
            <span className="font-mono opacity-50">{bodyMass.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={bodyMass}
            onChange={(e) => setBodyMass(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer hover:bg-slate-700 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        {/* Fluidity Control */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center text-blue-100/80 text-xs tracking-wider uppercase">
            <span className="flex items-center gap-2">
              <Sliders size={14} className="opacity-70" /> Fluidity
            </span>
            <span className="font-mono opacity-50">{fluidity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={fluidity}
            onChange={(e) => setFluidity(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer hover:bg-slate-700 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
      </footer>
    </div>
  );
};