import type { WorkloadType } from './workload.js';

export interface DatasetMetadata {
  name: string;
  version: string;
  provenance: string[];
  lastUpdatedAt?: string;
}

export type DatasetProvenanceStatus = 'illustrative' | 'verified';

export interface DatasetFactor<TUnit extends string> {
  value: number;
  unit: TUnit;
}

export interface DatasetReferenceRecord {
  datasetKey: string;
  name: string;
  description: string;
  workloadType: WorkloadType;
  gpuType: string;
  location: string;
  energySource: 'grid' | 'renewable' | 'mixed';
  energyReference: DatasetFactor<'watts'>;
  carbonIntensity: DatasetFactor<'kg CO2e/kWh'>;
  waterIntensity: DatasetFactor<'liters/kWh'>;
  electricityCost: DatasetFactor<'INR/GPU-hour'>;
  sourceName: string;
  sourceUrl?: string;
  referenceYear?: number;
  version: string;
  provenanceStatus: DatasetProvenanceStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
