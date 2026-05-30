import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function SensorChart({ data = [], metric = 'soil_moisture' }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="sensorFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4caf50" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e4ede0" />
        <XAxis dataKey="recorded_at" tick={{ fill: '#7a9b7a', fontSize: 11 }} minTickGap={28} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#7a9b7a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, color: '#1a2e1a', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          cursor={{ stroke: '#c8e6c9', strokeWidth: 1 }}
        />
        <Area type="monotone" dataKey={metric} stroke="#4caf50" fill="url(#sensorFill)" strokeWidth={2.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function WaterBarChart({ data = [] }) {
  const chartData = data.map(item => ({
    ...item,
    traditional: Number(item.liters_used || 0) + Number(item.liters_saved || 0),
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e4ede0" />
        <XAxis dataKey="date" tick={{ fill: '#7a9b7a', fontSize: 11 }} minTickGap={18} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#7a9b7a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, color: '#1a2e1a', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#4d6b4d', paddingTop: 8 }} />
        <Bar dataKey="liters_used" name="Smart irrigation" fill="#4caf50" radius={[4, 4, 0, 0]} />
        <Bar dataKey="traditional" name="Traditional (est)" fill="#b0bec5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
