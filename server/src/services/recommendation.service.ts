import type {
  OptimizationCandidate,
  OptimizationResult,
} from '../types/optimization.js';
import type {
  RecommendationItem,
  RecommendationMetricChange,
  RecommendationReason,
  RecommendationResult,
} from '../types/recommendation.js';
import type { OptimizationObjective, WorkloadInput } from '../types/workload.js';
import {
  OptimizationUnavailableError,
  OptimizationValidationError,
  optimizeWorkload,
  validateOptimizationObjective,
} from './optimization.service.js';

export class RecommendationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecommendationValidationError';
  }
}

export class RecommendationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecommendationUnavailableError';
  }
}

export async function generateRecommendations(
  input: WorkloadInput,
  requestedObjective?: unknown,
): Promise<RecommendationResult> {
  let objective: OptimizationObjective;
  try {
    objective = validateOptimizationObjective(
      requestedObjective ?? input.optimizationObjective,
    );
  } catch (error) {
    if (error instanceof OptimizationValidationError) {
      throw new RecommendationValidationError(error.message);
    }
    throw error;
  }
  const normalizedInput = { ...input, optimizationObjective: objective };

  let optimization: OptimizationResult;
  try {
    optimization = await optimizeWorkload(normalizedInput);
  } catch (error) {
    if (error instanceof OptimizationUnavailableError) {
      throw new RecommendationUnavailableError(error.message);
    }
    throw error;
  }

  const recommendations = buildRecommendations(optimization);
  const primary = recommendations[0];
  const fallbackEstimate = optimization.baseline.estimate;
  const fallbackConfiguration = optimization.baseline.input;

  return {
    objective,
    recommendedConfiguration: primary?.candidateConfiguration ?? fallbackConfiguration,
    estimate: primary?.estimate ?? fallbackEstimate,
    reasons: buildLegacyReasons(recommendations),
    tradeOffs: buildTradeOffs(primary),
    baseline: optimization.baseline,
    recommendations,
    skippedCandidates: optimization.skippedCandidates,
    warnings: optimization.warnings,
  };
}

export function buildRecommendations(optimization: OptimizationResult): RecommendationItem[] {
  const items: RecommendationItem[] = [];
  for (const [index, candidate] of optimization.candidates.entries()) {
    const categories = improvedCategories(candidate, optimization.objective);
    for (const category of categories) {
      const metric = metricForCategory(category, optimization.baseline.estimate, candidate);
      if (metric.absolute >= 0) continue;
      items.push({
        id: `${candidate.datasetKey}-${category}`,
        category,
        title: titleForCategory(category),
        explanation: explanationForCategory(category, candidate, optimization.objective),
        candidateConfiguration: candidate.input,
        estimate: candidate.estimate,
        metric,
        priority: Math.max(1, 100 - index * 5),
        datasetKey: candidate.datasetKey,
        datasetVersion: candidate.datasetVersion,
        provenanceStatus: candidate.provenanceStatus,
        warnings: candidate.estimate.warnings,
      });
    }
  }
  return items.sort((left, right) => right.priority - left.priority);
}

function improvedCategories(
  candidate: OptimizationCandidate,
  objective: OptimizationObjective,
): Array<'energy' | 'carbon' | 'water' | 'cost'> {
  const differences = candidate.differencesFromBaseline;
  const categories: Array<'energy' | 'carbon' | 'water' | 'cost'> = [];
  if (differences.energy.absolute < 0 && (objective === 'minimum-energy' || objective === 'balanced')) {
    categories.push('energy');
  }
  if (differences.carbon.absolute < 0 && (objective === 'minimum-carbon' || objective === 'balanced')) {
    categories.push('carbon');
  }
  if (differences.water.absolute < 0 && objective === 'balanced') categories.push('water');
  if (differences.operatingCost.absolute < 0 && (objective === 'minimum-cost' || objective === 'balanced')) {
    categories.push('cost');
  }
  return categories;
}

function metricForCategory(
  category: 'energy' | 'carbon' | 'water' | 'cost',
  baseline: OptimizationResult['baseline']['estimate'],
  candidate: OptimizationCandidate,
): RecommendationMetricChange {
  const metrics = {
    energy: [baseline.metrics.energy, candidate.estimate.metrics.energy],
    carbon: [baseline.metrics.carbon, candidate.estimate.metrics.carbon],
    water: [baseline.metrics.water, candidate.estimate.metrics.water],
    cost: [baseline.metrics.operatingCost, candidate.estimate.metrics.operatingCost],
  } as const;
  const [baselineMetric, candidateMetric] = metrics[category];
  const absolute = candidateMetric.value - baselineMetric.value;
  return {
    baseline: baselineMetric.value,
    candidate: candidateMetric.value,
    absolute,
    percentage: baselineMetric.value === 0 ? null : (absolute / baselineMetric.value) * 100,
    unit: candidateMetric.unit,
  };
}

function titleForCategory(category: RecommendationItem['category']): string {
  return {
    energy: 'Consider the lower-energy configuration',
    carbon: 'Consider the lower-carbon configuration',
    water: 'Consider the lower-water configuration',
    cost: 'Consider the lower-cost configuration',
    'trade-off': 'Review the sustainability trade-off',
    'data-quality': 'Verify the sustainability reference data',
  }[category];
}

function explanationForCategory(
  category: RecommendationItem['category'],
  candidate: OptimizationCandidate,
  objective: OptimizationObjective,
): string {
  const objectiveText = objective === 'balanced'
    ? 'the balanced normalized ranking'
    : `the ${objective} objective`;
  return `${titleForCategory(category)} because it ranked well under ${objectiveText}. The result is based on the evaluated ${candidate.datasetKey} dataset record. GPU throughput and model quality are not modeled.`;
}

function buildLegacyReasons(recommendations: RecommendationItem[]): RecommendationReason[] {
  return recommendations.slice(0, 5).map((recommendation) => ({
    category: recommendation.category,
    message: recommendation.explanation,
  }));
}

function buildTradeOffs(primary: RecommendationItem | undefined): string[] {
  if (!primary) return ['No evaluated candidate produced an objective-aligned improvement.'];
  return [
    'The candidate changes a reference configuration only; throughput and model quality were not evaluated.',
    ...(primary.provenanceStatus === 'illustrative'
      ? ['The recommendation uses illustrative data and requires source verification.']
      : []),
  ];
}
