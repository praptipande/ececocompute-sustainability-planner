import { useState } from 'react';
import { Page } from '../data/scenarios';
import { api, type OptimizationResponse } from '../lib/api';
import { useScenarios } from '../context/ScenarioContext';

interface Props { onNavigate: (p: Page) => void; }

export default function WhatIf({ onNavigate }: Props) {
  const { activeScenario } = useScenarios();
  const [objective, setObjective] = useState(activeScenario?.input.optimizationObjective ?? 'balanced');
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function evaluate() {
    if (!activeScenario) return;
    setLoading(true); setError(null);
    try {
      const response = await api.optimize({ ...activeScenario.input, optimizationObjective: objective });
      setResult(response.optimization);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to evaluate alternatives.');
    } finally { setLoading(false); }
  }

  if (!activeScenario) return <div style={{ padding: 40, color: '#4d7060' }}>Create a scenario in Planner before exploring alternatives.</div>;
  const baseline = result?.baseline.estimate;
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
      <h2 style={{ fontFamily: 'DM Sans, sans-serif', color: '#0f2318' }}>What-If / Explore Alternative</h2>
      <p style={{ color: '#4d7060' }}>Evaluate dataset-backed alternatives for the active scenario. Throughput, model quality, and operational feasibility are not modeled.</p>
      <div style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, padding: 20, margin: '20px 0' }}>
        <strong style={{ color: '#0f2318' }}>{activeScenario.input.scenarioName}</strong>
        <p style={{ color: '#4d7060', fontSize: 13 }}>{activeScenario.input.gpuCount}× {activeScenario.input.gpuType} · {activeScenario.input.runtimeHours} hours · {activeScenario.input.location}</p>
        <label style={{ color: '#4d7060', fontSize: 13 }}>Optimization objective <select value={objective} onChange={(event) => setObjective(event.target.value as typeof objective)} style={{ marginLeft: 8, padding: 8, border: '1px solid #dde8e2', borderRadius: 6 }}><option value="balanced">Balanced</option><option value="minimum-carbon">Minimum carbon</option><option value="minimum-energy">Minimum energy</option><option value="minimum-cost">Minimum cost</option></select></label>
        <button onClick={evaluate} disabled={loading} style={{ display: 'block', marginTop: 16, background: '#1a7a4a', color: '#fff', border: 0, borderRadius: 8, padding: '11px 22px', cursor: 'pointer' }}>{loading ? 'Evaluating…' : 'Evaluate alternatives →'}</button>
      </div>
      {error && <div role="alert" style={{ background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 8 }}>{error}</div>}
      {result && <><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>{result.candidates.map((candidate, index) => <div key={`${candidate.input.gpuType}-${candidate.input.energySource}-${index}`} style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, padding: 18 }}><strong style={{ color: '#0f2318' }}>{candidate.input.gpuType} · {candidate.input.energySource}</strong><p style={{ color: '#4d7060', fontSize: 13 }}>Energy: {candidate.estimate.metrics.energy.value} {candidate.estimate.metrics.energy.unit}</p><p style={{ color: '#4d7060', fontSize: 13 }}>Carbon: {candidate.estimate.metrics.carbon.value} {candidate.estimate.metrics.carbon.unit}</p><p style={{ color: '#4d7060', fontSize: 13 }}>Cost: {candidate.estimate.metrics.operatingCost.value} {candidate.estimate.metrics.operatingCost.unit}</p><small style={{ color: '#6b9e85' }}>{candidate.provenanceStatus} dataset</small></div>)}</div><p style={{ color: '#6b9e85', fontSize: 12, marginTop: 14 }}>Baseline energy: {baseline?.metrics.energy.value ?? 'unavailable'} {baseline?.metrics.energy.unit ?? ''}</p>{result.warnings.map((warning) => <div key={warning} style={{ background: '#fff8e6', color: '#92400e', padding: 10, borderRadius: 8, marginTop: 8, fontSize: 12 }}>⚠ {warning}</div>)}{result.skippedCandidates.map((item) => <div key={item.datasetKey} style={{ color: '#6b7060', fontSize: 12, marginTop: 6 }}>Skipped {item.datasetKey}: {item.reason}</div>)}</>}
      <button onClick={() => onNavigate('optimize')} style={{ marginTop: 20, border: 0, background: 'none', color: '#1a7a4a', cursor: 'pointer' }}>Open full optimization view →</button>
    </div>
  );
}
