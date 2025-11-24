import React from 'react';
import { SimulationParams } from './types';

interface ControlsProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  onReset: () => void;
}

const ControlSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
  <div className="flex flex-col gap-1 mb-4 group">
    <div className="flex justify-between items-center text-xs tracking-wider uppercase text-slate-500 group-hover:text-slate-300 transition-colors">
      <span>{label}</span>
      <span className="font-mono opacity-50">{value.toFixed(1)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400 hover:[&::-webkit-slider-thumb]:bg-cyan-300 [&::-webkit-slider-thumb]:transition-colors"
    />
  </div>
);

const Controls: React.FC<ControlsProps> = ({ params, setParams, onReset }) => {
  const updateParam = (key: keyof SimulationParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="backdrop-blur-sm bg-slate-950/30 border-l border-white/5 p-6 w-80 h-full flex flex-col pointer-events-auto transition-all duration-500 overflow-hidden">
      <h2 className="text-slate-200 font-light text-sm tracking-[0.2em] uppercase mb-8 border-b border-white/10 pb-4 flex-shrink-0">
        参数设置
      </h2>

      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <ControlSlider
          label="分离 (Separation)"
          value={params.separation}
          min={0}
          max={5}
          step={0.1}
          onChange={(v) => updateParam('separation', v)}
        />
        <ControlSlider
          label="对齐 (Alignment)"
          value={params.alignment}
          min={0}
          max={5}
          step={0.1}
          onChange={(v) => updateParam('alignment', v)}
        />
        <ControlSlider
          label="凝聚 (Cohesion)"
          value={params.cohesion}
          min={0}
          max={5}
          step={0.1}
          onChange={(v) => updateParam('cohesion', v)}
        />
        
        <div className="my-6 border-t border-white/5" />

        <ControlSlider
          label="速度 (Speed)"
          value={params.speed}
          min={0.5}
          max={10}
          step={0.1}
          onChange={(v) => updateParam('speed', v)}
        />
        <ControlSlider
          label="感知范围 (Perception)"
          value={params.perceptionRadius}
          min={10}
          max={150}
          step={5}
          onChange={(v) => updateParam('perceptionRadius', v)}
        />
        <ControlSlider
          label="粒子数量 (Particles)"
          value={params.particleCount}
          min={100}
          max={1500}
          step={50}
          onChange={(v) => updateParam('particleCount', v)}
        />
        <ControlSlider
          label="拖尾消散 (Trail Fade)"
          value={params.trailLength}
          min={0.05}
          max={0.9}
          step={0.05}
          onChange={(v) => updateParam('trailLength', v)}
        />

        <button
          onClick={onReset}
          className="mt-6 py-3 px-4 w-full border border-white/10 text-xs uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all rounded-sm mb-8"
        >
          重置系统 (Reset)
        </button>

        {/* Info Section */}
        <div className="text-xs text-slate-500 space-y-5 border-t border-white/10 pt-6 pb-4">
          <div>
            <h3 className="text-slate-300 font-light tracking-widest uppercase mb-2">模拟原理</h3>
            <p className="leading-relaxed mb-2 opacity-80">
              本模拟基于 Craig Reynolds 的 Boids 算法，展示了复杂的群体行为如何从简单的局部规则中涌现：
            </p>
            <ul className="list-disc pl-4 space-y-1 marker:text-cyan-500/50 opacity-80">
              <li><strong className="text-slate-400 font-normal">分离:</strong> 避免与近邻拥挤碰撞。</li>
              <li><strong className="text-slate-400 font-normal">对齐:</strong> 模仿近邻的运动方向。</li>
              <li><strong className="text-slate-400 font-normal">凝聚:</strong> 向近邻的中心位置靠拢。</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-slate-300 font-light tracking-widest uppercase mb-2">操作说明</h3>
            <p className="leading-relaxed opacity-80">
              调节上方滑块改变各规则权重，观察群体如何在混沌与秩序间转换。点击“重置系统”恢复默认平衡态。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;