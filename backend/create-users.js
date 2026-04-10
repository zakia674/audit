/**
 * create-users.js — Crée la table users et insère un compte démo.
 * Commande : node create-users.js
 */
const pool = require('./db');
const crypto = require('crypto');

async function run() {
  const client = await pool.connect();
  try {
    // Créer la table si elle n'existe pas
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id             SERIAL PRIMARY KEY,
        nom            TEXT NOT NULL,
        email          TEXT NOT NULL UNIQUE,
        password_hash  TEXT NOT NULL,
        date_creation  DATE DEFAULT CURRENT_DATE
      );
    `);
    console.log('✓ Table users créée (ou déjà existante)');

    // Insérer le compte démo s'il n'existe pas
    const hash = crypto.createHash('sha256').update('audit1234').digest('hex');
    await client.query(`
      INSERT INTO users (nom, email, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING;
    `, ['Jean Dupont', 'jean@audit.com', hash]);

    console.log('✓ Compte démo prêt :');
    console.log('  Email    : jean@audit.com');
    console.log('  Password : audit1234');
  } catch (err) {
    console.error('✗ Erreur :', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
