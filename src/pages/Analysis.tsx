import MetricCard from '../components/MetricCard';
import { fmt, Page } from '../data/scenarios';
import { useScenarios } from '../context/ScenarioContext';

interface Props {
  onNavigate: (p: Page) => void;
}

export default function Analysis({ onNavigate }: Props) {
  const { activeScenario, loading, error } = useScenarios();
  const estimate = activeScenario?.estimate;
  const baseline = estimate
    ? {
        energy: estimate.metrics.energy.value,
        co2: estimate.metrics.carbon.value,
        water: estimate.metrics.water.value,
        cost: estimate.metrics.operatingCost.value,
        score: estimate.metrics.sustainabilityScore.value,
        gpu: activeScenario.input.gpuType,
        gpuCount: activeScenario.input.gpuCount,
        runtime: activeScenario.input.runtimeHours,
        utilization: activeScenario.input.utilizationPercent,
        location: activeScenario.input.location,
        energySource: activeScenario.input.energySource,
      }
    : null;
  if (loading) return <div style={{ padding: 40, color: '#4d7060' }}>Loading saved scenarios…</div>;
  if (error) return <div role="alert" style={{ padding: 40, color: '#b91c1c' }}>{error}</div>;
  if (!baseline || !estimate) return <div style={{ padding: 40, color: '#4d7060' }}>Create a scenario in Planner to view a server-generated analysis.</div>;
  const maxVal = Math.max(baseline.energy, baseline.co2, baseline.water / 5, baseline.cost / 50);

  const bars = [
    { label: 'Energy', value: baseline.energy, max: 2000, color: '#d97706', unit: 'kWh' },
    { label: 'CO₂', value: baseline.co2, max: 600, color: '#16a34a', unit: 'kg CO₂e' },
    { label: 'Water', value: baseline.water, max: 4000, color: '#0284c7', unit: 'L' },
    { label: 'Cost', value: baseline.cost, max: 20000, color: '#7c3aed', unit: '₹' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 700,
              fontSize: 26,
              color: '#0f2318',
              margin: '0 0 6px',
            }}
          >
            Baseline Analysis
          </h2>
          <p style={{ fontSize: 14, color: '#4d7060', margin: 0 }}>
            Projected impact for the current configuration · estimates based on stated
            assumptions
          </p>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#fff8e6',
            border: '1px solid #fcd34d',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 12.5,
            color: '#92400e',
            fontWeight: 500,
          }}
        >
          ⚠ Scenario estimates — not live measurements
        </div>
      </div>

      {/* Config summary */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dde8e2',
          borderRadius: 12,
          padding: '16px 24px',
          marginBottom: 24,
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#4d7060', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Configuration
          </div>
        </div>
        {[
          ['GPU', `${baseline.gpuCount}× ${baseline.gpu}`],
          ['Runtime', `${baseline.runtime} hours`],
          ['Utilization', `${baseline.utilization}%`],
          ['Location', baseline.location],
          ['Energy', baseline.energySource],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 11, color: '#4d7060', marginBottom: 2 }}>{k}</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f2318', fontFamily: 'DM Sans, sans-serif' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Metric cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <MetricCard icon="⚡" label="Energy Consumption" value={fmt(baseline.energy)} unit="kWh · estimated" color="#d97706" />
        <MetricCard icon="🌿" label="Carbon Emissions" value={fmt(baseline.co2)} unit="kg CO₂e · estimated" color="#15803d" />
        <MetricCard icon="💧" label="Water Usage" value={fmt(baseline.water)} unit="Litres · estimated" color="#0284c7" />
        <MetricCard icon="₹" label="Estimated Cost" value={fmt(baseline.cost)} unit="INR · projected" color="#7c3aed" />
      </div>

      {/* Score + bars row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Score card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dde8e2',
            borderRadius: 12,
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4d7060', fontFamily: 'DM Sans, sans-serif' }}>
            EcoCompute Score
          </div>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `conic-gradient(#ca8a04 0% ${baseline.score}%, #e8f5ee ${baseline.score}% 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 24, color: '#ca8a04', lineHeight: 1 }}>
                {baseline.score}
              </div>
              <div style={{ fontSize: 10, color: '#4d7060' }}>/ 100</div>
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#ca8a04',
              fontWeight: 600,
              background: '#fef9c3',
              padding: '4px 10px',
              borderRadius: 20,
            }}
          >
            Moderate
          </div>
          <p style={{ fontSize: 11.5, color: '#6b9e85', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
            Score derived from estimated energy, carbon, water, and cost relative to benchmarks.
          </p>
        </div>

        {/* Bars */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dde8e2',
            borderRadius: 12,
            padding: '24px',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f2318', marginBottom: 18, fontFamily: 'DM Sans, sans-serif' }}>
            Environmental Impact Overview
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bars.map((b) => (
              <div key={b.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 500, color: '#0f2318' }}>{b.label}</span>
                  <span style={{ color: '#4d7060' }}>
                    {b.label === 'Cost' ? '₹' : ''}{fmt(b.value)}{b.label !== 'Cost' ? ' ' + b.unit : ''}
                  </span>
                </div>
                <div style={{ height: 10, background: '#f0f4f1', borderRadius: 5, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round((b.value / b.max) * 100)}%`,
                      background: b.color,
                      borderRadius: 5,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          background: 'linear-gradient(135deg, #e8f5ee 0%, #d1fae5 100%)',
          border: '1px solid #a7f3d0',
          borderRadius: 12,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 15, color: '#0f2318', marginBottom: 4 }}>
            Ready to explore alternatives?
          </div>
          <div style={{ fontSize: 13, color: '#4d7060' }}>
            Compare different GPU configurations and energy sources to reduce your footprint.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => onNavigate('whatif')}
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
            Explore Alternative →
          </button>
          <button
            onClick={() => onNavigate('compare')}
            style={{
              background: 'white',
              color: '#1a7a4a',
              border: '1px solid #a7f3d0',
              borderRadius: 8,
              padding: '11px 22px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Compare Scenarios
          </button>
        </div>
      </div>
    </div>
  );
}

