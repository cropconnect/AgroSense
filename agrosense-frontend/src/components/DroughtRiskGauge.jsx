export default function DroughtRiskGauge({ score = 0 }) {
  const clamped = Math.max(0, Math.min(100, score));
  const angle = -90 + clamped * 1.8;
  const color = clamped > 65 ? '#ef5350' : clamped > 35 ? '#ffa726' : '#4caf50';
  const track = '#e8f5e9';

  return (
    <div style={{ position: 'relative', margin: '0 auto', maxWidth: 240, aspectRatio: '2/1', overflow: 'hidden' }}>
      <svg viewBox="0 0 220 120" style={{ width: '100%', height: '100%' }}>
        <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke={track} strokeWidth="16" strokeLinecap="round" />
        <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
          strokeDasharray={`${clamped * 2.83} 283`} style={{ transition: 'stroke-dasharray 0.7s ease, stroke 0.4s ease' }} />
        <line x1="110" y1="110" x2="110" y2="46" stroke={color} strokeWidth="3.5" strokeLinecap="round"
          style={{ transform: `rotate(${angle}deg)`, transformOrigin: '110px 110px', transition: 'transform .65s ease' }} />
        <circle cx="110" cy="110" r="6" fill={color} />
      </svg>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
        <div className="value" style={{ fontSize: 36, color: 'var(--text-primary)' }}>{clamped}</div>
        <div className="label" style={{ marginTop: 2 }}>Drought Risk Index</div>
      </div>
    </div>
  );
}
