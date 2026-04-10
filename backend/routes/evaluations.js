const router = require('express').Router();
const db = require('../db');

// POST /api/missions/:id/evaluations
router.post('/:id/evaluations', async (req, res) => {
  const { controle_id, statut, maturite, justification, risque, recommandation } = req.body;
  if (!controle_id) return res.status(400).json({ error: 'controle_id requis' });
  const { rows } = await db.query(
    `INSERT INTO evaluations (mission_id,controle_id,statut,maturite,justification,risque,recommandation)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (mission_id,controle_id) DO UPDATE SET
       statut=$3, maturite=$4, justification=$5, risque=$6, recommandation=$7
     RETURNING *`,
    [req.params.id, controle_id, statut||'non_evalue', maturite??null, justification||null, risque||null, recommandation||null]
  );
  res.status(201).json(rows[0]);
});

// GET /api/missions/:id/evaluations
router.get('/:id/evaluations', async (req, res) => {
  const { rows } = await db.query(`
    SELECT e.*, c.code_iso, c.titre AS controle_titre, c.theme
    FROM evaluations e
    JOIN controles_iso c ON c.id = e.controle_id
    WHERE e.mission_id = $1
    ORDER BY e.id
  `, [req.params.id]);
  res.json(rows);
});

// PUT /api/evaluations/:id
router.put('/evaluations/:id', async (req, res) => {
  const { statut, maturite, justification, risque, recommandation } = req.body;
  const { rows } = await db.query(
    `UPDATE evaluations SET
       statut=COALESCE($1,statut), maturite=COALESCE($2,maturite),
       justification=COALESCE($3,justification), risque=COALESCE($4,risque),
       recommandation=COALESCE($5,recommandation)
     WHERE id=$6 RETURNING *`,
    [statut, maturite, justification, risque, recommandation, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'introuvable' });
  res.json(rows[0]);
});

module.exports = router;
