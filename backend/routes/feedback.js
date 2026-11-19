const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('dept_admin', 'super_admin'), async (req, res) => {
  const { role, department_id } = req.user;
  const { rows: [result] } = await pool.query(
    `WITH visible AS (
       SELECT f.id, f.complaint_id, f.department_id, u.name AS student_name,
              c.title AS complaint_title, f.rating, f.comment, f.created_at
       FROM feedback f
       JOIN users u ON u.id = f.student_id
       JOIN complaints c ON c.id = f.complaint_id
       WHERE $1::boolean OR f.department_id = $2::int
     )
     SELECT COALESCE(json_agg(v ORDER BY v.created_at DESC NULLS LAST, v.id DESC), '[]'::json) AS feedback,
            AVG(v.rating)::float AS average_rating
     FROM visible v`,
    [role === 'super_admin', department_id ?? null],
  );
  res.json(result);
});

module.exports = router;
