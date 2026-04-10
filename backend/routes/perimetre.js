const router = require('express').Router();
const db = require('../db');

// POST /api/missions/:id/perimetre
router.post('/:id/perimetre', async (req, res) => {
  const { id } = req.params;
  const { controle_ids } = req.body;
  if (!Array.isArray(controle_ids)) return res.status(400).json({ error: 'controle_ids requis' });

  await db.query('DELETE FROM perimetres WHERE mission_id=$1', [id]);
  for (const cid of controle_ids) {
    await db.query(
      'INSERT INTO perimetres (mission_id, controle_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [id, cid]
    );
  }
  res.json({ mission_id: Number(id), controle_ids });
});

// GET /api/missions/:id/perimetre
router.get('/:id/perimetre', async (req, res) => {
  const { rows } = await db.query(`
    SELECT c.*, e.id AS eval_id, e.statut, e.maturite, e.justification, e.risque, e.recommandation
    FROM perimetres p
    JOIN controles_iso c ON c.id = p.controle_id
    LEFT JOIN evaluations e ON e.controle_id = c.id AND e.mission_id = $1
    WHERE p.mission_id = $1
    ORDER BY c.id
  `, [req.params.id]);
  res.json(rows);
});

// DELETE /api/missions/:id/perimetre/:controle_id
router.delete('/:id/perimetre/:controle_id', async (req, res) => {
  const { rowCount } = await db.query(
    'DELETE FROM perimetres WHERE mission_id=$1 AND controle_id=$2',
    [req.params.id, req.params.controle_id]
  );
  if (!rowCount) return res.status(404).json({ error: 'introuvable' });
  res.json({ ok: true });
});

module.exports = router;
