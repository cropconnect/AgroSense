import { Leaf } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate('/dashboard');
    } catch {
      setError('Could not create account. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'grid', placeItems: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-primary)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            <Leaf size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Create account</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Start monitoring your farm with AgroSense</p>
        </div>

        <div className="card" style={{ padding: '28px 28px' }}>
          {error && (
            <div style={{ background: 'var(--accent-danger-tint)', border: '1px solid #ffcdd2', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c62828', marginBottom: 16 }}>
              {error}
            </div>
          )}
          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Name</label>
              <input className="input" placeholder="Your name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <input className="input" type="password" placeholder="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Confirm password</label>
              <input className="input" type="password" placeholder="password" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', fontSize: 15, minHeight: 44 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
