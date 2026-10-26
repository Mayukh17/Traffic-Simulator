import React, { useState } from 'react';
import { GisBasinNode } from '../types';
import {
  Satellite,
  Waves,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Layers,
  MapPin,
  TrendingDown,
  Compass,
  ArrowRight,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface AssacGisFusionProps {
  currentWaterMm: number;
  onTriggerHydroWave: () => void;
  isHydroWaveActive: boolean;
  p2pMeshActive: boolean;
  onToggleP2pMesh: () => void;
}

export const AssacGisFusion: React.FC<AssacGisFusionProps> = ({
  currentWaterMm,
  onTriggerHydroWave,
  isHydroWaveActive,
  p2pMeshActive,
  onToggleP2pMesh,
}) => {
  const [selectedBasinId, setSelectedBasinId] = useState<string>('basin_02');
  const [activeLayers, setActiveLayers] = useState({
    satelliteDem: true,
    runoffVectors: true,
    edgeNodes: true,
    floodZonation: true,
  });

  // Assam / Guwahati Key Urban Corridors
  const guwahatiBasins: GisBasinNode[] = [
    {
      id: 'basin_01',
      name: 'Bharalumukh Riverfront Pass',
      corridor: 'Brahmaputra Basin (West Guwahati)',
      elevationMeters: 46.2, // Low elevation river confluence
      soilRunoffCoefficient: 0.88,
      floodRiskTier: 'Low Elevation Basin',
      currentWaterDepthMm: Math.round(currentWaterMm * 1.3),
      densityPercent: 74,
      evacuationStatus: isHydroWaveActive ? 'Hydro-Flush Triggered' : 'Emergency Diversion',
      stalledVehicleCount: currentWaterMm > 20 ? 6 : 0,
      coords: { x: 160, y: 150 },
    },
    {
      id: 'basin_02',
      name: 'GS Road (Bhangagarh - Christian Basti)',
      corridor: 'Central Commercial Spine',
      elevationMeters: 51.4,
      soilRunoffCoefficient: 0.79,
      floodRiskTier: 'Low Elevation Basin',
      currentWaterDepthMm: currentWaterMm,
      densityPercent: 82,
      evacuationStatus: isHydroWaveActive ? 'Hydro-Flush Triggered' : 'Nominal Flow',
      stalledVehicleCount: currentWaterMm > 25 ? 9 : currentWaterMm > 15 ? 2 : 0,
      coords: { x: 380, y: 230 },
    },
    {
      id: 'basin_03',
      name: 'RG Baruah Road (Zoo Road Tiniali)',
      corridor: 'East Arterial Connector',
      elevationMeters: 54.8,
      soilRunoffCoefficient: 0.72,
      floodRiskTier: 'Moderate Slope',
      currentWaterDepthMm: Math.round(currentWaterMm * 0.7),
      densityPercent: 61,
      evacuationStatus: 'Nominal Flow',
      stalledVehicleCount: 0,
      coords: { x: 490, y: 160 },
    },
    {
      id: 'basin_04',
      name: 'Jalukbari Rotary (Gateway Hub)',
      corridor: 'NH-27 Junction & University Pass',
      elevationMeters: 58.6,
      soilRunoffCoefficient: 0.64,
      floodRiskTier: 'High Ground Ridge',
      currentWaterDepthMm: Math.round(currentWaterMm * 0.3),
      densityPercent: 53,
      evacuationStatus: 'Nominal Flow',
      stalledVehicleCount: 0,
      coords: { x: 110, y: 310 },
    },
    {
      id: 'basin_05',
      name: 'Six Mile & Khanapara Express Interchange',
      corridor: 'South Gateway Corridor',
      elevationMeters: 62.1,
      soilRunoffCoefficient: 0.58,
      floodRiskTier: 'High Ground Ridge',
      currentWaterDepthMm: Math.round(currentWaterMm * 0.2),
      densityPercent: 47,
      evacuationStatus: 'Nominal Flow',
      stalledVehicleCount: 0,
      coords: { x: 570, y: 290 },
    },
  ];

  const selectedBasin =
    guwahatiBasins.find((b) => b.id === selectedBasinId) || guwahatiBasins[1];

  return (
    <div className="flex flex-col gap-6">
      {/* Novelty Declaration Header */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/60 rounded-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">
                  ASSAC Space-Edge Dual Spatial Fusion Engine
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Novel Innovation Claim · NESFIC-D-22
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Directly addressing <strong className="text-white">Assam State Space Application Centre (ASSAC)</strong> and the <strong className="text-white">Department of Science &amp; Technology, Govt. of Assam</strong>: Fusing macro satellite Digital Elevation Models (DEM) and Brahmaputra/Bharalu flood basin runoff mapping with micro ESP32 edge telemetry and decentralized P2P ad-hoc mesh.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onTriggerHydroWave}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                isHydroWaveActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 animate-pulse'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
              }`}
            >
              <Waves className="w-4 h-4" />
              {isHydroWaveActive ? 'Active Hydro-Green Wave' : 'Trigger Hydro-Flush Wave'}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Novelty Pillars Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1.5">
            <Layers className="w-4 h-4" />
            1. Macro-Micro Spatial Fusion
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Eliminates agency fragmentation by layering ASSAC satellite hydrological GIS contours onto localized camera edge nodes to calculate true multi-modal flood inundation risks.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1.5">
            <Waves className="w-4 h-4" />
            2. Hydro-Traffic Evacuation Wave
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Signals adapt dynamically to water depth: if road water &gt;15mm, signals grant continuous green clearance to flush low-clearance two-wheelers and autos before engine hydro-lock.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1.5">
            <Radio className="w-4 h-4" />
            3. Storm-Proof Decentralized Mesh
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            If severe monsoon cyclones cut cellular 4G/5G towers, edge nodes communicate over an ad-hoc 2.4GHz ESP-NOW P2P mesh, maintaining signal green wave coordination offline.
          </p>
        </div>
      </div>

      {/* Main Interactive GIS & DEM Basin Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GIS Interactive Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span>Guwahati Urban Inundation GIS Map</span>
              <span className="text-[11px] font-mono text-slate-400">
                (ASSAC DEM Elevation &amp; Runoff Layer)
              </span>
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setActiveLayers((p) => ({ ...p, satelliteDem: !p.satelliteDem }))
                }
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  activeLayers.satelliteDem
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                DEM Elevation
              </button>
              <button
                onClick={() =>
                  setActiveLayers((p) => ({ ...p, floodZonation: !p.floodZonation }))
                }
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  activeLayers.floodZonation
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Brahmaputra Backflow
              </button>
              <button
                onClick={() =>
                  setActiveLayers((p) => ({ ...p, runoffVectors: !p.runoffVectors }))
                }
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  activeLayers.runoffVectors
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Drainage Vectors
              </button>
            </div>
          </div>

          {/* SVG Map Container */}
          <div className="relative w-full h-[400px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 720 440">
              <defs>
                {/* Elevation Gradient Contours */}
                <linearGradient id="demGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="50%" stopColor="#082f49" />
                  <stop offset="100%" stopColor="#022c22" />
                </linearGradient>

                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0369a1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
                </linearGradient>

                {/* Flood Hazard Pulse Animation */}
                <radialGradient id="floodGlow">
                  <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
                  <stop offset="70%" stopColor="rgba(56, 189, 248, 0.1)" />
                  <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                </radialGradient>
              </defs>

              {/* DEM Elevation Base Topography */}
              {activeLayers.satelliteDem && (
                <>
                  {/* High Ground Ridge (Nilachal / Khasi Foothills) */}
                  <path
                    d="M 500,440 Q 600,320 680,240 L 720,440 Z"
                    fill="rgba(16, 185, 129, 0.12)"
                    stroke="rgba(16, 185, 129, 0.3)"
                    strokeWidth="1"
                  />
                  <path
                    d="M 0,440 Q 120,360 220,440 Z"
                    fill="rgba(16, 185, 129, 0.12)"
                    stroke="rgba(16, 185, 129, 0.3)"
                    strokeWidth="1"
                  />

                  {/* Low Elevation Bharalu Basin Depression */}
                  <ellipse
                    cx="340"
                    cy="210"
                    rx="190"
                    ry="90"
                    fill="rgba(14, 116, 144, 0.15)"
                    stroke="rgba(6, 182, 212, 0.25)"
                    strokeDasharray="4,4"
                  />
                </>
              )}

              {/* Brahmaputra River Course (North Boundary) */}
              <path
                d="M 0,60 Q 200,85 400,50 T 720,70 L 720,0 L 0,0 Z"
                fill="url(#riverGrad)"
                stroke="#0284c7"
                strokeWidth="1.5"
              />
              <text x="360" y="35" fill="#38bdf8" fontSize="11" textAnchor="middle" className="font-mono font-medium">
                Brahmaputra River Corridor (High Water Surcharge Level: +49.8m)
              </text>

              {/* Bharalu River Drainage Channel */}
              <path
                d="M 160,150 Q 260,200 380,230 T 490,160"
                fill="none"
                stroke="rgba(56, 189, 248, 0.6)"
                strokeWidth="3.5"
                strokeDasharray="6,4"
              />

              {/* Inundation Flood Zone Pool if Waterlogging > 10mm */}
              {activeLayers.floodZonation && currentWaterMm > 8 && (
                <ellipse
                  cx="380"
                  cy="230"
                  rx="140"
                  ry="65"
                  fill="url(#floodGlow)"
                  className="animate-pulse"
                />
              )}

              {/* Arterial Road Network (Highways & Expressways) */}
              {/* GS Road Corridor */}
              <line
                x1="160"
                y1="150"
                x2="380"
                y2="230"
                stroke={isHydroWaveActive ? '#10b981' : '#334155'}
                strokeWidth={isHydroWaveActive ? '6' : '4'}
              />
              <line
                x1="380"
                y1="230"
                x2="570"
                y2="290"
                stroke={isHydroWaveActive ? '#10b981' : '#334155'}
                strokeWidth={isHydroWaveActive ? '6' : '4'}
              />

              {/* Zoo Road Connector */}
              <line
                x1="380"
                y1="230"
                x2="490"
                y2="160"
                stroke="#334155"
                strokeWidth="3.5"
              />

              {/* Jalukbari Rotary NH-27 */}
              <line
                x1="110"
                y1="310"
                x2="160"
                y2="150"
                stroke="#334155"
                strokeWidth="4"
              />

              {/* P2P Mesh Connectivity Wireless Links (Gossip Ring) */}
              {p2pMeshActive && (
                <>
                  <line
                    x1="160"
                    y1="150"
                    x2="380"
                    y2="230"
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="2,3"
                  />
                  <line
                    x1="380"
                    y1="230"
                    x2="490"
                    y2="160"
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="2,3"
                  />
                  <line
                    x1="380"
                    y1="230"
                    x2="570"
                    y2="290"
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="2,3"
                  />
                </>
              )}

              {/* Runoff Slope Vectors (Arrows) */}
              {activeLayers.runoffVectors && (
                <g stroke="#06b6d4" strokeWidth="1.2" opacity="0.7">
                  <line x1="560" y1="260" x2="420" y2="235" markerEnd="url(#arrow)" />
                  <line x1="480" y1="130" x2="410" y2="210" />
                  <line x1="200" y1="120" x2="320" y2="210" />
                </g>
              )}

              {/* Basins & Edge Nodes Pins */}
              {guwahatiBasins.map((basin) => {
                const isSelected = basin.id === selectedBasinId;
                const isCritical = basin.currentWaterDepthMm > 15;

                return (
                  <g
                    key={basin.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedBasinId(basin.id)}
                  >
                    {/* Ring highlight if selected */}
                    {isSelected && (
                      <circle
                        cx={basin.coords.x}
                        cy={basin.coords.y}
                        r="28"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                      />
                    )}

                    {/* Outer Circle */}
                    <circle
                      cx={basin.coords.x}
                      cy={basin.coords.y}
                      r="16"
                      fill={isCritical ? '#450a0a' : isHydroWaveActive ? '#022c22' : '#0f172a'}
                      stroke={isCritical ? '#ef4444' : isHydroWaveActive ? '#10b981' : '#38bdf8'}
                      strokeWidth="2"
                    />

                    {/* Inner Center Indicator */}
                    <circle
                      cx={basin.coords.x}
                      cy={basin.coords.y}
                      r="6"
                      fill={isCritical ? '#f87171' : isHydroWaveActive ? '#34d399' : '#0ea5e9'}
                    />

                    {/* Node Label */}
                    <text
                      x={basin.coords.x}
                      y={basin.coords.y - 22}
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                      className="font-sans"
                    >
                      {basin.name.split(' ')[0]}
                    </text>
                    <text
                      x={basin.coords.x}
                      y={basin.coords.y + 26}
                      fill={isCritical ? '#f87171' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {basin.currentWaterDepthMm}mm | {basin.elevationMeters}m
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Inundation Warning Alert Overlay */}
            {currentWaterMm > 15 && (
              <div className="absolute bottom-3 left-3 bg-red-950/90 border border-red-800 text-red-200 text-xs px-3 py-2 rounded-lg flex items-center gap-2 backdrop-blur-md">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  <strong>Brahmaputra Backflow / Inundation Alert:</strong> GS Road basin water level ({currentWaterMm}mm) exceeding two-wheeler exhaust threshold.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Selected Basin & Vehicle Clearance Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>ASSAC GIS Corridor Profile</span>
              <span className="font-mono text-cyan-400 font-semibold">
                ELEVATION: {selectedBasin.elevationMeters}m
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-0.5">
              {selectedBasin.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{selectedBasin.corridor}</p>

            <div className="space-y-3">
              {/* Terrain Tier Card */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">ASSAC Flood Susceptibility:</span>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      selectedBasin.floodRiskTier === 'Low Elevation Basin'
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedBasin.floodRiskTier}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Runoff coefficient: {selectedBasin.soilRunoffCoefficient} · Clay alluvial silt
                </div>
              </div>

              {/* Multi-Class Vehicle Inundation Stalling Matrix */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Vehicle Exhaust Stalling Thresholds</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Water: {selectedBasin.currentWaterDepthMm}mm
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  {/* Two-Wheelers */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Motorcycles (130mm limit):</span>
                    <span
                      className={`font-semibold ${
                        selectedBasin.currentWaterDepthMm > 18
                          ? 'text-red-400'
                          : selectedBasin.currentWaterDepthMm > 10
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {selectedBasin.currentWaterDepthMm > 18
                        ? 'HIGH STALL RISK'
                        : selectedBasin.currentWaterDepthMm > 10
                        ? 'CAUTION'
                        : 'SAFE'}
                    </span>
                  </div>

                  {/* Auto-Rickshaws */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Auto-Rickshaws (180mm limit):</span>
                    <span
                      className={`font-semibold ${
                        selectedBasin.currentWaterDepthMm > 24
                          ? 'text-red-400'
                          : selectedBasin.currentWaterDepthMm > 14
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {selectedBasin.currentWaterDepthMm > 24
                        ? 'HIGH STALL RISK'
                        : 'PASSABLE'}
                    </span>
                  </div>

                  {/* Standard Cars */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sedans/Cars (210mm limit):</span>
                    <span className="text-emerald-400 font-semibold">PASSABLE</span>
                  </div>
                </div>
              </div>

              {/* Decentralized P2P Mesh Mode Switch */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    ESP-NOW P2P Mesh (Storm Mode)
                  </span>
                  <button
                    onClick={onToggleP2pMesh}
                    className={`px-2 py-0.5 text-[11px] rounded font-mono ${
                      p2pMeshActive
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p2pMeshActive ? 'MESH ACTIVE' : 'CLOUD CELLULAR'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {p2pMeshActive
                    ? 'Cellular towers offline. Operating over localized 2.4GHz peer-to-peer gossip protocol between 5 intersection nodes.'
                    : 'Operating on primary MQTT broker with cloud sync.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={onTriggerHydroWave}
              className={`w-full py-2.5 px-4 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isHydroWaveActive
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
              }`}
            >
              {isHydroWaveActive
                ? 'Cancel Hydro-Flush Wave'
                : 'Authorize ASSAC Hydro-Green Wave Evacuation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
