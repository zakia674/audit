const router = require('express').Router();
const db = require('../db');

// POST /api/missions/:id/fiche
router.post('/:id/fiche', async (req, res) => {
  const { id } = req.params;
  const { nom, secteur, effectif, ca, siege, activite, clients_principaux, interlocuteurs } = req.body;
  const { rows } = await db.query(
    `INSERT INTO fiches_entreprise (mission_id,nom,secteur,effectif,ca,siege,activite,clients_principaux,interlocuteurs)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (mission_id) DO UPDATE SET
       nom=$2, secteur=$3, effectif=$4, ca=$5, siege=$6, activite=$7,
       clients_principaux=$8, interlocuteurs=$9
     RETURNING *`,
    [id, nom, secteur, effectif||null, ca, siege, activite, clients_principaux, interlocuteurs]
  );
  res.json(rows[0]);
});

// GET /api/missions/:id/fiche
router.get('/:id/fiche', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM fiches_entreprise WHERE mission_id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'introuvable' });
  res.json(rows[0]);
});

module.exports = router;
