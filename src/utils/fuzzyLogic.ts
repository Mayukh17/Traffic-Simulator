import { FuzzyEngineOutput, FuzzyRuleActivation } from '../types';

/**
 * Triangular membership function
 */
function trimf(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

/**
 * Trapezoidal membership function
 */
function trapmf(x: number, a: number, b: number, c: number, d: number): number {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

/**
 * Evaluates Antecedent 1: Vehicle Density (% road space occupied, 0-100)
 */
export function evaluateDensity(density: number) {
  const d = Math.max(0, Math.min(100, density));
  return {
    low: trapmf(d, -10, 0, 20, 40),
    medium: trimf(d, 25, 50, 75),
    high: trapmf(d, 60, 80, 100, 110),
  };
}

/**
 * Evaluates Antecedent 2: Average Approach Speed (km/h, 0-70)
 */
export function evaluateSpeed(speed: number) {
  const s = Math.max(0, Math.min(70, speed));
  return {
    slow: trapmf(s, -5, 0, 15, 25),
    moderate: trimf(s, 18, 32, 45),
    fast: trapmf(s, 38, 50, 70, 85),
  };
}

/**
 * Evaluates Antecedent 3: Weather Severity (0-100 index from ESP32 DHT & optical sensors)
 */
export function evaluateWeather(severity: number) {
  const w = Math.max(0, Math.min(100, severity));
  return {
    clear: trapmf(w, -10, 0, 20, 35),
    mild: trimf(w, 25, 50, 75),
    severe: trapmf(w, 65, 80, 100, 110),
  };
}

/**
 * Complete Mamdani Fuzzy Rule Base matching the Eco-TMS Proposal + ASSAC GIS Space-Edge Novelty
 */
export function runFuzzyInference(
  densityVal: number,
  speedVal: number,
  weatherVal: number,
  waterloggingDepthMm: number = 0
): FuzzyEngineOutput {
  const densityM = evaluateDensity(densityVal);
  const speedM = evaluateSpeed(speedVal);
  const weatherM = evaluateWeather(weatherVal);

  const isSevereWater = waterloggingDepthMm > 15 || weatherVal > 75;

  const rawRules: Array<{
    id: number;
    name: string;
    condition: string;
    evalWeight: () => number;
    outputGreen: 'Short' | 'Standard' | 'Long';
    outputYellow: 'Standard' | 'Extended';
  }> = [
    // Rule 1: Specified explicitly in proposal
    {
      id: 1,
      name: 'Baseline Congestion Clearance',
      condition: 'IF Density is High AND Weather is Clear',
      evalWeight: () => Math.min(densityM.high, weatherM.clear),
      outputGreen: 'Long',
      outputYellow: 'Standard',
    },
    // Rule 2: Specified explicitly in proposal (Weather safety)
    {
      id: 2,
      name: 'Severe Weather Safe Stoppage',
      condition: 'IF Density is High AND Weather is Severe',
      evalWeight: () => Math.min(densityM.high, weatherM.severe),
      outputGreen: 'Long',
      outputYellow: 'Extended', // Extended amber prevents wet asphalt slip
    },
    // Rule 3: Specified explicitly in proposal (Flow optimization)
    {
      id: 3,
      name: 'Free Flow Optimization',
      condition: 'IF Density is Low AND Speed is Fast AND Weather is Clear',
      evalWeight: () => Math.min(densityM.low, speedM.fast, weatherM.clear),
      outputGreen: 'Short',
      outputYellow: 'Standard',
    },
    // Rule 4: Severe weather with low density (cautionary yellow)
    {
      id: 4,
      name: 'Wet Road Speed Moderation',
      condition: 'IF Density is Low AND Weather is Severe',
      evalWeight: () => Math.min(densityM.low, weatherM.severe),
      outputGreen: 'Short',
      outputYellow: 'Extended',
    },
    // Rule 5: Balanced moderate traffic
    {
      id: 5,
      name: 'Nominal Mixed Flow',
      condition: 'IF Density is Medium AND Speed is Moderate',
      evalWeight: () => Math.min(densityM.medium, speedM.moderate),
      outputGreen: 'Standard',
      outputYellow: 'Standard',
    },
    // Rule 6: Medium density with poor weather
    {
      id: 6,
      name: 'Mild Rain Transition',
      condition: 'IF Density is Medium AND Weather is Mild',
      evalWeight: () => Math.min(densityM.medium, weatherM.mild),
      outputGreen: 'Standard',
      outputYellow: 'Extended',
    },
    // Rule 7: Severe weather with medium density
    {
      id: 7,
      name: 'Waterlogged Flow Maintenance',
      condition: 'IF Density is Medium AND Weather is Severe',
      evalWeight: () => Math.min(densityM.medium, weatherM.severe),
      outputGreen: 'Long',
      outputYellow: 'Extended',
    },
    // Rule 8: Slow crawling queue regardless of weather
    {
      id: 8,
      name: 'Gridlock Dissipation',
      condition: 'IF Density is High AND Speed is Slow',
      evalWeight: () => Math.min(densityM.high, speedM.slow),
      outputGreen: 'Long',
      outputYellow: weatherM.severe > 0.4 ? 'Extended' : 'Standard',
    },
    // Rule 9: Low density slow crawl
    {
      id: 9,
      name: 'Sparse Crawl Timing',
      condition: 'IF Density is Low AND Speed is Slow',
      evalWeight: () => Math.min(densityM.low, speedM.slow),
      outputGreen: 'Short',
      outputYellow: 'Standard',
    },
    // Rule 10: ASSAC Innovation - Hydro-Green Wave Evacuation
    {
      id: 10,
      name: 'ASSAC Hydro-Green Wave Evacuation',
      condition: 'IF Water Depth >15mm (Flash Flood Inundation) AND Density is Medium/High',
      evalWeight: () => {
        const waterWeight = Math.min(1.0, waterloggingDepthMm / 20);
        return Math.min(waterWeight, Math.max(densityM.medium, densityM.high));
      },
      outputGreen: 'Long',
      outputYellow: 'Extended',
    },
  ];

  const rules: FuzzyRuleActivation[] = rawRules.map((r) => {
    const weight = Number(r.evalWeight().toFixed(3));
    return {
      id: r.id,
      name: r.name,
      condition: r.condition,
      weight,
      outputGreen: r.outputGreen,
      outputYellow: r.outputYellow,
      isFired: weight > 0.05,
    };
  });

  // Consequent Crisp Centers (Seconds)
  const greenCenters: Record<'Short' | 'Standard' | 'Long', number> = {
    Short: 16,
    Standard: 36,
    Long: 65,
  };

  const yellowCenters: Record<'Standard' | 'Extended', number> = {
    Standard: 3.5,
    Extended: 6.0,
  };

  let totalGreenNumerator = 0;
  let totalGreenDenominator = 0;
  let totalYellowNumerator = 0;
  let totalYellowDenominator = 0;

  for (const r of rules) {
    if (r.weight > 0) {
      totalGreenNumerator += r.weight * greenCenters[r.outputGreen];
      totalGreenDenominator += r.weight;

      totalYellowNumerator += r.weight * yellowCenters[r.outputYellow];
      totalYellowDenominator += r.weight;
    }
  }

  // Centroid Defuzzification
  const greenCrisp =
    totalGreenDenominator > 0
      ? totalGreenNumerator / totalGreenDenominator
      : 30.0;

  const yellowCrisp =
    totalYellowDenominator > 0
      ? totalYellowNumerator / totalYellowDenominator
      : 3.5;

  const finalGreenSec = Math.round(greenCrisp * 10) / 10;
  const finalYellowSec = Math.round(yellowCrisp * 10) / 10;

  let greenCat: 'Short' | 'Standard' | 'Long' = 'Standard';
  if (finalGreenSec <= 22) greenCat = 'Short';
  else if (finalGreenSec >= 48) greenCat = 'Long';

  const yellowCat: 'Standard' | 'Extended' = finalYellowSec >= 4.6 ? 'Extended' : 'Standard';

  const hydroWaveTriggered = rules[9].isFired && waterloggingDepthMm > 12;

  let rationale = `Allocated ${finalGreenSec}s Green & ${finalYellowSec}s Amber. `;
  if (hydroWaveTriggered) {
    rationale += `[ASSAC Innovation]: Active Hydro-Green Wave Evacuation triggered to flush low-clearance two-wheelers and autos from low-lying corridor before engine water ingestion. `;
  } else if (weatherVal > 60) {
    rationale += `Extended amber triggered (+${(finalYellowSec - 3.5).toFixed(1)}s) to prevent skidding on wet road. `;
  }
  if (densityVal > 65) {
    rationale += `High spatial density of non-lane traffic granted maximum green extension.`;
  } else if (densityVal < 25 && speedVal > 35) {
    rationale += `Light density and free speed curtailed green phase to yield right of way.`;
  } else {
    rationale += `Balanced phase timing adapted to continuous mixed-vehicle approach rates.`;
  }

  return {
    antecedents: {
      density: { value: densityVal, memberships: densityM },
      speed: { value: speedVal, memberships: speedM },
      weather: { value: weatherVal, memberships: weatherM },
      drainageSaturation: Math.min(100, Math.round(waterloggingDepthMm * 2.8)),
    },
    rules,
    consequents: {
      greenLightExtensionSec: finalGreenSec,
      yellowLightDurationSec: finalYellowSec,
      greenCategory: greenCat,
      yellowCategory: yellowCat,
      hydroGreenWaveActive: hydroWaveTriggered,
    },
    decisionRationale: rationale,
    timestamp: Date.now(),
  };
}
