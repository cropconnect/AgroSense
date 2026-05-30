import { Bot, Droplets, Power, RefreshCw, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, safeGet } from '../api/client.js';
import AlertBanner from '../components/AlertBanner.jsx';
import ClimateRiskBadge from '../components/ClimateRiskBadge.jsx';
import SensorCard from '../components/SensorCard.jsx';
import { SensorChart } from '../components/SensorChart.jsx';
import { useAlerts } from '../hooks/useAlerts.js';
import { useSensors } from '../hooks/useSensors.js';
import { useWeather } from '../hooks/useWeather.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { latest, history, loading } = useSensors();
  const weather = useWeather();
  const alerts = useAlerts();
  const [metric, setMetric] = useState('soil_moisture');
  const [waterSaved, setWaterSaved] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pumpRunning, setPumpRunning] = useState(false);
  const [pumpToast, setPumpToast] = useState('');
  const [quickMsg, setQuickMsg] = useState('');
  const [quickReply, setQuickReply] = useState('');
  const [quickSending, setQuickSending] = useState(false);
  const activeAlerts = alerts.filter(a => !a.acknowledged).length;

  useEffect(() => {
    safeGet('/api/water/summary', null).then(data => {
      if (data) setWaterSaved(data.total_liters_saved_30d);
    });
  }, []);

  async function runPump() {
    setPumpRunning(true);
    try {
      await api.post('/api/pumps/main/on', { runtime_minutes: 15 });
      setPumpToast('Pump started for 15 minutes');
      setTimeout(() => setPumpToast(''), 3000);
    } catch {
      setPumpToast('Failed to start pump');
      setTimeout(() => setPumpToast(''), 3000);
    } finally { setPumpRunning(false); }
  }

  async function quickChat() {
    const text = quickMsg.trim();
    if (!text || quickSending) return;
    setQuickMsg(''); setQuickSending(true);
    try {
      const { data } = await api.post('/api/ai/chat', {
        message: text,
        sensor_data: latest,
        weather_data: weather,
        location: 'Farm block A',
      });
      setQuickReply(data.reply);
    } catch {
      setQuickReply('AI unavailable. Check Gemini API key.');
    } finally { setQuickSending(false); }
  }

  return (
    <div key={refreshKey} className="page space-y-5">

      <AlertBanner count={activeAlerts} />

      <div className="hero-banner" style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Farm Command Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Sensor telemetry, irrigation controls, weather risk and AI - in one view.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-green"><span className="pulse-dot" style={{ width: 6, height: 6 }} /> Sensors live</span>
          <button className="btn btn-ghost" style={{ minHeight: 36, padding: '0 12px', fontSize: 13 }}
            onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SensorCard label="Soil Moisture" value={latest.soil_moisture} unit="%" tone="green" loading={loading} />
        <div className="card card-warn" style={{ padding: 18 }}>
          <div className="label" style={{ marginBottom: 10 }}>Drought Risk</div>
          <ClimateRiskBadge score={weather.drought_risk_score} />
          <div className="value" style={{ fontSize: 28, marginTop: 10 }}>{weather.drought_risk_score ?? '-'}</div>
        </div>
        <SensorCard label="Water Saved (30d)" value={waterSaved !== null ? Math.round(waterSaved).toLocaleString() : '—'} unit="L" tone="water" />
        <SensorCard label="Active Alerts" value={activeAlerts} unit="" tone={activeAlerts ? 'danger' : 'green'} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_.8fr]">
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>24h Sensor Chart</h2>
            <select className="input" style={{ maxWidth: 180, minHeight: 34, padding: '6px 32px 6px 10px', fontSize: 13 }} value={metric} onChange={e => setMetric(e.target.value)}>
              <option value="soil_moisture">Soil moisture</option>
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
            </select>
          </div>
          <SensorChart data={history} metric={metric} />
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>7-Day Forecast</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {weather.daily.slice(0, 6).map((day, i) => (
              <div key={day.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none', fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', width: 36 }}>{day.date?.slice(5)}</span>
                <span style={{ color: 'var(--text-muted)', flex: 1, textAlign: 'center' }}>{day.condition}</span>
                <span className="value" style={{ fontSize: 13, color: 'var(--accent-primary-dark)' }}>{day.max_temp}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card card-green" style={{ padding: '18px 20px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-primary-tint)', display: 'grid', placeItems: 'center', marginBottom: 12, border: '1px solid var(--border-strong)' }}>
            <Power size={18} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>Quick Pump Control</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px' }}>Main pump · tap to run 15 min cycle</p>
          {pumpToast && <p style={{ fontSize: 12, color: 'var(--accent-primary-dark)', fontWeight: 600, margin: '0 0 10px' }}>{pumpToast}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={runPump} disabled={pumpRunning}>
            {pumpRunning ? 'Starting...' : 'Run 15 min irrigation'}
          </button>
        </div>

        <div className="card card-water" style={{ padding: '18px 20px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-water-tint)', display: 'grid', placeItems: 'center', marginBottom: 12, border: '1px solid #b3e5fc' }}>
            <Bot size={18} color="var(--accent-water)" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>AI Quick Chat</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px' }}>Ask about irrigation timing, drought risk or crop advice.</p>
          {quickReply && <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px', padding: '8px 10px', background: 'var(--bg-base)', borderRadius: 6, border: '1px solid var(--border)' }}>{quickReply}</p>}
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="input" placeholder="Ask AgroSense AI..." style={{ fontSize: 13 }}
              value={quickMsg} onChange={e => setQuickMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && quickChat()} />
            <button className="btn btn-primary" style={{ minHeight: 40, padding: '0 12px' }}
              onClick={quickChat} disabled={quickSending}>
              <Send size={14} />
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-base)', display: 'grid', placeItems: 'center', marginBottom: 12, border: '1px solid var(--border)' }}>
            <Droplets size={18} color="var(--text-muted)" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>Recent Alerts</h2>
          {activeAlerts > 0
            ? <p style={{ fontSize: 13, color: 'var(--accent-danger)', fontWeight: 600 }}>{activeAlerts} unacknowledged alert{activeAlerts > 1 ? 's' : ''}</p>
            : <p style={{ fontSize: 13, color: 'var(--accent-primary)', fontWeight: 600 }}>No active alerts</p>
          }
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: 12, fontSize: 13 }}
            onClick={() => navigate('/alerts')}>
            View All Alerts →
          </button>
        </div>
      </div>
    </div>
  );
}
