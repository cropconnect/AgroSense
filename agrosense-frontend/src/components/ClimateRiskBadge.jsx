export default function ClimateRiskBadge({ score = 0 }) {
  const s = Number(score);
  const [cls, label] = s > 65 ? ['badge-danger', 'Critical Risk']
    : s > 45 ? ['badge-warn', 'High Risk']
    : s > 25 ? ['badge-warn', 'Moderate Risk']
    : ['badge-green', 'Low Risk'];
  return <span className={`badge ${cls}`} style={{ fontSize: 13, padding: '5px 14px' }}>{label}</span>;
}
