import DonutConformite from './DonutConformite';
import BarresThemes from './BarresThemes';
import RadarThemes from './RadarThemes';
import MatriceRisque from './MatriceRisque';
import CourbeProgression from './CourbeProgression';
import DeadlineTimeline from './DeadlineTimeline';

function ChartCard({ title, children, fullWidth }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '1.25rem',
      gridColumn: fullWidth ? '1 / -1' : undefined,
    }}>
      {title && (
        <div style={{
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: 'var(--muted)',
          marginBottom: '1rem',
          fontWeight: 600,
        }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export default function AnalyticsSection({ stats, loading, error, missions }) {
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
        Chargement des statistiques…
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{
        padding: '0.75rem 1rem',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 4,
        color: '#dc2626',
        fontSize: '0.82rem',
        marginBottom: '1rem',
      }}>
        ⚠ Statistiques analytiques indisponibles — {error || 'erreur inconnue'}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1.5rem',
    }}>
      {/* Ligne 1 : Donut + Barres */}
      <ChartCard title="Conformité globale">
        <DonutConformite data={stats.conformite_globale} />
      </ChartCard>

      <ChartCard title="Score par thème ISO 27002">
        <BarresThemes data={stats.par_theme} />
      </ChartCard>

      {/* Ligne 2 : Radar + Matrice côte à côte */}
      <ChartCard title="Radar des thèmes ISO">
        <RadarThemes
          par_theme={stats.par_theme}
          score_global={stats.conformite_globale?.score}
        />
      </ChartCard>

      <ChartCard title="Matrice de risque">
        <MatriceRisque data={stats.incidents_par_gravite} />
      </ChartCard>

      {/* Ligne 3 : Courbe progression + Deadline côte à côte */}
      <ChartCard title="Progression des missions">
        <CourbeProgression data={stats.missions_par_mois} />
      </ChartCard>

      <ChartCard title="Deadlines — jours restants">
        <DeadlineTimeline missions={missions || []} />
      </ChartCard>
    </div>
  );
}
