import React, { useState } from 'react';
import { CityNode } from '../types';
import {
  MapPin,
  TrendingUp,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  Compass,
  Bus,
  RefreshCw,
} from 'lucide-react';

interface CityPredictiveMapProps {
  currentIntersectionDensity: number;
  currentWeather: string;
}

export const CityPredictiveMap: React.FC<CityPredictiveMapProps> = ({
  currentIntersectionDensity,
  currentWeather,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_04');
  const [activeDiversions, setActiveDiversions] = useState<Record<string, boolean>>({
    node_02: true,
  });

  const cityNodes: CityNode[] = [
    {
      id: 'node_01',
      name: 'MG Road Junction',
      location: 'North Corridor (KM 1.2)',
      density: 58,
      weather: 'Clear',
      status: 'Nominal',
      predictedPeakMinutes: 24,
      reroutePlan: null,
      coords: { x: 180, y: 110 },
    },
    {
      id: 'node_02',
      name: 'Tech Park Expressway Cross',
      location: 'East Tech Belt (KM 3.8)',
      density: 84,
      weather: 'Mild',
      status: 'Bottleneck Risk',
      predictedPeakMinutes: 8,
      reroutePlan: 'Divert heavy commercial buses to Arterial Bypass 4B',
      coords: { x: 520, y: 140 },
    },
    {
      id: 'node_03',
      name: 'Central Railway Station Circle',
      location: 'Transit Core (KM 2.1)',
      density: 68,
      weather: 'Clear',
      status: 'Nominal',
      predictedPeakMinutes: 19,
      reroutePlan: null,
      coords: { x: 230, y: 290 },
    },
    {
      id: 'node_04',
      name: 'South Avenue 4-Way (Active Twin)',
      location: 'South Sector (KM 0.0 - Current)',
      density: currentIntersectionDensity,
      weather: currentWeather.includes('Severe')
        ? 'Severe'
        : currentWeather.includes('Rain') || currentWeather.includes('Fog')
        ? 'Mild'
        : 'Clear',
      status:
        currentIntersectionDensity > 70
          ? 'Bottleneck Risk'
          : activeDiversions['node_04']
          ? 'Active Diversion'
          : 'Nominal',
      predictedPeakMinutes: currentIntersectionDensity > 65 ? 5 : 32,
      reroutePlan:
        currentIntersectionDensity > 65
          ? 'Activate feeder green phase extension on Parallel Ring Road'
          : null,
      coords: { x: 380, y: 220 },
    },
    {
      id: 'node_05',
      name: 'Outer Ring Road Interchange',
      location: 'Southwest Hub (KM 5.4)',
      density: 44,
      weather: 'Clear',
      status: 'Nominal',
      predictedPeakMinutes: 45,
      reroutePlan: null,
      coords: { x: 490, y: 350 },
    },
  ];

  const selectedNode =
    cityNodes.find((n) => n.id === selectedNodeId) || cityNodes[3];

  const toggleDiversion = (nodeId: string) => {
    setActiveDiversions((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              Predictive Cloud Backend (scikit-learn Pattern Forecasting)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated edge metadata identifying recurring bottlenecks 10–30 mins before queues form
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono text-cyan-300">ML Model: GradientBoostedRegressor</span>
          <span className="text-slate-600">·</span>
          <span>Training Baseline: 2.4M edge telemetry cycles</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Canvas (Left 2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-200">
              City Urban Corridor Topology & Telemetry Mesh
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Click any node to inspect predictive forecast
            </span>
          </div>

          <div className="relative w-full h-[380px] bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 700 420">
              {/* Background grid lines */}
              <defs>
                <pattern id="grid" width="35" height="35" patternUnits="userSpaceOnUse">
                  <path
                    d="M 35 0 L 0 0 0 35"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.04)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="700" height="420" fill="url(#grid)" />

              {/* Connecting Arterial Roads */}
              {/* Node 1 to 4 */}
              <line
                x1="180"
                y1="110"
                x2="380"
                y2="220"
                stroke="#1e293b"
                strokeWidth="10"
              />
              <line
                x1="180"
                y1="110"
                x2="380"
                y2="220"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="6,6"
              />

              {/* Node 4 to 2 */}
              <line
                x1="380"
                y1="220"
                x2="520"
                y2="140"
                stroke="#1e293b"
                strokeWidth="10"
              />
              <line
                x1="380"
                y1="220"
                x2="520"
                y2="140"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="4,4"
              />

              {/* Node 1 to 3 */}
              <line
                x1="180"
                y1="110"
                x2="230"
                y2="290"
                stroke="#1e293b"
                strokeWidth="8"
              />
              <line
                x1="180"
                y1="110"
                x2="230"
                y2="290"
                stroke="#64748b"
                strokeWidth="1.5"
              />

              {/* Node 3 to 4 */}
              <line
                x1="230"
                y1="290"
                x2="380"
                y2="220"
                stroke="#1e293b"
                strokeWidth="8"
              />
              <line
                x1="230"
                y1="290"
                x2="380"
                y2="220"
                stroke="#64748b"
                strokeWidth="1.5"
              />

              {/* Node 4 to 5 */}
              <line
                x1="380"
                y1="220"
                x2="490"
                y2="350"
                stroke="#1e293b"
                strokeWidth="8"
              />
              <line
                x1="380"
                y1="220"
                x2="490"
                y2="350"
                stroke="#10b981"
                strokeWidth="2"
              />

              {/* Node Markers */}
              {cityNodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isWarning = node.status === 'Bottleneck Risk';
                const isDiversion = activeDiversions[node.id];

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    {/* Ring highlight if selected */}
                    {isSelected && (
                      <circle
                        cx={node.coords.x}
                        cy={node.coords.y}
                        r="24"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                      />
                    )}

                    {/* Outer node circle */}
                    <circle
                      cx={node.coords.x}
                      cy={node.coords.y}
                      r="16"
                      fill={
                        isWarning
                          ? '#7f1d1d'
                          : isDiversion
                          ? '#1e3a5f'
                          : '#0f172a'
                      }
                      stroke={
                        isWarning
                          ? '#ef4444'
                          : isDiversion
                          ? '#38bdf8'
                          : '#334155'
                      }
                      strokeWidth="2"
                    />

                    {/* Inner core circle */}
                    <circle
                      cx={node.coords.x}
                      cy={node.coords.y}
                      r="7"
                      fill={
                        isWarning
                          ? '#f87171'
                          : isDiversion
                          ? '#0ea5e9'
                          : '#10b981'
                      }
                    />

                    {/* Node Label */}
                    <text
                      x={node.coords.x}
                      y={node.coords.y - 20}
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                      className="font-sans"
                    >
                      {node.name.split(' ')[0]}
                    </text>
                    <text
                      x={node.coords.x}
                      y={node.coords.y + 26}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {node.density}% occ
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Inspector (Right Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Node Inspector</span>
              <span className="font-mono text-cyan-400">{selectedNode.id.toUpperCase()}</span>
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              {selectedNode.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{selectedNode.location}</p>

            <div className="space-y-3">
              {/* Density indicator */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Current Occupancy:</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {selectedNode.density}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      selectedNode.density > 75
                        ? 'bg-red-400'
                        : selectedNode.density > 50
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${selectedNode.density}%` }}
                  />
                </div>
              </div>

              {/* Peak Congestion ETA Forecast */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Predicted Bottleneck ETA:</span>
                  <span className="font-mono font-semibold text-amber-300 tabular-nums">
                    ~{selectedNode.predictedPeakMinutes} mins
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Historical pattern correlation: +32% spillover expected from upstream corridor.
                </p>
              </div>

              {/* Reroute / Diversion Strategy */}
              {selectedNode.reroutePlan && (
                <div className="p-3 bg-cyan-950/20 border border-cyan-800/60 rounded">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 mb-1">
                    <Bus className="w-3.5 h-3.5" />
                    Proactive Diversion Plan
                  </div>
                  <p className="text-xs text-slate-300">
                    {selectedNode.reroutePlan}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={() => toggleDiversion(selectedNode.id)}
              className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeDiversions[selectedNode.id]
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
              }`}
            >
              {activeDiversions[selectedNode.id]
                ? 'Deactivate Dynamic Reroute'
                : 'Execute Dynamic Traffic Diversion'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
