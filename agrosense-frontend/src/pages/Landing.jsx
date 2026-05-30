import { ArrowRight, Bot, CheckCircle, CloudSun, Droplets, Leaf, RadioTower, Sprout, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { safeGet } from '../api/client.js';

export default function Landing() {
  const [latest, setLatest] = useState({ soil_moisture: null, temperature: null, humidity: null });
  useEffect(() => {
    safeGet('/api/public/sensors/latest', {}).then(data => {
      if (data) setLatest(data);
    });
  }, []);

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg, #f4f7f4 0%, #edf7ed 50%, #f1f8e9 100%)', borderBottom: '1px solid var(--border)' }}>
        <div className="page" style={{ paddingTop: 48, paddingBottom: 56 }}>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">

            <div>
              <div className="chip" style={{ marginBottom: 20 }}>
                <RadioTower size={13} /> Live climate mesh · 15 farms
              </div>
              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: '0 0 16px' }}>
                Climate & Water<br />
                <span style={{ color: 'var(--accent-primary)' }}>Intelligence</span><br />
                for Farmers
              </h1>
              <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 460, margin: '0 0 28px' }}>
                AI-powered IoT platform that monitors soil, predicts drought, and conserves water - saving up to 40% irrigation compared to traditional methods.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                <Link to="/signup" className="btn btn-primary" style={{ fontSize: 15, padding: '0 22px', minHeight: 46 }}>
                  Get Started Free <ArrowRight size={17} />
                </Link>
                <Link to="/dashboard" className="btn btn-ghost" style={{ fontSize: 15, padding: '0 22px', minHeight: 46 }}>
                  Live Demo
                </Link>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {['No hardware subscription', 'Works with ESP32', 'Open API'].map(f => (
                  <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                    <CheckCircle size={13} color="var(--accent-primary)" /> {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: 200, background: 'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 50%, #c8e6c9 100%)', display: 'grid', placeItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 56 }}>🌱</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-primary-dark)', marginTop: 8 }}>Live Farm Intelligence</div>
                </div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Live Sensor Data</span>
                  <span className="badge badge-green"><span className="pulse-dot" style={{ width: 6, height: 6 }} /> Live</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    ['Soil', latest.soil_moisture ?? '-', '%', 'card-green'],
                    ['Temp', latest.temperature ?? '-', 'C', 'card-warn'],
                    ['Humidity', latest.humidity ?? '-', '%', 'card-water'],
                  ].map(([label, val, unit, cls]) => (
                    <div key={label} className={`card ${cls}`} style={{ padding: '12px 14px' }}>
                      <div className="label" style={{ marginBottom: 6 }}>{label}</div>
                      <div className="value" style={{ fontSize: 22, color: 'var(--text-primary)' }}>
                        {val}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 2 }}>{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="page" style={{ paddingTop: 40 }}>
        <p className="label" style={{ textAlign: 'center', marginBottom: 28 }}>What AgroSense does</p>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [Droplets, 'Water Conservation', 'Smart sensor-triggered irrigation saves up to 40% water vs flood irrigation. Track every liter saved.', 'card-water', 'var(--accent-water)'],
            [CloudSun, 'Climate Monitoring', 'Real-time soil, temperature, humidity and 7-day weather tracking with farming-specific advice.', 'card-green', 'var(--accent-primary)'],
            [Bot, 'AI Advisor', 'Gemini AI gives crop recommendations, drought risk scores and irrigation plans based on your live data.', 'card-gray', '#757575'],
          ].map(([Icon, title, text, cls, iconColor]) => (
            <div key={title} className={`card ${cls}`} style={{ padding: '24px 20px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-base)', display: 'grid', placeItems: 'center', marginBottom: 14, border: '1px solid var(--border)' }}>
                <Icon size={20} color={iconColor} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 8px' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page" style={{ paddingTop: 0 }}>
        <div style={{ background: 'var(--accent-primary)', borderRadius: 14, padding: '28px 32px' }}>
          <div className="grid gap-4 text-center md:grid-cols-3">
            {[['2,400 L', 'Water saved today', TrendingDown], ['15', 'Farms monitored', Sprout], ['0.8 kg', 'CO2 avoided today', Leaf]].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>{val}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 4, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page" style={{ paddingTop: 0 }}>
        <p className="label" style={{ textAlign: 'center', marginBottom: 28 }}>How it works</p>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['01', 'Connect ESP32', 'Mount your soil moisture, temperature and humidity sensors. Register your device ID in AgroSense settings.'],
            ['02', 'Monitor in real time', 'Live sensor dashboard shows telemetry, weather forecasts, drought risk score and pump status.'],
            ['03', 'Act on AI advice', 'AgroSense AI reads your live data and tells you exactly when to irrigate, which crops to plant, and how to save water.'],
          ].map(([num, title, text]) => (
            <div key={num} className="card" style={{ padding: '22px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-primary-soft)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>{num}</div>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 8px' }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>AgroSense - Climate & Water Intelligence Platform · Built for sustainable farming</p>
      </footer>
    </>
  );
}
