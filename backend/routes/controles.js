const router = require('express').Router();
const db = require('../db');

// GET /api/controles
router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM controles_iso ORDER BY id');
  res.json(rows);
});

module.exports = router;
