const jwt = require('jsonwebtoken');
const { User } = require('../models');
exports.authenticateToken = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Token missing' });
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch { res.status(401).json({ success: false, message: 'Invalid or expired token' }); }
};
exports.requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
exports.errorHandler = (err, req, res, next) => {
  const code = err.name === 'ValidationError' ? 400 : err.code === 11000 ? 409 : err.status || 500;
  res.status(code).json({ success: false, message: err.code === 11000 ? 'Already exists' : err.message });
};
exports.wrap = fn => (req, res, next) => fn(req, res, next).catch(next);
