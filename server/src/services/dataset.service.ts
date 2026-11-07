import {
  DatasetModel,
  toDatasetReferenceRecord,
  type DatasetDocument,
} from '../models/dataset.model.js';
import type { DatasetReferenceRecord } from '../types/dataset.js';
import type { WorkloadInput } from '../types/workload.js';

export class DatasetValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatasetValidationError';
  }
}

export async function listActiveDatasetRecords(): Promise<DatasetReferenceRecord[]> {
  const records = await DatasetModel.find({ active: true }).sort({ datasetKey: 1 });
  return records.map(validateDatasetDocument);
}

export async function getDatasetRecordByKey(
  datasetKey: string,
): Promise<DatasetReferenceRecord | null> {
  const record = await DatasetModel.findOne({ datasetKey });
  return record ? validateDatasetDocument(record) : null;
}

export async function findApplicableDatasetRecord(
  input: WorkloadInput,
  version?: string,
): Promise<DatasetReferenceRecord | null> {
  const record = await DatasetModel.findOne({
    active: true,
    ...(version ? { version } : {}),
    workloadType: input.workloadType,
    gpuType: input.gpuType,
    location: input.location,
    energySource: input.energySource,
  });

  return record ? validateDatasetDocument(record) : null;
}

export function validateDatasetRecord(record: DatasetReferenceRecord): void {
  if (!record.datasetKey.trim()) {
    throw new DatasetValidationError('Dataset key is required');
  }
  if (!record.name.trim() || !record.description.trim()) {
    throw new DatasetValidationError('Dataset name and description are required');
  }
  const factors = [
    record.energyReference,
    record.carbonIntensity,
    record.waterIntensity,
    record.electricityCost,
  ];

  if (factors.some((factor) => !Number.isFinite(factor.value) || factor.value < 0)) {
    throw new DatasetValidationError('Dataset factors must be finite non-negative numbers');
  }
  if (record.referenceYear !== undefined &&
      (!Number.isInteger(record.referenceYear) ||
        record.referenceYear < 1900 ||
        record.referenceYear > 2100)) {
    throw new DatasetValidationError('Reference year must be between 1900 and 2100');
  }
}

export function validateDatasetDocument(document: DatasetDocument): DatasetReferenceRecord {
  const record = toDatasetReferenceRecord(document);
  validateDatasetRecord(record);
  return record;
}
