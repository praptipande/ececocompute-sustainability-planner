interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  unit: string;
  color?: string;
  change?: number; // percentage change from baseline
  note?: string;
}

export default function MetricCard({
  icon,
  label,
  value,
  unit,
  color = '#1a7a4a',
  change,
  note,
}: MetricCardProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #dde8e2',
        borderRadius: 12,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        {change !== undefined && (
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              padding: '3px 7px',
              borderRadius: 20,
              background: change < 0 ? '#e8f5ee' : '#fef3c7',
              color: change < 0 ? '#15803d' : '#92400e',
            }}
          >
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div>
        <div
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 700,
            fontSize: 26,
            color,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 12, color: '#4d7060', marginTop: 2 }}>{unit}</div>
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#0f2318',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {label}
      </div>
      {note && <div style={{ fontSize: 11, color: '#6b9e85' }}>{note}</div>}
    </div>
  );
}
