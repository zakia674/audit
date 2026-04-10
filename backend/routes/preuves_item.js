const router = require('express').Router();
const path   = require('path');
const fs     = require('fs');
const db     = require('../db');

// DELETE /api/preuves/:id
router.delete('/:id', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM preuves WHERE id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'introuvable' });
  const full = path.join(__dirname, '..', rows[0].fichier_path);
  if (fs.existsSync(full)) fs.unlinkSync(full);
  await db.query('DELETE FROM preuves WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// GET /api/preuves/:id/fichier
router.get('/:id/fichier', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM preuves WHERE id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'introuvable' });
  const full = path.join(__dirname, '..', rows[0].fichier_path);
  if (!fs.existsSync(full)) return res.status(404).json({ error: 'fichier manquant' });
  res.download(full, rows[0].nom_fichier);
});

module.exports = router;
