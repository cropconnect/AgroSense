import { Activity, Bell, Bot, CloudRain, CloudSun, Droplets, Gauge, Leaf, Store, User, Waves } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const links = [
  ['/dashboard', Gauge, 'Dashboard'],
  ['/sensors', Activity, 'Sensors'],
  ['/climate', CloudSun, 'Climate'],
  ['/weather', CloudRain, 'Weather'],
  ['/water', Droplets, 'Water'],
  ['/alerts', Bell, 'Alerts'],
  ['/ai', Bot, 'AI Advisor'],
  ['/market', Store, 'Market'],
  ['/pumps', Waves, 'Pumps'],
];

export default function Navbar() {
  const { pathname } = useLocation();
  const isPublic = ['/', '/login', '/signup'].includes(pathname);

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }} className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto flex min-h-[68px] w-[min(1180px,calc(100%-32px))] flex-wrap items-center justify-between gap-3 py-2">

        <NavLink to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-primary)', display: 'grid', placeItems: 'center' }}>
            <Leaf size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Agro<span style={{ color: 'var(--accent-primary)' }}>Sense</span>
          </span>
        </NavLink>

        {!isPublic && (
          <nav className="flex flex-wrap items-center gap-1">
            {links.map(([to, Icon, label]) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.15s',
                  background: isActive ? 'var(--accent-primary-tint)' : 'transparent',
                  color: isActive ? 'var(--accent-primary-dark)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                })}
                title={label}
              >
                <Icon size={15} />
                <span className="hidden lg:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        {!isPublic && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="hidden md:flex items-center gap-2" style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--accent-primary-tint)', padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border-strong)' }}>
              <span className="pulse-dot" />
              ESP32 online
            </div>
            <NavLink to="/profile" style={{ padding: 8, borderRadius: 8, display: 'grid', placeItems: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <User size={16} />
            </NavLink>
          </div>
        )}

      </div>
    </header>
  );
}
