import { Schema, Types, model, type Document } from 'mongoose';
import type { EstimateResult } from '../types/estimate.js';
import type {
  EnergySource,
  OptimizationObjective,
  PerformanceTarget,
  WorkloadInput,
  WorkloadType,
} from '../types/workload.js';
import type { Scenario } from '../types/scenario.js';

const workloadSchema = new Schema<WorkloadInput>(
  {
    scenarioName: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    workloadType: {
      type: String,
      required: true,
      enum: [
        'image-classification',
        'natural-language-processing',
        'object-detection',
        'generative-ai-llm',
        'recommendation-system',
      ] satisfies WorkloadType[],
    },
    gpuType: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    gpuCount: { type: Number, required: true, min: 1, max: 1024 },
    runtimeHours: { type: Number, required: true, min: 0, max: 87600 },
    utilizationPercent: { type: Number, required: true, min: 0, max: 100 },
    location: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    energySource: {
      type: String,
      required: true,
      enum: ['grid', 'renewable', 'mixed'] satisfies EnergySource[],
    },
    performanceTarget: {
      type: String,
      required: true,
      enum: ['standard', 'high', 'maximum'] satisfies PerformanceTarget[],
    },
    optimizationObjective: {
      type: String,
      required: true,
      enum: [
        'minimum-carbon',
        'minimum-energy',
        'minimum-cost',
        'balanced',
      ] satisfies OptimizationObjective[],
    },
  },
  { _id: false },
);

export interface ScenarioDocument extends Document {
  ownerId: Types.ObjectId;
  input: WorkloadInput;
  estimate?: EstimateResult;
  createdAt: Date;
  updatedAt: Date;
}

const scenarioSchema = new Schema<ScenarioDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    input: { type: workloadSchema, required: true },
    estimate: { type: Schema.Types.Mixed, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

scenarioSchema.index({ ownerId: 1, updatedAt: -1 });

export const ScenarioModel = model<ScenarioDocument>('Scenario', scenarioSchema);

export function toScenario(document: ScenarioDocument): Scenario {
  return {
    id: document._id.toString(),
    ownerId: document.ownerId.toString(),
    input: document.input,
    estimate: document.estimate,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}
