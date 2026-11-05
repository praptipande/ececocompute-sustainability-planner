export type Page =
  | 'dashboard'
  | 'planner'
  | 'analysis'
  | 'whatif'
  | 'compare'
  | 'optimize'
  | 'recommendation'
  | 'methodology'
  | 'admin';

export const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'planner', label: 'Planner' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'compare', label: 'Compare' },
  { id: 'recommendation', label: 'Recommendation' },
];

export const BASELINE = {
  energy: 1240,
  co2: 410,
  water: 2232,
  cost: 13020,
  score: 72,
  gpu: 'NVIDIA A100',
  gpuCount: 8,
  runtime: 20,
  utilization: 80,
  location: 'Mumbai, India',
  energySource: 'Grid',
};

export const ALT_GRID = {
  energy: 950,
  co2: 310,
  water: 1710,
  cost: 9980,
  score: 79,
  gpu: 'NVIDIA T4',
  gpuCount: 4,
  runtime: 30,
  utilization: 75,
  location: 'Mumbai, India',
  energySource: 'Grid',
};

export const ALT_RENEWABLE = {
  energy: 950,
  co2: 145,
  water: 340,
  cost: 9980,
  score: 91,
  gpu: 'NVIDIA T4',
  gpuCount: 4,
  runtime: 30,
  utilization: 75,
  location: 'Mumbai, India',
  energySource: 'Renewable',
};

export function pct(val: number, base: number) {
  return Math.round(((val - base) / base) * 100);
}

export function fmt(n: number) {
  return n.toLocaleString('en-IN');
}
