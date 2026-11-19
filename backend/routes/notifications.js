const express = require('express');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { rows: [result] } = await pool.query(
    `WITH owned AS (
       SELECT * FROM notifications WHERE user_id = $1
     ), latest AS (
       SELECT * FROM owned ORDER BY created_at DESC NULLS LAST, id DESC LIMIT 30
     )
     SELECT COALESCE((
       SELECT json_agg(n ORDER BY n.created_at DESC NULLS LAST, n.id DESC) FROM latest n
     ), '[]'::json) AS notifications,
     (SELECT COUNT(*)::int FROM owned WHERE NOT is_read) AS unread_count`,
    [req.user.id],
  );
  res.json(result);
});

router.patch('/read-all', async (req, res) => {
  const { rowCount } = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND NOT is_read',
    [req.user.id],
  );
  res.json({ updated_count: rowCount });
});

router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  if (!/^[0-9]+$/.test(id) || Number(id) < 1 || Number(id) > 2147483647) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  const { rows: [notification] } = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, req.user.id],
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
});

module.exports = router;
