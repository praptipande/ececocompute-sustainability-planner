import { useState } from 'react';
import { Page } from '../data/scenarios';
import { useScenarios } from '../context/ScenarioContext';
import type { WorkloadInput } from '../lib/api';

interface Props {
  onNavigate: (p: Page) => void;
}

const GPU_OPTIONS = ['NVIDIA A100', 'NVIDIA V100', 'NVIDIA T4', 'NVIDIA H100', 'AMD MI250X'];
const WORKLOAD_OPTIONS = [
  'Image Classification',
  'Natural Language Processing',
  'Object Detection',
  'Generative AI (LLM)',
  'Recommendation System',
];
const LOCATION_OPTIONS = [
  'Mumbai, India',
  'Bangalore, India',
  'Delhi, India',
  'Singapore',
  'US East',
  'Europe West',
];
const ENERGY_OPTIONS = ['Grid', 'Renewable', 'Mixed'];
const PERFORMANCE_OPTIONS = ['Standard', 'High', 'Maximum'];
const OBJECTIVE_OPTIONS = ['Minimum Carbon', 'Minimum Energy', 'Minimum Cost', 'Balanced'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: '#4d7060',
          fontFamily: 'DM Sans, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #dde8e2',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  color: '#0f2318',
  background: '#ffffff',
  outline: 'none',
  width: '100%',
};

export default function Planner({ onNavigate }: Props) {
  const { create } = useScenarios();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    scenarioName: 'Train an image classification model',
    workload: 'Image Classification',
    gpu: 'NVIDIA A100',
    gpuCount: '8',
    runtime: '20',
    utilization: '80',
    location: 'Mumbai, India',
    energySource: 'Grid',
    performance: 'Standard',
    objective: 'Minimum Carbon',
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    const input: WorkloadInput = {
      scenarioName: form.scenarioName.trim(),
      workloadType: {
        'Image Classification': 'image-classification',
        'Natural Language Processing': 'natural-language-processing',
        'Object Detection': 'object-detection',
        'Generative AI (LLM)': 'generative-ai-llm',
        'Recommendation System': 'recommendation-system',
      }[form.workload] as WorkloadInput['workloadType'],
      gpuType: form.gpu.replace(/^NVIDIA |^AMD /, ''),
      gpuCount: Number(form.gpuCount),
      runtimeHours: Number(form.runtime),
      utilizationPercent: Number(form.utilization),
      location: form.location,
      energySource: form.energySource.toLowerCase() as WorkloadInput['energySource'],
      performanceTarget: form.performance.toLowerCase() as WorkloadInput['performanceTarget'],
      optimizationObjective: {
        'Minimum Carbon': 'minimum-carbon',
        'Minimum Energy': 'minimum-energy',
        'Minimum Cost': 'minimum-cost',
        Balanced: 'balanced',
      }[form.objective] as WorkloadInput['optimizationObjective'],
    };
    setError(null);
    setSubmitting(true);
    try {
      await create(input);
      onNavigate('analysis');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to calculate this scenario.');
    } finally {
      setSubmitting(false);
    }
  }

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
          Scenario Planner
        </h2>
        <p style={{ fontSize: 14, color: '#4d7060', margin: 0 }}>
          Configure your AI/ML compute workload to estimate its environmental and economic
          footprint.
        </p>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dde8e2',
          borderRadius: 16,
          padding: '32px',
        }}
      >
        {/* Section: Scenario */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#1a7a4a',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#1a7a4a',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              1
            </div>
            Scenario Details
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
            }}
          >
            <Field label="Scenario Name">
              <input
                style={inputStyle}
                value={form.scenarioName}
                onChange={(e) => set('scenarioName', e.target.value)}
              />
            </Field>
            <Field label="AI Workload / Model">
              <select
                style={inputStyle}
                value={form.workload}
                onChange={(e) => set('workload', e.target.value)}
              >
                {WORKLOAD_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div style={{ height: 1, background: '#dde8e2', marginBottom: 28 }} />

        {/* Section: Hardware */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#1a7a4a',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#1a7a4a',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              2
            </div>
            Hardware Configuration
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 20,
            }}
          >
            <Field label="GPU / CPU Type">
              <select
                style={inputStyle}
                value={form.gpu}
                onChange={(e) => set('gpu', e.target.value)}
              >
                {GPU_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Number of GPUs">
              <input
                type="number"
                style={inputStyle}
                value={form.gpuCount}
                min={1}
                max={256}
                onChange={(e) => set('gpuCount', e.target.value)}
              />
            </Field>
            <Field label="Runtime (hours)">
              <input
                type="number"
                style={inputStyle}
                value={form.runtime}
                min={1}
                onChange={(e) => set('runtime', e.target.value)}
              />
            </Field>
            <Field label="Utilization (%)">
              <input
                type="number"
                style={inputStyle}
                value={form.utilization}
                min={1}
                max={100}
                onChange={(e) => set('utilization', e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div style={{ height: 1, background: '#dde8e2', marginBottom: 28 }} />

        {/* Section: Environment */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#1a7a4a',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#1a7a4a',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              3
            </div>
            Infrastructure & Environment
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 20,
            }}
          >
            <Field label="Data-Center Location">
              <select
                style={inputStyle}
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
              >
                {LOCATION_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Energy Source">
              <select
                style={inputStyle}
                value={form.energySource}
                onChange={(e) => set('energySource', e.target.value)}
              >
                {ENERGY_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div style={{ height: 1, background: '#dde8e2', marginBottom: 28 }} />

        {/* Section: Objectives */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#1a7a4a',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#1a7a4a',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              4
            </div>
            Optimization Objectives
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
            }}
          >
            <Field label="Performance Target">
              <select
                style={inputStyle}
                value={form.performance}
                onChange={(e) => set('performance', e.target.value)}
              >
                {PERFORMANCE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Optimization Objective">
              <select
                style={inputStyle}
                value={form.objective}
                onChange={(e) => set('objective', e.target.value)}
              >
                {OBJECTIVE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            paddingTop: 8,
          }}
        >
          <p style={{ fontSize: 12, color: '#6b9e85', margin: 0 }}>
            Estimates are calculated by the backend from the active reference dataset.
          </p>
          {error && <div role="alert" style={{ color: '#b91c1c', background: '#fef2f2', padding: 10, borderRadius: 8, fontSize: 12 }}>{error}</div>}
          <button
            onClick={() => void submit()}
            disabled={submitting}
            style={{
              background: '#1a7a4a',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '13px 32px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {submitting ? 'Calculating…' : 'Analyse Scenario →'}
          </button>
        </div>
      </div>
    </div>
  );
}
