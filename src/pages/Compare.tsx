import { BASELINE, ALT_GRID, ALT_RENEWABLE, fmt, pct, Page } from '../data/scenarios';
import { useEffect, useState } from 'react';
import { api, type Comparison } from '../lib/api';
import { useScenarios } from '../context/ScenarioContext';

interface Props {
  onNavigate: (p: Page) => void;
}

const SCENARIOS = [
  {
    id: 'A',
    label: 'Scenario A',
    subtitle: 'Current / Baseline',
    data: BASELINE,
    color: '#d97706',
    bg: '#fff8e6',
    border: '#fcd34d',
  },
  {
    id: 'B',
    label: 'Scenario B',
    subtitle: 'Alternative (Grid)',
    data: ALT_GRID,
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#7dd3fc',
  },
  {
    id: 'C',
    label: 'Scenario C',
    subtitle: 'Alt + Renewable ⭐',
    data: ALT_RENEWABLE,
    color: '#16a34a',
    bg: '#e8f5ee',
    border: '#86efac',
  },
];

const METRICS = [
  { key: 'energy' as const, icon: '⚡', label: 'Energy', unit: 'kWh' },
  { key: 'co2' as const, icon: '🌿', label: 'CO₂ Emissions', unit: 'kg CO₂e' },
  { key: 'water' as const, icon: '💧', label: 'Water Usage', unit: 'Litres' },
  { key: 'cost' as const, icon: '₹', label: 'Estimated Cost', unit: 'INR' },
  { key: 'score' as const, icon: '🏆', label: 'EcoScore', unit: '/ 100' },
];

export default function Compare({ onNavigate }: Props) {
  const { scenarios } = useScenarios();
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (scenarios.length < 2) return;
    setLoading(true);
    api.comparison(scenarios.slice(0, 5).map((scenario) => scenario.id))
      .then(({ comparison: result }) => setComparison(result))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to compare scenarios.'))
      .finally(() => setLoading(false));
  }, [scenarios]);

  if (scenarios.length < 2) return <div style={{ padding: 40, color: '#4d7060' }}>Save at least two scenarios in Planner before comparing them.</div>;
  if (loading) return <div style={{ padding: 40, color: '#4d7060' }}>Comparing saved scenario estimates…</div>;
  if (error) return <div role="alert" style={{ padding: 40, color: '#b91c1c' }}>{error}</div>;
  if (comparison) return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
      <h2 style={{ fontFamily: 'DM Sans, sans-serif', color: '#0f2318' }}>Scenario Comparison</h2>
      <p style={{ color: '#4d7060', fontSize: 14 }}>Baseline: {comparison.baseline.label}. Differences are candidate minus baseline.</p>
      {comparison.warnings.map((warning) => <div key={warning} style={{ background: '#fff8e6', color: '#92400e', padding: 10, borderRadius: 8, marginBottom: 8, fontSize: 12 }}>⚠ {warning}</div>)}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginTop: 20 }}>
        {[comparison.baseline, ...comparison.alternatives].map((item) => <div key={item.label} style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, padding: 18 }}><strong style={{ color: '#0f2318' }}>{item.label}</strong><p style={{ color: '#4d7060', fontSize: 13 }}>Energy: {item.estimate.metrics.energy.value} {item.estimate.metrics.energy.unit}</p><p style={{ color: '#4d7060', fontSize: 13 }}>Carbon: {item.estimate.metrics.carbon.value} {item.estimate.metrics.carbon.unit}</p><p style={{ color: '#4d7060', fontSize: 13 }}>Water: {item.estimate.metrics.water.value} {item.estimate.metrics.water.unit}</p><p style={{ color: '#4d7060', fontSize: 13 }}>Cost: {item.estimate.metrics.operatingCost.value} {item.estimate.metrics.operatingCost.unit}</p></div>)}
      </div>
    </div>
  );
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 700,
            fontSize: 26,
            color: '#0f2318',
            margin: '0 0 6px',
          }}
        >
          Scenario Comparison
        </h2>
        <p style={{ fontSize: 14, color: '#4d7060', margin: 0 }}>
          Side-by-side comparison of projected environmental and economic impact across
          configurations.
        </p>
      </div>

      {/* Scenario cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {SCENARIOS.map((s) => (
          <div
            key={s.id}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 12,
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 15, color: s.color }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 12, color: '#4d7060', marginTop: 2 }}>{s.subtitle}</div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: s.color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                {s.id}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12.5, color: '#4d7060' }}>
                {s.data.gpuCount}× {s.data.gpu}
              </div>
              <div style={{ fontSize: 12.5, color: '#4d7060' }}>
                {s.data.runtime}h · {s.data.utilization}% util
              </div>
              <div style={{ fontSize: 12.5, color: '#4d7060' }}>
                {s.data.location} · {s.data.energySource}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Metric table */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dde8e2',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7faf8', borderBottom: '1px solid #dde8e2' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4d7060', fontFamily: 'DM Sans, sans-serif', width: 180 }}>
                Metric
              </th>
              {SCENARIOS.map((s) => (
                <th
                  key={s.id}
                  style={{
                    padding: '14px 16px',
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: s.color,
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m, i) => (
              <tr
                key={m.key}
                style={{
                  borderBottom: i < METRICS.length - 1 ? '1px solid #f0f4f1' : 'none',
                }}
              >
                <td style={{ padding: '14px 20px', fontSize: 13 }}>
                  <span style={{ marginRight: 8 }}>{m.icon}</span>
                  <span style={{ fontWeight: 500, color: '#0f2318' }}>{m.label}</span>
                  <div style={{ fontSize: 11, color: '#6b9e85', marginTop: 2, paddingLeft: 22 }}>{m.unit}</div>
                </td>
                {SCENARIOS.map((s) => {
                  const val = s.data[m.key];
                  const isBase = s.id === 'A';
                  const change = isBase ? null : pct(val, BASELINE[m.key]);
                  return (
                    <td key={s.id} style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div
                        style={{
                          fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 700,
                          fontSize: 18,
                          color: s.color,
                        }}
                      >
                        {m.key === 'cost' ? '₹' : ''}{s.id !== 'A' ? '~' : ''}{fmt(val)}
                      </div>
                      {change !== null && (
                        <div
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            marginTop: 4,
                            color: change < 0 ? '#15803d' : '#dc2626',
                          }}
                        >
                          {change > 0 ? '+' : ''}{change}% vs baseline
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trade-off note */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dde8e2',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 24,
        }}
      >
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, color: '#0f2318', marginBottom: 12 }}>
          Trade-off Summary
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: '#4d7060', lineHeight: 1.6 }}>
            <strong style={{ color: '#0284c7' }}>Scenario B</strong> reduces energy and cost
            by lowering GPU count, but increases runtime from 20 to 30 hours. Carbon reduction
            comes from lower overall compute, not energy source.
          </p>
          <p style={{ margin: 0, fontSize: 13.5, color: '#4d7060', lineHeight: 1.6 }}>
            <strong style={{ color: '#16a34a' }}>Scenario C</strong> provides a major reduction
            in estimated carbon impact (~64%) through renewable energy, while maintaining a similar
            energy and cost footprint to Scenario B.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#6b9e85', lineHeight: 1.6, fontStyle: 'italic' }}>
            The appropriate configuration depends on your optimization objective and operational
            constraints. No single scenario is universally best.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={() => onNavigate('optimize')}
          style={{
            background: '#1a7a4a',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '11px 22px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Optimise Configuration →
        </button>
      </div>
    </div>
  );
}
