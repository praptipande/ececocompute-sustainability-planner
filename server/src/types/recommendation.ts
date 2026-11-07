import type { EstimateResult } from './estimate.js';
import type { OptimizationObjective, WorkloadInput } from './workload.js';

export interface RecommendationReason {
  category:
    | 'energy'
    | 'carbon'
    | 'water'
    | 'cost'
    | 'performance'
    | 'trade-off'
    | 'data-quality';
  message: string;
}

export interface RecommendationMetricChange {
  baseline: number;
  candidate: number;
  absolute: number;
  percentage: number | null;
  unit: string;
}

export interface RecommendationItem {
  id: string;
  category: 'energy' | 'carbon' | 'water' | 'cost' | 'trade-off' | 'data-quality';
  title: string;
  explanation: string;
  candidateConfiguration: WorkloadInput;
  estimate: EstimateResult;
  metric: RecommendationMetricChange;
  priority: number;
  datasetKey: string;
  datasetVersion: string;
  provenanceStatus: 'illustrative' | 'verified';
  warnings: string[];
}

export interface RecommendationResult {
  objective: OptimizationObjective;
  recommendedConfiguration: WorkloadInput;
  estimate: EstimateResult;
  reasons: RecommendationReason[];
  tradeOffs: string[];
  baseline: {
    input: WorkloadInput;
    estimate: EstimateResult;
  };
  recommendations: RecommendationItem[];
  skippedCandidates: { datasetKey: string; reason: string }[];
  warnings: string[];
}
