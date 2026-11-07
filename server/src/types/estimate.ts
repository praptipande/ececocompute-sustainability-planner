import type { WorkloadInput } from './workload.js';

export interface EstimateMetric<TUnit extends string> {
  value: number;
  unit: TUnit;
}

export interface EstimateMetrics {
  energy: EstimateMetric<'kWh'>;
  carbon: EstimateMetric<'kg CO2e'>;
  water: EstimateMetric<'liters'>;
  operatingCost: EstimateMetric<'INR'>;
  sustainabilityScore: EstimateMetric<'score'>;
}

export interface CalculationAssumptions {
  hardwarePowerWatts: number;
  dataCenterOverheadFactor: number;
  carbonIntensityKgCo2ePerKwh: number;
  waterIntensityLitersPerKwh: number;
  costPerGpuHourInr: number;
  utilizationFraction: number;
  datasetKey: string;
  provenanceStatus: 'illustrative' | 'verified';
  scoreMethod: string;
}

export interface EstimateResult {
  input: WorkloadInput;
  metrics: EstimateMetrics;
  assumptions: CalculationAssumptions;
  calculationVersion: string;
  datasetVersion: string;
  warnings: string[];
  createdAt?: string;
}
