const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const db     = require('../db');

const upload = multer({ storage: multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => cb(null, `preuve_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`),
})});

// POST /api/evaluations/:id/preuves
router.post('/:id/preuves', upload.single('fichier'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'fichier requis' });
  const { rows } = await db.query(
    'INSERT INTO preuves (evaluation_id,nom_fichier,fichier_path,type_fichier) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.params.id, req.file.originalname, `/uploads/${req.file.filename}`, req.file.mimetype]
  );
  res.status(201).json(rows[0]);
});

// GET /api/evaluations/:id/preuves
router.get('/:id/preuves', async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM preuves WHERE evaluation_id=$1 ORDER BY id DESC',
    [req.params.id]
  );
  res.json(rows);
});

module.exports = router;
