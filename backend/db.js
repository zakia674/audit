const { Pool } = require('pg');

const pool = new Pool({
  host:     'localhost',
  port:     5432,
  database: 'learn_audit',
  user:     'audit_user',
  password: 'audit1234',
});

pool.on('error', (err) => {
  console.error('PostgreSQL error:', err.message);
});

module.exports = pool;
