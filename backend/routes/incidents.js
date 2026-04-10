const router = require('express').Router();
const db = require('../db');

// POST /api/missions/:id/incidents
router.post('/:id/incidents', async (req, res) => {
  const { titre, date_incident, gravite, description } = req.body;
  if (!titre) return res.status(400).json({ error: 'titre requis' });
  const { rows } = await db.query(
    'INSERT INTO incidents (mission_id,titre,date_incident,gravite,description) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.params.id, titre, date_incident||null, gravite||null, description||null]
  );
  res.status(201).json(rows[0]);
});

// GET /api/missions/:id/incidents
router.get('/:id/incidents', async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM incidents WHERE mission_id=$1 ORDER BY id DESC',
    [req.params.id]
  );
  res.json(rows);
});

module.exports = router;
