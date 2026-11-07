import type {
  OptimizationCandidate,
  OptimizationDifference,
  OptimizationDifferences,
  OptimizationResult,
  SkippedOptimizationCandidate,
} from '../types/optimization.js';
import type { OptimizationObjective, WorkloadInput } from '../types/workload.js';
import { listActiveDatasetRecords } from './dataset.service.js';
import {
  DatasetUnavailableError,
  EstimationValidationError,
  estimateWorkload,
} from './estimation.service.js';

export const MAX_OPTIMIZATION_CANDIDATES = 12;

const OBJECTIVES: readonly OptimizationObjective[] = [
  'minimum-carbon',
  'minimum-energy',
  'minimum-cost',
  'balanced',
];

export class OptimizationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OptimizationValidationError';
  }
}

export class OptimizationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OptimizationUnavailableError';
  }
}

export function validateOptimizationObjective(value: unknown): OptimizationObjective {
  if (typeof value !== 'string' || !OBJECTIVES.includes(value as OptimizationObjective)) {
    throw new OptimizationValidationError('Optimization objective is invalid');
  }
  return value as OptimizationObjective;
}

export async function optimizeWorkload(input: WorkloadInput): Promise<OptimizationResult> {
  const objective = validateOptimizationObjective(input.optimizationObjective);
  let baseline;
  try {
    baseline = await estimateWorkload(input);
  } catch (error) {
    if (error instanceof EstimationValidationError || error instanceof DatasetUnavailableError) {
      throw new OptimizationUnavailableError(error.message);
    }
    throw error;
  }

  const records = await listActiveDatasetRecords();
  const compatibleRecords = records.filter(
    (record) =>
      record.workloadType === input.workloadType &&
      record.location === input.location,
  );
  const candidates: OptimizationCandidate[] = [];
  const skippedCandidates: SkippedOptimizationCandidate[] = [];
  const seenConfigurations = new Set([configurationKey(input.gpuType, input.energySource)]);

  for (const record of compatibleRecords) {
    if (candidates.length >= MAX_OPTIMIZATION_CANDIDATES) {
      skippedCandidates.push({
        datasetKey: record.datasetKey,
        reason: `Candidate limit of ${MAX_OPTIMIZATION_CANDIDATES} reached`,
      });
      continue;
    }
    const key = configurationKey(record.gpuType, record.energySource);
    if (seenConfigurations.has(key)) {
      skippedCandidates.push({
        datasetKey: record.datasetKey,
        reason: 'Duplicate GPU and energy-source configuration',
      });
      continue;
    }
    seenConfigurations.add(key);

    const candidateInput: WorkloadInput = {
      ...input,
      scenarioName: `${input.scenarioName} - ${record.gpuType} ${record.energySource}`,
      gpuType: record.gpuType,
      energySource: record.energySource,
    };
    try {
      const estimate = await estimateWorkload(candidateInput, record.datasetKey);
      candidates.push({
        input: candidateInput,
        estimate,
        differencesFromBaseline: calculateOptimizationDifferences(baseline, estimate),
        rankingValue: 0,
        explanation: '',
        datasetKey: record.datasetKey,
        datasetVersion: record.version,
        provenanceStatus: record.provenanceStatus,
      });
    } catch (error) {
      if (error instanceof EstimationValidationError || error instanceof DatasetUnavailableError) {
        skippedCandidates.push({ datasetKey: record.datasetKey, reason: error.message });
        continue;
      }
      throw error;
    }
  }

  rankOptimizationCandidates(candidates, objective);
  const recommendation = candidates[0] ?? null;
  if (recommendation) recommendation.explanation = explainRecommendation(objective);

  return {
    objective,
    baseline: { input, estimate: baseline },
    recommendation,
    candidates,
    skippedCandidates,
    warnings: collectWarnings(baseline, candidates),
  };
}

export function rankOptimizationCandidates(
  candidates: OptimizationCandidate[],
  objective: OptimizationObjective,
): void {
  if (candidates.length === 0) return;
  const values = candidates.map((candidate) => rankingMetric(candidate.estimate, objective));
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  for (const [index, candidate] of candidates.entries()) {
    candidate.rankingValue = minimum === maximum ? 1 : (maximum - values[index]) / (maximum - minimum);
  }
  candidates.sort((left, right) => right.rankingValue - left.rankingValue);
}

function rankingMetric(
  estimate: OptimizationCandidate['estimate'],
  objective: OptimizationObjective,
): number {
  if (objective === 'minimum-carbon') return estimate.metrics.carbon.value;
  if (objective === 'minimum-energy') return estimate.metrics.energy.value;
  if (objective === 'minimum-cost') return estimate.metrics.operatingCost.value;
  return (
    normalize(estimate.metrics.energy.value, 100) +
    normalize(estimate.metrics.carbon.value, 100) +
    normalize(estimate.metrics.water.value, 500) +
    normalize(estimate.metrics.operatingCost.value, 10000)
  ) / 4;
}

function normalize(value: number, limit: number): number {
  return Math.min(1, Math.max(0, value / limit));
}

export function calculateOptimizationDifferences(
  baseline: OptimizationCandidate['estimate'],
  alternative: OptimizationCandidate['estimate'],
): OptimizationDifferences {
  return {
    energy: difference(baseline.metrics.energy.value, alternative.metrics.energy.value),
    carbon: difference(baseline.metrics.carbon.value, alternative.metrics.carbon.value),
    water: difference(baseline.metrics.water.value, alternative.metrics.water.value),
    operatingCost: difference(baseline.metrics.operatingCost.value, alternative.metrics.operatingCost.value),
    sustainabilityScore: difference(
      baseline.metrics.sustainabilityScore.value,
      alternative.metrics.sustainabilityScore.value,
    ),
  };
}

function difference(baseline: number, alternative: number): OptimizationDifference {
  return {
    absolute: alternative - baseline,
    percentage: baseline === 0 ? null : ((alternative - baseline) / baseline) * 100,
  };
}

function configurationKey(gpuType: string, energySource: string): string {
  return `${gpuType}\u0000${energySource}`;
}

function explainRecommendation(objective: OptimizationObjective): string {
  if (objective === 'balanced') {
    return 'Ranks highest using equal-weighted normalized energy, carbon, water, and cost impacts.';
  }
  const labels = {
    'minimum-carbon': 'lowest carbon estimate',
    'minimum-energy': 'lowest energy estimate',
    'minimum-cost': 'lowest operating-cost estimate',
  } as const;
  return `Ranks highest because it has the ${labels[objective]}.`;
}

function collectWarnings(
  baseline: OptimizationCandidate['estimate'],
  candidates: OptimizationCandidate[],
): string[] {
  const warnings = new Set(baseline.warnings);
  for (const candidate of candidates) {
    for (const warning of candidate.estimate.warnings) warnings.add(warning);
  }
  if (candidates.some((candidate) => candidate.provenanceStatus === 'illustrative')) {
    warnings.add('Some optimization results use illustrative factors and are not validated production measurements.');
  }
  if (candidates.some((candidate) => candidate.input.gpuType !== baseline.input.gpuType)) {
    warnings.add('GPU configuration changes are reference alternatives; throughput and model quality are not modeled.');
  }
  return [...warnings];
}
