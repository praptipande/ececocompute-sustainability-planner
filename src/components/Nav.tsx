import { NAV_ITEMS, Page } from '../data/scenarios';
import { useAuth } from '../context/AuthContext';

interface NavProps {
  current: Page;
  onNavigate: (p: Page) => void;
}

export default function Nav({ current, onNavigate }: NavProps) {
  const { user, logout } = useAuth();
  return (
    <nav
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #dde8e2',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {/* Brand */}
        <button
          onClick={() => onNavigate('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 0',
            marginRight: 32,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1a7a4a 0%, #2fb870 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2L3 7v8h4v-4h4v4h4V7L9 2z"
                fill="white"
                fillOpacity="0.9"
              />
              <circle cx="9" cy="6" r="1.5" fill="white" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 700,
                fontSize: 15,
                color: '#0f2318',
                lineHeight: 1.2,
              }}
            >
              EcoCompute
            </div>
            <div style={{ fontSize: 10, color: '#4d7060', lineHeight: 1 }}>
              AI Sustainability Planner
            </div>
          </div>
        </button>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {[...NAV_ITEMS, ...(user?.role === 'admin' ? [{ id: 'admin' as Page, label: 'Admin' }] : [])].map((item) => {
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  padding: '18px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? '2px solid #1a7a4a' : '2px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: active ? 600 : 500,
                  fontSize: 13.5,
                  color: active ? '#1a7a4a' : '#4d7060',
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Methodology link */}
        <button
          onClick={() => onNavigate('methodology')}
          style={{
            padding: '8px 14px',
            background: current === 'methodology' ? '#e8f5ee' : 'none',
            border: '1px solid #dde8e2',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: 12.5,
            color: current === 'methodology' ? '#1a7a4a' : '#4d7060',
            fontWeight: 500,
          }}
        >
          Methodology
        </button>
        <button
          onClick={logout}
          style={{ marginLeft: 10, padding: '8px 12px', background: '#f7faf8', border: '1px solid #dde8e2', borderRadius: 6, cursor: 'pointer', color: '#4d7060', fontSize: 12.5 }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
