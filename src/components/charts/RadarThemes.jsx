import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';

export default function RadarThemes({ par_theme, score_global }) {
  const data = [
    ...(par_theme || []),
    { theme: 'Score global', score: score_global ?? 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="theme"
          tick={{ fontSize: '0.75rem', fill: 'var(--muted)' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: '0.7rem', fill: 'var(--muted)' }}
          tickCount={5}
        />
        <Radar
          dataKey="score"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.35}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, 'Score']}
          contentStyle={{ fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: 4 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
