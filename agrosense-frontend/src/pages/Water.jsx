import { Bot, Droplets } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, safeGet } from '../api/client.js';
import CarbonSavingsCounter from '../components/CarbonSavingsCounter.jsx';
import DroughtRiskGauge from '../components/DroughtRiskGauge.jsx';
import { WaterBarChart } from '../components/SensorChart.jsx';
import WaterSavingsWidget from '../components/WaterSavingsWidget.jsx';

const fallback = { total_liters_saved_30d: 12480, carbon_kg_saved_30d: 6.24, efficiency_percent: 41.8, sessions_count: 12, daily_usage: [] };

export default function Water() {
  const [summary, setSummary] = useState(fallback);
  const [crop, setCrop] = useState('Millet');
  const [advice, setAdvice] = useState(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState('');

  useEffect(() => { safeGet('/api/water/summary', fallback).then(setSummary); }, []);

  async function askAdvice() {
    setAdviceLoading(true); setAdviceError('');
    try {
      const { data } = await api.post('/api/ai/water-advice', { crop_type: crop, land_size_acres: 2.5, sensor_data: {}, weather_data: {} });
      setAdvice(data);
    } catch {
      setAdviceError('Could not get AI advice. Check Gemini API key in backend .env');
    } finally { setAdviceLoading(false); }
  }

  const daily = summary.daily_usage?.length ? summary.daily_usage
    : Array.from({ length: 14 }, (_, i) => ({ date: `D${i + 1}`, liters_used: 260 + i * 12, liters_saved: 430 + i * 9 }));

  return (
    <div className="page space-y-5">
      <div className="hero-banner" style={{ padding: '24px 28px', display: 'grid', gap: 24, alignItems: 'center', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,.9fr)' }}>
        <div>
          <div className="label" style={{ marginBottom: 10 }}>Water Resource Management</div>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            <WaterSavingsWidget value={summary.total_liters_saved_30d} /> Liters Saved
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Compared with traditional flood irrigation across the last 30 days.</p>
        </div>
        <div style={{ height: 180, width: '100%', borderRadius: 10, border: '1px solid var(--border-strong)', background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>💧</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-primary-dark)', marginTop: 8 }}>Smart Irrigation Field</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <CarbonSavingsCounter value={summary.carbon_kg_saved_30d} />
        <div className="card card-green" style={{ padding: '20px 22px' }}>
          <div className="label" style={{ marginBottom: 10 }}>Efficiency Score</div>
          <DroughtRiskGauge score={summary.efficiency_percent} />
        </div>
        <div className="card card-water" style={{ padding: '20px 22px' }}>
          <Droplets color="var(--accent-water)" size={22} />
          <div className="value" style={{ fontSize: 36, color: 'var(--accent-water)', marginTop: 12 }}>{summary.sessions_count || 12}</div>
          <div className="label" style={{ marginTop: 4 }}>Smart irrigation sessions</div>
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Daily Usage - Smart vs Traditional</h2>
        <WaterBarChart data={daily} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="card card-water" style={{ padding: '18px 20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>AI Water Advice</h2>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Crop type</label>
          <select className="input" value={crop} onChange={e => setCrop(e.target.value)}>
            <option>Millet</option><option>Tomato</option><option>Rice</option><option>Pigeon pea</option>
          </select>
          {adviceError && <p style={{ fontSize: 12, color: 'var(--accent-danger)', margin: '8px 0 0' }}>{adviceError}</p>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={askAdvice} disabled={adviceLoading}>
            <Bot size={16} /> {adviceLoading ? 'Generating...' : 'Generate Plan'}
          </button>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>Smart Irrigation Tips</h2>
          {advice
            ? <div><p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{advice.advice}</p>
                <p className="value" style={{ fontSize: 20, color: 'var(--accent-water)', marginTop: 10 }}>{advice.estimated_daily_liters} L/day</p></div>
            : <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
                {['Irrigate at dawn', 'Check soil moisture first', 'Use rainfall forecasts', 'Monitor post-irrigation'].map(tip =>
                  <div key={tip} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>{tip}</div>)}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
