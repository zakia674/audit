const router = require('express').Router();
const db = require('../db');

// GET /api/missions/:id/rapport
router.get('/:id/rapport', async (req, res) => {
  const { id } = req.params;

  // Vérifier la mission
  const mRes = await db.query('SELECT * FROM missions WHERE id=$1', [id]);
  if (!mRes.rows.length) return res.status(404).json({ error: 'mission introuvable' });

  // Évaluations du périmètre
  const { rows: evals } = await db.query(
    'SELECT statut FROM evaluations WHERE mission_id=$1', [id]
  );

  // Périmètre total (dénominateur = tous les contrôles sélectionnés)
  const { rows: periRows } = await db.query(
    'SELECT COUNT(*) as n FROM perimetres WHERE mission_id=$1', [id]
  );
  const totalPerimetre = parseInt(periRows[0].n) || evals.length;

  const total            = totalPerimetre;
  const nb_conformes     = evals.filter(e => e.statut === 'conforme').length;
  const nb_non_conformes = evals.filter(e => e.statut === 'non_conforme').length;
  const nb_partiels      = evals.filter(e => e.statut === 'partiel').length;
  // Les contrôles non ouverts comptent comme non_evalue (0 points)
  const score_global = total > 0
    ? ((nb_conformes + nb_partiels * 0.5) / total) * 100
    : 0;

  const recommandation_finale =
    score_global >= 80 ? "Niveau de conformité satisfaisant. Maintenir les contrôles en place." :
    score_global >= 50 ? "Niveau partiel. Un plan d'action ciblé est recommandé." :
                         "Niveau insuffisant. Un plan d'action urgent sur 3 mois est indispensable.";

  // Upsert rapport
  await db.query(
    `INSERT INTO rapport (mission_id,score_global,nb_conformes,nb_non_conformes,nb_partiels,recommandation_finale,date_generation)
     VALUES ($1,$2,$3,$4,$5,$6,CURRENT_DATE)
     ON CONFLICT (mission_id) DO UPDATE SET
       score_global=$2, nb_conformes=$3, nb_non_conformes=$4, nb_partiels=$5,
       recommandation_finale=$6, date_generation=CURRENT_DATE`,
    [id, score_global.toFixed(2), nb_conformes, nb_non_conformes, nb_partiels, recommandation_finale]
  );

  // Détail évaluations
  const { rows: detail } = await db.query(`
    SELECT e.*, c.code_iso, c.titre AS controle_titre, c.theme
    FROM evaluations e
    JOIN controles_iso c ON c.id = e.controle_id
    WHERE e.mission_id = $1
    ORDER BY c.id
  `, [id]);

  res.json({
    mission:              mRes.rows[0],
    score_global:         parseFloat(score_global.toFixed(2)),
    total,
    nb_conformes,
    nb_non_conformes,
    nb_partiels,
    recommandation_finale,
    evaluations:          detail,
  });
});

module.exports = router;
