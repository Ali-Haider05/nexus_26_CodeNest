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
    `INSERT INTO complaints (student_id, department_id, category, title, description, image_url, status)
     SELECT $1, id, $2, $3, $4, $5, 'pending' FROM departments WHERE name = $6
     RETURNING *`,
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
  if (status !== undefined && status !== 'pending' && !adminStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status filter' });
  }
  if ((category !== undefined && typeof category !== 'string') ||
      (search !== undefined && typeof search !== 'string')) {
    return res.status(400).json({ message: 'Invalid category or search filter' });
  }
  if (isSuperAdmin && department_id !== undefined && !isId(department_id)) {
    return res.status(400).json({ message: 'Invalid department_id filter' });
  }

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

router.get('/:id', loadComplaint, async (req, res) => {
  const { rows: [result] } = await pool.query(
    `SELECT (${responses}) AS responses FROM complaints c WHERE c.id = $1`,
    [req.complaint.id],
  );
  if (!result) return res.status(404).json({ message: 'Complaint not found' });
  res.json({ ...req.complaint, responses: result.responses });
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
  // Update the complaint and record its remark in one atomic statement.
  const { rows: [complaint] } = await pool.query(
    `WITH updated AS (
       UPDATE complaints
       SET status = $2, reject_reason = $3, updated_at = NOW()
       WHERE id = $1 AND department_id = $6
       RETURNING *
     ), recorded AS (
       INSERT INTO responses (complaint_id, admin_id, remark)
       SELECT id, $4, $5 FROM updated WHERE $5::text IS NOT NULL
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
    `INSERT INTO responses (complaint_id, admin_id, remark)
     SELECT id, $2, $3 FROM complaints WHERE id = $1 AND department_id = $4
     RETURNING *`,
    [req.complaint.id, req.user.id, remark.trim(), req.user.department_id],
  );
  if (!response) return res.status(404).json({ message: 'Complaint not found' });
  res.status(201).json(response);
});

module.exports = router;
