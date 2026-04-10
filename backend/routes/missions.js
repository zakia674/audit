const router = require('express').Router();
const db = require('../db');

// POST /api/missions
router.post('/', async (req, res) => {
  const { titre, auditeur, client, date_fin } = req.body;
  if (!titre) return res.status(400).json({ error: 'titre requis' });
  const { rows } = await db.query(
    'INSERT INTO missions (titre, auditeur, client, date_fin) VALUES ($1,$2,$3,$4) RETURNING *',
    [titre, auditeur || null, client || null, date_fin || null]
  );
  res.status(201).json(rows[0]);
});

// GET /api/missions
router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM missions ORDER BY id DESC');
  res.json(rows);
});

// GET /api/missions/:id
router.get('/:id', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM missions WHERE id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'introuvable' });
  res.json(rows[0]);
});

// PUT /api/missions/:id
router.put('/:id', async (req, res) => {
  const { titre, auditeur, client, statut, date_fin } = req.body;
  const { rows } = await db.query(
    `UPDATE missions SET
      titre    = COALESCE($1, titre),
      auditeur = COALESCE($2, auditeur),
      client   = COALESCE($3, client),
      statut   = COALESCE($4, statut),
      date_fin = $5
     WHERE id=$6 RETURNING *`,
    [titre, auditeur, client, statut, date_fin || null, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'introuvable' });
  res.json(rows[0]);
});

// DELETE /api/missions/:id
router.delete('/:id', async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM missions WHERE id=$1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'introuvable' });
  res.json({ ok: true });
});

module.exports = router;
