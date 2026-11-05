import { useEffect, useState } from 'react';
import { Page } from '../data/scenarios';
import { api, type OptimizationResponse } from '../lib/api';
import { useScenarios } from '../context/ScenarioContext';

interface Props {
  onNavigate: (p: Page) => void;
}

const OBJECTIVES = [
  {
    id: 'minimum-carbon',
    label: 'Minimum Carbon',
    icon: '🌿',
    desc: 'Prioritise lowest estimated CO₂ emissions. Recommends renewable energy sources and efficient hardware.',
    color: '#16a34a',
    bg: '#e8f5ee',
  },
  {
    id: 'minimum-energy',
    label: 'Minimum Energy',
    icon: '⚡',
    desc: 'Prioritise lowest estimated energy consumption. Favours efficient GPU configurations.',
    color: '#d97706',
    bg: '#fff8e6',
  },
  {
    id: 'minimum-cost',
    label: 'Minimum Cost',
    icon: '₹',
    desc: 'Prioritise lowest projected cost. Balances hardware count and runtime efficiency.',
    color: '#7c3aed',
    bg: '#f3e8ff',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    icon: '⚖️',
    desc: 'Trade-off between carbon, energy, cost, and performance. Good general-purpose choice.',
    color: '#0284c7',
    bg: '#e0f2fe',
  },
];

export default function Optimize({ onNavigate }: Props) {
  const [selected, setSelected] = useState('minimum-carbon');
  const { activeScenario } = useScenarios();
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeScenario) return;
    setLoading(true);
    setError(null);
    api.optimize({ ...activeScenario.input, optimizationObjective: selected as OptimizationResponse['objective'] })
      .then(({ optimization }) => setResult(optimization))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to optimize this scenario.'))
      .finally(() => setLoading(false));
  }, [activeScenario, selected]);

  if (!activeScenario) return <div style={{ padding: 40, color: '#4d7060' }}>Create a scenario in Planner before running optimization.</div>;
  if (loading) return <div style={{ padding: 40, color: '#4d7060' }}>Evaluating dataset-backed alternatives…</div>;
  if (error) return <div role="alert" style={{ padding: 40, color: '#b91c1c' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px' }}>
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
          Optimisation Objectives
        </h2>
        <p style={{ fontSize: 14, color: '#4d7060', margin: 0 }}>
          Select an optimisation objective to find the recommended configuration for your
          workload.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {OBJECTIVES.map((obj) => {
          const active = selected === obj.id;
          return (
            <button
              key={obj.id}
              onClick={() => setSelected(obj.id)}
              style={{
                background: active ? obj.bg : '#ffffff',
                border: `2px solid ${active ? obj.color : '#dde8e2'}`,
                borderRadius: 12,
                padding: '22px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                transition: 'all 0.15s',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: active ? obj.color : '#f0f4f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {obj.icon}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 700,
                    fontSize: 15,
                    color: active ? obj.color : '#0f2318',
                    marginBottom: 6,
                  }}
                >
                  {obj.label}
                  {active && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        background: obj.color,
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      Selected
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#4d7060', lineHeight: 1.5 }}>
                  {obj.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary of selection */}
      <div
        style={{
          background: '#f7faf8',
          border: '1px solid #dde8e2',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: '#4d7060', fontWeight: 600, marginBottom: 4 }}>
            Selected Objective
          </div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 17, color: '#0f2318' }}>
            {OBJECTIVES.find((o) => o.id === selected)?.label}
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#4d7060', flex: 1, lineHeight: 1.5 }}>
          {selected === 'minimum-carbon'
            ? 'The optimiser will identify the configuration with lowest estimated carbon impact, including renewable energy availability and GPU efficiency.'
            : selected === 'minimum-energy'
            ? 'The optimiser will identify the most energy-efficient configuration for the target workload.'
            : selected === 'minimum-cost'
            ? 'The optimiser will identify the configuration with the lowest projected compute cost.'
            : 'The optimiser will find a balanced configuration considering carbon, energy, and cost together.'}
        </div>
        <button
          onClick={() => onNavigate('recommendation')}
          style={{
            background: '#1a7a4a',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            padding: '13px 28px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Find Recommended Configuration →
        </button>
      </div>

      {result && (
        <div style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <strong style={{ color: '#0f2318' }}>{result.candidates.length} evaluated alternatives</strong>
          {result.recommendation && <p style={{ color: '#4d7060', fontSize: 13 }}>Best evaluated option: {result.recommendation.input.gpuType} / {result.recommendation.input.energySource}.</p>}
          {result.warnings.map((warning) => <div key={warning} style={{ color: '#92400e', fontSize: 12, marginTop: 6 }}>⚠ {warning}</div>)}
          {result.skippedCandidates.length > 0 && <div style={{ color: '#6b9e85', fontSize: 12, marginTop: 8 }}>{result.skippedCandidates.length} candidate(s) could not be evaluated; reasons are retained by the API.</div>}
        </div>
      )}
      <p style={{ fontSize: 12, color: '#6b9e85', textAlign: 'center', margin: 0 }}>
        Optimization uses only active dataset records and does not model throughput or model quality.
      </p>
    </div>
  );
}
