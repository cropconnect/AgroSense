import { Bell, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, safeGet } from '../api/client.js';
import AlertBanner from '../components/AlertBanner.jsx';

export default function Alerts() {
  const [events, setEvents] = useState([]);
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ metric: 'soil_moisture', operator: '<', threshold: 25, alert_type: 'warning', message_template: '' });
  const [toast, setToast] = useState('');

  const load = () => {
    safeGet('/api/alerts/events', []).then(setEvents);
    safeGet('/api/alerts/rules', []).then(setRules);
  };
  useEffect(load, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function createRule(next = form) {
    try { await api.post('/api/alerts/rules', next); load(); showToast('Alert rule added'); }
    catch { showToast('Failed to add rule'); }
  }
  async function deleteRule(id) {
    try { await api.delete(`/api/alerts/rules/${id}`); load(); showToast('Rule deleted'); }
    catch { showToast('Failed to delete rule'); }
  }
  async function acknowledge(id) {
    try {
      await api.post(`/api/alerts/events/${id}/acknowledge`);
      setEvents(prev => prev.map(e => e.id === id ? { ...e, acknowledged: true } : e));
      showToast('Alert acknowledged');
    } catch { showToast('Failed to acknowledge'); }
  }

  return (
    <div className="page space-y-5">
      <div className="hero-banner" style={{ padding: '20px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Climate Alert Rules</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Threshold rules for soil, heat, humidity, pH and drought risk.</p>
      </div>

      {toast && <div style={{ background: 'var(--accent-primary-tint)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--accent-primary-dark)' }}>{toast}</div>}

      <AlertBanner count={events.filter(e => !e.acknowledged).length} />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card card-danger" style={{ padding: '18px 20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Recent Alert Events</h2>
          {events.length ? events.map(ev => (
            <div key={ev.id} style={{ background: ev.acknowledged ? 'var(--bg-base)' : 'var(--accent-danger-tint)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ev.severity === 'critical' ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>{ev.severity} · {ev.metric}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{ev.message}</div>
              </div>
              {!ev.acknowledged && (
                <button className="btn btn-ghost" style={{ minHeight: 30, padding: '0 10px', fontSize: 12, flexShrink: 0 }} onClick={() => acknowledge(ev.id)}>
                  ✓ Acknowledge
                </button>
              )}
            </div>
          )) : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No alert events yet.</p>}
        </div>

        <div className="card card-green" style={{ padding: '18px 20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Create Alert Rule</h2>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Metric</label>
              <select className="input" value={form.metric} onChange={e => setForm({ ...form, metric: e.target.value })}>
                <option value="soil_moisture">Soil Moisture</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="ph">pH</option>
                <option value="drought_risk_score">Drought Risk</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Operator</label>
              <select className="input" value={form.operator} onChange={e => setForm({ ...form, operator: e.target.value })}>
                <option>{'<'}</option><option>{'>'}</option><option>{'<='}</option><option>{'>='}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Threshold</label>
              <input className="input" type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Severity</label>
              <select className="input" value={form.alert_type} onChange={e => setForm({ ...form, alert_type: e.target.value })}>
                <option>warning</option><option>critical</option>
              </select>
            </div>
          </div>
          <input className="input" style={{ marginTop: 10 }} placeholder="Custom message (optional)" value={form.message_template} onChange={e => setForm({ ...form, message_template: e.target.value })} />
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => createRule()}>
            <Plus size={16} /> Add Rule
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Active Alert Rules</h2>
        {rules.map(rule => (
          <div key={rule.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{rule.metric} {rule.operator} {rule.threshold} <span style={{ color: 'var(--text-muted)' }}>({rule.alert_type})</span></span>
            <button className="btn btn-danger" style={{ minHeight: 32, padding: '0 10px' }} onClick={() => deleteRule(rule.id)}><Trash2 size={14} /></button>
          </div>
        ))}
        {!rules.length && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No rules configured.</p>}
        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[['Low Moisture Alert', { metric: 'soil_moisture', operator: '<', threshold: 25, alert_type: 'warning', message_template: 'Soil moisture too low' }],
            ['High Temp Alert', { metric: 'temperature', operator: '>', threshold: 38, alert_type: 'critical', message_template: 'Temperature critical' }],
            ['Drought Risk Alert', { metric: 'drought_risk_score', operator: '>', threshold: 70, alert_type: 'critical', message_template: 'Drought risk critical' }]
          ].map(([label, rule]) => (
            <button key={label} className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => createRule(rule)}>
              <Bell size={14} /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
