const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const userFields = 'id, name, email, role, department_id, avatar_url';

function signToken({ id, role, department_id }) {
  return jwt.sign({ id, role, department_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ message: 'Enter a name and a valid email address' });
  }

  // bcrypt only uses the first 72 bytes.
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
    return res.status(400).json({ message: 'Password must be at least 8 characters and at most 72 bytes' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // Enforce email uniqueness even when registration requests overlap.
  const { rows: [user] } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'student')
     ON CONFLICT (email) DO NOTHING
     RETURNING ${userFields}`,
    [name.trim(), email.trim().toLowerCase(), passwordHash],
  );

  if (!user) return res.status(409).json({ message: 'Email already in use' });
  res.status(201).json({ token: signToken(user), user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string' || !password ||
      Buffer.byteLength(password) > 72) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const { rows: [record] } = await pool.query(
    `SELECT ${userFields}, password_hash FROM users WHERE email = $1`,
    [email.trim().toLowerCase()],
  );
  if (!record || !(await bcrypt.compare(password, record.password_hash))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const { password_hash, ...user } = record;
  res.json({ token: signToken(user), user });
});

router.get('/me', authenticate, async (req, res) => {
  const { rows: [user] } = await pool.query(
    `SELECT ${userFields} FROM users WHERE id = $1`,
    [req.user.id],
  );
  if (!user) return res.status(401).json({ message: 'User no longer exists' });
  res.json(user);
});

router.patch('/me/avatar', authenticate, async (req, res) => {
  const { avatar_url } = req.body ?? {};
  if (avatar_url !== null && (typeof avatar_url !== 'string' || avatar_url.length > 300000 ||
      !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar_url))) {
    return res.status(400).json({ message: 'Use a JPEG, PNG, or WebP data URL of at most 300,000 characters, or null' });
  }

  const { rows: [user] } = await pool.query(
    `UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING ${userFields}`,
    [avatar_url, req.user.id],
  );
  if (!user) return res.status(401).json({ message: 'User no longer exists' });
  res.json(user);
});

module.exports = router;
