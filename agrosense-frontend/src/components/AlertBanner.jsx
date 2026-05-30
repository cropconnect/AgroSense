import { Link } from 'react-router-dom';

export default function AlertBanner({ count = 0 }) {
  if (!count) return null;
  return (
    <div style={{ background: 'var(--accent-danger-tint)', border: '1px solid #ffcdd2', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#c62828' }}>
      ⚠️ {count} unacknowledged climate alert{count > 1 ? 's' : ''} -{' '}
      <Link to="/alerts" style={{ color: '#c62828', textDecoration: 'underline' }}>View and acknowledge</Link>
    </div>
  );
}
