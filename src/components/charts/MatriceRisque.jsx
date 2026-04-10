import { getColumn } from '../../utils/dashboardStats';

// Gravités du bas vers le haut
const GRAVITES = ['faible', 'moyen', 'eleve', 'critique'];
const GRAVITE_LABELS = { faible: 'Faible', moyen: 'Moyen', eleve: 'Élevé', critique: 'Critique' };

// Couleurs de fond des cellules : dégradé vert → rouge selon (ligne, colonne)
// ligne 0 = faible (bas), ligne 3 = critique (haut)
// col 0 = peu d'incidents, col 3 = beaucoup
const CELL_COLORS = [
  ['#4ade80', '#a3e635', '#facc15', '#fb923c'], // faible
  ['#a3e635', '#facc15', '#fb923c', '#f87171'], // moyen
  ['#facc15', '#fb923c', '#f87171', '#ef4444'], // élevé
  ['#fb923c', '#f87171', '#ef4444', '#b91c1c'], // critique
];

export default function MatriceRisque({ data }) {
  // Construire un map gravite → { count, col }
  const incidentMap = {};
  (data || []).forEach(({ gravite, count }) => {
    incidentMap[gravite] = { count, col: getColumn(count) };
  });

  const COL_LABELS = ['0', '1–2', '3–5', '6+'];

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', minWidth: 340 }}>
        {/* Axe Y — labels gravité */}
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4, paddingTop: 28 }}>
          {GRAVITES.map(g => (
            <div key={g} style={{
              height: 52, display: 'flex', alignItems: 'center',
              fontSize: '0.72rem', color: 'var(--muted)', width: 52, justifyContent: 'flex-end',
              paddingRight: 6, fontWeight: 600,
            }}>
              {GRAVITE_LABELS[g]}
            </div>
          ))}
        </div>

        {/* Grille */}
        <div style={{ flex: 1 }}>
          {/* En-têtes colonnes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 4 }}>
            {COL_LABELS.map(l => (
              <div key={l} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--muted)' }}>{l}</div>
            ))}
          </div>

          {/* Lignes (du haut = critique, vers le bas = faible) */}
          {[...GRAVITES].reverse().map((gravite, rowIdx) => {
            const realRow = 3 - rowIdx; // index pour CELL_COLORS (0=faible, 3=critique)
            const incident = incidentMap[gravite];
            return (
              <div key={gravite} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 4 }}>
                {[0, 1, 2, 3].map(col => {
                  const isActive = incident && incident.col === col;
                  return (
                    <div
                      key={col}
                      title={isActive ? `${GRAVITE_LABELS[gravite]} — ${incident.count} incident(s)` : ''}
                      style={{
                        height: 52,
                        background: CELL_COLORS[realRow][col],
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isActive ? 'default' : 'default',
                        border: isActive ? '2px solid rgba(0,0,0,0.2)' : '2px solid transparent',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      {isActive && (
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}>
                          {incident.count}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Axe X label */}
          <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>
            Nombre d&apos;incidents
          </div>
        </div>
      </div>
    </div>
  );
}
