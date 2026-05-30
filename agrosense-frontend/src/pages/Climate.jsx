import { Bot } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import ClimateRiskBadge from '../components/ClimateRiskBadge.jsx';
import DroughtRiskGauge from '../components/DroughtRiskGauge.jsx';
import SensorCard from '../components/SensorCard.jsx';
import { SensorChart } from '../components/SensorChart.jsx';
import { useSensors } from '../hooks/useSensors.js';
import { useWeather } from '../hooks/useWeather.js';

export default function Climate() {
  const weather = useWeather();
  const { latest, history } = useSensors(168);
  const [risk, setRisk] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState('');

  async function runRisk() {
    setRiskLoading(true); setRiskError('');
    try {
      const { data } = await api.post('/api/ai/drought-risk', { sensor_data: latest, weather_data: weather, location: 'Farm block A', crop_type: 'current crop' });
      setRisk(data);
    } catch {
      setRiskError('AI analysis failed. Check Gemini API key.');
    } finally { setRiskLoading(false); }
  }

  return (
    <div className="page space-y-5">
      <div className="hero-banner" style={{ padding: '20px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Climate Monitoring & Prediction</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Forecast-aware climate risk, soil trends and AI drought assessment.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SensorCard label="Temperature" value={weather.current.temperature} unit="°C" tone="warn" />
        <SensorCard label="Humidity" value={weather.current.humidity} unit="%" tone="water" />
        <SensorCard label="Wind Speed" value={weather.current.wind_speed} unit="km/h" />
        <div className="card card-green" style={{ padding: 18 }}>
          <div className="label" style={{ marginBottom: 8 }}>Condition</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{weather.current.condition}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{weather.current.farming_advice}</div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="card card-warn" style={{ padding: '24px 20px' }}>
          <DroughtRiskGauge score={weather.drought_risk_score} />
          <div style={{ textAlign: 'center', marginTop: 14 }}><ClimateRiskBadge score={weather.drought_risk_score} /></div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>7-Day Climate Forecast</h2>
          {weather.daily.map((d, i) => (
            <div key={d.date} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 60px', gap: 8, padding: '8px 0', borderBottom: i < weather.daily.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13, alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.date}</span>
              <span style={{ color: 'var(--text-muted)' }}>{d.condition}</span>
              <span className="value" style={{ fontSize: 12 }}>{d.min_temp}–{d.max_temp}°C</span>
              <span style={{ color: 'var(--accent-water)', fontSize: 12 }}>{d.precipitation} mm</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Soil Health Trends (7 days)</h2>
        <SensorChart data={history} metric="ph" />
      </div>

      <div className="card card-gray" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: risk || riskError ? 16 : 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>AI Climate Risk Assessment</h2>
          <button className="btn btn-primary" onClick={runRisk} disabled={riskLoading}>
            <Bot size={16} /> {riskLoading ? 'Analysing...' : 'Run AI Drought Analysis'}
          </button>
        </div>
        {riskError && <p style={{ fontSize: 13, color: 'var(--accent-danger)' }}>{riskError}</p>}
        {risk && (
          <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
            <div className="value" style={{ fontSize: 20, color: 'var(--text-primary)' }}>{risk.risk_level} · {risk.risk_score}/100</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '8px 0 10px', lineHeight: 1.6 }}>{risk.explanation}</p>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {(risk.recommendations || []).map(item => <li key={item} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>

      <Link to="/alerts" className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
        Configure Climate Alerts →
      </Link>
    </div>
  );
}
