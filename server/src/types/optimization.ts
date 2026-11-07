import type { DatasetProvenanceStatus } from './dataset.js';
import type { EstimateResult } from './estimate.js';
import type { OptimizationObjective, WorkloadInput } from './workload.js';

export interface OptimizationDifference {
  absolute: number;
  percentage: number | null;
}

export interface OptimizationDifferences {
  energy: OptimizationDifference;
  carbon: OptimizationDifference;
  water: OptimizationDifference;
  operatingCost: OptimizationDifference;
  sustainabilityScore: OptimizationDifference;
}

export interface OptimizationCandidate {
  input: WorkloadInput;
  estimate: EstimateResult;
  differencesFromBaseline: OptimizationDifferences;
  rankingValue: number;
  explanation: string;
  datasetKey: string;
  datasetVersion: string;
  provenanceStatus: DatasetProvenanceStatus;
}

export interface SkippedOptimizationCandidate {
  datasetKey: string;
  reason: string;
}

export interface OptimizationResult {
  objective: OptimizationObjective;
  baseline: {
    input: WorkloadInput;
    estimate: EstimateResult;
  };
  recommendation: OptimizationCandidate | null;
  candidates: OptimizationCandidate[];
  skippedCandidates: SkippedOptimizationCandidate[];
  warnings: string[];
}
