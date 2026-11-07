import { Schema, model, type Document } from 'mongoose';
import type {
  DatasetProvenanceStatus,
  DatasetReferenceRecord,
} from '../types/dataset.js';
import type { EnergySource, WorkloadType } from '../types/workload.js';

interface DatasetFactorDocument<TUnit extends string> {
  value: number;
  unit: TUnit;
}

export interface DatasetDocument extends Document {
  datasetKey: string;
  name: string;
  description: string;
  workloadType: WorkloadType;
  gpuType: string;
  location: string;
  energySource: EnergySource;
  energyReference: DatasetFactorDocument<'watts'>;
  carbonIntensity: DatasetFactorDocument<'kg CO2e/kWh'>;
  waterIntensity: DatasetFactorDocument<'liters/kWh'>;
  electricityCost: DatasetFactorDocument<'INR/GPU-hour'>;
  sourceName: string;
  sourceUrl?: string;
  referenceYear?: number;
  version: string;
  provenanceStatus: DatasetProvenanceStatus;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const factorSchema = (unit: string) =>
  new Schema<DatasetFactorDocument<string>>(
    {
      value: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        required: true,
        enum: [unit],
        default: unit,
      },
    },
    { _id: false },
  );

const datasetSchema = new Schema<DatasetDocument>(
  {
    datasetKey: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 1,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
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
    gpuType: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    energySource: {
      type: String,
      required: true,
      enum: ['grid', 'renewable', 'mixed'] satisfies EnergySource[],
    },
    energyReference: {
      type: factorSchema('watts'),
      required: true,
    },
    carbonIntensity: {
      type: factorSchema('kg CO2e/kWh'),
      required: true,
    },
    waterIntensity: {
      type: factorSchema('liters/kWh'),
      required: true,
    },
    electricityCost: {
      type: factorSchema('INR/GPU-hour'),
      required: true,
    },
    sourceName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    referenceYear: {
      type: Number,
      min: 1900,
      max: 2100,
    },
    version: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    provenanceStatus: {
      type: String,
      required: true,
      enum: ['illustrative', 'verified'] satisfies DatasetProvenanceStatus[],
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

datasetSchema.index(
  {
    version: 1,
    workloadType: 1,
    gpuType: 1,
    location: 1,
    energySource: 1,
  },
  { unique: true },
);

export const DatasetModel = model<DatasetDocument>('Dataset', datasetSchema);

export function toDatasetReferenceRecord(document: DatasetDocument): DatasetReferenceRecord {
  return {
    datasetKey: document.datasetKey,
    name: document.name,
    description: document.description,
    workloadType: document.workloadType,
    gpuType: document.gpuType,
    location: document.location,
    energySource: document.energySource,
    energyReference: document.energyReference,
    carbonIntensity: document.carbonIntensity,
    waterIntensity: document.waterIntensity,
    electricityCost: document.electricityCost,
    sourceName: document.sourceName,
    sourceUrl: document.sourceUrl,
    referenceYear: document.referenceYear,
    version: document.version,
    provenanceStatus: document.provenanceStatus,
    active: document.active,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}
