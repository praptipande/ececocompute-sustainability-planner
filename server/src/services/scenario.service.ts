import mongoose from 'mongoose';
import {
  ScenarioModel,
  toScenario,
  type ScenarioDocument,
} from '../models/scenario.model.js';
import {
  DatasetUnavailableError,
  EstimationValidationError,
  estimateWorkload,
} from './estimation.service.js';
import type { Scenario } from '../types/scenario.js';
import type {
  EnergySource,
  OptimizationObjective,
  PerformanceTarget,
  WorkloadInput,
  WorkloadType,
} from '../types/workload.js';

const WORKLOAD_TYPES: readonly WorkloadType[] = [
  'image-classification',
  'natural-language-processing',
  'object-detection',
  'generative-ai-llm',
  'recommendation-system',
];
const ENERGY_SOURCES: readonly EnergySource[] = ['grid', 'renewable', 'mixed'];
const PERFORMANCE_TARGETS: readonly PerformanceTarget[] = ['standard', 'high', 'maximum'];
const OBJECTIVES: readonly OptimizationObjective[] = [
  'minimum-carbon',
  'minimum-energy',
  'minimum-cost',
  'balanced',
];

export class ScenarioValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScenarioValidationError';
  }
}

export class ScenarioNotFoundError extends Error {
  constructor() {
    super('Scenario was not found');
    this.name = 'ScenarioNotFoundError';
  }
}

export function validateScenarioId(id: string): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ScenarioValidationError('Scenario ID is invalid');
  }
}

export function validateWorkloadInputShape(value: unknown): WorkloadInput {
  if (!isRecord(value)) {
    throw new ScenarioValidationError('A workload input object is required');
  }

  const input = value as Partial<WorkloadInput>;
  if (
    typeof input.scenarioName !== 'string' ||
    typeof input.workloadType !== 'string' ||
    typeof input.gpuType !== 'string' ||
    typeof input.gpuCount !== 'number' ||
    typeof input.runtimeHours !== 'number' ||
    typeof input.utilizationPercent !== 'number' ||
    typeof input.location !== 'string' ||
    typeof input.energySource !== 'string' ||
    typeof input.performanceTarget !== 'string' ||
    typeof input.optimizationObjective !== 'string'
  ) {
    throw new ScenarioValidationError('All workload fields are required');
  }

  const result = {
    ...input,
    scenarioName: input.scenarioName.trim(),
    gpuType: input.gpuType.trim(),
    location: input.location.trim(),
  } as WorkloadInput;

  if (!result.scenarioName || !result.gpuType || !result.location) {
    throw new ScenarioValidationError('Scenario name, GPU type, and location are required');
  }
  if (!WORKLOAD_TYPES.includes(result.workloadType)) {
    throw new ScenarioValidationError('Workload type is invalid');
  }
  if (!ENERGY_SOURCES.includes(result.energySource)) {
    throw new ScenarioValidationError('Energy source is invalid');
  }
  if (!PERFORMANCE_TARGETS.includes(result.performanceTarget)) {
    throw new ScenarioValidationError('Performance target is invalid');
  }
  if (!OBJECTIVES.includes(result.optimizationObjective)) {
    throw new ScenarioValidationError('Optimization objective is invalid');
  }
  if (
    !Number.isFinite(result.gpuCount) ||
    !Number.isFinite(result.runtimeHours) ||
    !Number.isFinite(result.utilizationPercent)
  ) {
    throw new ScenarioValidationError('Numeric workload fields must be finite');
  }

  return result;
}

export async function createScenario(
  ownerId: string,
  input: WorkloadInput,
): Promise<Scenario> {
  const estimate = await estimateWorkload(input);
  const document = await ScenarioModel.create({ ownerId, input, estimate });
  return toScenario(document);
}

export async function listScenarios(ownerId: string): Promise<Scenario[]> {
  const documents = await ScenarioModel.find({ ownerId }).sort({ updatedAt: -1 });
  return documents.map(toScenario);
}

export async function getScenario(ownerId: string, id: string): Promise<Scenario> {
  const document = await findOwnedScenario(ownerId, id);
  return toScenario(document);
}

export async function updateScenario(
  ownerId: string,
  id: string,
  input: WorkloadInput,
): Promise<Scenario> {
  const document = await findOwnedScenario(ownerId, id);
  const estimate = await estimateWorkload(input);
  document.input = input;
  document.estimate = estimate;
  await document.save();
  return toScenario(document);
}

export async function deleteScenario(ownerId: string, id: string): Promise<void> {
  const result = await ScenarioModel.deleteOne({ _id: id, ownerId });
  if (result.deletedCount !== 1) {
    throw new ScenarioNotFoundError();
  }
}

async function findOwnedScenario(ownerId: string, id: string): Promise<ScenarioDocument> {
  validateScenarioId(id);
  const document = await ScenarioModel.findOne({ _id: id, ownerId });
  if (!document) {
    throw new ScenarioNotFoundError();
  }
  return document;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isScenarioCalculationError(error: unknown): boolean {
  return error instanceof EstimationValidationError || error instanceof DatasetUnavailableError;
}
