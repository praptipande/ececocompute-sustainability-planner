export type EnergySource = 'grid' | 'renewable' | 'mixed';

export type PerformanceTarget = 'standard' | 'high' | 'maximum';

export type OptimizationObjective =
  | 'minimum-carbon'
  | 'minimum-energy'
  | 'minimum-cost'
  | 'balanced';

export type WorkloadType =
  | 'image-classification'
  | 'natural-language-processing'
  | 'object-detection'
  | 'generative-ai-llm'
  | 'recommendation-system';

export interface WorkloadInput {
  scenarioName: string;
  workloadType: WorkloadType;
  gpuType: string;
  gpuCount: number;
  runtimeHours: number;
  utilizationPercent: number;
  location: string;
  energySource: EnergySource;
  performanceTarget: PerformanceTarget;
  optimizationObjective: OptimizationObjective;
}

