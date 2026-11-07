import type { WorkloadInput } from './workload.js';
import type { EstimateResult } from './estimate.js';

export interface Scenario {
  id: string;
  ownerId: string;
  input: WorkloadInput;
  /** Snapshot generated from the dataset at the time the scenario was saved. */
  estimate?: EstimateResult;
  createdAt: string;
  updatedAt: string;
}
