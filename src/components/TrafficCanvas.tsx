import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Vehicle,
  VehicleType,
  TrafficDirection,
  SignalPhase,
  EdgeCVMetrics,
  ESP32Telemetry,
} from '../types';
import {
  Eye,
  EyeOff,
  Sliders,
  Layers,
  Sparkles,
  ShieldAlert,
  Car,
  CloudRain,
  Sun,
  CloudFog,
} from 'lucide-react';

interface TrafficCanvasProps {
  currentPhase: SignalPhase;
  phaseTimeRemaining: number;
  totalPhaseTime: number;
  edgeMetrics: EdgeCVMetrics;
  esp32Data: ESP32Telemetry;
  cameraObscured: boolean;
  onToggleCameraObscure: () => void;
  onVehicleCountUpdate: (metrics: EdgeCVMetrics) => void;
  onTriggerSurge: (type: 'rush' | 'bikes' | 'clear') => void;
  simulationSpeed: number;
}

const VEHICLE_CONFIGS: Record<
  VehicleType,
  {
    width: number;
    height: number;
    colors: string[];
    baseSpeed: number;
    spaceWeight: number;
  }
> = {
  motorcycle: {
    width: 10,
    height: 18,
    colors: ['#06b6d4', '#e11d48', '#f59e0b', '#3b82f6', '#10b981'],
    baseSpeed: 3.2,
    spaceWeight: 1,
  },
  autorickshaw: {
    width: 15,
    height: 24,
    colors: ['#15803d', '#ca8a04', '#047857'], // Classic green/yellow auto-rickshaws
    baseSpeed: 2.4,
    spaceWeight: 2,
  },
  car: {
    width: 20,
    height: 38,
    colors: ['#e2e8f0', '#94a3b8', '#64748b', '#ef4444', '#3b82f6', '#1e293b'],
    baseSpeed: 2.8,
    spaceWeight: 3.5,
  },
  bus: {
    width: 25,
    height: 64,
    colors: ['#ea580c', '#b45309', '#0369a1'],
    baseSpeed: 1.8,
    spaceWeight: 7.5,
  },
};

export const TrafficCanvas: React.FC<TrafficCanvasProps> = ({
  currentPhase,
  phaseTimeRemaining,
  totalPhaseTime,
  edgeMetrics,
  esp32Data,
  cameraObscured,
  onToggleCameraObscure,
  onVehicleCountUpdate,
  onTriggerSurge,
  simulationSpeed,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const vehiclesRef = useRef<Vehicle[]>([]);
  const rainDropsRef = useRef<Array<{ x: number; y: number; length: number; speed: number }>>([]);
  const trackIdCounter = useRef(100);

  // Overlays
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showDensityGrid, setShowDensityGrid] = useState(false);
  const [showTrajectory, setShowTrajectory] = useState(true);

  // Initialize random rain drops
  useEffect(() => {
    const drops = [];
    for (let i = 0; i < 90; i++) {
      drops.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        length: 8 + Math.random() * 12,
        speed: 10 + Math.random() * 15,
      });
    }
    rainDropsRef.current = drops;
  }, []);

  // Spawn vehicle helper
  const spawnVehicle = useCallback(
    (direction: TrafficDirection, preferredType?: VehicleType) => {
      const types: VehicleType[] = preferredType
        ? [preferredType]
        : ['motorcycle', 'motorcycle', 'autorickshaw', 'autorickshaw', 'car', 'car', 'bus'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      const conf = VEHICLE_CONFIGS[chosenType];

      // Lane offsets for Indian non-lane mixed traffic
      // Width of road corridor = 160px (2 lanes each way, 80px per direction)
      const laneSpread = 28;
      const offset = (Math.random() - 0.5) * laneSpread;

      let x = 0;
      let y = 0;

      // Coordinate layout: Canvas is 760 x 560
      const cx = 380;
      const cy = 280;

      switch (direction) {
        case 'north': // Traveling South (downwards)
          x = cx - 42 + offset;
          y = -50;
          break;
        case 'south': // Traveling North (upwards)
          x = cx + 42 + offset;
          y = 610;
          break;
        case 'west': // Traveling East (rightwards)
          x = -50;
          y = cy + 42 + offset;
          break;
        case 'east': // Traveling West (leftwards)
          x = 810;
          y = cy - 42 + offset;
          break;
      }

      // Check minimum distance from existing vehicles in same lane spawn zone
      const tooClose = vehiclesRef.current.some((v) => {
        return Math.hypot(v.x - x, v.y - y) < conf.height * 1.5;
      });

      if (tooClose && vehiclesRef.current.length > 30) return;

      trackIdCounter.current += 1;
      const clearanceMap: Record<VehicleType, number> = {
        motorcycle: 130,
        autorickshaw: 180,
        car: 210,
        bus: 350,
      };

      const vehicle: Vehicle = {
        id: `veh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: chosenType,
        direction,
        x,
        y,
        targetSpeed: conf.baseSpeed * (0.85 + Math.random() * 0.3),
        currentSpeed: conf.baseSpeed,
        width: conf.width,
        height: conf.height,
        color: conf.colors[Math.floor(Math.random() * conf.colors.length)],
        laneOffset: offset,
        weavingPhase: Math.random() * Math.PI * 2,
        waitDuration: 0,
        passedIntersection: false,
        confidence: Number((0.88 + Math.random() * 0.1).toFixed(2)),
        boundingTrackId: trackIdCounter.current,
        groundClearanceMm: clearanceMap[chosenType],
        stallRisk: esp32Data.waterloggingMm > clearanceMap[chosenType] / 8 ? 'Warning' : 'Safe',
      };

      vehiclesRef.current.push(vehicle);
    },
    []
  );

  // Handle external surge triggers
  useEffect(() => {
    const directions: TrafficDirection[] = ['north', 'south', 'east', 'west'];
    const handleSurge = (e: CustomEvent<string>) => {
      const type = e.detail;
      if (type === 'rush') {
        for (let i = 0; i < 16; i++) {
          setTimeout(() => {
            spawnVehicle(directions[i % 4]);
          }, i * 140);
        }
      } else if (type === 'bikes') {
        for (let i = 0; i < 18; i++) {
          setTimeout(() => {
            spawnVehicle(directions[i % 4], 'motorcycle');
          }, i * 90);
        }
      } else if (type === 'clear') {
        vehiclesRef.current = [];
      }
    };

    window.addEventListener('traffic-surge' as any, handleSurge as any);
    return () => window.removeEventListener('traffic-surge' as any, handleSurge as any);
  }, [spawnVehicle]);

  // Initial population of vehicles
  useEffect(() => {
    const directions: TrafficDirection[] = ['north', 'south', 'east', 'west'];
    if (vehiclesRef.current.length === 0) {
      for (let i = 0; i < 12; i++) {
        spawnVehicle(directions[i % 4]);
      }
    }
  }, [spawnVehicle]);

  // Main simulation render loop
  useEffect(() => {
    let animId: number;
    let spawnTimer = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const roadWidth = 150;

      // Spawn periodic vehicles
      spawnTimer += simulationSpeed;
      if (spawnTimer > 42) {
        spawnTimer = 0;
        const dirs: TrafficDirection[] = ['north', 'south', 'east', 'west'];
        spawnVehicle(dirs[Math.floor(Math.random() * dirs.length)]);
      }

      // Clear canvas with deep dark asphalt
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      // Draw landscape / curbs
      ctx.fillStyle = '#090d16';
      // Corners
      ctx.fillRect(0, 0, cx - roadWidth / 2, cy - roadWidth / 2);
      ctx.fillRect(cx + roadWidth / 2, 0, width - (cx + roadWidth / 2), cy - roadWidth / 2);
      ctx.fillRect(0, cy + roadWidth / 2, cx - roadWidth / 2, height - (cy + roadWidth / 2));
      ctx.fillRect(cx + roadWidth / 2, cy + roadWidth / 2, width, height);

      // Pavement boundary sidewalks
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, cx - roadWidth / 2, cy - roadWidth / 2);
      ctx.strokeRect(cx + roadWidth / 2, 0, width - (cx + roadWidth / 2), cy - roadWidth / 2);
      ctx.strokeRect(0, cy + roadWidth / 2, cx - roadWidth / 2, height - (cy + roadWidth / 2));
      ctx.strokeRect(cx + roadWidth / 2, cy + roadWidth / 2, width, height);

      // Road Surface (Dark Asphalt)
      ctx.fillStyle = '#111827';
      // Vertical road (North-South)
      ctx.fillRect(cx - roadWidth / 2, 0, roadWidth, height);
      // Horizontal road (East-West)
      ctx.fillRect(0, cy - roadWidth / 2, width, roadWidth);

      // Wet road reflection if severe or mild rain
      if (esp32Data.waterloggingMm > 2) {
        ctx.fillStyle = 'rgba(14, 116, 144, 0.08)';
        ctx.fillRect(cx - roadWidth / 2, 0, roadWidth, height);
        ctx.fillRect(0, cy - roadWidth / 2, width, roadWidth);

        // Water puddles / pooling on road shoulders
        ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
        ctx.beginPath();
        ctx.ellipse(cx - 50, cy - 85, 22, 10, 0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 45, cy + 90, 28, 12, -0.3, 0, Math.PI * 2);
        ctx.ellipse(cx - 95, cy + 48, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Yellow Center Dividers (Dashed)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10]);

      // North & South center dividers
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, cy - roadWidth / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy + roadWidth / 2);
      ctx.lineTo(cx, height);
      ctx.stroke();

      // East & West center dividers
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(cx - roadWidth / 2, cy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + roadWidth / 2, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      ctx.setLineDash([]); // Reset dash

      // Lane markings (White dashed)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 14]);

      // N-S lanes
      ctx.beginPath();
      ctx.moveTo(cx - roadWidth / 4, 0);
      ctx.lineTo(cx - roadWidth / 4, cy - roadWidth / 2);
      ctx.moveTo(cx + roadWidth / 4, 0);
      ctx.lineTo(cx + roadWidth / 4, cy - roadWidth / 2);

      ctx.moveTo(cx - roadWidth / 4, cy + roadWidth / 2);
      ctx.lineTo(cx - roadWidth / 4, height);
      ctx.moveTo(cx + roadWidth / 4, cy + roadWidth / 2);
      ctx.lineTo(cx + roadWidth / 4, height);
      ctx.stroke();

      // E-W lanes
      ctx.beginPath();
      ctx.moveTo(0, cy - roadWidth / 4);
      ctx.lineTo(cx - roadWidth / 2, cy - roadWidth / 4);
      ctx.moveTo(0, cy + roadWidth / 4);
      ctx.lineTo(cx - roadWidth / 2, cy + roadWidth / 4);

      ctx.moveTo(cx + roadWidth / 2, cy - roadWidth / 4);
      ctx.lineTo(width, cy - roadWidth / 4);
      ctx.moveTo(cx + roadWidth / 2, cy + roadWidth / 4);
      ctx.lineTo(width, cy + roadWidth / 4);
      ctx.stroke();

      ctx.setLineDash([]);

      // Zebra Crossings (Stop Lines)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      const zebraStripeCount = 7;
      const stripeW = 14;

      // North Stop line & Zebra
      for (let i = 0; i < zebraStripeCount; i++) {
        ctx.fillRect(cx - roadWidth / 2 + i * 22 + 4, cy - roadWidth / 2 - 18, stripeW, 14);
      }
      // South Stop line & Zebra
      for (let i = 0; i < zebraStripeCount; i++) {
        ctx.fillRect(cx - roadWidth / 2 + i * 22 + 4, cy + roadWidth / 2 + 4, stripeW, 14);
      }
      // West Stop line & Zebra
      for (let i = 0; i < zebraStripeCount; i++) {
        ctx.fillRect(cx - roadWidth / 2 - 18, cy - roadWidth / 2 + i * 22 + 4, 14, stripeW);
      }
      // East Stop line & Zebra
      for (let i = 0; i < zebraStripeCount; i++) {
        ctx.fillRect(cx + roadWidth / 2 + 4, cy - roadWidth / 2 + i * 22 + 4, 14, stripeW);
      }

      // Stop Line Coordinates
      const stopLineNorth = cy - roadWidth / 2 - 24;
      const stopLineSouth = cy + roadWidth / 2 + 24;
      const stopLineWest = cx - roadWidth / 2 - 24;
      const stopLineEast = cx + roadWidth / 2 + 24;

      // Determine signal permissions
      const isNsGreen = currentPhase === 'NS_GREEN';
      const isNsYellow = currentPhase === 'NS_YELLOW';
      const isEwGreen = currentPhase === 'EW_GREEN';
      const isEwYellow = currentPhase === 'EW_YELLOW';

      // Update vehicle positions and physics
      const currentVehicles = vehiclesRef.current;
      const remainingVehicles: Vehicle[] = [];

      let totalSpeed = 0;
      let activeCount = 0;
      let bikeCount = 0;
      let autoCount = 0;
      let carCount = 0;
      let busCount = 0;

      for (let i = 0; i < currentVehicles.length; i++) {
        const v = currentVehicles[i];

        // Tally vehicle breakdown
        if (v.type === 'motorcycle') bikeCount++;
        else if (v.type === 'autorickshaw') autoCount++;
        else if (v.type === 'car') carCount++;
        else if (v.type === 'bus') busCount++;

        // Stop line evaluation
        let shouldStop = false;
        const stopDistanceMargin = 12;

        if (v.direction === 'north') {
          // Traveling downwards
          if (!v.passedIntersection) {
            if (v.y >= cy + roadWidth / 2) {
              v.passedIntersection = true;
            } else if (v.y >= stopLineNorth - stopDistanceMargin && v.y <= stopLineNorth + 10) {
              if (!isNsGreen) {
                // If yellow and already close, proceed; otherwise stop
                if (isNsYellow && v.y > stopLineNorth - 8) {
                  shouldStop = false;
                } else {
                  shouldStop = true;
                }
              }
            }
          }
        } else if (v.direction === 'south') {
          // Traveling upwards
          if (!v.passedIntersection) {
            if (v.y <= cy - roadWidth / 2) {
              v.passedIntersection = true;
            } else if (v.y <= stopLineSouth + stopDistanceMargin && v.y >= stopLineSouth - 10) {
              if (!isNsGreen) {
                if (isNsYellow && v.y < stopLineSouth + 8) {
                  shouldStop = false;
                } else {
                  shouldStop = true;
                }
              }
            }
          }
        } else if (v.direction === 'west') {
          // Traveling rightwards
          if (!v.passedIntersection) {
            if (v.x >= cx + roadWidth / 2) {
              v.passedIntersection = true;
            } else if (v.x >= stopLineWest - stopDistanceMargin && v.x <= stopLineWest + 10) {
              if (!isEwGreen) {
                if (isEwYellow && v.x > stopLineWest - 8) {
                  shouldStop = false;
                } else {
                  shouldStop = true;
                }
              }
            }
          }
        } else if (v.direction === 'east') {
          // Traveling leftwards
          if (!v.passedIntersection) {
            if (v.x <= cx - roadWidth / 2) {
              v.passedIntersection = true;
            } else if (v.x <= stopLineEast + stopDistanceMargin && v.x >= stopLineEast - 10) {
              if (!isEwGreen) {
                if (isEwYellow && v.x < stopLineEast + 8) {
                  shouldStop = false;
                } else {
                  shouldStop = true;
                }
              }
            }
          }
        }

        // Collision avoidance with leading vehicles in same corridor
        let vehicleAheadDistance = 999;
        let leadingVehicle: Vehicle | null = null;

        for (let j = 0; j < currentVehicles.length; j++) {
          if (i === j) continue;
          const other = currentVehicles[j];
          if (other.direction !== v.direction) continue;

          // Check if other is ahead
          let dist = 999;
          if (v.direction === 'north' && other.y > v.y) {
            dist = other.y - other.height / 2 - (v.y + v.height / 2);
          } else if (v.direction === 'south' && other.y < v.y) {
            dist = v.y - v.height / 2 - (other.y + other.height / 2);
          } else if (v.direction === 'west' && other.x > v.x) {
            dist = other.x - other.width / 2 - (v.x + v.width / 2);
          } else if (v.direction === 'east' && other.x < v.x) {
            dist = v.x - v.width / 2 - (other.x + other.width / 2);
          }

          // Non-lane dynamics: Motorcycles can squeeze past if lateral offset difference is sufficient!
          const lateralDiff =
            v.direction === 'north' || v.direction === 'south'
              ? Math.abs(v.x - other.x)
              : Math.abs(v.y - other.y);

          const requiredLateralGap = (v.width + other.width) / 2 + 4;
          const isLateralOverlap = lateralDiff < requiredLateralGap;

          if (isLateralOverlap && dist > 0 && dist < vehicleAheadDistance) {
            vehicleAheadDistance = dist;
            leadingVehicle = other;
          }
        }

        // Apply speed adjustments
        const minSafeGap = v.type === 'motorcycle' ? 8 : 16;
        if (shouldStop) {
          v.currentSpeed = Math.max(0, v.currentSpeed - 0.25 * simulationSpeed);
          v.waitDuration += 0.05 * simulationSpeed;
        } else if (vehicleAheadDistance < minSafeGap) {
          // Brake behind leader
          v.currentSpeed = Math.min(v.currentSpeed, (leadingVehicle?.currentSpeed || 0) * 0.9);
          v.waitDuration += 0.02 * simulationSpeed;
        } else {
          // Accelerate back to target speed
          v.currentSpeed = Math.min(
            v.targetSpeed,
            v.currentSpeed + 0.12 * simulationSpeed
          );
        }

        // Non-lane motorcycle weaving motion through gaps
        if (v.type === 'motorcycle' && v.currentSpeed > 0.5) {
          v.weavingPhase += 0.08 * simulationSpeed;
          const weaveAmt = Math.sin(v.weavingPhase) * 0.4;
          if (v.direction === 'north' || v.direction === 'south') {
            v.x += weaveAmt;
          } else {
            v.y += weaveAmt;
          }
        }

        // Update position
        const moveDist = v.currentSpeed * simulationSpeed;
        if (v.direction === 'north') v.y += moveDist;
        else if (v.direction === 'south') v.y -= moveDist;
        else if (v.direction === 'west') v.x += moveDist;
        else if (v.direction === 'east') v.x -= moveDist;

        // Keep inside bounds
        const outOfBounds =
          v.x < -80 || v.x > width + 80 || v.y < -80 || v.y > height + 80;

        if (!outOfBounds) {
          remainingVehicles.push(v);
          totalSpeed += v.currentSpeed * 18; // approx km/h
          activeCount++;
        }
      }

      vehiclesRef.current = remainingVehicles;

      // Draw Spatial Density Grid if enabled
      if (showDensityGrid) {
        const cellSize = 30;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 1;
        for (let gx = cx - roadWidth / 2; gx <= cx + roadWidth / 2; gx += cellSize) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, height);
          ctx.stroke();
        }
        for (let gy = cy - roadWidth / 2; gy <= cy + roadWidth / 2; gy += cellSize) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(width, gy);
          ctx.stroke();
        }
      }

      // Draw Vehicles
      for (const v of remainingVehicles) {
        ctx.save();
        ctx.translate(v.x, v.y);

        // Rotation according to direction
        let angle = 0;
        if (v.direction === 'north') angle = Math.PI / 2;
        else if (v.direction === 'south') angle = -Math.PI / 2;
        else if (v.direction === 'west') angle = 0;
        else if (v.direction === 'east') angle = Math.PI;

        ctx.rotate(angle);

        // Vehicle shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(-v.height / 2 + 2, -v.width / 2 + 2, v.height, v.width);

        // Vehicle Body
        ctx.fillStyle = v.color;
        const rad = v.type === 'motorcycle' ? 2 : 4;
        ctx.beginPath();
        ctx.roundRect(-v.height / 2, -v.width / 2, v.height, v.width, rad);
        ctx.fill();

        // Distinct styling for Auto-rickshaw (Yellow/Green canopy roof)
        if (v.type === 'autorickshaw') {
          ctx.fillStyle = '#eab308'; // yellow canvas roof
          ctx.beginPath();
          ctx.roundRect(-v.height / 4, -v.width / 2 + 1, v.height / 1.5, v.width - 2, 2);
          ctx.fill();
        }

        // Distinct styling for Motorcycle (Handlebar & rider silhouette)
        if (v.type === 'motorcycle') {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-2, -v.width / 2 - 1, 4, v.width + 2); // handlebar
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2); // rider helmet
          ctx.fill();
        }

        // Headlights / Tail lights
        if (v.type !== 'motorcycle') {
          // Front headlights
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(v.height / 2 - 2, -v.width / 2 + 1, 2, 3);
          ctx.fillRect(v.height / 2 - 2, v.width / 2 - 4, 2, 3);
          // Red tail lights
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-v.height / 2, -v.width / 2 + 1, 2, 3);
          ctx.fillRect(-v.height / 2, v.width / 2 - 4, 2, 3);
        }

        ctx.restore();

        // Edge YOLO Bounding Box & Label Overlay
        if (showBoundingBoxes && !cameraObscured) {
          ctx.save();
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1;
          const boxPad = 4;
          const bw = v.direction === 'north' || v.direction === 'south' ? v.width : v.height;
          const bh = v.direction === 'north' || v.direction === 'south' ? v.height : v.width;

          ctx.strokeRect(
            v.x - bw / 2 - boxPad,
            v.y - bh / 2 - boxPad,
            bw + boxPad * 2,
            bh + boxPad * 2
          );

          // Class tag badge
          const typeTag =
            v.type === 'motorcycle'
              ? '2W'
              : v.type === 'autorickshaw'
              ? 'Auto'
              : v.type === 'car'
              ? 'Car'
              : 'Bus';

          ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
          ctx.fillRect(v.x - bw / 2 - boxPad, v.y - bh / 2 - boxPad - 13, 56, 13);
          ctx.fillStyle = '#020617';
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.fillText(
            `${typeTag} ${Math.round(v.confidence * 100)}%`,
            v.x - bw / 2 - boxPad + 3,
            v.y - bh / 2 - boxPad - 3
          );

          // Optical flow trajectory arrow
          if (showTrajectory && v.currentSpeed > 0.4) {
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(v.x, v.y);
            const vecLen = v.currentSpeed * 8;
            if (v.direction === 'north') ctx.lineTo(v.x, v.y + vecLen);
            else if (v.direction === 'south') ctx.lineTo(v.x, v.y - vecLen);
            else if (v.direction === 'west') ctx.lineTo(v.x + vecLen, v.y);
            else if (v.direction === 'east') ctx.lineTo(v.x - vecLen, v.y);
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      // Draw Traffic Signals (Gantry / Poles)
      const drawSignalHead = (
        sx: number,
        sy: number,
        isGreen: boolean,
        isYellow: boolean,
        isRed: boolean,
        label: string
      ) => {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(sx - 11, sy - 28, 22, 56, 4);
        ctx.fill();
        ctx.stroke();

        // Red lamp
        ctx.fillStyle = isRed ? '#ef4444' : '#450a0a';
        if (isRed) {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.arc(sx, sy - 17, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Yellow lamp
        ctx.fillStyle = isYellow ? '#f59e0b' : '#451a03';
        if (isYellow) {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Green lamp
        ctx.fillStyle = isGreen ? '#10b981' : '#022c22';
        if (isGreen) {
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.arc(sx, sy + 17, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Small indicator text
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(label, sx - 7, sy + 38);
      };

      // North-South Signal Heads
      const nsIsGreen = currentPhase === 'NS_GREEN';
      const nsIsYellow = currentPhase === 'NS_YELLOW';
      const nsIsRed = !nsIsGreen && !nsIsYellow;

      const ewIsGreen = currentPhase === 'EW_GREEN';
      const ewIsYellow = currentPhase === 'EW_YELLOW';
      const ewIsRed = !ewIsGreen && !ewIsYellow;

      // North signal (facing south-bound traffic)
      drawSignalHead(cx - roadWidth / 2 - 20, cy - roadWidth / 2 - 20, nsIsGreen, nsIsYellow, nsIsRed, 'N-S');
      // South signal
      drawSignalHead(cx + roadWidth / 2 + 20, cy + roadWidth / 2 + 20, nsIsGreen, nsIsYellow, nsIsRed, 'N-S');

      // East signal
      drawSignalHead(cx + roadWidth / 2 + 20, cy - roadWidth / 2 - 20, ewIsGreen, ewIsYellow, ewIsRed, 'E-W');
      // West signal
      drawSignalHead(cx - roadWidth / 2 - 20, cy + roadWidth / 2 + 20, ewIsGreen, ewIsYellow, ewIsRed, 'E-W');

      // Environmental Weather Particle Simulation
      if (esp32Data.weatherCondition === 'Mild Rain' || esp32Data.weatherCondition === 'Severe Waterlogging') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.lineWidth = 1;
        const drops = rainDropsRef.current;
        for (let d of drops) {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 3, d.y + d.length);
          ctx.stroke();

          d.y += d.speed * simulationSpeed;
          d.x -= 2 * simulationSpeed;
          if (d.y > height) {
            d.y = -10;
            d.x = Math.random() * width;
          }
        }
      }

      // Dense Fog Haze Overlay
      if (esp32Data.visibilityLux < 300) {
        const fogAlpha = Math.min(0.7, ((300 - esp32Data.visibilityLux) / 300) * 0.7);
        ctx.fillStyle = `rgba(148, 163, 184, ${fogAlpha})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Camera Obscured Simulation (resilience test)
      if (cameraObscured) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(0, 0, width, height);

        // Noise & lens grime splatter
        ctx.fillStyle = '#475569';
        for (let s = 0; s < 30; s++) {
          ctx.beginPath();
          ctx.arc((s * 37) % width, (s * 49) % height, (s % 12) + 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CAMERA FEED OBSCURED (LENS BLOCKED / MUD / FOG)', cx, cy - 20);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '13px JetBrains Mono, monospace';
        ctx.fillText('Autonomous Failover: Operating on ESP32 Weather Telemetry & Historical Model', cx, cy + 10);
        ctx.textAlign = 'start';
      }

      // Update parent metrics once every few frames
      const calculatedDensity = Math.min(
        100,
        Math.round(
          (bikeCount * 1.5 + autoCount * 3 + carCount * 5 + busCount * 9) * 1.2
        )
      );

      const calculatedAvgSpeed =
        activeCount > 0 ? Math.round(totalSpeed / activeCount) : 32;

      onVehicleCountUpdate({
        nodeId: 'NODE_INTX_04',
        fps: 28,
        densityPercent: calculatedDensity,
        avgSpeedKmh: calculatedAvgSpeed,
        totalVehiclesDetected: activeCount,
        breakdown: {
          motorcycles: bikeCount,
          autorickshaws: autoCount,
          cars: carCount,
          buses: busCount,
        },
        cameraObscured,
        spatialCongestionZone:
          calculatedDensity > 65 ? 'High' : calculatedDensity > 35 ? 'Medium' : 'Low',
        inundationFlushActive: esp32Data.waterloggingMm > 15,
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    currentPhase,
    cameraObscured,
    simulationSpeed,
    esp32Data,
    showBoundingBoxes,
    showDensityGrid,
    showTrajectory,
    onVehicleCountUpdate,
    spawnVehicle,
  ]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top status bar above simulation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900 border border-slate-800 rounded-lg">
        {/* Signal Phase readout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Signal Phase:</span>
            <span className="font-mono text-xs font-semibold text-cyan-400">
              {currentPhase.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Phase Clock:</span>
            <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
              {phaseTimeRemaining.toFixed(1)}s
            </span>
            <span className="text-[11px] text-slate-500 tabular-nums">
              / {totalPhaseTime.toFixed(1)}s
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Road state & weather tag */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {esp32Data.weatherCondition === 'Clear' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : esp32Data.weatherCondition.includes('Fog') ? (
              <CloudFog className="w-3.5 h-3.5 text-slate-300" />
            ) : (
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{esp32Data.weatherCondition}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{esp32Data.waterloggingMm}mm water</span>
          </div>
        </div>

        {/* View toggles & camera obscure button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              showBoundingBoxes
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            YOLO Bounding Boxes
          </button>
          <button
            onClick={() => setShowDensityGrid(!showDensityGrid)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              showDensityGrid
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Spatial Density Grid
          </button>
          <button
            onClick={onToggleCameraObscure}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
              cameraObscured
                ? 'bg-red-950 text-red-300 border border-red-800'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cameraObscured ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-red-400" />
                Obscured (Failover Active)
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Obscure Lens (Test Resilience)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={760}
          height={540}
          className="w-full max-w-[760px] h-auto object-contain block"
        />

        {/* Overlay HUD Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 text-xs font-mono flex items-center gap-2">
            <span className="text-slate-400">Microprocessor Edge CV:</span>
            <span className="text-emerald-400 font-semibold">{edgeMetrics.fps} FPS</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">Latency: 9ms</span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 text-xs font-mono flex items-center gap-2">
            <span className="text-slate-400">Road Spatial Density:</span>
            <span
              className={`font-semibold ${
                edgeMetrics.densityPercent > 65
                  ? 'text-red-400'
                  : edgeMetrics.densityPercent > 35
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {edgeMetrics.densityPercent}%
            </span>
            <span className="text-slate-500">
              ({edgeMetrics.spatialCongestionZone} Congestion)
            </span>
          </div>
        </div>

        {/* Vehicle Counts HUD (Bottom Left) */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded border border-slate-800 text-xs font-mono flex items-center gap-4 pointer-events-none">
          <div>
            <span className="text-slate-400">2-Wheelers:</span>{' '}
            <span className="text-cyan-400 font-bold tabular-nums">
              {edgeMetrics.breakdown.motorcycles}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Auto-Rickshaws:</span>{' '}
            <span className="text-amber-400 font-bold tabular-nums">
              {edgeMetrics.breakdown.autorickshaws}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Cars:</span>{' '}
            <span className="text-slate-200 font-bold tabular-nums">
              {edgeMetrics.breakdown.cars}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Buses/Trucks:</span>{' '}
            <span className="text-orange-400 font-bold tabular-nums">
              {edgeMetrics.breakdown.buses}
            </span>
          </div>
        </div>

        {/* Rapid Surge Triggers (Bottom Right) */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded border border-slate-800">
          <span className="text-[11px] text-slate-400 px-1 font-medium">Inject Flow:</span>
          <button
            onClick={() => onTriggerSurge('bikes')}
            className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded transition-colors"
          >
            +18 Two-Wheelers
          </button>
          <button
            onClick={() => onTriggerSurge('rush')}
            className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 rounded transition-colors"
          >
            Rush Hour Surge
          </button>
          <button
            onClick={() => onTriggerSurge('clear')}
            className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded transition-colors"
          >
            Clear Grid
          </button>
        </div>
      </div>
    </div>
  );
};
