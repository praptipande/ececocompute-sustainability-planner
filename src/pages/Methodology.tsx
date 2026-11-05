import { Page } from '../data/scenarios';

interface Props {
  onNavigate: (p: Page) => void;
}

const SECTIONS = [
  {
    icon: '⚡',
    title: 'Energy Estimation',
    content:
      'Energy consumption is estimated based on the selected compute hardware (GPU type and count), utilisation percentage, and runtime duration. GPU power draw values are sourced from typical manufacturer specifications and benchmark reports. The formula applies: Energy (kWh) = GPU Power (kW) × GPU Count × Runtime (h) × Utilisation.',
  },
  {
    icon: '🌿',
    title: 'Carbon Emissions Estimation',
    content:
      'Carbon emissions are estimated using the projected energy requirement and an assumed carbon-intensity factor for the selected energy source and location. Grid carbon intensity is based on regional averages. Renewable energy is assumed to have a substantially lower carbon intensity (near-zero for generation). Formula: CO₂e = Energy (kWh) × Carbon Intensity (kg CO₂e/kWh).',
  },
  {
    icon: '💧',
    title: 'Water Usage Estimation',
    content:
      'Water usage is estimated using an assumed water-intensity coefficient associated with data-centre operation and cooling. This varies by energy source — grid-connected data centres typically consume more cooling water than renewable-powered facilities. Formula: Water (L) = Energy (kWh) × Water Intensity (L/kWh).',
  },
  {
    icon: '₹',
    title: 'Cost Estimation',
    content:
      'Compute cost is estimated based on assumed per-GPU-hour pricing for the selected hardware in the specified region, multiplied by GPU count and runtime. Costs are approximate and do not account for spot pricing, reserved instances, or data transfer. Prices are stated in Indian Rupees (INR).',
  },
  {
    icon: '🏆',
    title: 'Sustainability Score',
    content:
      'The EcoCompute Sustainability Score (0–100) is a project-defined composite metric derived from the scenario\'s estimated energy, carbon, water, and cost impact relative to a reference baseline. Higher scores indicate a more sustainable configuration. This score is for comparative and illustrative purposes within the EcoCompute tool.',
  },
  {
    icon: '📊',
    title: 'Scenario Comparison',
    content:
      'Scenario comparison places two or more user-defined configurations side-by-side using the same calculation assumptions and baseline values. Percentage changes are computed relative to the Current / Baseline scenario. The comparison does not incorporate real-time infrastructure data.',
  },
];

export default function Methodology({ onNavigate }: Props) {
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
          Methodology & Assumptions
        </h2>
        <p style={{ fontSize: 14, color: '#4d7060', margin: 0 }}>
          How EcoCompute calculates projected environmental and economic impact.
        </p>
      </div>

      {/* Important disclaimer box */}
      <div
        style={{
          background: '#fff8e6',
          border: '1px solid #fcd34d',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 700,
            fontSize: 15,
            color: '#92400e',
            marginBottom: 10,
          }}
        >
          ⚠ Important: Scope and Limitations
        </div>
        <div style={{ background: '#e8f5ee', border: '1px solid #a7f3d0', borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#166534', fontSize: 13.5, lineHeight: 1.6 }}>
          The connected planner uses the active backend dataset and returns its dataset version,
          provenance status, assumptions, and warnings with every estimate. Illustrative records
          are clearly marked and are not verified production environmental factors.
        </div>
        <p style={{ fontSize: 14, color: '#92400e', margin: '0 0 10px', lineHeight: 1.6 }}>
          <strong>EcoCompute provides estimated scenario values based on stated assumptions.
          These are not live measurements.</strong>
        </p>
        <p style={{ fontSize: 13.5, color: '#78350f', margin: 0, lineHeight: 1.6 }}>
          EcoCompute does not claim to provide real-time environmental monitoring, live data
          from data centres, trained ML predictions, actual hardware measurements, or
          guaranteed savings. All projections depend on the assumptions documented on this page
          and should be treated as indicative estimates for planning and comparison purposes.
        </p>
      </div>

      {/* Methodology sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        {SECTIONS.map((s) => (
          <div
            key={s.title}
            style={{
              background: '#ffffff',
              border: '1px solid #dde8e2',
              borderRadius: 12,
              padding: '22px 24px',
              display: 'flex',
              gap: 18,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#e8f5ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#0f2318',
                  marginBottom: 8,
                }}
              >
                {s.title}
              </div>
              <p style={{ fontSize: 13.5, color: '#4d7060', margin: 0, lineHeight: 1.65 }}>
                {s.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Assumptions table */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dde8e2',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: '#f7faf8',
            borderBottom: '1px solid #dde8e2',
            padding: '14px 24px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: '#0f2318',
          }}
        >
          Key Assumed Values (Demo Scenario)
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7faf8' }}>
              {['Parameter', 'Value', 'Notes'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 20px',
                    textAlign: 'left',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#4d7060',
                    fontFamily: 'DM Sans, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['GPU TDP (A100)', '~400W', 'Typical peak draw; actual varies with workload'],
              ['GPU TDP (T4)', '~70W', 'Lower TDP GPU for inference workloads'],
              ['Grid carbon intensity (Mumbai)', '~0.82 kg CO₂e/kWh', 'Indian national grid average approximation'],
              ['Renewable carbon intensity', '~0.02 kg CO₂e/kWh', 'Conservative renewable generation estimate'],
              ['Water intensity (Grid)', '~1.8 L/kWh', 'Typical data-centre cooling coefficient'],
              ['Water intensity (Renewable)', '~0.36 L/kWh', 'Lower water usage for renewable-powered facilities'],
              ['Cost per GPU-hour (A100)', '~₹80/h', 'Indicative on-demand cloud pricing for India region'],
              ['Cost per GPU-hour (T4)', '~₹42/h', 'Indicative on-demand cloud pricing for India region'],
            ].map(([p, v, n], i, arr) => (
              <tr
                key={p}
                style={{
                  borderBottom: i < arr.length - 1 ? '1px solid #f0f4f1' : 'none',
                }}
              >
                <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 500, color: '#0f2318' }}>{p}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, fontFamily: 'monospace', color: '#1a7a4a', fontWeight: 600 }}>{v}</td>
                <td style={{ padding: '12px 20px', fontSize: 12.5, color: '#6b9e85' }}>{n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 12, color: '#6b9e85', lineHeight: 1.6, marginBottom: 24 }}>
        This tool was developed as a B.Tech FSDL mini-project. Values and coefficients are
        illustrative estimates for academic demonstration purposes. They do not constitute
        professional environmental consulting advice.
      </div>

      <button
        onClick={() => onNavigate('dashboard')}
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
        ← Back to Dashboard
      </button>
    </div>
  );
}
