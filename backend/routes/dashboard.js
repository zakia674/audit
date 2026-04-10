const router = require('express').Router();
const db = require('../db');

const THEMES = ['Organisationnel', 'Humain', 'Physique', 'Technologique'];

function computeScore(conformes, partiels, non_conformes) {
  const total = conformes + partiels + non_conformes;
  if (total === 0) return 0;
  return Math.round(((conformes + partiels * 0.5) / total) * 100 * 10) / 10;
}

function buildParTheme(rows) {
  return THEMES.map(theme => {
    const row = rows.find(r => r.theme === theme);
    if (!row) return { theme, score: 0 };
    const c = parseInt(row.conformes) || 0;
    const p = parseInt(row.partiels) || 0;
    const n = parseInt(row.non_conformes) || 0;
    return { theme, score: Math.round(computeScore(c, p, n)) };
  });
}

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [q1, q2, q3, q4] = await Promise.all([
      // conformite_globale
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE statut = 'conforme')     AS conformes,
          COUNT(*) FILTER (WHERE statut = 'partiel')      AS partiels,
          COUNT(*) FILTER (WHERE statut = 'non_conforme') AS non_conformes
        FROM evaluations
        WHERE statut IN ('conforme', 'partiel', 'non_conforme')
      `),
      // par_theme
      db.query(`
        SELECT
          c.theme,
          COUNT(*) FILTER (WHERE e.statut = 'conforme')     AS conformes,
          COUNT(*) FILTER (WHERE e.statut = 'partiel')      AS partiels,
          COUNT(*) FILTER (WHERE e.statut = 'non_conforme') AS non_conformes
        FROM evaluations e
        JOIN controles_iso c ON c.id = e.controle_id
        WHERE e.statut IN ('conforme', 'partiel', 'non_conforme')
        GROUP BY c.theme
      `),
      // incidents_par_gravite
      db.query(`
        SELECT gravite, COUNT(*) AS count
        FROM incidents
        WHERE gravite IS NOT NULL
        GROUP BY gravite
      `),
      // missions_par_mois
      db.query(`
        SELECT TO_CHAR(date_creation, 'YYYY-MM') AS mois, COUNT(*) AS count
        FROM missions
        GROUP BY mois
        ORDER BY mois ASC
      `),
    ]);

    const row = q1.rows[0];
    const conformes     = parseInt(row.conformes) || 0;
    const partiels      = parseInt(row.partiels) || 0;
    const non_conformes = parseInt(row.non_conformes) || 0;

    res.json({
      conformite_globale: {
        conformes,
        partiels,
        non_conformes,
        score: computeScore(conformes, partiels, non_conformes),
      },
      par_theme: buildParTheme(q2.rows),
      incidents_par_gravite: q3.rows.map(r => ({
        gravite: r.gravite,
        count: parseInt(r.count),
      })),
      missions_par_mois: q4.rows.map(r => ({
        mois: r.mois,
        count: parseInt(r.count),
      })),
    });
  } catch (err) {
    console.error('dashboard/stats error:', err.message, err.stack);
    res.status(500).json({ error: 'Erreur interne du serveur', detail: err.message });
  }
});

module.exports = router;
