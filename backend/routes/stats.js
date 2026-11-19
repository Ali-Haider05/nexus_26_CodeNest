const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const statuses = ['pending', 'in_progress', 'resolved', 'rejected'];

router.get('/', authenticate, authorize('dept_admin', 'super_admin'), async (req, res) => {
  const { role, department_id } = req.user;

  // Scope departments first so every count and recent complaint uses the same access rules.
  const { rows: [stats] } = await pool.query(
    `WITH visible_departments AS (
       SELECT id, name FROM departments WHERE $1::boolean OR id = $2::int
     ), visible_complaints AS (
       SELECT c.id, c.title, c.status, c.category, c.department_id, c.created_at,
              d.name AS department_name
       FROM complaints c
       JOIN visible_departments d ON d.id = c.department_id
     ), department_counts AS (
       SELECT d.name AS department, COUNT(c.id) AS count
       FROM visible_departments d
       LEFT JOIN visible_complaints c ON c.department_id = d.id
       GROUP BY d.id, d.name
     ), category_counts AS (
       SELECT category, COUNT(*) AS count FROM visible_complaints GROUP BY category
     ), recent_complaints AS (
       SELECT id, title, status, department_name, created_at
       FROM visible_complaints
       ORDER BY created_at DESC NULLS LAST, id DESC
       LIMIT 5
     )
     SELECT json_build_object(
       'total', COUNT(*),
       'pending', COUNT(*) FILTER (WHERE status = 'pending'),
       'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
       'resolved', COUNT(*) FILTER (WHERE status = 'resolved'),
       'rejected', COUNT(*) FILTER (WHERE status = 'rejected')
     ) AS totals,
     (SELECT COALESCE(json_agg(d ORDER BY d.department), '[]'::json)
      FROM department_counts d) AS "byDepartment",
     (SELECT COALESCE(json_agg(c ORDER BY c.category), '[]'::json)
      FROM category_counts c) AS "byCategory",
     (SELECT COALESCE(json_agg(r ORDER BY r.created_at DESC NULLS LAST, r.id DESC), '[]'::json)
      FROM recent_complaints r) AS recent
     FROM visible_complaints`,
    [role === 'super_admin', department_id ?? null],
  );

  const byStatus = statuses.map((status) => ({ status, count: stats.totals[status] }));
  res.json({ ...stats, byStatus });
});

module.exports = router;
