import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Dot,
} from 'recharts';
import { formatMois } from '../../utils/dashboardStats';

export default function CourbeProgression({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--muted)', fontSize: '0.85rem',
      }}>
        Aucune donnée disponible
      </div>
    );
  }

  const chartData = data.map(d => ({ ...d, label: formatMois(d.mois) }));
  const singlePoint = data.length === 1;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: '0.75rem', fill: 'var(--muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: '0.75rem', fill: 'var(--muted)' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          formatter={(value) => [value, 'Missions']}
          contentStyle={{ fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: 4 }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={singlePoint ? { r: 5, fill: 'var(--primary)' } : { r: 3, fill: 'var(--primary)' }}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
