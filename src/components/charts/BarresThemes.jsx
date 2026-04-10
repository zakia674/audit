import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts';
import { getBarColor } from '../../utils/dashboardStats';

export default function BarresThemes({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="theme"
          width={110}
          tick={{ fontSize: '0.8rem', fill: 'var(--muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, 'Score']}
          contentStyle={{ fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: 4 }}
        />
        <Bar dataKey="score" radius={[0, 3, 3, 0]} maxBarSize={22}>
          {data.map((entry) => (
            <Cell key={entry.theme} fill={getBarColor(entry.score)} />
          ))}
          <LabelList
            dataKey="score"
            position="right"
            formatter={(v) => `${v}%`}
            style={{ fontSize: '0.8rem', fill: 'var(--muted)', fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
