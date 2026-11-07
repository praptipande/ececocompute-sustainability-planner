import {
  findApplicableDatasetRecord,
  getDatasetRecordByKey,
} from './dataset.service.js';
import type { DatasetReferenceRecord } from '../types/dataset.js';
import type {
  CalculationAssumptions,
  EstimateResult,
} from '../types/estimate.js';
import type { WorkloadInput } from '../types/workload.js';

const CALCULATION_VERSION = '1.0.0';
const NO_FACILITY_OVERHEAD = 1;
const SCORE_METHOD =
  'Provisional factor-intensity score: equal-weighted normalized hardware power, carbon, water, and cost factors; not an official standard.';

const SCORE_REFERENCE_LIMITS = {
  powerWatts: 1000,
  carbonKgCo2ePerKwh: 1,
  waterLitersPerKwh: 5,
  costInrPerGpuHour: 200,
} as const;

export class EstimationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EstimationValidationError';
  }
}

export class DatasetUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatasetUnavailableError';
  }
}

export function calculateEstimate(
  input: WorkloadInput,
  dataset: DatasetReferenceRecord,
  createdAt = new Date(),
): EstimateResult {
  validateWorkloadInput(input);
  validateDatasetForCalculation(input, dataset);

  const utilizationFraction = input.utilizationPercent / 100;
  const energyKwh =
    (dataset.energyReference.value *
      input.gpuCount *
      input.runtimeHours *
      utilizationFraction *
      NO_FACILITY_OVERHEAD) /
    1000;
  const carbonKgCo2e = energyKwh * dataset.carbonIntensity.value;
  const waterLiters = energyKwh * dataset.waterIntensity.value;
  const operatingCost =
    dataset.electricityCost.value * input.gpuCount * input.runtimeHours;
  const sustainabilityScore = calculateProvisionalScore(dataset);

  const metrics = {
    energy: { value: energyKwh, unit: 'kWh' as const },
    carbon: { value: carbonKgCo2e, unit: 'kg CO2e' as const },
    water: { value: waterLiters, unit: 'liters' as const },
    operatingCost: { value: operatingCost, unit: 'INR' as const },
    sustainabilityScore: { value: sustainabilityScore, unit: 'score' as const },
  };

  assertFiniteResults(Object.values(metrics).map((metric) => metric.value));

  const assumptions: CalculationAssumptions = {
    hardwarePowerWatts: dataset.energyReference.value,
    dataCenterOverheadFactor: NO_FACILITY_OVERHEAD,
    carbonIntensityKgCo2ePerKwh: dataset.carbonIntensity.value,
    waterIntensityLitersPerKwh: dataset.waterIntensity.value,
    costPerGpuHourInr: dataset.electricityCost.value,
    utilizationFraction,
    datasetKey: dataset.datasetKey,
    provenanceStatus: dataset.provenanceStatus,
    scoreMethod: SCORE_METHOD,
  };

  return {
    input,
    metrics,
    assumptions,
    calculationVersion: CALCULATION_VERSION,
    datasetVersion: dataset.version,
    warnings:
      dataset.provenanceStatus === 'illustrative'
        ? ['Dataset record is illustrative and must not be treated as validated production data.']
        : [],
    createdAt: createdAt.toISOString(),
  };
}

export async function estimateWorkload(
  input: WorkloadInput,
  datasetKey?: string,
): Promise<EstimateResult> {
  const dataset = datasetKey
    ? await getDatasetRecordByKey(datasetKey)
    : await findApplicableDatasetRecord(input);

  if (!dataset) {
    throw new DatasetUnavailableError(
      'No active dataset record matches this workload configuration',
    );
  }

  return calculateEstimate(input, dataset);
}

function validateWorkloadInput(input: WorkloadInput): void {
  if (!input.scenarioName.trim()) {
    throw new EstimationValidationError('Scenario name is required');
  }
  if (!input.gpuType.trim() || !input.location.trim()) {
    throw new EstimationValidationError('GPU type and location are required');
  }
  if (!Number.isInteger(input.gpuCount) || input.gpuCount < 1 || input.gpuCount > 1024) {
    throw new EstimationValidationError('GPU count must be an integer from 1 to 1024');
  }
  if (!Number.isFinite(input.runtimeHours) || input.runtimeHours <= 0 || input.runtimeHours > 87600) {
    throw new EstimationValidationError('Runtime must be finite and greater than zero');
  }
  if (
    !Number.isFinite(input.utilizationPercent) ||
    input.utilizationPercent < 0 ||
    input.utilizationPercent > 100
  ) {
    throw new EstimationValidationError('Utilization must be between 0 and 100 percent');
  }
}

function validateDatasetForCalculation(
  input: WorkloadInput,
  dataset: DatasetReferenceRecord,
): void {
  if (!dataset.active) {
    throw new DatasetUnavailableError('The selected dataset record is inactive');
  }
  if (
    dataset.workloadType !== input.workloadType ||
    dataset.gpuType !== input.gpuType ||
    dataset.location !== input.location ||
    dataset.energySource !== input.energySource
  ) {
    throw new DatasetUnavailableError('Dataset record does not match the workload input');
  }

  const expectedUnits = [
    [dataset.energyReference.unit, 'watts'],
    [dataset.carbonIntensity.unit, 'kg CO2e/kWh'],
    [dataset.waterIntensity.unit, 'liters/kWh'],
    [dataset.electricityCost.unit, 'INR/GPU-hour'],
  ];
  if (expectedUnits.some(([actual, expected]) => actual !== expected)) {
    throw new DatasetUnavailableError('Dataset factor units are incompatible');
  }

  const factors = [
    dataset.energyReference.value,
    dataset.carbonIntensity.value,
    dataset.waterIntensity.value,
    dataset.electricityCost.value,
  ];
  if (
    factors.some((value) => !Number.isFinite(value) || value < 0) ||
    dataset.energyReference.value <= 0
  ) {
    throw new DatasetUnavailableError('Dataset factors must be finite and valid');
  }
}

function calculateProvisionalScore(dataset: DatasetReferenceRecord): number {
  const normalizedImpacts = [
    dataset.energyReference.value / SCORE_REFERENCE_LIMITS.powerWatts,
    dataset.carbonIntensity.value / SCORE_REFERENCE_LIMITS.carbonKgCo2ePerKwh,
    dataset.waterIntensity.value / SCORE_REFERENCE_LIMITS.waterLitersPerKwh,
    dataset.electricityCost.value / SCORE_REFERENCE_LIMITS.costInrPerGpuHour,
  ];
  const averageImpact =
    normalizedImpacts.reduce((total, impact) => total + impact, 0) /
    normalizedImpacts.length;
  return Math.round(Math.max(0, Math.min(100, (1 - averageImpact) * 100)));
}

function assertFiniteResults(values: number[]): void {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new EstimationValidationError('Calculation produced a non-finite result');
  }
}

