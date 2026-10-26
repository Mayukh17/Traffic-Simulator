export type VehicleType = 'motorcycle' | 'autorickshaw' | 'car' | 'bus';

export type TrafficDirection = 'north' | 'south' | 'east' | 'west';

export type SignalPhase = 'NS_GREEN' | 'NS_YELLOW' | 'ALL_RED' | 'EW_GREEN' | 'EW_YELLOW';

export interface Vehicle {
  id: string;
  type: VehicleType;
  direction: TrafficDirection;
  x: number;
  y: number;
  targetSpeed: number;
  currentSpeed: number; // km/h
  width: number;
  height: number;
  color: string;
  laneOffset: number; // For non-lane based weaving
  weavingPhase: number;
  waitDuration: number; // seconds waiting at stop line
  passedIntersection: boolean;
  confidence: number; // Edge YOLO confidence (0.85 - 0.98)
  boundingTrackId: number;
  groundClearanceMm: number; // For inundation stalling risk calculation
  stallRisk: 'Safe' | 'Warning' | 'Critical Stalling';
}

export interface ESP32Telemetry {
  nodeId: string;
  timestamp: number;
  temperatureC: number;
  humidityPercent: number;
  visibilityLux: number; // Optical sensor: 1000 = clear daylight, <150 = fog/smog
  waterloggingMm: number; // Road surface depth (0 to 65mm)
  weatherCondition: 'Clear' | 'Mild Rain' | 'Dense Fog' | 'Severe Waterlogging';
  weatherSeverityIndex: number; // 0 to 100
  mqttTopic: string;
  payloadBytes: number;
  rssiDb: number;
  meshP2PPeers: number; // Decentralized P2P node mesh count
  p2pMeshActive: boolean;
}

export interface EdgeCVMetrics {
  nodeId: string;
  fps: number;
  densityPercent: number; // 0 - 100% road occupancy
  avgSpeedKmh: number; // km/h
  totalVehiclesDetected: number;
  breakdown: {
    motorcycles: number;
    autorickshaws: number;
    cars: number;
    buses: number;
  };
  cameraObscured: boolean;
  spatialCongestionZone: 'Low' | 'Medium' | 'High';
  inundationFlushActive: boolean;
}

export interface FuzzyMembership {
  label: string;
  degree: number; // 0.0 to 1.0
}

export interface FuzzyRuleActivation {
  id: number;
  name: string;
  condition: string;
  weight: number; // rule firing strength (0.0 to 1.0)
  outputGreen: 'Short' | 'Standard' | 'Long';
  outputYellow: 'Standard' | 'Extended';
  isFired: boolean;
}

export interface FuzzyEngineOutput {
  antecedents: {
    density: { value: number; memberships: { low: number; medium: number; high: number } };
    speed: { value: number; memberships: { slow: number; moderate: number; fast: number } };
    weather: { value: number; memberships: { clear: number; mild: number; severe: number } };
    drainageSaturation?: number; // ASSAC GIS DEM runoff antecedent
  };
  rules: FuzzyRuleActivation[];
  consequents: {
    greenLightExtensionSec: number; // calculated crisp output
    yellowLightDurationSec: number; // calculated crisp output
    greenCategory: 'Short' | 'Standard' | 'Long';
    yellowCategory: 'Standard' | 'Extended';
    hydroGreenWaveActive: boolean;
  };
  decisionRationale: string;
  timestamp: number;
}

export interface MqttPacketLog {
  id: string;
  timestamp: string;
  topic: string;
  sizeBytes: number;
  payload: string;
  qos: 0 | 1 | 2;
  protocol: 'MQTT-Cloud' | 'ESP-NOW P2P Mesh';
}

export interface GisBasinNode {
  id: string;
  name: string;
  corridor: string;
  elevationMeters: number; // ASSAC DEM elevation
  soilRunoffCoefficient: number; // 0.0 to 1.0
  floodRiskTier: 'Low Elevation Basin' | 'Moderate Slope' | 'High Ground Ridge';
  currentWaterDepthMm: number;
  densityPercent: number;
  evacuationStatus: 'Nominal Flow' | 'Hydro-Flush Triggered' | 'Emergency Diversion';
  stalledVehicleCount: number;
  coords: { x: number; y: number };
}

export interface CityNode {
  id: string;
  name: string;
  location: string;
  density: number;
  weather: 'Clear' | 'Mild' | 'Severe';
  status: 'Nominal' | 'Bottleneck Risk' | 'Active Diversion';
  predictedPeakMinutes: number;
  reroutePlan: string | null;
  coords: { x: number; y: number };
}

export interface SystemMetrics {
  ecoTmsWaitTimeSec: number;
  fixedTimerWaitTimeSec: number;
  fuelSavedLitres: number;
  co2SavedKg: number;
  hardBrakingAvoidedCount: number;
  bandwidthConsumedKb: number;
  traditionalBandwidthConsumedKb: number;
  waterloggedStallsAverted: number; // ASSAC GIS innovation metric
  p2pMeshPacketUptimePercent: number; // Decentralized storm uptime
}
