export interface ApiError {
  code: string;
  message: string;
  details?: { code: string; message: string }[];
}

export interface ApiFailure {
  success: false;
  error: ApiError;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
};

export type AdminDataset = {
  datasetKey: string; name: string; description?: string; workloadType: string;
  gpuType: string; location: string; energySource: string; version: string;
  active: boolean; provenanceStatus: 'illustrative' | 'verified';
  sourceName?: string; sourceUrl?: string; referenceYear?: number;
  units: Record<string, string>; createdAt: string; updatedAt: string;
};

export type WorkloadInput = {
  scenarioName: string;
  workloadType:
    | 'image-classification'
    | 'natural-language-processing'
    | 'object-detection'
    | 'generative-ai-llm'
    | 'recommendation-system';
  gpuType: string;
  gpuCount: number;
  runtimeHours: number;
  utilizationPercent: number;
  location: string;
  energySource: 'grid' | 'renewable' | 'mixed';
  performanceTarget: 'standard' | 'high' | 'maximum';
  optimizationObjective: 'minimum-carbon' | 'minimum-energy' | 'minimum-cost' | 'balanced';
};

export type EstimateMetric = { value: number; unit: string };
export type EstimateResult = {
  input: WorkloadInput;
  metrics: {
    energy: EstimateMetric;
    carbon: EstimateMetric;
    water: EstimateMetric;
    operatingCost: EstimateMetric;
    sustainabilityScore: EstimateMetric;
  };
  assumptions: {
    datasetKey: string;
    provenanceStatus: 'illustrative' | 'verified';
    scoreMethod: string;
  };
  calculationVersion: string;
  datasetVersion: string;
  warnings: string[];
};

export type Scenario = {
  id: string;
  ownerId: string;
  input: WorkloadInput;
  estimate?: EstimateResult;
  createdAt: string;
  updatedAt: string;
};

export type Comparison = {
  baseline: { label: string; estimate: EstimateResult };
  alternatives: {
    label: string;
    estimate: EstimateResult;
    differencesFromBaseline?: Record<string, { absolute: number; percentage: number | null }>;
  }[];
  warnings: string[];
};

export type RecommendationResponse = {
  objective: WorkloadInput['optimizationObjective'];
  baseline: { input: WorkloadInput; estimate: EstimateResult };
  recommendedConfiguration: WorkloadInput;
  estimate: EstimateResult;
  recommendations: {
    id: string;
    category: string;
    title: string;
    explanation: string;
    candidateConfiguration: WorkloadInput;
    estimate: EstimateResult;
    metric: { baseline: number; candidate: number; absolute: number; percentage: number | null; unit: string };
    priority: number;
    provenanceStatus: 'illustrative' | 'verified';
    warnings: string[];
  }[];
  skippedCandidates: { datasetKey: string; reason: string }[];
  warnings: string[];
};

export type OptimizationResponse = {
  objective: WorkloadInput['optimizationObjective'];
  baseline: { input: WorkloadInput; estimate: EstimateResult };
  recommendation: { input: WorkloadInput; estimate: EstimateResult } | null;
  candidates: { input: WorkloadInput; estimate: EstimateResult; differencesFromBaseline: Record<string, { absolute: number; percentage: number | null }>; provenanceStatus: 'illustrative' | 'verified' }[];
  skippedCandidates: { datasetKey: string; reason: string }[];
  warnings: string[];
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const TOKEN_KEY = 'ecocompute.jwt';

export function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const token = getStoredToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Unable to reach the EcoCompute API. Check that the backend is running.');
  }

  if (response.status === 204) return undefined as T;

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error(`The API returned an unexpected response (${response.status}).`);
  }

  if (!response.ok || !payload.success) {
    if (response.status === 401) clearStoredToken();
    throw new Error(payload.success ? `Request failed (${response.status}).` : payload.error.message);
  }
  return payload.data;
}

export const api = {
  me: () => apiRequest<{ user: User }>('/auth/me'),
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  scenarios: () => apiRequest<{ scenarios: Scenario[] }>('/scenarios'),
  createScenario: (input: WorkloadInput) =>
    apiRequest<{ scenario: Scenario }>('/scenarios', {
      method: 'POST',
      body: JSON.stringify({ input }),
    }),
  updateScenario: (id: string, input: WorkloadInput) =>
    apiRequest<{ scenario: Scenario }>(`/scenarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ input }),
    }),
  deleteScenario: (id: string) =>
    apiRequest<void>(`/scenarios/${id}`, { method: 'DELETE' }),
  comparison: (scenarioIds: string[]) =>
    apiRequest<{ comparison: Comparison }>('/comparisons', {
      method: 'POST',
      body: JSON.stringify({ scenarioIds }),
    }),
  optimize: (input: WorkloadInput) =>
    apiRequest<{ optimization: OptimizationResponse }>('/optimize', {
      method: 'POST',
      body: JSON.stringify({ input }),
    }),
  recommendations: (input: WorkloadInput, objective?: WorkloadInput['optimizationObjective']) =>
    apiRequest<{ recommendations: RecommendationResponse }>('/recommendations', {
      method: 'POST',
      body: JSON.stringify({ input, ...(objective ? { objective } : {}) }),
    }),
  dashboard: () => apiRequest<{ summary: Record<string, unknown> }>('/admin/dashboard'),
  adminUsers: () => apiRequest<{ users: User[]; pagination: { total: number; page: number; pageSize: number; totalPages: number } }>('/admin/users'),
  adminDatasets: () => apiRequest<{ datasets: AdminDataset[] }>('/admin/datasets'),
};
