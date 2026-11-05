import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8 || (mode === 'register' && name.trim().length < 2)) {
      setError(mode === 'register'
        ? 'Enter a name and a password of at least 8 characters.'
        : 'Password must contain at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name.trim(), email, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to authenticate.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 12px',
    border: '1px solid #dde8e2',
    borderRadius: 8,
    fontSize: 14,
    boxSizing: 'border-box',
    marginBottom: 12,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f1', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #dde8e2', borderRadius: 16, padding: 32 }}>
        <div style={{ color: '#1a7a4a', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>EcoCompute</div>
        <h1 style={{ color: '#0f2318', fontSize: 25, margin: '0 0 8px' }}>
          {mode === 'login' ? 'Sign in to your planner' : 'Create your planner account'}
        </h1>
        <p style={{ color: '#4d7060', fontSize: 13, marginBottom: 24 }}>
          Save scenarios and receive server-generated sustainability estimates.
        </p>
        {mode === 'register' && (
          <input aria-label="Name" placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} />
        )}
        <input aria-label="Email" type="email" required placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} style={inputStyle} />
        <input aria-label="Password" type="password" required placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} style={inputStyle} />
        {error && <div role="alert" style={{ color: '#b91c1c', background: '#fef2f2', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button disabled={submitting} style={{ width: '100%', background: '#1a7a4a', color: '#fff', border: 0, borderRadius: 9, padding: 13, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer' }}>
          {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
        </button>
        <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }} style={{ width: '100%', marginTop: 14, border: 0, background: 'none', color: '#1a7a4a', cursor: 'pointer' }}>
          {mode === 'login' ? 'Need an account? Register' : 'Already registered? Sign in'}
        </button>
      </form>
    </div>
  );
}
