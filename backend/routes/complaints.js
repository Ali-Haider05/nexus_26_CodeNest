const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const departmentsByCategory = new Map([
  ['Cafeteria', 'Cafeteria'],
  ['Library', 'Library'],
  ['Laboratories & IT Facilities', 'Laboratory / IT'],
  ['Teaching & Academic Affairs', 'Teaching / Academic'],
]);
const adminStatuses = ['in_progress', 'resolved', 'rejected'];

const complaintDetails = `
  SELECT c.*, student.name AS student_name, d.name AS department_name
  FROM complaints c
  JOIN users student ON student.id = c.student_id
  JOIN departments d ON d.id = c.department_id
`;

// Keep responses chronological and return an empty array for new complaints.
const responses = `
  SELECT COALESCE(json_agg(
    json_build_object('remark', r.remark, 'admin_name', a.name, 'created_at', r.created_at)
    ORDER BY r.created_at, r.id
  ), '[]'::json)
  FROM responses r
  JOIN users a ON a.id = r.admin_id
  WHERE r.complaint_id = c.id
`;

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isId(value) {
  return typeof value === 'string' && /^[0-9]+$/.test(value) &&
    Number(value) > 0 && Number(value) <= 2147483647;
}

function validateFilters({ status, category, search, department_id }, isSuperAdmin) {
  if (status !== undefined && status !== 'pending' && !adminStatuses.includes(status)) {
    return 'Invalid status filter';
  }
  if ((category !== undefined && typeof category !== 'string') ||
      (search !== undefined && typeof search !== 'string')) {
    return 'Invalid category or search filter';
  }
  if (isSuperAdmin && department_id !== undefined && !isId(department_id)) {
    return 'Invalid department_id filter';
  }
  return null;
}

const exportColumns = [
  'ID', 'Title', 'Category', 'Department', 'Student Name', 'Status',
  'Description', 'Reject Reason', 'Latest Remark', 'Created At', 'Updated At',
];

function csvCell(value) {
  const text = (value instanceof Date ? value.toISOString() : String(value ?? ''))
    .replace(/\r\n|[\r\n\u2028\u2029]/g, ' ');
  const safe = /^\s*[=+@-]/.test(text) ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}

async function loadComplaint(req, res, next) {
  const { id } = req.params;
  if (!isId(id)) return res.status(404).json({ message: 'Complaint not found' });

  const { rows: [complaint] } = await pool.query(
    `${complaintDetails} WHERE c.id = $1`,
    [id],
  );
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  const user = req.user;
  const canAccess = user.role === 'super_admin' ||
    (user.role === 'student' && complaint.student_id === user.id) ||
    (user.role === 'dept_admin' && complaint.department_id === user.department_id);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  req.complaint = complaint;
  next();
}

router.post('/', authorize('student'), async (req, res) => {
  const { category, title, description, image_url = null } = req.body ?? {};
  const department = departmentsByCategory.get(category);
  if (!department) return res.status(400).json({ message: 'Invalid category' });
  if (!isText(title) || !isText(description)) {
    return res.status(400).json({ message: 'Title and description are required' });
  }
  if (image_url !== null && (typeof image_url !== 'string' || image_url.length > 2000000)) {
    return res.status(400).json({ message: 'image_url must be a string of at most 2,000,000 characters' });
  }

  const { rows: [complaint] } = await pool.query(
    `WITH created AS (
       INSERT INTO complaints (student_id, department_id, category, title, description, image_url, status)
       SELECT $1, id, $2, $3, $4, $5, 'pending' FROM departments WHERE name = $6
       RETURNING *
     ), tracked AS (
       INSERT INTO complaint_history (complaint_id, status, note, changed_by)
       SELECT id, status, 'Complaint submitted', student_id FROM created
     ), notified AS (
       INSERT INTO notifications (user_id, complaint_id, message)
       SELECT u.id, c.id, 'New complaint: ' || c.title
       FROM created c CROSS JOIN users u
       WHERE u.role = 'super_admin' OR (u.role = 'dept_admin' AND u.department_id = c.department_id)
     )
     SELECT * FROM created`,
    [req.user.id, category, title.trim(), description.trim(), image_url, department],
  );
  if (!complaint) return res.status(400).json({ message: 'No department found for this category' });
  res.status(201).json(complaint);
});

router.get('/mine', authorize('student'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.*, d.name AS department_name, (${responses}) AS responses
     FROM complaints c
     JOIN departments d ON d.id = c.department_id
     WHERE c.student_id = $1
     ORDER BY c.created_at DESC, c.id DESC`,
    [req.user.id],
  );
  res.json(rows);
});

router.get('/', authorize('dept_admin', 'super_admin'), async (req, res) => {
  const { status, department_id, category, search } = req.query;
  const isSuperAdmin = req.user.role === 'super_admin';
  const error = validateFilters(req.query, isSuperAdmin);
  if (error) return res.status(400).json({ message: error });

  const department = isSuperAdmin ? department_id : req.user.department_id;
  const { rows } = await pool.query(
    `${complaintDetails}
     WHERE (($1::boolean AND $2::int IS NULL) OR c.department_id = $2)
       AND ($3::text IS NULL OR c.status = $3)
       AND ($4::text IS NULL OR c.category = $4)
       AND ($5::text IS NULL OR strpos(lower(c.title), lower($5)) > 0
                            OR strpos(lower(c.description), lower($5)) > 0)
     ORDER BY c.created_at DESC, c.id DESC`,
    [isSuperAdmin, department ?? null, status ?? null, category ?? null, search?.trim() || null],
  );
  res.json(rows);
});

router.get('/export', authorize('student', 'dept_admin', 'super_admin'), async (req, res) => {
  const { id, role } = req.user;
  const { status, category, search, department_id } = req.query;
  const isSuperAdmin = role === 'super_admin';
  const error = validateFilters(req.query, isSuperAdmin);
  if (error) return res.status(400).json({ message: error });

  const department = isSuperAdmin ? department_id : req.user.department_id;
  const { rows } = await pool.query(
    `SELECT c.id, c.title, c.category, d.name AS department, u.name AS student_name,
            c.status, c.description, c.reject_reason,
            (SELECT r.remark FROM responses r WHERE r.complaint_id = c.id
             ORDER BY r.created_at DESC NULLS LAST, r.id DESC LIMIT 1) AS latest_remark,
            c.created_at, c.updated_at
     FROM complaints c
     JOIN departments d ON d.id = c.department_id
     JOIN users u ON u.id = c.student_id
     WHERE (($1 = 'student' AND c.student_id = $2)
         OR ($1 = 'dept_admin' AND c.department_id = $3)
         OR ($1 = 'super_admin' AND ($3::int IS NULL OR c.department_id = $3)))
       AND ($4::text IS NULL OR c.status = $4)
       AND ($5::text IS NULL OR c.category = $5)
       AND ($6::text IS NULL OR strpos(lower(c.title), lower($6)) > 0
                            OR strpos(lower(c.description), lower($6)) > 0
                            OR ($1 <> 'super_admin' AND strpos(c.id::text, $6) > 0)
                            OR ($1 = 'dept_admin' AND strpos(lower(u.name), lower($6)) > 0))
     ORDER BY c.created_at DESC, c.id DESC`,
    [role, id, department ?? null, status ?? null, category ?? null, search?.trim() || null],
  );

  const lines = [exportColumns.map(csvCell).join(',')];
  for (const row of rows) {
    lines.push([row.id, row.title, row.category, row.department, row.student_name, row.status,
      row.description, row.reject_reason, row.latest_remark, row.created_at, row.updated_at].map(csvCell).join(','));
  }
  const date = new Date().toISOString().slice(0, 10);
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="complaints-report-' + date + '.csv"',
    'Access-Control-Expose-Headers': 'Content-Disposition',
    'Cache-Control': 'private, no-store',
  });
  res.send('\uFEFF' + lines.join('\r\n') + '\r\n');
});

router.get('/:id', loadComplaint, async (req, res) => {
  const { rows: [result] } = await pool.query(
    `SELECT (${responses}) AS responses,
       (SELECT json_agg(h ORDER BY (h.id IS NOT NULL), h.created_at NULLS LAST, h.id)
        FROM (
          SELECT id, complaint_id, status, note, changed_by, created_at
          FROM complaint_history WHERE complaint_id = c.id
          UNION ALL
          SELECT NULL::int, c.id, 'pending', 'Complaint submitted', c.student_id, c.created_at
          WHERE NOT EXISTS (
            SELECT 1 FROM complaint_history WHERE complaint_id = c.id AND status = 'pending'
          )
        ) h) AS history,
       (SELECT row_to_json(f) FROM feedback f WHERE f.complaint_id = c.id) AS feedback
     FROM complaints c WHERE c.id = $1`,
    [req.complaint.id],
  );
  if (!result) return res.status(404).json({ message: 'Complaint not found' });
  const { feedback, ...details } = result;
  res.json({ ...req.complaint, ...details, ...(feedback && { feedback }) });
});

router.patch('/:id/status', authorize('dept_admin'), loadComplaint, async (req, res) => {
  const { status, remark } = req.body ?? {};
  if (!adminStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  if (status === 'rejected' && !isText(remark)) {
    return res.status(400).json({ message: 'A rejection remark is required' });
  }
  if (remark !== undefined && !isText(remark)) {
    return res.status(400).json({ message: 'Remark must be a non-empty string' });
  }

  const trimmedRemark = remark?.trim() ?? null;
  // Lock the previous status so concurrent updates record only real transitions.
  const { rows: [complaint] } = await pool.query(
    `WITH previous AS (
       SELECT id, status FROM complaints WHERE id = $1 AND department_id = $6 FOR UPDATE
     ), updated AS (
       UPDATE complaints c
       SET status = $2, reject_reason = $3, updated_at = NOW()
       FROM previous p WHERE c.id = p.id
       RETURNING c.*
     ), recorded AS (
       INSERT INTO responses (complaint_id, admin_id, remark)
       SELECT id, $4, $5 FROM updated WHERE $5::text IS NOT NULL
     ), tracked AS (
       INSERT INTO complaint_history (complaint_id, status, note, changed_by)
       SELECT u.id, u.status, $5, $4 FROM updated u JOIN previous p ON p.id = u.id
       WHERE p.status <> u.status
     ), notified AS (
       INSERT INTO notifications (user_id, complaint_id, message)
       SELECT u.student_id, u.id,
              CASE WHEN p.status <> u.status THEN format('Your complaint ''%s'' is now %s', u.title, u.status)
                   ELSE 'New response on your complaint' END
       FROM updated u JOIN previous p ON p.id = u.id
       WHERE p.status <> u.status OR $5::text IS NOT NULL
     )
     SELECT * FROM updated`,
    [req.complaint.id, status, status === 'rejected' ? trimmedRemark : null,
      req.user.id, trimmedRemark, req.user.department_id],
  );
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  res.json(complaint);
});

router.post('/:id/respond', authorize('dept_admin'), loadComplaint, async (req, res) => {
  const { remark } = req.body ?? {};
  if (!isText(remark)) return res.status(400).json({ message: 'Remark is required' });

  const { rows: [response] } = await pool.query(
    `WITH recorded AS (
       INSERT INTO responses (complaint_id, admin_id, remark)
       SELECT id, $2, $3 FROM complaints WHERE id = $1 AND department_id = $4
       RETURNING *
     ), notified AS (
       INSERT INTO notifications (user_id, complaint_id, message)
       SELECT c.student_id, r.complaint_id, 'New response on your complaint'
       FROM recorded r JOIN complaints c ON c.id = r.complaint_id
     )
     SELECT * FROM recorded`,
    [req.complaint.id, req.user.id, remark.trim(), req.user.department_id],
  );
  if (!response) return res.status(404).json({ message: 'Complaint not found' });
  res.status(201).json(response);
});

router.post('/:id/feedback', authorize('student'), loadComplaint, async (req, res) => {
  const { rating, comment = null } = req.body ?? {};
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be an integer from 1 to 5' });
  }
  if (comment !== null && (typeof comment !== 'string' || comment.length > 1000)) {
    return res.status(400).json({ message: 'Comment must be at most 1,000 characters' });
  }

  const { rows: [feedback] } = await pool.query(
    `WITH eligible AS (
       SELECT id, student_id, department_id, title
       FROM complaints WHERE id = $1 AND student_id = $2 AND status IN ('resolved', 'rejected')
       FOR UPDATE
     ), submitted AS (
       INSERT INTO feedback (complaint_id, student_id, department_id, rating, comment)
       SELECT id, student_id, department_id, $3, $4 FROM eligible
       ON CONFLICT (complaint_id) DO NOTHING
       RETURNING *
     ), notified AS (
       INSERT INTO notifications (user_id, complaint_id, message)
       SELECT u.id, f.complaint_id, 'New feedback: ' || c.title
       FROM submitted f JOIN eligible c ON c.id = f.complaint_id CROSS JOIN users u
       WHERE u.role = 'super_admin' OR (u.role = 'dept_admin' AND u.department_id = f.department_id)
     )
     SELECT * FROM submitted`,
    [req.complaint.id, req.user.id, rating, comment],
  );
  if (!feedback) return res.status(409).json({ message: 'Only resolved or rejected complaints can receive feedback once' });
  res.status(201).json(feedback);
});

module.exports = router;
