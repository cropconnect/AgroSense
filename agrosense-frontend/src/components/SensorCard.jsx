export default function SensorCard({ label, value, unit, tone = 'green', loading = false }) {
  const toneMap = {
    green: { cls: 'card-green', val: 'var(--accent-primary-dark)', bg: 'var(--accent-primary-tint)' },
    water: { cls: 'card-water', val: '#0277bd', bg: 'var(--accent-water-tint)' },
    warn: { cls: 'card-warn', val: '#e65100', bg: 'var(--accent-warning-tint)' },
    danger: { cls: 'card-danger', val: '#c62828', bg: 'var(--accent-danger-tint)' },
    gray: { cls: 'card-gray', val: '#424242', bg: '#f5f5f5' },
  };
  const t = toneMap[tone] || toneMap.green;

  if (loading) return (
    <div className="card" style={{ padding: 18 }}>
      <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 32, width: '70%' }} />
    </div>
  );

  return (
    <div className={`card ${t.cls}`} style={{ padding: 18 }}>
      <div className="label" style={{ marginBottom: 10 }}>{label}</div>
      <div className="value" style={{ fontSize: 30, color: t.val }}>
        {value ?? '-'}
        {unit && <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  );
}
