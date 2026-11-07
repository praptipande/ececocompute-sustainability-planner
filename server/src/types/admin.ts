import type { DatasetProvenanceStatus } from './dataset.js';
import type { User, UserRole } from './user.js';
import type { WorkloadType } from './workload.js';

export interface AdminPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminUserList {
  users: User[];
  pagination: AdminPagination;
}

export interface AdminDatasetOverview {
  datasetKey: string;
  name: string;
  description: string;
  workloadType: WorkloadType;
  gpuType: string;
  location: string;
  energySource: string;
  version: string;
  active: boolean;
  provenanceStatus: DatasetProvenanceStatus;
  sourceName: string;
  sourceUrl?: string;
  referenceYear?: number;
  units: {
    energyReference: string;
    carbonIntensity: string;
    waterIntensity: string;
    electricityCost: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminDatasetList {
  datasets: AdminDatasetOverview[];
  pagination: AdminPagination;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  totalScenarios: number;
  activeDatasetRecords: number;
  usersByRole: Record<UserRole, number>;
  scenariosByWorkloadType: Partial<Record<WorkloadType, number>>;
  datasetsByProvenance: Record<DatasetProvenanceStatus, number>;
}
