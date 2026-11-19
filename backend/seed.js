const fs = require('node:fs/promises');
const path = require('node:path');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./db');

const admins = [
  ['Cafeteria Admin', 'cafeteria@campusconnect.com', 'Cafeteria'],
  ['Library Admin', 'library@campusconnect.com', 'Library'],
  ['Lab Admin', 'lab@campusconnect.com', 'Laboratory / IT'],
  ['Teaching Admin', 'teaching@campusconnect.com', 'Teaching / Academic'],
  ['Super Admin', 'super@campusconnect.com', null],
];

async function seed() {
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < 8 || Buffer.byteLength(password) > 72) {
    throw new Error('Set SEED_ADMIN_PASSWORD to at least 8 characters and at most 72 bytes');
  }

  const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  const client = await pool.connect();
  const created = [];

  try {
    // Apply the schema and seed data together.
    await client.query('BEGIN');
    await client.query(schema);

    for (const [, , department] of admins) {
      if (department === null) continue;

      const result = await client.query(
        'INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [department],
      );
      if (result.rowCount) created.push('Created department: ' + department);
    }

    for (const [name, email, department] of admins) {
      const passwordHash = await bcrypt.hash(password, 12);
      const role = department === null ? 'super_admin' : 'dept_admin';
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash, role, department_id)
         VALUES ($1, $2, $3, $4, (SELECT id FROM departments WHERE name = $5))
         ON CONFLICT (email) DO NOTHING`,
        [name, email, passwordHash, role, department],
      );
      if (result.rowCount) created.push('Created ' + role + ': ' + email);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  console.log('Schema applied.');
  for (const message of created) console.log(message);
  if (created.length === 0) console.log('Seed departments and users already exist.');
}

seed()
  .finally(() => pool.end())
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  });
