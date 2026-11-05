import { useEffect, useState } from 'react';
import { Page } from '../data/scenarios';
import { api, type AdminDataset, type User } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Props { onNavigate: (page: Page) => void; }

export default function Admin({ onNavigate }: Props) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [datasets, setDatasets] = useState<AdminDataset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    Promise.all([
      api.dashboard(),
      api.adminUsers(),
      api.adminDatasets(),
    ]).then(([dashboard, userPage, datasetPage]) => {
      setSummary(dashboard.summary);
      setUsers(userPage.users);
      setDatasets(datasetPage.datasets);
    }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load admin data.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (user?.role !== 'admin') return <div style={{ padding: 40 }}>Administrator access required.</div>;
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
      <h2 style={{ fontFamily: 'DM Sans, sans-serif', color: '#0f2318', marginBottom: 6 }}>Admin Dashboard</h2>
      <p style={{ color: '#4d7060', fontSize: 14 }}>Read-only operational overview from the EcoCompute API.</p>
      {loading && <p style={{ color: '#4d7060' }}>Loading dashboard…</p>}
      {error && <div role="alert" style={{ background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 8 }}>{error}</div>}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, margin: '24px 0' }}>
          {[
            ['Users', summary.totalUsers],
            ['Scenarios', summary.totalScenarios],
            ['Active datasets', summary.activeDatasetRecords],
          ].map(([label, value]) => <div key={String(label)} style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, padding: 20 }}><div style={{ color: '#4d7060', fontSize: 12 }}>{String(label)}</div><strong style={{ fontSize: 25, color: '#1a7a4a' }}>{String(value)}</strong></div>)}
        </div>
      )}
      <div style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: 18, fontWeight: 700, color: '#0f2318' }}>Users</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={{ textAlign: 'left', padding: 12 }}>Name</th><th style={{ textAlign: 'left', padding: 12 }}>Email</th><th style={{ textAlign: 'left', padding: 12 }}>Role</th></tr></thead><tbody>{users.map((item) => <tr key={item.id}><td style={{ padding: 12 }}>{item.name}</td><td style={{ padding: 12 }}>{item.email}</td><td style={{ padding: 12 }}>{item.role}</td></tr>)}</tbody></table>
      </div>
      <div style={{ background: '#fff', border: '1px solid #dde8e2', borderRadius: 12, overflow: 'hidden', marginTop: 20 }}>
        <div style={{ padding: 18, fontWeight: 700, color: '#0f2318' }}>Dataset records</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={{ textAlign: 'left', padding: 12 }}>Key</th><th style={{ textAlign: 'left', padding: 12 }}>Workload</th><th style={{ textAlign: 'left', padding: 12 }}>Version</th><th style={{ textAlign: 'left', padding: 12 }}>Provenance</th></tr></thead><tbody>{datasets.map((item) => <tr key={item.datasetKey}><td style={{ padding: 12 }}>{item.datasetKey}</td><td style={{ padding: 12 }}>{item.workloadType}</td><td style={{ padding: 12 }}>{item.version}</td><td style={{ padding: 12 }}>{item.provenanceStatus}</td></tr>)}</tbody></table>
      </div>
      <button onClick={() => onNavigate('dashboard')} style={{ marginTop: 20, border: 0, background: 'none', color: '#1a7a4a', cursor: 'pointer' }}>← Back to dashboard</button>
    </div>
  );
}
