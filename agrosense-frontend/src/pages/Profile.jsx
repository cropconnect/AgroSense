import { LogOut, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, safeGet } from '../api/client.js';

const fields = [
  { key: 'name', label: 'Full Name', placeholder: 'Your name' },
  { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
  { key: 'state', label: 'State', placeholder: 'Maharashtra' },
  { key: 'location', label: 'Location / Village', placeholder: 'Pune district' },
  { key: 'district', label: 'District', placeholder: 'Pune' },
  { key: 'land_size', label: 'Land Size (acres)', placeholder: '2.5', type: 'number' },
  { key: 'sensor_device_id', label: 'ESP32 Device ID', placeholder: 'agro-device-01' },
];

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', state: '', location: '', district: '', land_size: '', sensor_device_id: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const initial = (form.name || form.email || 'A').charAt(0).toUpperCase();

  useEffect(() => {
    safeGet('/api/auth/me', null).then(data => {
      if (data) setForm(current => ({ ...current, ...data }));
    });
  }, []);

  async function save() {
    setError(''); setSaved(false);
    try {
      const { email: _email, id: _id, ...profileData } = form;
      await api.put('/api/auth/profile', profileData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save. Please try again.');
    }
  }

  async function logout() {
    await api.post('/api/auth/logout');
    navigate('/');
  }

  return (
    <div className="page space-y-5" style={{ maxWidth: 760 }}>
      <div className="hero-banner" style={{ padding: '20px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>My Profile</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Manage your account, farm details and sensor device.</p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-primary-tint)', border: '2px solid var(--border-strong)', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 700, color: 'var(--accent-primary-dark)' }}>
            {initial}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{form.name || 'AgroSense User'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{form.email || 'No email available'}</div>
            <span className="badge badge-green" style={{ marginTop: 8 }}>Active account</span>
          </div>
        </div>

        {error && <div style={{ background: 'var(--accent-danger-tint)', border: '1px solid #ffcdd2', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c62828', marginBottom: 16 }}>{error}</div>}
        {saved && <div style={{ background: 'var(--accent-primary-tint)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent-primary-dark)', fontWeight: 600, marginBottom: 16 }}>Profile saved</div>}

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          {fields.map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
              <input className="input" type={type || 'text'} placeholder={placeholder} value={form[key] || ''} onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary" onClick={save}><Save size={16} /> Save Profile</button>
        </div>
      </div>

      <div className="card card-danger" style={{ padding: 24, marginTop: 8 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-danger)', margin: '0 0 12px' }}>Danger Zone</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: 'var(--text-primary)' }}>Sign out of AgroSense</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>You will be redirected to the login page.</p>
          </div>
          <button className="btn" style={{ background: 'var(--accent-danger)', color: '#fff' }} onClick={logout}><LogOut size={16} /> Logout</button>
        </div>
      </div>
    </div>
  );
}
