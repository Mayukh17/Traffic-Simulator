import React from 'react';
import { FuzzyEngineOutput } from '../types';
import { CheckCircle2, AlertTriangle, ArrowRight, Activity, Zap } from 'lucide-react';

interface FuzzyEngineVisualizerProps {
  fuzzyData: FuzzyEngineOutput;
  manualOverride: boolean;
  onUpdateManualInputs: (density: number, speed: number, weather: number) => void;
  onToggleManualOverride: (override: boolean) => void;
}

export const FuzzyEngineVisualizer: React.FC<FuzzyEngineVisualizerProps> = ({
  fuzzyData,
  manualOverride,
  onUpdateManualInputs,
  onToggleManualOverride,
}) => {
  const { antecedents, rules, consequents, decisionRationale } = fuzzyData;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Control Mode */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              Fuzzy Inference Engine (Mamdani Control Loop)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous antecedents mapped via linguistic membership functions to optimize mixed-traffic signal phases
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Input Source:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800">
            <button
              onClick={() => onToggleManualOverride(false)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                !manualOverride
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Edge Sensors
            </button>
            <button
              onClick={() => onToggleManualOverride(true)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                manualOverride
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Sliders
            </button>
          </div>
        </div>
      </div>

      {/* Manual Input Sliders if Manual Override Active */}
      {manualOverride && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900/60 border border-cyan-800/40 rounded-lg">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Vehicle Density:</span>
              <span className="font-mono text-cyan-400 font-semibold tabular-nums">
                {antecedents.density.value}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={antecedents.density.value}
              onChange={(e) =>
                onUpdateManualInputs(
                  Number(e.target.value),
                  antecedents.speed.value,
                  antecedents.weather.value
                )
              }
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Average Speed:</span>
              <span className="font-mono text-cyan-400 font-semibold tabular-nums">
                {antecedents.speed.value} km/h
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="65"
              value={antecedents.speed.value}
              onChange={(e) =>
                onUpdateManualInputs(
                  antecedents.density.value,
                  Number(e.target.value),
                  antecedents.weather.value
                )
              }
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Weather Severity:</span>
              <span className="font-mono text-cyan-400 font-semibold tabular-nums">
                {antecedents.weather.value}/100
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={antecedents.weather.value}
              onChange={(e) =>
                onUpdateManualInputs(
                  antecedents.density.value,
                  antecedents.speed.value,
                  Number(e.target.value)
                )
              }
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 3 Antecedents Membership Curve Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Antecedent 1: Vehicle Density */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200">
                1. Vehicle Density (Camera CV)
              </span>
              <span className="font-mono text-xs text-cyan-400 font-semibold tabular-nums">
                {antecedents.density.value}% Occupied
              </span>
            </div>

            {/* SVG Membership Curve */}
            <div className="relative h-28 w-full bg-slate-950 rounded border border-slate-800/80 p-2">
              <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                {/* Low Density Curve (Trapezoid) */}
                <polyline
                  points="0,10 20,10 40,55 0,55"
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                {/* Medium Density Curve (Triangle) */}
                <polyline
                  points="25,55 50,10 75,55"
                  fill="rgba(234, 179, 8, 0.15)"
                  stroke="#eab308"
                  strokeWidth="1.5"
                />
                {/* High Density Curve (Trapezoid) */}
                <polyline
                  points="60,55 80,10 100,10 100,55"
                  fill="rgba(239, 68, 68, 0.15)"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                {/* Current Value Marker Line */}
                <line
                  x1={antecedents.density.value}
                  y1="5"
                  x2={antecedents.density.value}
                  y2="55"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="2,2"
                />
              </svg>
            </div>
          </div>

          {/* Membership degrees readout */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-sky-400">Low</div>
              <div className="font-mono text-xs font-semibold tabular-nums text-slate-200">
                {antecedents.density.memberships.low.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-amber-400">Medium</div>
              <div className="font-mono text-xs font-semibold tabular-nums text-slate-200">
                {antecedents.density.memberships.medium.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-red-400">High</div>
              <div className="font-mono text-xs font-semibold tabular-nums text-slate-200">
                {antecedents.density.memberships.high.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Antecedent 2: Average Approach Speed */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200">
                2. Average Speed (Optical Flow)
              </span>
              <span className="font-mono text-xs text-cyan-400 font-semibold tabular-nums">
                {antecedents.speed.value} km/h
              </span>
            </div>

            {/* SVG Membership Curve */}
            <div className="relative h-28 w-full bg-slate-950 rounded border border-slate-800/80 p-2">
              <svg className="w-full h-full" viewBox="0 0 70 60" preserveAspectRatio="none">
                {/* Slow (0-25) */}
                <polyline
                  points="0,10 15,10 25,55 0,55"
                  fill="rgba(239, 68, 68, 0.15)"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                {/* Moderate (18-45) */}
                <polyline
                  points="18,55 32,10 45,55"
                  fill="rgba(234, 179, 8, 0.15)"
                  stroke="#eab308"
                  strokeWidth="1.5"
                />
                {/* Fast (38-70) */}
                <polyline
                  points="38,55 50,10 70,10 70,55"
                  fill="rgba(16, 185, 129, 0.15)"
                  stroke="#10b981"
                  strokeWidth="1.5"
                />
                {/* Current Value Marker */}
                <line
                  x1={antecedents.speed.value}
                  y1="5"
                  x2={antecedents.speed.value}
                  y2="55"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="2,2"
                />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-red-400">Slow</div>
              <div className="font-mono text-xs font-semibold tabular-nums text-slate-200">
                {antecedents.speed.memberships.slow.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-amber-400">Moderate</div>
              <div className="font-mono text-xs font-semibold tabular-nums text-slate-200">
                {antecedents.speed.memberships.moderate.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-emerald-400">Fast</div>
              <div className="font-mono text-xs font-semibold tabular-nums text-slate-200">
                {antecedents.speed.memberships.fast.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Antecedent 3: Weather Severity */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200">
                3. Weather Severity (ESP32 Array)
              </span>
              <span className="font-mono text-xs text-cyan-400 font-semibold tabular-nums">
                {antecedents.weather.value} Index
              </span>
            </div>

            {/* SVG Membership Curve */}
            <div className="relative h-28 w-full bg-slate-950 rounded border border-slate-800/80 p-2">
              <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                {/* Clear (0-35) */}
                <polyline
                  points="0,10 20,10 35,55 0,55"
                  fill="rgba(16, 185, 129, 0.15)"
                  stroke="#10b981"
                  strokeWidth="1.5"
                />
                {/* Mild (25-75) */}
                <polyline
                  points="25,55 50,10 75,55"
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                {/* Severe (65-100) */}
                <polyline
                  points="65,55 80,10 100,10 100,55"
                  fill="rgba(239, 68, 68, 0.15)"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                {/* Current Value Marker */}
                <line
                  x1={antecedents.weather.value}
                  y1="5"
                  x2={antecedents.weather.value}
                  y2="55"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="2,2"
                />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-emerald-400">Clear</div>
              <div className="font-mono text-xs font-semibold tabular-nums text-slate-200">
                {antecedents.weather.memberships.clear.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-sky-400">Mild</div>
              <div className="font-mono text-xs font-semibold tabular-nums text-slate-200">
                {antecedents.weather.memberships.mild.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-red-400">Severe</div>
              <div className="font-mono text-xs font-semibold tabular-nums text-slate-200">
                {antecedents.weather.memberships.severe.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consequents / Defuzzification Crisp Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Output 1: Green Light Extension */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Consequent 1 · Green Phase Duration
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              {consequents.greenCategory}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {consequents.greenLightExtensionSec}
            </span>
            <span className="text-sm text-slate-400">seconds</span>
          </div>

          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
              style={{
                width: `${Math.min(100, (consequents.greenLightExtensionSec / 75) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>Short (15s)</span>
            <span>Standard (35s)</span>
            <span>Long (65s)</span>
          </div>
        </div>

        {/* Output 2: Yellow Light Duration */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Consequent 2 · Yellow Phase Duration
            </span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded ${
                consequents.yellowCategory === 'Extended'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {consequents.yellowCategory}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {consequents.yellowLightDurationSec}
            </span>
            <span className="text-sm text-slate-400">seconds</span>
            {consequents.yellowCategory === 'Extended' && (
              <span className="text-xs text-amber-400 font-medium ml-2">
                (+2.5s Wet Brake Buffer)
              </span>
            )}
          </div>

          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                consequents.yellowCategory === 'Extended' ? 'bg-amber-400' : 'bg-slate-500'
              }`}
              style={{
                width: `${(consequents.yellowLightDurationSec / 7) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>Standard (3.5s)</span>
            <span>Wet Asphalt Extended (6.0s)</span>
          </div>
        </div>
      </div>

      {/* Decision Rationale */}
      <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-start gap-3">
        <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Centroid Defuzzification Rationale: </span>
          {decisionRationale}
        </div>
      </div>

      {/* Fuzzy Rule Base Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">
              Fuzzy Rule Base & Activation Strengths
            </span>
            <span className="text-xs text-slate-500 font-mono">
              (Mamdani Min-Operator Firing)
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {rules.filter((r) => r.isFired).length} rules currently active
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {rules.map((rule) => {
            const isProposalRule = rule.id <= 3;
            return (
              <div
                key={rule.id}
                className={`p-3 text-xs transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  rule.isFired
                    ? 'bg-cyan-950/20 text-slate-200'
                    : 'bg-transparent text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                      isProposalRule
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Rule {rule.id}
                  </span>
                  <div>
                    <div className="font-medium text-slate-200 flex items-center gap-2">
                      <span>{rule.name}</span>
                      {isProposalRule && (
                        <span className="text-[10px] text-amber-400 font-normal">
                          [Proposal Section 4]
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {rule.condition}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Firing weight gauge */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Weight:
                    </span>
                    <span className="font-mono text-xs font-semibold tabular-nums text-white w-10 text-right">
                      {rule.weight.toFixed(2)}
                    </span>
                    <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-cyan-400 transition-all"
                        style={{ width: `${rule.weight * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Consequent Tag */}
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span>Green: {rule.outputGreen}</span>
                    <span>·</span>
                    <span>Yellow: {rule.outputYellow}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
