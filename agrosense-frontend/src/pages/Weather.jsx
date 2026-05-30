import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client.js';
import SensorCard from '../components/SensorCard.jsx';
import { useWeather } from '../hooks/useWeather.js';

function riskColor(score) {
  if (score < 30) return 'var(--accent-primary)';
  if (score <= 60) return 'var(--accent-warning)';
  return 'var(--accent-danger)';
}

function riskLabel(score) {
  if (score < 30) return 'Low';
  if (score <= 60) return 'Moderate';
  return 'High';
}

export default function Weather() {
  const hookWeather = useWeather();
  const [customWeather, setCustomWeather] = useState(null);
  const weather = customWeather ?? hookWeather;
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const score = Number(weather?.drought_risk_score || 0);

  async function fetchForecast() {
    const [lat, lon] = location.split(',').map(part => part.trim());
    if (!lat || !lon || Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) {
      setError('Enter location as lat,lon');
      return;
    }
    setError('');
    try {
      const { data } = await api.get(`/api/weather/forecast?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
      setCustomWeather(data);
    } catch {
      setError('Could not fetch forecast for that location.');
    }
  }

  return (
    <div className="page space-y-5">
      <div className="hero-banner" style={{ padding: '20px 24px', display: 'grid', gap: 16, alignItems: 'center', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,.75fr)' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Weather Forecast</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>7-day climate outlook with farming advice for your location.</p>
        </div>
        <div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="lat,lon e.g. 28.61,77.20" />
            <button className="btn btn-primary" onClick={fetchForecast}><MapPin size={16} /> Fetch Forecast</button>
          </div>
          {error && <p style={{ fontSize: 12, color: 'var(--accent-danger)', margin: '8px 0 0' }}>{error}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SensorCard label="Temperature" value={weather.current.temperature} unit="°C" tone="warn" />
        <SensorCard label="Humidity" value={weather.current.humidity} unit="%" tone="water" />
        <SensorCard label="Wind Speed" value={weather.current.wind_speed} unit="km/h" tone="gray" />
        <div className="card card-green" style={{ padding: 18 }}>
          <div className="label" style={{ marginBottom: 8 }}>Condition</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{weather.current.condition}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{weather.current.farming_advice}</div>
        </div>
      </div>

      <div className="card card-warn" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 150 }}>
            <div className="label" style={{ marginBottom: 8 }}>Drought Risk Score</div>
            <span className="value" style={{ fontSize: 28, color: 'var(--text-primary)' }}>{score}/100</span>
          </div>
          <div style={{ flex: '1 1 260px' }}>
            <div style={{ height: 10, borderRadius: 5, background: '#e4ede0', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, Math.max(0, score))}%`, height: '100%', borderRadius: 5, background: riskColor(score) }} />
            </div>
            <p style={{ fontSize: 12, color: riskColor(score), fontWeight: 700, margin: '8px 0 0' }}>{riskLabel(score)} risk</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
        {weather.daily.map(d => (
          <div key={d.date} className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{d.date?.slice(5) || d.date}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{d.condition}</div>
            <div className="value" style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 8 }}>{d.min_temp}–{d.max_temp}°C</div>
            <div style={{ fontSize: 12, color: 'var(--accent-water)', marginTop: 6 }}>{d.precipitation} mm</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5, fontStyle: 'italic' }}>{d.farming_advice}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
