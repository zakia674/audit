import { PieChart, Pie, Cell, Label, ResponsiveContainer } from 'recharts';

const COLORS = {
  conformes:     '#22c55e',
  partiels:      '#f97316',
  non_conformes: '#ef4444',
  vide:          '#d1d5db',
};

const LEGEND = [
  { key: 'conformes',     label: 'Conformes',     color: COLORS.conformes },
  { key: 'partiels',      label: 'Partiels',       color: COLORS.partiels },
  { key: 'non_conformes', label: 'Non conformes',  color: COLORS.non_conformes },
];

export default function DonutConformite({ data }) {
  const { conformes = 0, partiels = 0, non_conformes = 0, score = 0 } = data || {};
  const total = conformes + partiels + non_conformes;

  const chartData = total === 0
    ? [{ name: 'vide', value: 1 }]
    : [
        { name: 'conformes',     value: conformes },
        { name: 'partiels',      value: partiels },
        { name: 'non_conformes', value: non_conformes },
      ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            strokeWidth={2}
          >
            {total === 0
              ? <Cell fill={COLORS.vide} stroke={COLORS.vide} />
              : chartData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} stroke={COLORS[entry.name]} />
                ))
            }
            <Label
              value={`${Math.round(score)}%`}
              position="center"
              style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: '1.6rem',
                fontWeight: 700,
                fill: 'var(--primary)',
              }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Légende */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {LEGEND.map(({ key, label, color }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            {label}
            {total > 0 && (
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                ({data[key]})
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
