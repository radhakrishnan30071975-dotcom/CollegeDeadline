const r = require('express').Router();
const { Deadline, User, Application } = require('../models');
const { authenticateToken, requireRole, wrap } = require('../middleware/auth');
const { autoTrackDeadline } = require('../services/autoTrack');
const { findDuplicate } = require('../services/duplicate'), { notify } = require('../services/notify'), { score } = require('../services/match');
r.use(authenticateToken, requireRole('admin', 'superadmin'));
r.get('/pending', wrap(async (req, res) => {
  const list = await Deadline.find({ status: 'pending' }).populate('submittedBy', 'name email').lean();
  for (const d of list) d.duplicate = await findDuplicate({ ...d, submittedBy: undefined });
  res.json({ success: true, data: list });
}));
r.post('/deadlines', wrap(async (req, res) => {
  const d = await Deadline.create({ ...req.body, status: 'approved', official: true, approvedBy: req.user._id });
  if (req.body.notifyStudents) for (const u of await User.find({ role: 'student' })) if (score(d, u).matchScore >= 65) await notify(u._id, 'new_match', `New opportunity: ${d.title}`, d._id, `new-${d._id}`);
  autoTrackDeadline(d).catch(e => console.error('Auto-track failed:', e.message));
  res.status(201).json({ success: true, data: d });
}));
r.put('/deadlines/:id', wrap(async (req, res) => res.json({ success: true, data: await Deadline.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) })));
r.put('/deadlines/:id/approve', wrap(async (req, res) => {
  const d = await Deadline.findByIdAndUpdate(req.params.id, { status: 'approved', approvedBy: req.user._id }, { new: true });
  if (d?.submittedBy) await notify(d.submittedBy, 'submission_approved', `Your submission "${d.title}" was approved`, d._id, `ok-${d._id}`);
  if (d) autoTrackDeadline(d).catch(e => console.error('Auto-track failed:', e.message));
  res.json({ success: true, data: d });
}));
r.put('/deadlines/:id/reject', wrap(async (req, res) => {
  if (!req.body.reason) return res.status(400).json({ success: false, message: 'Rejection reason required' });
  const d = await Deadline.findByIdAndUpdate(req.params.id, { status: 'rejected', rejectionReason: req.body.reason, approvedBy: req.user._id }, { new: true });
  if (d?.submittedBy) await notify(d.submittedBy, 'submission_rejected', `Your submission "${d.title}" was rejected: ${req.body.reason}`, d._id, `no-${d._id}`);
  res.json({ success: true, data: d });
}));
r.delete('/deadlines/:id', wrap(async (req, res) => { await Deadline.findByIdAndDelete(req.params.id); res.json({ success: true, data: 'Deleted' }); }));
r.get('/analytics', wrap(async (req, res) => {
  const g = (M, field, match = {}) => M.aggregate([{ $match: match }, { $group: { _id: field, count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  const week = new Date(Date.now() - 7 * 864e5), soon = new Date(Date.now() + 7 * 864e5), now = new Date();
  res.json({ success: true, data: {
    byCategory: await g(Deadline, '$category', { status: 'approved' }), byStatus: await g(Deadline, '$status'),
    perMonth: await Deadline.aggregate([{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$deadlineDate' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    mostViewed: await Deadline.find({ status: 'approved' }).sort({ views: -1 }).limit(5).select('title views'),
    trackerStages: await g(Application, '$stage'),
    totals: { active: await Deadline.countDocuments({ status: 'approved', deadlineDate: { $gte: now } }), pending: await Deadline.countDocuments({ status: 'pending' }),
      approvedThisWeek: await Deadline.countDocuments({ status: 'approved', updatedAt: { $gte: week } }), rejected: await Deadline.countDocuments({ status: 'rejected' }),
      expiringSoon: await Deadline.countDocuments({ status: 'approved', deadlineDate: { $gte: now, $lte: soon } }) } } });
}));
r.get('/users', requireRole('superadmin'), wrap(async (req, res) => res.json({ success: true, data: await User.find().select('-password') })));
r.put('/users/:id/role', requireRole('superadmin'), wrap(async (req, res) => {
  if (!['student', 'volunteer', 'admin', 'superadmin'].includes(req.body.role)) return res.status(400).json({ success: false, message: 'Invalid role' });
  res.json({ success: true, data: await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }) });
}));
module.exports = r;