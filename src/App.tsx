import { useState } from 'react';
import { Page } from './data/scenarios';
import Nav from './components/Nav';
import Dashboard from './pages/Dashboard';
import Planner from './pages/Planner';
import Analysis from './pages/Analysis';
import WhatIf from './pages/WhatIf';
import Compare from './pages/Compare';
import Optimize from './pages/Optimize';
import Recommendation from './pages/Recommendation';
import Methodology from './pages/Methodology';
import AuthScreen from './components/AuthScreen';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScenarioProvider } from './context/ScenarioContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');

  function navigate(p: Page) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f0f4f1', color: '#4d7060' }}>Loading session…</div>;
  if (!user) return <AuthScreen />;
  const currentUser = user;

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'planner':
        return <Planner onNavigate={navigate} />;
      case 'analysis':
        return <Analysis onNavigate={navigate} />;
      case 'whatif':
        return <WhatIf onNavigate={navigate} />;
      case 'compare':
        return <Compare onNavigate={navigate} />;
      case 'optimize':
        return <Optimize onNavigate={navigate} />;
      case 'recommendation':
        return <Recommendation onNavigate={navigate} />;
      case 'methodology':
        return <Methodology onNavigate={navigate} />;
      case 'admin':
        return currentUser.role === 'admin' ? <Admin onNavigate={navigate} /> : <Dashboard onNavigate={navigate} />;
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f1' }}>
      <Nav current={page} onNavigate={navigate} />
      <main>{renderPage()}</main>
      <footer
        style={{
          borderTop: '1px solid #dde8e2',
          background: '#ffffff',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 12, color: '#4d7060' }}>
          © 2024 EcoCompute — AI Compute Sustainability Planner · B.Tech FSDL Mini-Project
        </div>
        <div style={{ fontSize: 12, color: '#6b9e85' }}>
          All values are scenario estimates based on stated assumptions · Not live measurements
        </div>
        <button
          onClick={() => navigate('methodology')}
          style={{
            fontSize: 12,
            color: '#1a7a4a',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Methodology & Assumptions
        </button>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ScenarioProvider>
        <AppContent />
      </ScenarioProvider>
    </AuthProvider>
  );
}
