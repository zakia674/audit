const router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email et mot de passe requis.' });

  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email.trim().toLowerCase()]
  );

  if (!rows.length)
    return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

  const user = rows[0];
  if (user.password_hash !== hashPassword(password))
    return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

  res.json({ id: user.id, nom: user.nom, email: user.email });
});

module.exports = router;
