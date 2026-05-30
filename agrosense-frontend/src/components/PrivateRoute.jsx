import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { safeGet } from '../api/client.js';

export default function PrivateRoute({ children }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    safeGet('/api/auth/me', null).then(data => {
      setStatus(data && data.id ? 'ok' : 'unauth');
    });
  }, []);

  if (status === 'loading') return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border-strong)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', margin: '0 auto 10px', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Loading...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return status === 'ok' ? children : <Navigate to="/login" replace />;
}
