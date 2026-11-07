import type { FilterQuery } from 'mongoose';
import { DatasetModel, type DatasetDocument } from '../models/dataset.model.js';
import { ScenarioModel } from '../models/scenario.model.js';
import { UserModel, type UserDocument } from '../models/user.model.js';
import type {
  AdminDashboardSummary,
  AdminDatasetList,
  AdminDatasetOverview,
  AdminPagination,
  AdminUserList,
} from '../types/admin.js';
import type { UserRole } from '../types/user.js';
import type { WorkloadType } from '../types/workload.js';
import { toPublicUser } from './auth.service.js';

export const DEFAULT_ADMIN_PAGE_SIZE = 20;
export const MAX_ADMIN_PAGE_SIZE = 100;
const MAX_SEARCH_LENGTH = 100;

export class AdminValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminValidationError';
  }
}

export interface AdminListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

export function parseAdminListQuery(query: Record<string, unknown>): AdminListQuery {
  const page = parsePositiveInteger(query.page, 'page', 1);
  const pageSize = parsePositiveInteger(query.pageSize, 'pageSize', DEFAULT_ADMIN_PAGE_SIZE);
  if (pageSize > MAX_ADMIN_PAGE_SIZE) {
    throw new AdminValidationError(`pageSize must not exceed ${MAX_ADMIN_PAGE_SIZE}`);
  }

  let search: string | undefined;
  if (query.search !== undefined) {
    if (typeof query.search !== 'string') {
      throw new AdminValidationError('search must be a string');
    }
    search = query.search.trim();
    if (search.length > MAX_SEARCH_LENGTH) {
      throw new AdminValidationError(`search must not exceed ${MAX_SEARCH_LENGTH} characters`);
    }
    if (search.length === 0) search = undefined;
  }

  return { page, pageSize, search };
}

export async function getDashboardSummary(): Promise<AdminDashboardSummary> {
  const [totalUsers, totalScenarios, activeDatasetRecords, usersByRole, scenariosByWorkloadType, datasetsByProvenance] =
    await Promise.all([
      UserModel.countDocuments(),
      ScenarioModel.countDocuments(),
      DatasetModel.countDocuments({ active: true }),
      UserModel.aggregate<{ _id: UserRole; count: number }>([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      ScenarioModel.aggregate<{ _id: WorkloadType; count: number }>([
        { $group: { _id: '$input.workloadType', count: { $sum: 1 } } },
      ]),
      DatasetModel.aggregate<{ _id: 'illustrative' | 'verified'; count: number }>([
        { $group: { _id: '$provenanceStatus', count: { $sum: 1 } } },
      ]),
    ]);

  return {
    totalUsers,
    totalScenarios,
    activeDatasetRecords,
    usersByRole: {
      user: countByKey(usersByRole, 'user'),
      admin: countByKey(usersByRole, 'admin'),
    },
    scenariosByWorkloadType: Object.fromEntries(
      scenariosByWorkloadType.map((entry) => [entry._id, entry.count]),
    ) as Partial<Record<WorkloadType, number>>,
    datasetsByProvenance: {
      illustrative: countByKey(datasetsByProvenance, 'illustrative'),
      verified: countByKey(datasetsByProvenance, 'verified'),
    },
  };
}

export async function listAdminUsers(query: AdminListQuery): Promise<AdminUserList> {
  const filter: FilterQuery<UserDocument> = {};
  if (query.search) {
    const escapedSearch = escapeRegExp(query.search);
    const searchPattern = new RegExp(escapedSearch, 'i');
    filter.$or = [{ name: searchPattern }, { email: searchPattern }];
  }

  const total = await UserModel.countDocuments(filter);
  const documents = await UserModel.find(filter)
    .select('name email role createdAt updatedAt')
    .sort({ createdAt: -1, _id: 1 })
    .skip((query.page - 1) * query.pageSize)
    .limit(query.pageSize);

  return {
    users: documents.map(toPublicUser),
    pagination: createPagination(query, total),
  };
}

export async function listAdminDatasets(query: AdminListQuery): Promise<AdminDatasetList> {
  const total = await DatasetModel.countDocuments();
  const documents = await DatasetModel.find()
    .select(
      'datasetKey name description workloadType gpuType location energySource version active provenanceStatus sourceName sourceUrl referenceYear energyReference.unit carbonIntensity.unit waterIntensity.unit electricityCost.unit createdAt updatedAt',
    )
    .sort({ updatedAt: -1, datasetKey: 1 })
    .skip((query.page - 1) * query.pageSize)
    .limit(query.pageSize);

  return {
    datasets: documents.map(toAdminDatasetOverview),
    pagination: createPagination(query, total),
  };
}

export function toAdminDatasetOverview(document: DatasetDocument): AdminDatasetOverview {
  return {
    datasetKey: document.datasetKey,
    name: document.name,
    description: document.description,
    workloadType: document.workloadType,
    gpuType: document.gpuType,
    location: document.location,
    energySource: document.energySource,
    version: document.version,
    active: document.active,
    provenanceStatus: document.provenanceStatus,
    sourceName: document.sourceName,
    sourceUrl: document.sourceUrl,
    referenceYear: document.referenceYear,
    units: {
      energyReference: document.energyReference.unit,
      carbonIntensity: document.carbonIntensity.unit,
      waterIntensity: document.waterIntensity.unit,
      electricityCost: document.electricityCost.unit,
    },
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

function createPagination(query: AdminListQuery, total: number): AdminPagination {
  return {
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
  };
}

function parsePositiveInteger(value: unknown, field: string, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new AdminValidationError(`${field} must be a positive integer`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new AdminValidationError(`${field} must be a positive integer`);
  }
  return parsed;
}

function countByKey<T extends string>(
  entries: Array<{ _id: T; count: number }>,
  key: T,
): number {
  return entries.find((entry) => entry._id === key)?.count ?? 0;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
