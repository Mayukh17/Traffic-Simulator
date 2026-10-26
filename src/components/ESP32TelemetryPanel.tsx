import React, { useState } from 'react';
import { ESP32Telemetry, MqttPacketLog } from '../types';
import {
  Thermometer,
  Droplets,
  Eye,
  Wifi,
  Radio,
  Cpu,
  Layers,
  Check,
  Copy,
  Sliders,
  CloudRain,
  Sun,
  CloudFog,
} from 'lucide-react';

interface ESP32TelemetryPanelProps {
  esp32Data: ESP32Telemetry;
  mqttLogs: MqttPacketLog[];
  onSetWeatherPreset: (preset: 'clear' | 'fog' | 'monsoon' | 'drizzle') => void;
  onUpdateSensors: (temp: number, humidity: number, lux: number, waterMm: number) => void;
}

export const ESP32TelemetryPanel: React.FC<ESP32TelemetryPanelProps> = ({
  esp32Data,
  mqttLogs,
  onSetWeatherPreset,
  onUpdateSensors,
}) => {
  const [activeTab, setActiveTab] = useState<'stream' | 'pinout' | 'bandwidth'>('stream');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPayload = (payload: string, id: string) => {
    navigator.clipboard.writeText(payload);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Controller & Weather Presets */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">
              ESP32 Environmental Sensor Node (Hardware PoC)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Decentralized low-cost microcontroller node transmitting lightweight telemetry via MQTT
          </p>
        </div>

        {/* Weather condition injectors */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Inject Weather:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
            <button
              onClick={() => onSetWeatherPreset('clear')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                esp32Data.weatherCondition === 'Clear'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3 h-3" />
              Clear
            </button>
            <button
              onClick={() => onSetWeatherPreset('fog')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                esp32Data.weatherCondition.includes('Fog')
                  ? 'bg-slate-700 text-slate-200 border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CloudFog className="w-3 h-3" />
              Dense Fog
            </button>
            <button
              onClick={() => onSetWeatherPreset('drizzle')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                esp32Data.weatherCondition === 'Mild Rain'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CloudRain className="w-3 h-3" />
              Mild Rain
            </button>
            <button
              onClick={() => onSetWeatherPreset('monsoon')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                esp32Data.weatherCondition === 'Severe Waterlogging'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Droplets className="w-3 h-3" />
              Monsoon Flooding
            </button>
          </div>
        </div>
      </div>

      {/* Sensor Telemetry Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sensor 1: Temperature */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              Ambient Temp (DHT22)
            </span>
            <span className="font-mono text-[11px] text-slate-500">GPIO 4</span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-white tabular-nums">
              {esp32Data.temperatureC.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">°C</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Range: 15°C – 48°C</span>
            <span className="text-emerald-400 font-mono">Calibrated</span>
          </div>
        </div>

        {/* Sensor 2: Humidity */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Relative Humidity
            </span>
            <span className="font-mono text-[11px] text-slate-500">DHT22</span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-white tabular-nums">
              {esp32Data.humidityPercent}
            </span>
            <span className="text-xs text-slate-400 font-mono">% RH</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Dew Point: 22.4°C</span>
            <span className="font-mono text-slate-300">
              {esp32Data.humidityPercent > 85 ? 'High Vapor' : 'Nominal'}
            </span>
          </div>
        </div>

        {/* Sensor 3: Optical Visibility */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              Optical Visibility (LDR)
            </span>
            <span className="font-mono text-[11px] text-slate-500">GPIO 34 ADC</span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-white tabular-nums">
              {esp32Data.visibilityLux}
            </span>
            <span className="text-xs text-slate-400 font-mono">Lux</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Penetration:</span>
            <span
              className={`font-mono font-medium ${
                esp32Data.visibilityLux < 300 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {esp32Data.visibilityLux < 300 ? 'Severe Fog / Smog' : 'Clear View'}
            </span>
          </div>
        </div>

        {/* Sensor 4: Road Waterlogging */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              Road Surface Water
            </span>
            <span className="font-mono text-[11px] text-slate-500">GPIO 35 ADC</span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-white tabular-nums">
              {esp32Data.waterloggingMm}
            </span>
            <span className="text-xs text-slate-400 font-mono">mm depth</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Hydroplane Risk:</span>
            <span
              className={`font-mono font-medium ${
                esp32Data.waterloggingMm > 15
                  ? 'text-red-400'
                  : esp32Data.waterloggingMm > 4
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {esp32Data.waterloggingMm > 15
                ? 'High Hazard'
                : esp32Data.waterloggingMm > 4
                ? 'Moderate'
                : 'Dry / Safe'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: MQTT Stream | Hardware Pinout PoC | Bandwidth Efficiency */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('stream')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'stream'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live MQTT Packet Stream
            </button>
            <button
              onClick={() => setActiveTab('bandwidth')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'bandwidth'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bandwidth vs Video Comparison
            </button>
            <button
              onClick={() => setActiveTab('pinout')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'pinout'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hardware PoC Wiring Diagram
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="text-emerald-400 font-semibold">QoS 1</span>
            <span>·</span>
            <span>Broker: mqtt.broker.ecotms.local</span>
          </div>
        </div>

        {/* Tab 1: Live MQTT Packet Stream */}
        {activeTab === 'stream' && (
          <div className="p-4 flex flex-col gap-3">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Published Topics: <code className="text-cyan-300 font-mono">ecotms/node/intx-04/telemetry</code></span>
              <span className="font-mono text-[11px] text-slate-500">Transmission Rate: 1.0 Hz (Every 1000ms)</span>
            </div>

            <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs max-h-72 overflow-y-auto space-y-2">
              {mqttLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-slate-500 text-[11px] shrink-0 tabular-nums">
                      {log.timestamp}
                    </span>
                    <span className="text-emerald-400 text-[11px] shrink-0 font-semibold">
                      PUB [QoS {log.qos}]
                    </span>
                    <span className="text-slate-300 truncate font-mono text-[11px]">
                      {log.payload}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500 tabular-nums">
                      {log.sizeBytes} B
                    </span>
                    <button
                      onClick={() => handleCopyPayload(log.payload, log.id)}
                      className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy JSON Payload"
                    >
                      {copiedId === log.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Bandwidth Efficiency Breakdown */}
        {activeTab === 'bandwidth' && (
          <div className="p-6 flex flex-col gap-6">
            <div className="max-w-3xl">
              <h3 className="text-sm font-semibold text-white">
                Low-Power Communication & Bandwidth Savings Analysis
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Eco-TMS addresses Section 2 of the NESFIC-D-22 mandate: instead of streaming expensive 1080p video feeds from intersections to a central cloud, microprocessors analyze imagery locally and transmit only structured numerical metadata via MQTT.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Traditional Camera Feed */}
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-xs text-red-400 font-semibold mb-1">
                  Traditional Centralized Smart City Architecture
                </div>
                <div className="text-xs text-slate-400 mb-3">
                  Streaming 1080p H.264/H.265 CCTV video to centralized server
                </div>
                <div className="font-mono text-2xl font-bold text-white mb-2 tabular-nums">
                  4,500 <span className="text-sm text-slate-400 font-normal">KB / sec</span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>· Daily data per junction: <span className="font-mono text-slate-300">~388 GB / day</span></div>
                  <div>· Cellular 4G/5G data cost: <span className="font-mono text-slate-300">$180 / month / node</span></div>
                  <div>· Latency under network congestion: <span className="font-mono text-red-400">1,200 – 4,500 ms</span></div>
                </div>
              </div>

              {/* Eco-TMS Decentralized Edge Telemetry */}
              <div className="p-4 bg-cyan-950/20 rounded-lg border border-cyan-800/60">
                <div className="text-xs text-cyan-300 font-semibold mb-1">
                  Eco-TMS Decentralized Edge & ESP32 Array
                </div>
                <div className="text-xs text-slate-400 mb-3">
                  Edge extraction + structured MQTT JSON packets
                </div>
                <div className="font-mono text-2xl font-bold text-cyan-300 mb-2 tabular-nums">
                  0.18 <span className="text-sm text-slate-400 font-normal">KB / sec</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>· Daily data per junction: <span className="font-mono text-cyan-200">~15.5 MB / day</span> <span className="text-emerald-400 font-semibold">(-99.996%)</span></div>
                  <div>· Operational data cost: <span className="font-mono text-cyan-200">&lt; $0.50 / month / node</span></div>
                  <div>· Transmission latency: <span className="font-mono text-emerald-400">&lt; 15 ms</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Hardware PoC Pinout Diagram */}
        {activeTab === 'pinout' && (
          <div className="p-6 flex flex-col gap-4">
            <div className="text-xs text-slate-300">
              Schematic Pinout for Phase 2 Hardware Prototype (ESP32-WROOM-32D Core):
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono">
                <div className="text-amber-400 font-bold mb-2">DHT22 Digital Interface</div>
                <div className="text-slate-400 space-y-1 text-[11px]">
                  <div>Pin 1: VCC (3.3V DC)</div>
                  <div>Pin 2: DATA (GPIO 4 with 10k pull-up)</div>
                  <div>Pin 3: NC (No Connection)</div>
                  <div>Pin 4: GND</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono">
                <div className="text-sky-400 font-bold mb-2">Optical Visibility Array</div>
                <div className="text-slate-400 space-y-1 text-[11px]">
                  <div>VCC: 3.3V Regulated</div>
                  <div>Analog OUT: GPIO 34 (ADC1_CH6)</div>
                  <div>Precision: 12-bit ADC (0 - 4095)</div>
                  <div>Enclosure: Weatherproof Quartz Lens</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono">
                <div className="text-blue-400 font-bold mb-2">Road Waterlogging Probe</div>
                <div className="text-slate-400 space-y-1 text-[11px]">
                  <div>Submersible Depth: 0 - 50 mm</div>
                  <div>Analog OUT: GPIO 35 (ADC1_CH7)</div>
                  <div>Filter: Moving median debounce</div>
                  <div>Mount: Curb Drain Well Flange</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
