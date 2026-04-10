const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const db     = require('../db');

// Créer la table au démarrage
db.query(`
  CREATE TABLE IF NOT EXISTS fiches_pdf (
    id           SERIAL PRIMARY KEY,
    mission_id   INTEGER NOT NULL UNIQUE REFERENCES missions(id) ON DELETE CASCADE,
    fichier_path TEXT
  )
`).then(() => console.log('✓ fiches_pdf table OK'))
  .catch(err => console.error('fiches_pdf table error:', err.message));

const upload = multer({ storage: multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => cb(null, `fiche_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`),
})});

// POST /api/missions/:id/fiche-pdf
router.post('/:id/fiche-pdf', upload.single('fichier'), async (req, res) => {
  const { id } = req.params;
  const fichier_path = req.file ? `/uploads/${req.file.filename}` : null;
  if (!fichier_path) return res.status(400).json({ error: 'Aucun fichier reçu' });
  try {
    const { rows } = await db.query(
      `INSERT INTO fiches_pdf (mission_id, fichier_path)
       VALUES ($1,$2)
       ON CONFLICT (mission_id) DO UPDATE SET fichier_path=$2
       RETURNING fichier_path`,
      [id, fichier_path]
    );
    res.json({ fichier_path: rows[0].fichier_path });
  } catch (err) {
    console.error('fiche-pdf POST error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/missions/:id/fiche-pdf
router.get('/:id/fiche-pdf', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT fichier_path FROM fiches_pdf WHERE mission_id=$1', [req.params.id]);
    if (!rows.length || !rows[0].fichier_path) return res.status(404).json({ error: 'introuvable' });
    res.json({ fichier_path: rows[0].fichier_path });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
