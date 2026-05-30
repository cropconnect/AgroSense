import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, safeGet } from '../api/client.js';

const FIELDS = [
  { key: 'name', label: 'Full Name', placeholder: 'Your name' },
  { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
  { key: 'state', label: 'State', placeholder: 'Maharashtra' },
  { key: 'location', label: 'Location / Village', placeholder: 'Pune district' },
  { key: 'land_size', label: 'Land Size (acres)', placeholder: '2.5', type: 'number' },
  { key: 'sensor_device_id', label: 'ESP32 Device ID', placeholder: 'agro-device-01' },
];

export default function Settings() {
  const [form, setForm] = useState({ name: '', phone: '', state: '', location: '', land_size: '', sensor_device_id: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    safeGet('/api/auth/me', null).then(data => {
      if (data) setForm(f => ({ ...f, ...data }));
    });
  }, []);

  async function save() {
    setError(''); setSaved(false);
    try {
      const { email: _email, id: _id, ...profileData } = form;
      await api.put('/api/auth/profile', profileData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError('Failed to save. Please try again.'); }
  }

  return (
    <div className="page space-y-5" style={{ maxWidth: 760 }}>
      <div className="hero-banner" style={{ padding: '20px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Account Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Update your farm profile and link your ESP32 sensor device.</p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        {error && <div style={{ background: 'var(--accent-danger-tint)', border: '1px solid #ffcdd2', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c62828', marginBottom: 16 }}>{error}</div>}
        {saved && <div style={{ background: 'var(--accent-primary-tint)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent-primary-dark)', fontWeight: 600, marginBottom: 16 }}>✓ Profile saved</div>}
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
              <input className="input" type={type || 'text'} placeholder={placeholder} value={form[key] || ''}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary" onClick={save}><Save size={16} /> Save Profile</button>
        </div>
      </div>
    </div>
  );
}
