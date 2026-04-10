import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

function getDeadlineColor(joursRestants) {
  if (joursRestants < 0)  return '#dc2626'; // dépassé
  if (joursRestants <= 7) return '#dc2626'; // rouge urgent
  if (joursRestants <= 14) return '#ea580c'; // orange
  if (joursRestants <= 30) return '#d97706'; // jaune
  return '#16a34a'; // vert
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const label = d.jours < 0
    ? `Dépassé de ${Math.abs(d.jours)}j`
    : d.jours === 0 ? "Aujourd'hui !"
    : `${d.jours} jour${d.jours > 1 ? 's' : ''} restant${d.jours > 1 ? 's' : ''}`;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6,
      padding: '8px 12px', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{d.titre}</div>
      <div style={{ color: payload[0].fill, fontWeight: 700 }}>{label}</div>
      {d.date_fin && <div style={{ color: '#9ca3af', marginTop: 2 }}>Échéance : {new Date(d.date_fin).toLocaleDateString('fr-FR')}</div>}
    </div>
  );
}

export default function DeadlineTimeline({ missions }) {
  const now = new Date();

  const data = missions
    .filter(m => m.statut === 'en_cours' && m.date_fin)
    .map(m => {
      const fin = new Date(m.date_fin);
      const jours = Math.ceil((fin - now) / (1000 * 60 * 60 * 24));
      return {
        titre: m.titre?.length > 18 ? m.titre.slice(0, 18) + '…' : (m.titre || '—'),
        jours,
        date_fin: m.date_fin,
        color: getDeadlineColor(jours),
        // valeur absolue pour la barre, min 1 pour afficher même si dépassé
        barVal: Math.abs(jours) || 1,
      };
    })
    .sort((a, b) => a.jours - b.jours);

  if (data.length === 0) {
    return (
      <div style={{
        height: 200, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--muted)', fontSize: '0.85rem', gap: 8,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Aucune deadline définie
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: '0.72rem', fill: 'var(--muted)' }}
          axisLine={false} tickLine={false}
          tickFormatter={v => `${v}j`}
        />
        <YAxis
          type="category" dataKey="titre" width={90}
          tick={{ fontSize: '0.72rem', fill: 'var(--muted)' }}
          axisLine={false} tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Bar dataKey="barVal" radius={[0, 3, 3, 0]} maxBarSize={18}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
