import type { EstimateResult } from './estimate.js';

export interface MetricDifference {
  absolute: number;
  /** Null when the baseline metric is zero and a percentage is undefined. */
  percentage: number | null;
}

export interface EstimateDifferences {
  energy: MetricDifference;
  carbon: MetricDifference;
  water: MetricDifference;
  operatingCost: MetricDifference;
  sustainabilityScore: MetricDifference;
}

export interface ComparisonEstimate {
  label: string;
  estimate: EstimateResult;
  differencesFromBaseline?: EstimateDifferences;
}

export interface ComparisonResult {
  baseline: ComparisonEstimate;
  alternatives: ComparisonEstimate[];
  warnings: string[];
}
