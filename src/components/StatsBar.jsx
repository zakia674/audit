function StatCard({ label, value }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      padding: '1rem 1.25rem',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    }}>
      <span style={{
        fontFamily: "'Libre Baskerville', Georgia, serif",
        fontSize: '1.8rem',
        fontWeight: 700,
        color: 'var(--primary)',
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{
        fontSize: '0.78rem',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: 'var(--muted)',
      }}>
        {label}
      </span>
    </div>
  )
}

export default function StatsBar({ total, enCours, terminees, scoreMoyen }) {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1.25rem 2.5rem',
    }}>
      <StatCard label="Total missions" value={total} />
      <StatCard label="En cours" value={enCours} />
      <StatCard label="Terminées" value={terminees} />
      <StatCard label="Score moyen" value={scoreMoyen !== null ? `${scoreMoyen}%` : '—'} />
    </div>
  )
}
