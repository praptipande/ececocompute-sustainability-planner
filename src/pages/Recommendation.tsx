import { ALT_RENEWABLE, BASELINE, fmt, pct, Page } from '../data/scenarios';
import { useEffect, useState } from 'react';
import { api, type RecommendationResponse } from '../lib/api';
import { useScenarios } from '../context/ScenarioContext';

interface Props {
  onNavigate: (p: Page) => void;
}

const impacts = [
  { icon: '⚡', label: 'Energy', base: BASELINE.energy, rec: ALT_RENEWABLE.energy, unit: 'kWh', color: '#d97706' },
  { icon: '🌿', label: 'CO₂', base: BASELINE.co2, rec: ALT_RENEWABLE.co2, unit: 'kg CO₂e', color: '#16a34a' },
  { icon: '💧', label: 'Water', base: BASELINE.water, rec: ALT_RENEWABLE.water, unit: 'L', color: '#0284c7' },
  { icon: '₹', label: 'Cost', base: BASELINE.cost, rec: ALT_RENEWABLE.cost, unit: 'INR', color: '#7c3aed' },
];

export default function Recommendation({ onNavigate }: Props) {
  const { activeScenario } = useScenarios();
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!activeScenario) return;
    setLoading(true);
    api.recommendations(activeScenario.input)
      .then(({ recommendations }) => setResult(recommendations))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to generate recommendations.'))
      .finally(() => setLoading(false));
  }, [activeScenario]);
  if (!activeScenario) return <div style={{ padding: 40, color: '#4d7060' }}>Create a scenario in Planner before requesting recommendations.</div>;
  if (loading) return <div style={{ padding: 40, color: '#4d7060' }}>Generating evidence-backed recommendations…</div>;
  if (error) return <div role="alert" style={{ padding: 40, color: '#b91c1c' }}>{error}</div>;
  if (result) return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px' }}>
      <div style={{ background: 'linear-gradient(135deg,#0f2318,#1a7a4a)', borderRadius: 16, padding: '30px 36px', color: '#fff', marginBottom: 20 }}><div style={{ fontSize: 12, color: '#7de8b0' }}>Server recommendation · {result.objective}</div><h2 style={{ margin: '8px 0' }}>Evidence-backed recommendations</h2><p style={{ margin: 0, opacity: 0.85, fontSize: 13 }}>Only evaluated dataset alternatives are shown.</p></div>
      {result.warnings.map((warning) => <div key={warning} style={{ background: '#fff8e6', color: '#92400e', padding: 10, borderRadius: 8, marginBottom: 8, fontSize: 12 }}>⚠ {warning}</div>)}
      {result.recommendations.length === 0 && <div style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, padding: 20, color: '#4d7060' }}>No evaluated candidate improved a metric for this objective.</div>}
      {result.recommendations.map((item) => <div key={item.id} style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, padding: 20, marginTop: 14 }}><strong style={{ color: '#0f2318' }}>{item.title}</strong><p style={{ color: '#4d7060', fontSize: 13 }}>{item.explanation}</p><div style={{ color: '#1a7a4a', fontWeight: 700 }}>{item.metric.absolute < 0 ? '' : '+'}{item.metric.absolute} {item.metric.unit} ({item.metric.percentage === null ? 'n/a' : `${item.metric.percentage.toFixed(1)}%`}) vs baseline</div><div style={{ color: '#6b9e85', fontSize: 12, marginTop: 6 }}>Provenance: {item.provenanceStatus}</div></div>)}
    </div>
  );
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px' }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f2318 0%, #1a7a4a 100%)',
          borderRadius: 16,
          padding: '36px 40px',
          color: 'white',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -20,
            top: -20,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(47,184,112,0.1)',
          }}
        />
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(47,184,112,0.2)',
              border: '1px solid rgba(47,184,112,0.4)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 11.5,
              marginBottom: 16,
              color: '#7de8b0',
              fontWeight: 500,
            }}
          >
            ✓ Optimised for Minimum Carbon
          </div>
          <h2
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 700,
              fontSize: 28,
              margin: '0 0 12px',
            }}
          >
            Recommended Configuration
          </h2>
          <p style={{ fontSize: 14, opacity: 0.8, margin: 0, lineHeight: 1.6, maxWidth: 520 }}>
            Based on your Minimum Carbon objective, this configuration provides the best
            estimated sustainability outcome for the stated workload — scenario estimates only.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Config summary */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dde8e2',
            borderRadius: 12,
            padding: '24px',
          }}
        >
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 15, color: '#0f2318', marginBottom: 18 }}>
            Recommended Setup
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['GPU', `${ALT_RENEWABLE.gpuCount}× ${ALT_RENEWABLE.gpu}`],
              ['Runtime', `${ALT_RENEWABLE.runtime} hours`],
              ['Utilization', `${ALT_RENEWABLE.utilization}%`],
              ['Location', ALT_RENEWABLE.location],
              ['Energy Source', `${ALT_RENEWABLE.energySource} / Mixed`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#4d7060' }}>{k}</span>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    fontFamily: 'DM Sans, sans-serif',
                    background: k === 'Energy Source' ? '#e8f5ee' : 'transparent',
                    padding: k === 'Energy Source' ? '2px 8px' : '0',
                    borderRadius: 4,
                    color: k === 'Energy Source' ? '#1a7a4a' : '#0f2318',
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: '#dde8e2', margin: '16px 0' }} />

          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: `conic-gradient(#16a34a 0% ${ALT_RENEWABLE.score}%, #e8f5ee ${ALT_RENEWABLE.score}% 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 16, color: '#16a34a', lineHeight: 1 }}>
                  {ALT_RENEWABLE.score}
                </div>
                <div style={{ fontSize: 9, color: '#4d7060' }}>/100</div>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 15, color: '#16a34a' }}>
                Excellent
              </div>
              <div style={{ fontSize: 12, color: '#4d7060' }}>EcoCompute Sustainability Score</div>
            </div>
          </div>
        </div>

        {/* Reasons */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dde8e2',
            borderRadius: 12,
            padding: '24px',
          }}
        >
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 15, color: '#0f2318', marginBottom: 16 }}>
            Why This Configuration?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '✅', text: 'Lower GPU count (4 vs 8) reduces estimated energy consumption per run.' },
              { icon: '✅', text: 'Renewable energy substantially lowers estimated carbon intensity.' },
              { icon: '✅', text: 'NVIDIA T4 offers good efficiency for inference-grade workloads.' },
              { icon: '✅', text: 'Projected cost reduction of ~23% compared to baseline.' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, lineHeight: 1.5, color: '#0f2318' }}>
                <span>{r.icon}</span>
                <span style={{ color: '#4d7060' }}>{r.text}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: '#dde8e2', margin: '14px 0' }} />
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13, color: '#0f2318', marginBottom: 10 }}>
            Trade-offs
          </div>
          {[
            '⚠ Runtime increases from 20 to 30 hours.',
            '⚠ Renewable energy availability may vary by location.',
            '⚠ These are scenario estimates based on stated assumptions.',
          ].map((t, i) => (
            <div key={i} style={{ fontSize: 12.5, color: '#6b9e85', lineHeight: 1.5 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {impacts.map((m) => {
          const delta = pct(m.rec, m.base);
          return (
            <div
              key={m.label}
              style={{
                background: '#ffffff',
                border: '1px solid #dde8e2',
                borderRadius: 12,
                padding: '18px',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 20, color: m.color }}>
                ~{m.label === 'Cost' ? '₹' : ''}{fmt(m.rec)}
              </div>
              <div style={{ fontSize: 11, color: '#4d7060', marginBottom: 8 }}>{m.unit}</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#0f2318', marginBottom: 6 }}>{m.label}</div>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: '3px 7px',
                  borderRadius: 4,
                  background: '#e8f5ee',
                  color: '#15803d',
                }}
              >
                {delta}% vs baseline
              </span>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div
        style={{
          background: '#fff8e6',
          border: '1px solid #fcd34d',
          borderRadius: 10,
          padding: '14px 18px',
          fontSize: 12.5,
          color: '#92400e',
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        <strong>Disclaimer:</strong> EcoCompute provides estimated scenario values based on
        stated assumptions including hardware power ratings, regional carbon intensity factors,
        and water usage coefficients. These are not live measurements, real-time data, or
        guarantees of actual savings. Actual results will depend on infrastructure, workload
        characteristics, and operational conditions.
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button
          onClick={() => onNavigate('methodology')}
          style={{
            background: 'none',
            color: '#1a7a4a',
            border: '1px solid #dde8e2',
            borderRadius: 8,
            padding: '10px 18px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            fontSize: 13.5,
            cursor: 'pointer',
          }}
        >
          View Methodology & Assumptions
        </button>
        <button
          onClick={() => onNavigate('planner')}
          style={{
            background: '#1a7a4a',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 22px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 700,
            fontSize: 13.5,
            cursor: 'pointer',
          }}
        >
          Plan a New Scenario
        </button>
      </div>
    </div>
  );
}
