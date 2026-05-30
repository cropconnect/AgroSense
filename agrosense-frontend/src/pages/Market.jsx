import { Search } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client.js';

export default function Market() {
  const [state, setState] = useState('Maharashtra');
  const [commodity, setCommodity] = useState('Tomato');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const { data } = await api.get(`/api/market/prices?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}`);
      setRows(data);
    } catch { setError('Could not fetch prices. Check Data.gov.in API key in backend .env'); }
  }

  return (
    <div className="page space-y-5">
      <div className="hero-banner" style={{ padding: '20px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Mandi Market Prices</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Live commodity prices from government mandi data.</p>
      </div>
      <div className="card" style={{ padding: '18px 20px', display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr auto', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>State</label>
          <input className="input" value={state} placeholder="e.g. Maharashtra" onChange={e => setState(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Commodity</label>
          <input className="input" value={commodity} placeholder="e.g. Tomato" onChange={e => setCommodity(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={load}><Search size={16} /> Search</button>
      </div>
      {error && <p style={{ fontSize: 13, color: 'var(--accent-danger)' }}>{error}</p>}
      <div className="card" style={{ padding: '18px 20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 620, textAlign: 'left', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              {['Market', 'Commodity', 'Min ₹', 'Max ₹', 'Modal ₹', 'Date'].map(h =>
                <th key={h} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.market}-${i}`} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px', color: 'var(--text-primary)' }}>{row.market}</td>
                <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{row.commodity}</td>
                <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{row.min_price}</td>
                <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{row.max_price}</td>
                <td style={{ padding: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--accent-primary-dark)' }}>{row.modal_price}</td>
                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && !error && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>Enter state and commodity above, then click Search.</p>}
      </div>
    </div>
  );
}
