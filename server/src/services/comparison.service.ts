import mongoose from 'mongoose';
import {
  ScenarioModel,
  type ScenarioDocument,
} from '../models/scenario.model.js';
import type {
  ComparisonEstimate,
  ComparisonResult,
  EstimateDifferences,
  MetricDifference,
} from '../types/comparison.js';
import type { EstimateResult } from '../types/estimate.js';

export const MAX_COMPARISON_SCENARIOS = 5;

export class ComparisonValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ComparisonValidationError';
  }
}

export class ComparisonNotFoundError extends Error {
  constructor() {
    super('One or more scenarios were not found');
    this.name = 'ComparisonNotFoundError';
  }
}

export class ComparisonUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ComparisonUnavailableError';
  }
}

export function validateComparisonScenarioIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new ComparisonValidationError('scenarioIds must be an array');
  }
  if (value.length < 2 || value.length > MAX_COMPARISON_SCENARIOS) {
    throw new ComparisonValidationError(
      `A comparison must contain between 2 and ${MAX_COMPARISON_SCENARIOS} scenarios`,
    );
  }
  if (value.some((id) => typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id))) {
    throw new ComparisonValidationError('Every scenario ID must be a valid MongoDB ID');
  }

  const ids = value as string[];
  if (new Set(ids).size !== ids.length) {
    throw new ComparisonValidationError('Duplicate scenario IDs are not allowed');
  }
  return ids;
}

export async function compareOwnedScenarios(
  ownerId: string,
  scenarioIds: string[],
): Promise<ComparisonResult> {
  const documents = await ScenarioModel.find({
    ownerId,
    _id: { $in: scenarioIds },
  });

  if (documents.length !== scenarioIds.length) {
    throw new ComparisonNotFoundError();
  }

  const byId = new Map(documents.map((document) => [document._id.toString(), document]));
  const orderedDocuments: ScenarioDocument[] = [];
  for (const id of scenarioIds) {
    const document = byId.get(id);
    if (!document) {
      throw new ComparisonNotFoundError();
    }
    orderedDocuments.push(document);
  }

  const estimates = orderedDocuments.map((document) => {
    if (!document.estimate) {
      throw new ComparisonUnavailableError(
        'One or more scenarios does not have a saved estimate snapshot',
      );
    }
    return document.estimate;
  });

  return buildComparison(
    orderedDocuments,
    estimates,
  );
}

export function buildComparison(
  documents: ScenarioDocument[],
  estimates: EstimateResult[],
): ComparisonResult {
  if (documents.length < 2 || documents.length !== estimates.length) {
    throw new ComparisonValidationError('At least two scenario estimates are required');
  }

  validateMetricUnits(estimates);
  const baselineEstimate = estimates[0];
  const baseline: ComparisonEstimate = {
    label: documents[0].input.scenarioName,
    estimate: baselineEstimate,
  };
  const warnings = collectWarnings(estimates);

  const alternatives = documents.slice(1).map((document, index) => {
    const estimate = estimates[index + 1];
    return {
      label: document.input.scenarioName,
      estimate,
      differencesFromBaseline: calculateDifferences(baselineEstimate, estimate),
    };
  });

  return { baseline, alternatives, warnings };
}

function calculateDifferences(
  baseline: EstimateResult,
  alternative: EstimateResult,
): EstimateDifferences {
  return {
    energy: difference(baseline.metrics.energy.value, alternative.metrics.energy.value),
    carbon: difference(baseline.metrics.carbon.value, alternative.metrics.carbon.value),
    water: difference(baseline.metrics.water.value, alternative.metrics.water.value),
    operatingCost: difference(
      baseline.metrics.operatingCost.value,
      alternative.metrics.operatingCost.value,
    ),
    sustainabilityScore: difference(
      baseline.metrics.sustainabilityScore.value,
      alternative.metrics.sustainabilityScore.value,
    ),
  };
}

function difference(baseline: number, alternative: number): MetricDifference {
  const absolute = alternative - baseline;
  return {
    absolute,
    percentage: baseline === 0 ? null : (absolute / baseline) * 100,
  };
}

function validateMetricUnits(estimates: EstimateResult[]): void {
  const first = estimates[0];
  for (const estimate of estimates) {
    if (
      estimate.metrics.energy.unit !== first.metrics.energy.unit ||
      estimate.metrics.carbon.unit !== first.metrics.carbon.unit ||
      estimate.metrics.water.unit !== first.metrics.water.unit ||
      estimate.metrics.operatingCost.unit !== first.metrics.operatingCost.unit ||
      estimate.metrics.sustainabilityScore.unit !== first.metrics.sustainabilityScore.unit
    ) {
      throw new ComparisonUnavailableError(
        'Scenario estimates use incompatible metric units',
      );
    }
  }
}

function collectWarnings(estimates: EstimateResult[]): string[] {
  const warnings = new Set(estimates.flatMap((estimate) => estimate.warnings));
  const datasetVersions = new Set(estimates.map((estimate) => estimate.datasetVersion));
  const calculationVersions = new Set(estimates.map((estimate) => estimate.calculationVersion));
  const provenanceStatuses = new Set(
    estimates.map((estimate) => estimate.assumptions.provenanceStatus),
  );

  if (datasetVersions.size > 1) {
    warnings.add(
      'Scenarios use different dataset versions; differences may reflect dataset changes as well as workload changes.',
    );
  }
  if (calculationVersions.size > 1) {
    warnings.add('Scenarios use different calculation versions.');
  }
  if (provenanceStatuses.size > 1) {
    warnings.add('Scenarios mix illustrative and verified provenance; results are not uniformly validated.');
  }
  return [...warnings];
}
