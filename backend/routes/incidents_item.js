const router = require('express').Router();
const db = require('../db');

// PUT /api/incidents/:id
router.put('/:id', async (req, res) => {
  const { titre, date_incident, gravite, description } = req.body;
  const { rows } = await db.query(
    `UPDATE incidents SET
       titre=COALESCE($1,titre), date_incident=COALESCE($2,date_incident),
       gravite=COALESCE($3,gravite), description=COALESCE($4,description)
     WHERE id=$5 RETURNING *`,
    [titre, date_incident, gravite, description, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'introuvable' });
  res.json(rows[0]);
});

// DELETE /api/incidents/:id
router.delete('/:id', async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM incidents WHERE id=$1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'introuvable' });
  res.json({ ok: true });
});

module.exports = router;
