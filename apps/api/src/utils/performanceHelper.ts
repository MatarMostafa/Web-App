interface PerformanceThresholdData {
  redMin: number;
  redMax: number;
  yellowMin: number;
  yellowMax: number;
  greenMin: number;
  greenMax: number;
}

interface MetricsConfig {
  weights?: Record<string, number>;
  metrics?: Record<string, number>;
}

// Default fallback thresholds
const DEFAULT_THRESHOLDS: PerformanceThresholdData = {
  redMin: 0,
  redMax: 40,
  yellowMin: 41,
  yellowMax: 70,
  greenMin: 71,
  greenMax: 100
};

export function calculateScore(metricsData: Record<string, any> = {}, config?: MetricsConfig): number {
  // Use custom weights if provided, otherwise default
  const weights = config?.weights || { attendance: 0.2, quality: 0.4, speed: 0.4 };
  const metrics = config?.metrics || metricsData;
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  // Calculate weighted average only for available metrics
  Object.entries(weights).forEach(([key, weight]) => {
    if (metrics[key] !== undefined && metrics[key] !== null) {
      weightedSum += (metrics[key] || 0) * weight;
      totalWeight += weight;
    }
  });
  
  // If no metrics available, return 0
  if (totalWeight === 0) return 0;
  
  // Calculate weighted average (metrics are already 0-100 scale)
  const score = weightedSum / totalWeight;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function validateThresholds(thresholds: PerformanceThresholdData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check individual ranges
  if (thresholds.redMin > thresholds.redMax) {
    errors.push("Red range invalid: min > max");
  }
  if (thresholds.yellowMin > thresholds.yellowMax) {
    errors.push("Yellow range invalid: min > max");
  }
  if (thresholds.greenMin > thresholds.greenMax) {
    errors.push("Green range invalid: min > max");
  }
  
  // Check for gaps and overlaps
  if (thresholds.redMax + 1 !== thresholds.yellowMin) {
    errors.push(`Gap or overlap between RED and YELLOW ranges: RED ends at ${thresholds.redMax}, YELLOW starts at ${thresholds.yellowMin}`);
  }
  if (thresholds.yellowMax + 1 !== thresholds.greenMin) {
    errors.push(`Gap or overlap between YELLOW and GREEN ranges: YELLOW ends at ${thresholds.yellowMax}, GREEN starts at ${thresholds.greenMin}`);
  }
  
  // Check coverage of 0-100 range
  if (thresholds.redMin !== 0) {
    errors.push("Thresholds must start from 0");
  }
  if (thresholds.greenMax !== 100) {
    errors.push("Thresholds must end at 100");
  }
  
  return { isValid: errors.length === 0, errors };
}

export function getTrafficLight(score: number, thresholds?: PerformanceThresholdData | null): "RED" | "YELLOW" | "GREEN" {
  const t = thresholds || DEFAULT_THRESHOLDS;
  
  // Validate thresholds before using
  const validation = validateThresholds(t);
  if (!validation.isValid) {
    console.warn("Invalid thresholds detected, using defaults:", validation.errors);
    return getTrafficLight(score, DEFAULT_THRESHOLDS);
  }
  
  // Ensure score is in valid range
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  if (normalizedScore >= t.greenMin && normalizedScore <= t.greenMax) return "GREEN";
  if (normalizedScore >= t.yellowMin && normalizedScore <= t.yellowMax) return "YELLOW";
  if (normalizedScore >= t.redMin && normalizedScore <= t.redMax) return "RED";
  
  // Fallback (should never happen with valid thresholds)
  console.warn(`Score ${normalizedScore} doesn't match any threshold range, defaulting to RED`);
  return "RED";
}

export function getTrafficLightReason(color: string, score?: number): string {
  const scoreText = score !== undefined ? ` (Score: ${score})` : "";
  
  switch (color) {
    case "RED":
      return `Performance below acceptable range${scoreText}`;
    case "YELLOW":
      return `Performance needs improvement${scoreText}`;
    case "GREEN":
      return `Performance meets or exceeds expectations${scoreText}`;
    default:
      return `Unknown performance status${scoreText}`;
  }
}

export function getDefaultThresholds(): PerformanceThresholdData {
  return { ...DEFAULT_THRESHOLDS };
}
