const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const match = req.get('Authorization')?.match(/^Bearer\s+(\S+)$/i);
  if (!match) return res.status(401).json({ message: 'Authentication required' });

  try {
    const { id, role, department_id } = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    req.user = { id, role, department_id };
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  next();
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
