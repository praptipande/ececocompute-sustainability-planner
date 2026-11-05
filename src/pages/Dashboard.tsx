import MetricCard from '../components/MetricCard';
import { Page } from '../data/scenarios';
import { useScenarios } from '../context/ScenarioContext';

interface Props { onNavigate: (p: Page) => void; }

export default function Dashboard({ onNavigate }: Props) {
  const { scenarios, activeScenario, loading, error, setActive, update, remove } = useScenarios();
  const estimate = activeScenario?.estimate;

  async function renameScenario() {
    if (!activeScenario) return;
    const name = window.prompt('Scenario name', activeScenario.input.scenarioName)?.trim();
    if (!name || name === activeScenario.input.scenarioName) return;
    try {
      await update(activeScenario.id, { ...activeScenario.input, scenarioName: name });
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'Unable to update the scenario.');
    }
  }

  async function deleteCurrentScenario() {
    if (!activeScenario || !window.confirm(`Delete "${activeScenario.input.scenarioName}"?`)) return;
    try {
      await remove(activeScenario.id);
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'Unable to delete the scenario.');
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f2318 0%, #1a7a4a 100%)', borderRadius: 16, padding: '40px 48px', marginBottom: 32, color: 'white' }}>
        <div style={{ color: '#7de8b0', fontSize: 12, marginBottom: 14 }}>Server-backed scenario estimates</div>
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 34, margin: '0 0 10px' }}>EcoCompute Dashboard</h1>
        <p style={{ fontSize: 15, opacity: 0.8, maxWidth: 560, lineHeight: 1.6 }}>Plan and compare AI/ML compute configurations by their estimated energy, carbon, water and cost impact.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('planner')} style={{ background: '#2fb870', color: 'white', border: 0, borderRadius: 8, padding: '11px 24px', fontWeight: 600, cursor: 'pointer' }}>Start Planning →</button>
          <button onClick={() => onNavigate('compare')} style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '11px 24px', cursor: 'pointer' }}>Compare Scenarios</button>
        </div>
      </div>

      {loading && <p style={{ color: '#4d7060' }}>Loading saved scenarios…</p>}
      {error && <div role="alert" style={{ background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
      <div style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <strong style={{ color: '#0f2318' }}>Saved scenarios</strong>
          <select aria-label="Active scenario" value={activeScenario?.id ?? ''} onChange={(event) => setActive(scenarios.find((item) => item.id === event.target.value) ?? null)} style={{ flex: 1, minWidth: 220, border: '1px solid #dde8e2', borderRadius: 6, padding: 8 }}>
            {!scenarios.length && <option value="">No saved scenarios</option>}
            {scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.input.scenarioName}</option>)}
          </select>
          {activeScenario && <><button onClick={renameScenario} style={{ border: 0, background: 'none', color: '#1a7a4a', cursor: 'pointer' }}>Rename</button><button onClick={deleteCurrentScenario} style={{ border: 0, background: 'none', color: '#b91c1c', cursor: 'pointer' }}>Delete</button></>}
        </div>
        {activeScenario && <div style={{ color: '#4d7060', fontSize: 13, marginTop: 10 }}>{activeScenario.input.gpuCount}× {activeScenario.input.gpuType} · {activeScenario.input.runtimeHours} hours · {activeScenario.input.location} · {activeScenario.input.energySource}</div>}
      </div>

      {!estimate && <div style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, padding: 20, color: '#4d7060', marginBottom: 24 }}>Create a scenario to see server-generated metrics. No prototype values are shown as results.</div>}
      {estimate && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <MetricCard icon="⚡" label="Energy Consumption" value={estimate.metrics.energy.value.toLocaleString()} unit={estimate.metrics.energy.unit} color="#d97706" />
        <MetricCard icon="🌿" label="Carbon Emissions" value={estimate.metrics.carbon.value.toLocaleString()} unit={estimate.metrics.carbon.unit} color="#15803d" />
        <MetricCard icon="💧" label="Water Usage" value={estimate.metrics.water.value.toLocaleString()} unit={estimate.metrics.water.unit} color="#0284c7" />
        <MetricCard icon="₹" label="Estimated Cost" value={estimate.metrics.operatingCost.value.toLocaleString()} unit={estimate.metrics.operatingCost.unit} color="#7c3aed" />
        <MetricCard icon="🏆" label="Sustainability Score" value={estimate.metrics.sustainabilityScore.value.toLocaleString()} unit="/100 (provisional)" color="#ca8a04" />
      </div>}
      {estimate?.warnings.map((warning) => <div key={warning} style={{ background: '#fff8e6', color: '#92400e', padding: 10, borderRadius: 8, marginBottom: 8, fontSize: 12 }}>⚠ {warning}</div>)}
      <div style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontFamily: 'DM Sans, sans-serif', color: '#0f2318' }}>Planning Workflow</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{(['planner', 'analysis', 'whatif', 'compare', 'optimize', 'recommendation'] as Page[]).map((page) => <button key={page} onClick={() => onNavigate(page)} style={{ border: '1px solid #dde8e2', background: '#e8f5ee', color: '#1a7a4a', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}>{page}</button>)}</div>
      </div>
    </div>
  );
}
