import React from 'react';
import {
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Sliders,
  CloudSun,
  Eye,
  EyeOff,
  Car,
  AlertTriangle,
} from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  simulationSpeed: number;
  onChangeSpeed: (speed: number) => void;
  weatherCondition: string;
  onSetWeatherPreset: (preset: 'clear' | 'fog' | 'monsoon' | 'drizzle') => void;
  cameraObscured: boolean;
  onToggleCameraObscure: () => void;
  onTriggerSurge: (type: 'rush' | 'bikes' | 'clear') => void;
  controlMode: 'fuzzy' | 'rigid';
  onToggleControlMode: (mode: 'fuzzy' | 'rigid') => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  onToggleRunning,
  simulationSpeed,
  onChangeSpeed,
  weatherCondition,
  onSetWeatherPreset,
  cameraObscured,
  onToggleCameraObscure,
  onTriggerSurge,
  controlMode,
  onToggleControlMode,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
      {/* Play/Pause & Speed Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleRunning}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            isRunning
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Resume
            </>
          )}
        </button>

        {/* Speed selectors */}
        <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800">
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                simulationSpeed === spd
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Signal Mode Controller */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Control Loop:</span>
        <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800">
          <button
            onClick={() => onToggleControlMode('fuzzy')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              controlMode === 'fuzzy'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fuzzy Adaptive
          </button>
          <button
            onClick={() => onToggleControlMode('rigid')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              controlMode === 'rigid'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fixed 45s Timer
          </button>
        </div>
      </div>

      {/* Weather Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Weather:</span>
        <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800">
          <button
            onClick={() => onSetWeatherPreset('clear')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              weatherCondition === 'Clear'
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clear
          </button>
          <button
            onClick={() => onSetWeatherPreset('fog')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              weatherCondition.includes('Fog')
                ? 'bg-slate-700 text-slate-200 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dense Fog
          </button>
          <button
            onClick={() => onSetWeatherPreset('drizzle')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              weatherCondition === 'Mild Rain'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mild Rain
          </button>
          <button
            onClick={() => onSetWeatherPreset('monsoon')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              weatherCondition === 'Severe Waterlogging'
                ? 'bg-blue-500/20 text-blue-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monsoon
          </button>
        </div>
      </div>

      {/* Camera Obscuration Fault Injection */}
      <button
        onClick={onToggleCameraObscure}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
          cameraObscured
            ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
        }`}
      >
        {cameraObscured ? (
          <>
            <EyeOff className="w-3.5 h-3.5 text-red-400" />
            Clear Camera Lens
          </>
        ) : (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Simulate Camera Failure (Resilience)
          </>
        )}
      </button>
    </div>
  );
};
