import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, safeGet } from '../api/client.js';
import PumpToggle from '../components/PumpToggle.jsx';

export default function Pumps() {
  const [pumps, setPumps] = useState([{ pump_id: 'main', is_on: false, runtime_minutes: 0 }]);
  const [runtime, setRuntime] = useState(15);
  const [timerState, setTimerState] = useState({});
  const [toast, setToast] = useState('');
  useEffect(() => { safeGet('/api/pumps', pumps).then(setPumps); }, []);
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }
  function getTimer(pumpId) {
    return { time: timerState[pumpId]?.time || '06:00', duration: timerState[pumpId]?.duration || 30 };
  }
  function setTimer(pumpId, field, value) {
    setTimerState(prev => ({ ...prev, [pumpId]: { ...getTimer(pumpId), [field]: value } }));
  }
  async function toggle(pump) {
    const path = pump.is_on ? `/api/pumps/${pump.pump_id}/off` : `/api/pumps/${pump.pump_id}/on`;
    try {
      await api.post(path, pump.is_on ? {} : { runtime_minutes: runtime });
      setPumps((items) => items.map((item) =>
        item.pump_id === pump.pump_id ? { ...item, is_on: !pump.is_on, runtime_minutes: runtime } : item
      ));
      showToast(`Pump ${!pump.is_on ? 'started' : 'stopped'}`);
    } catch {
      showToast('Failed to control pump. Check connection.');
    }
  }
  async function addTimer(pumpId) {
    const timerKey = `timer_${Date.now()}`;
    const { time, duration } = getTimer(pumpId);
    try {
      await api.post(`/api/pumps/${pumpId}/timers`, {
        timer_key: timerKey,
        start_time: time,
        duration_minutes: duration,
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        active: true,
      });
      showToast('Timer added successfully');
    } catch {
      showToast('Failed to add timer');
    }
  }
  return (
    <div className="page space-y-5">
      <div className="hero-banner" style={{ padding: '20px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Pump Control</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Control irrigation pumps and set recurring schedules.</p>
      </div>
      {toast && <div style={{ background: 'var(--accent-primary-tint)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--accent-primary-dark)' }}>{toast}</div>}
      <div className="grid gap-5 md:grid-cols-2">
        {pumps.map((pump) => <div className="card card-green" style={{ padding: 20 }} key={pump.pump_id}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{pump.pump_id} pump</h2><span className="pulse-dot" /></div><div style={{ marginTop: 20 }}><PumpToggle active={pump.is_on} onClick={() => toggle(pump)} /></div><label className="label" style={{ display: 'block', marginTop: 20 }}>Runtime minutes</label><input className="input" style={{ marginTop: 8 }} type="number" value={runtime} onChange={(e) => setRuntime(Number(e.target.value))} /><div style={{ marginTop: 20, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}><h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>Schedule Timer</h3><div style={{ display: 'grid', gap: 10 }}><div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Start Time</label><input className="input" type="time" value={getTimer(pump.pump_id).time} onChange={e => setTimer(pump.pump_id, 'time', e.target.value)} /></div><div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Duration (minutes)</label><input className="input" type="number" value={getTimer(pump.pump_id).duration} min={1} onChange={e => setTimer(pump.pump_id, 'duration', Number(e.target.value))} /></div><button className="btn btn-primary" style={{ width: '100%' }} onClick={() => addTimer(pump.pump_id)}><Plus size={16} /> Add Timer</button></div></div></div>)}
      </div>
    </div>
  );
}
