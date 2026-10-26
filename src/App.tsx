import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SignalPhase,
  EdgeCVMetrics,
  ESP32Telemetry,
  FuzzyEngineOutput,
  MqttPacketLog,
  SystemMetrics,
} from './types';
import { runFuzzyInference } from './utils/fuzzyLogic';
import { Header } from './components/Header';
import { TrafficCanvas } from './components/TrafficCanvas';
import { FuzzyEngineVisualizer } from './components/FuzzyEngineVisualizer';
import { ESP32TelemetryPanel } from './components/ESP32TelemetryPanel';
import { CityPredictiveMap } from './components/CityPredictiveMap';
import { BenchmarkComparison } from './components/BenchmarkComparison';
import { SimulationControls } from './components/SimulationControls';
import { AssacGisFusion } from './components/AssacGisFusion';
import { SubmissionDossierModal } from './components/SubmissionDossierModal';
import { Satellite, Waves, Radio, ShieldAlert, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'intersection' | 'fuzzy' | 'esp32' | 'assac-gis' | 'predictive' | 'benchmark'
  >('intersection');

  const [isRunning, setIsRunning] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [controlMode, setControlMode] = useState<'fuzzy' | 'rigid'>('fuzzy');
  const [cameraObscured, setCameraObscured] = useState(false);
  const [manualFuzzyOverride, setManualFuzzyOverride] = useState(false);
  const [isHydroWaveActive, setIsHydroWaveActive] = useState(false);
  const [p2pMeshActive, setP2pMeshActive] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Manual inputs for testing fuzzy edge cases
  const [manualInputs, setManualInputs] = useState({
    density: 78,
    speed: 28,
    weather: 85,
  });

  // Edge CV data
  const [edgeMetrics, setEdgeMetrics] = useState<EdgeCVMetrics>({
    nodeId: 'NODE_GS_ROAD_04',
    fps: 28,
    densityPercent: 42,
    avgSpeedKmh: 34,
    totalVehiclesDetected: 14,
    breakdown: {
      motorcycles: 8,
      autorickshaws: 3,
      cars: 2,
      buses: 1,
    },
    cameraObscured: false,
    spatialCongestionZone: 'Medium',
    inundationFlushActive: false,
  });

  // ESP32 Telemetry
  const [esp32Data, setEsp32Data] = useState<ESP32Telemetry>({
    nodeId: 'ESP32_GSROAD_04',
    timestamp: Date.now(),
    temperatureC: 28.4,
    humidityPercent: 68,
    visibilityLux: 820,
    waterloggingMm: 0,
    weatherCondition: 'Clear',
    weatherSeverityIndex: 12,
    mqttTopic: 'assac/ecotms/node/gsroad-04/telemetry',
    payloadBytes: 184,
    rssiDb: -62,
    meshP2PPeers: 4,
    p2pMeshActive: false,
  });

  // MQTT Packet Logs
  const [mqttLogs, setMqttLogs] = useState<MqttPacketLog[]>([]);

  // Signal State Machine
  const [currentPhase, setCurrentPhase] = useState<SignalPhase>('NS_GREEN');
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(35.0);
  const [totalPhaseTime, setTotalPhaseTime] = useState(35.0);

  // System Cumulative Metrics
  const [metrics, setMetrics] = useState<SystemMetrics>({
    ecoTmsWaitTimeSec: 18.2,
    fixedTimerWaitTimeSec: 46.5,
    fuelSavedLitres: 48.6,
    co2SavedKg: 114.2,
    hardBrakingAvoidedCount: 38,
    bandwidthConsumedKb: 1420,
    traditionalBandwidthConsumedKb: 34500000,
    waterloggedStallsAverted: 29,
    p2pMeshPacketUptimePercent: 99.8,
  });

  // Latest calculated Fuzzy Output
  const [fuzzyOutput, setFuzzyOutput] = useState<FuzzyEngineOutput>(() =>
    runFuzzyInference(42, 34, 12, 0)
  );

  // Weather Preset handler
  const handleSetWeatherPreset = (preset: 'clear' | 'fog' | 'monsoon' | 'drizzle') => {
    let temp = 29.2;
    let humidity = 62;
    let lux = 860;
    let water = 0;
    let condition: ESP32Telemetry['weatherCondition'] = 'Clear';
    let severity = 10;

    if (preset === 'fog') {
      temp = 18.5;
      humidity = 92;
      lux = 180;
      water = 1.2;
      condition = 'Dense Fog';
      severity = 68;
    } else if (preset === 'drizzle') {
      temp = 24.1;
      humidity = 88;
      lux = 420;
      water = 4.8;
      condition = 'Mild Rain';
      severity = 45;
    } else if (preset === 'monsoon') {
      temp = 22.0;
      humidity = 98;
      lux = 210;
      water = 24.5;
      condition = 'Severe Waterlogging';
      severity = 92;
    }

    setEsp32Data((prev) => ({
      ...prev,
      temperatureC: temp,
      humidityPercent: humidity,
      visibilityLux: lux,
      waterloggingMm: water,
      weatherCondition: condition,
      weatherSeverityIndex: severity,
    }));
  };

  // Toggle Hydro-Green Wave Evacuation
  const handleToggleHydroWave = () => {
    const nextState = !isHydroWaveActive;
    setIsHydroWaveActive(nextState);
    if (nextState) {
      // Force NS_GREEN long clearance
      setCurrentPhase('NS_GREEN');
      setPhaseTimeRemaining(65.0);
      setTotalPhaseTime(65.0);
      setMetrics((m) => ({
        ...m,
        waterloggedStallsAverted: m.waterloggedStallsAverted + 6,
      }));
    }
  };

  // Recalculate fuzzy logic whenever antecedents change
  useEffect(() => {
    const d = manualFuzzyOverride
      ? manualInputs.density
      : cameraObscured
      ? 50
      : edgeMetrics.densityPercent;

    const s = manualFuzzyOverride
      ? manualInputs.speed
      : cameraObscured
      ? 28
      : edgeMetrics.avgSpeedKmh;

    const w = manualFuzzyOverride
      ? manualInputs.weather
      : esp32Data.weatherSeverityIndex;

    const water = esp32Data.waterloggingMm;

    const res = runFuzzyInference(d, s, w, water);
    setFuzzyOutput(res);
  }, [
    manualFuzzyOverride,
    manualInputs,
    cameraObscured,
    edgeMetrics.densityPercent,
    edgeMetrics.avgSpeedKmh,
    esp32Data.weatherSeverityIndex,
    esp32Data.waterloggingMm,
  ]);

  // Telemetry MQTT / P2P Mesh transmission loop (every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isRunning) return;

      const jitterTemp = Number(
        (esp32Data.temperatureC + (Math.random() - 0.5) * 0.15).toFixed(1)
      );

      const packetId = `pkt_${Date.now().toString(36)}`;
      const timeStr = new Date().toLocaleTimeString();

      const payloadObj = {
        node_id: esp32Data.nodeId,
        agency_mesh: 'ASSAC_GIS_FUSED',
        dem_basin: 'GS_ROAD_BHANGAGARH',
        ts: Date.now(),
        temp_c: jitterTemp,
        humidity_pct: esp32Data.humidityPercent,
        lux: esp32Data.visibilityLux,
        water_mm: esp32Data.waterloggingMm,
        severity_idx: esp32Data.weatherSeverityIndex,
        cv_density_pct: cameraObscured ? null : edgeMetrics.densityPercent,
        hydro_flush_active: isHydroWaveActive,
        mesh_peers: p2pMeshActive ? 4 : 0,
      };

      const payloadStr = JSON.stringify(payloadObj);
      const byteSize = new Blob([payloadStr]).size;

      const newLog: MqttPacketLog = {
        id: packetId,
        timestamp: timeStr,
        topic: p2pMeshActive
          ? 'assac/p2p-mesh/gsroad-04/gossip'
          : esp32Data.mqttTopic,
        sizeBytes: byteSize,
        payload: payloadStr,
        qos: 1,
        protocol: p2pMeshActive ? 'ESP-NOW P2P Mesh' : 'MQTT-Cloud',
      };

      setMqttLogs((prev) => [newLog, ...prev.slice(0, 30)]);

      setMetrics((prev) => {
        const isWet = esp32Data.waterloggingMm > 5;
        return {
          ...prev,
          fuelSavedLitres: prev.fuelSavedLitres + 0.04 * simulationSpeed,
          co2SavedKg: prev.co2SavedKg + 0.09 * simulationSpeed,
          bandwidthConsumedKb: prev.bandwidthConsumedKb + Math.round(byteSize / 1024),
          traditionalBandwidthConsumedKb:
            prev.traditionalBandwidthConsumedKb + 4500 * simulationSpeed,
          hardBrakingAvoidedCount:
            prev.hardBrakingAvoidedCount + (isWet && Math.random() < 0.25 ? 1 : 0),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isRunning,
    simulationSpeed,
    esp32Data,
    cameraObscured,
    edgeMetrics.densityPercent,
    isHydroWaveActive,
    p2pMeshActive,
  ]);

  // Traffic Signal State Machine Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setPhaseTimeRemaining((prevTime) => {
        const nextTime = prevTime - 0.1 * simulationSpeed;

        if (nextTime <= 0) {
          let nextPhase: SignalPhase = 'NS_YELLOW';
          let duration = 3.5;

          if (currentPhase === 'NS_GREEN') {
            nextPhase = 'NS_YELLOW';
            duration =
              controlMode === 'fuzzy'
                ? fuzzyOutput.consequents.yellowLightDurationSec
                : 3.5;
          } else if (currentPhase === 'NS_YELLOW') {
            nextPhase = 'ALL_RED';
            duration = 1.5;
          } else if (currentPhase === 'ALL_RED') {
            nextPhase = 'EW_GREEN';
            duration =
              controlMode === 'fuzzy'
                ? fuzzyOutput.consequents.greenLightExtensionSec
                : 45.0;
          } else if (currentPhase === 'EW_GREEN') {
            nextPhase = 'EW_YELLOW';
            duration =
              controlMode === 'fuzzy'
                ? fuzzyOutput.consequents.yellowLightDurationSec
                : 3.5;
          } else if (currentPhase === 'EW_YELLOW') {
            nextPhase = 'NS_GREEN';
            duration =
              controlMode === 'fuzzy'
                ? fuzzyOutput.consequents.greenLightExtensionSec
                : 45.0;
          }

          setCurrentPhase(nextPhase);
          setTotalPhaseTime(duration);
          return duration;
        }

        return nextTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed, currentPhase, controlMode, fuzzyOutput]);

  const handleTriggerSurge = (type: 'rush' | 'bikes' | 'clear') => {
    window.dispatchEvent(new CustomEvent('traffic-surge', { detail: type }));
  };

  const handleResetSimulation = () => {
    handleTriggerSurge('clear');
    setCurrentPhase('NS_GREEN');
    setPhaseTimeRemaining(35.0);
    setTotalPhaseTime(35.0);
    setIsHydroWaveActive(false);
    setP2pMeshActive(false);
    setMetrics({
      ecoTmsWaitTimeSec: 18.2,
      fixedTimerWaitTimeSec: 46.5,
      fuelSavedLitres: 48.6,
      co2SavedKg: 114.2,
      hardBrakingAvoidedCount: 38,
      bandwidthConsumedKb: 1420,
      traditionalBandwidthConsumedKb: 34500000,
      waterloggedStallsAverted: 29,
      p2pMeshPacketUptimePercent: 99.8,
    });
  };

  const handleExportReport = () => {
    const reportData = {
      project: 'Eco-TMS: Edge-AI & Fuzzy Inference Driven Traffic Decision-Support',
      challenge: 'AI-Based Smart Transport Monitoring and Traffic Decision-Support for Urban Areas',
      challengeOwners: 'Assam State Space Application Centre (ASSAC) • Department of Science & Technology • Government of Assam',
      stream: 'NESFIC-D-22',
      noveltyClaims: [
        'Dual-Scale Macro-Micro Spatial Fusion (ASSAC DEM Satellite GIS + Edge Telemetry)',
        'Vehicle Ground-Clearance Aware Hydro-Green Wave Evacuation (Auto & 2W Flood Stalling Prevention)',
        'Decentralized 2.4GHz ESP-NOW P2P Mesh Gossip Consensus (Offline Storm Resilience)',
        'Cross-Agency Unified Decision Dispatch bridging ASSAC, Traffic Police, and ASDMA'
      ],
      timestamp: new Date().toISOString(),
      currentPhase,
      controlMode,
      edgeMetrics,
      esp32Data,
      fuzzyOutput,
      systemPerformanceMetrics: metrics,
      mqttSampleLogs: mqttLogs.slice(0, 10),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assac-ecotms-novelty-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onResetSimulation={handleResetSimulation}
        onExportReport={handleExportReport}
        onOpenDossier={() => setIsDossierOpen(true)}
        isHydroWaveActive={isHydroWaveActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* ASSAC Challenge Alignment Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <div>
              <span className="font-bold text-white">ASSAC Challenge Submission: </span>
              <span className="text-slate-400">
                Department of Science &amp; Technology · Government of Assam (NESFIC-D-22)
              </span>
            </div>
            <button
              onClick={() => setIsDossierOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-semibold transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official Submission Dossier (12 Form Answers)</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <div>
              Corridor: <span className="text-cyan-300">Guwahati Urban Belt (GS Road)</span>
            </div>
            <div>
              Flood Mode: <span className={isHydroWaveActive ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                {isHydroWaveActive ? 'Hydro-Flush Wave Active' : 'Adaptive Monitoring'}
              </span>
            </div>
            <div>
              Network: <span className={p2pMeshActive ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                {p2pMeshActive ? 'ESP-NOW P2P Mesh' : 'Cellular MQTT'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Simulation Controls */}
        <SimulationControls
          isRunning={isRunning}
          onToggleRunning={() => setIsRunning(!isRunning)}
          simulationSpeed={simulationSpeed}
          onChangeSpeed={setSimulationSpeed}
          weatherCondition={esp32Data.weatherCondition}
          onSetWeatherPreset={handleSetWeatherPreset}
          cameraObscured={cameraObscured}
          onToggleCameraObscure={() => setCameraObscured(!cameraObscured)}
          onTriggerSurge={handleTriggerSurge}
          controlMode={controlMode}
          onToggleControlMode={setControlMode}
        />

        {/* Dynamic Tab Viewport */}
        {activeTab === 'intersection' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Intersection Simulation Canvas (7 cols) */}
            <div className="lg:col-span-7">
              <TrafficCanvas
                currentPhase={currentPhase}
                phaseTimeRemaining={phaseTimeRemaining}
                totalPhaseTime={totalPhaseTime}
                edgeMetrics={edgeMetrics}
                esp32Data={esp32Data}
                cameraObscured={cameraObscured}
                onToggleCameraObscure={() => setCameraObscured(!cameraObscured)}
                onVehicleCountUpdate={setEdgeMetrics}
                onTriggerSurge={handleTriggerSurge}
                simulationSpeed={simulationSpeed}
              />
            </div>

            {/* Quick-Access Fuzzy & Telemetry Side Dock (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Fuzzy Phase Decision Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold text-white">
                    Live Fuzzy Signal Adjustment
                  </span>
                  <button
                    onClick={() => setActiveTab('fuzzy')}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] font-medium"
                  >
                    Open Full Engine →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1">
                      Green Extension
                    </div>
                    <div className="font-mono text-2xl font-bold text-white tabular-nums">
                      {fuzzyOutput.consequents.greenLightExtensionSec}s
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      {fuzzyOutput.consequents.greenCategory} Phase
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1">
                      Yellow Duration
                    </div>
                    <div className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
                      {fuzzyOutput.consequents.yellowLightDurationSec}s
                    </div>
                    <div className="text-[10px] text-amber-400 mt-0.5">
                      {fuzzyOutput.consequents.yellowCategory === 'Extended'
                        ? 'Extended (Wet Safety)'
                        : 'Standard (Clear Road)'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800/80 leading-relaxed">
                  <span className="text-slate-300 font-medium">Active Rationale: </span>
                  {fuzzyOutput.decisionRationale}
                </div>
              </div>

              {/* ASSAC Space-Edge Quick Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                    ASSAC Space-Edge Hydro Mode
                  </span>
                  <button
                    onClick={() => setActiveTab('assac-gis')}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] font-medium"
                  >
                    View GIS Map →
                  </button>
                </div>

                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-[11px]">Road Surface Depth:</div>
                    <div className="font-mono font-bold text-cyan-300 text-sm">
                      {esp32Data.waterloggingMm} mm
                    </div>
                  </div>
                  <button
                    onClick={handleToggleHydroWave}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                      isHydroWaveActive
                        ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isHydroWaveActive ? 'Hydro-Wave Active' : 'Authorize Flush'}
                  </button>
                </div>
              </div>

              {/* Edge Node Telemetry Capsule */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-white">
                      ESP32 Environmental Telemetry
                    </span>
                    <button
                      onClick={() => setActiveTab('esp32')}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] font-medium"
                    >
                      Inspect MQTT Logs →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center my-3 font-mono">
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">Temp</div>
                      <div className="text-xs font-bold text-white tabular-nums">
                        {esp32Data.temperatureC}°C
                      </div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">Visibility</div>
                      <div className="text-xs font-bold text-white tabular-nums">
                        {esp32Data.visibilityLux} lx
                      </div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">Water Depth</div>
                      <div className="text-xs font-bold text-cyan-300 tabular-nums">
                        {esp32Data.waterloggingMm} mm
                      </div>
                    </div>
                  </div>
                </div>

                {cameraObscured && (
                  <div className="p-2.5 bg-red-950/40 border border-red-800 rounded flex items-center gap-2 text-xs text-red-200">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    <span>
                      Camera obscured! Autonomous hybrid failover running on ESP32 environmental sensors.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assac-gis' && (
          <AssacGisFusion
            currentWaterMm={esp32Data.waterloggingMm}
            onTriggerHydroWave={handleToggleHydroWave}
            isHydroWaveActive={isHydroWaveActive}
            p2pMeshActive={p2pMeshActive}
            onToggleP2pMesh={() => setP2pMeshActive(!p2pMeshActive)}
          />
        )}

        {activeTab === 'fuzzy' && (
          <FuzzyEngineVisualizer
            fuzzyData={fuzzyOutput}
            manualOverride={manualFuzzyOverride}
            onUpdateManualInputs={(d, s, w) =>
              setManualInputs({ density: d, speed: s, weather: w })
            }
            onToggleManualOverride={setManualFuzzyOverride}
          />
        )}

        {activeTab === 'esp32' && (
          <ESP32TelemetryPanel
            esp32Data={esp32Data}
            mqttLogs={mqttLogs}
            onSetWeatherPreset={handleSetWeatherPreset}
            onUpdateSensors={(t, h, l, w) =>
              setEsp32Data((prev) => ({
                ...prev,
                temperatureC: t,
                humidityPercent: h,
                visibilityLux: l,
                waterloggingMm: w,
              }))
            }
          />
        )}

        {activeTab === 'predictive' && (
          <CityPredictiveMap
            currentIntersectionDensity={edgeMetrics.densityPercent}
            currentWeather={esp32Data.weatherCondition}
          />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkComparison
            metrics={metrics}
            controlMode={controlMode}
            onToggleControlMode={setControlMode}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span>Eco-TMS · Submission for NESFIC-D-22</span>
          <span className="mx-2">·</span>
          <span>Assam State Space Application Centre (ASSAC) · Dept. of Science &amp; Technology, Govt. of Assam</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Cartosat DEM · ESP-NOW P2P Mesh · OpenCV YOLO Non-Lane Bounding
        </div>
      </footer>

      {/* Official NESFIC Submission Dossier Modal */}
      <SubmissionDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />
    </div>
  );
}
