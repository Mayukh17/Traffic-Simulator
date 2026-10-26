import React from 'react';
import { Cpu, RefreshCw, Download, Satellite, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: 'intersection' | 'fuzzy' | 'esp32' | 'assac-gis' | 'predictive' | 'benchmark';
  onSelectTab: (
    tab: 'intersection' | 'fuzzy' | 'esp32' | 'assac-gis' | 'predictive' | 'benchmark'
  ) => void;
  onResetSimulation: () => void;
  onExportReport: () => void;
  onOpenDossier: () => void;
  isHydroWaveActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onResetSimulation,
  onExportReport,
  onOpenDossier,
  isHydroWaveActive,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
          <Cpu className="w-4 h-4 text-slate-950 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            Eco-TMS
          </span>
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
            ASSAC · NESFIC-D-22 · Edge-AI & Space-Edge GIS
          </span>
        </div>
      </div>

      {/* Zone 2: Clean single-line nav tabs */}
      <nav className="hidden xl:flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800/80">
        <button
          onClick={() => onSelectTab('intersection')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'intersection'
              ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          Live Intersection Twin
        </button>
        <button
          onClick={() => onSelectTab('fuzzy')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'fuzzy'
              ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          Fuzzy Inference Engine
        </button>
        <button
          onClick={() => onSelectTab('esp32')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'esp32'
              ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          ESP32 Telemetry
        </button>
        <button
          onClick={() => onSelectTab('assac-gis')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'assac-gis'
              ? 'bg-cyan-950/80 text-cyan-300 shadow-sm border border-cyan-700/70'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          <span>ASSAC Space-Edge GIS</span>
          {isHydroWaveActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
        <button
          onClick={() => onSelectTab('predictive')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'predictive'
              ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          Predictive Network
        </button>
        <button
          onClick={() => onSelectTab('benchmark')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'benchmark'
              ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          Performance & Novelty
        </button>
      </nav>

      {/* Zone 3: Primary action button + Submission Dossier Trigger */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenDossier}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Submission Dossier (12 Answers)</span>
        </button>

        <button
          onClick={onResetSimulation}
          title="Reset traffic & metrics"
          className="p-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onExportReport}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-cyan-500/20"
        >
          <Download className="w-3.5 h-3.5" />
          Export JSON
        </button>
      </div>
    </header>
  );
};
