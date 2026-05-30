import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import SensorCard from '../components/SensorCard.jsx';
import { SensorChart } from '../components/SensorChart.jsx';
import { useSensors } from '../hooks/useSensors.js';

const metrics = [
  ['soil_moisture', 'Soil Moisture', '%', 'green'],
  ['temperature', 'Temperature', '°C', 'warn'],
  ['humidity', 'Humidity', '%', 'water'],
  ['ph', 'pH', 'pH', 'gray'],
  ['nitrogen', 'Nitrogen', 'mg/kg', 'green'],
  ['phosphorus', 'Phosphorus', 'mg/kg', 'green'],
  ['potassium', 'Potassium', 'mg/kg', 'green'],
];

function SensorsContent() {
  const { latest, history, loading } = useSensors(24);
  const [selectedMetric, setSelectedMetric] = useState('soil_moisture');

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map(([key, label, unit, tone]) => (
          <SensorCard
            key={key}
            label={label}
            value={latest?.[key]}
            unit={unit}
            tone={tone}
            loading={loading}
          />
        ))}
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>24h Sensor History</h2>
          <select className="input" style={{ maxWidth: 180 }} value={selectedMetric} onChange={e => setSelectedMetric(e.target.value)}>
            {metrics.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <SensorChart data={history} metric={selectedMetric} />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '12px 0 0' }}>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>

    </>
  );
}

export default function Sensors() {
  const [refresh, setRefresh] = useState(0);
  const forceRefresh = () => setRefresh(value => value + 1);

  useEffect(() => {
    const id = setInterval(forceRefresh, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page space-y-5">
      <div className="hero-banner" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Sensor Readings</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Live telemetry from your ESP32 field device. Auto-refreshes every 30 seconds.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="pulse-dot" /> Live
          </span>
          <button className="btn btn-ghost" onClick={forceRefresh}><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>

      <SensorsContent key={refresh} />
    </div>
  );
}
