const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const db     = require('../db');

const upload = multer({ storage: multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => cb(null, `lettre_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`),
})});

// POST /api/missions/:id/lettre
router.post('/:id/lettre', upload.single('fichier'), async (req, res) => {
  const { id } = req.params;
  const fichier_path = req.file ? `/uploads/${req.file.filename}` : null;
  const notes = req.body.notes || null;
  const { rows } = await db.query(
    `INSERT INTO lettres_mission (mission_id, fichier_path, notes) VALUES ($1,$2,$3)
     ON CONFLICT (mission_id) DO UPDATE SET fichier_path=COALESCE($2,lettres_mission.fichier_path), notes=$3
     RETURNING *`,
    [id, fichier_path, notes]
  );
  res.json(rows[0]);
});

// GET /api/missions/:id/lettre
router.get('/:id/lettre', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM lettres_mission WHERE mission_id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'introuvable' });
  res.json(rows[0]);
});

// PUT /api/missions/:id/lettre
router.put('/:id/lettre', async (req, res) => {
  const { rows } = await db.query(
    'UPDATE lettres_mission SET notes=$1 WHERE mission_id=$2 RETURNING *',
    [req.body.notes, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'introuvable' });
  res.json(rows[0]);
});

module.exports = router;
