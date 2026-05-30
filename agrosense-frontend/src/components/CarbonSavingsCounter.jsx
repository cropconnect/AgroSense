import WaterSavingsWidget from './WaterSavingsWidget.jsx';

export default function CarbonSavingsCounter({ value = 0 }) {
  return (
    <div className="card card-green" style={{ padding: '20px 22px' }} title="0.0005 kg CO2 saved per liter of water conserved">
      <div className="label" style={{ marginBottom: 10 }}>Carbon Avoided</div>
      <div style={{ fontSize: 36, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <WaterSavingsWidget value={value} />
        <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>kg CO2</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '8px 0 0' }}>
        Equivalent to {Math.round(value * 4)} km not driven by car
      </p>
    </div>
  );
}
