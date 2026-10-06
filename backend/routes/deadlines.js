const r = require('express').Router();
const { Deadline, Access, Application, User } = require('../models');
const { authenticateToken, requireRole, wrap } = require('../middleware/auth');
const { score } = require('../services/match'), { readiness } = require('../services/readiness'), { findDuplicate } = require('../services/duplicate'), { notify } = require('../services/notify');
r.use(authenticateToken);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
r.get('/', wrap(async (req, res) => {
  const { q, category, branch, year, cgpa, status, from, to, sort = 'nearest', page = 1, limit = 12 } = req.query;
  const f = { status: 'approved' }, now = new Date();
  if (q) f.$or = [{ title: new RegExp(esc(String(q)), 'i') }, { description: new RegExp(esc(String(q)), 'i') }];
  if (category) f.category = String(category);
  if (branch) f.eligibilityBranches = String(branch);
  if (year) f.eligibilityYears = +year;
  if (cgpa) f.minimumCGPA = { $lte: +cgpa };
  if (status === 'upcoming') f.deadlineDate = { $gte: now };
  if (status === 'closed') f.deadlineDate = { $lt: now };
  if (from || to) f.deadlineDate = { ...(f.deadlineDate || {}), ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
  const order = sort === 'newest' || sort === 'recent' ? { createdAt: -1 } : { deadlineDate: 1 };
  let items = await Deadline.find(f).sort({ isPinned: -1, ...order }).skip((page - 1) * limit).limit(+limit).lean();
  items = items.map(d => ({ deadline: d, ...score(d, req.user) }));
  if (sort === 'match') items.sort((a, b) => b.matchScore - a.matchScore);
  res.json({ success: true, data: { items, page: +page, total: await Deadline.countDocuments(f) } });
}));
r.get('/feed', wrap(async (req, res) => {
  const list = await Deadline.find({ status: 'approved', deadlineDate: { $gte: new Date() } }).lean();
  res.json({ success: true, data: list.map(d => ({ deadline: d, ...score(d, req.user) })).sort((a, b) => b.matchScore - a.matchScore) });
}));
r.get('/calendar', wrap(async (req, res) => {
  const list = await Deadline.find({ status: 'approved' }).select('title category deadlineDate').lean();
  res.json({ success: true, data: list.map(d => ({ id: d._id, title: d.title, start: d.deadlineDate, category: d.category })) });
}));
// Volunteer's own submissions (any status) so they can track review progress
r.get('/mine/list', requireRole('volunteer', 'admin', 'superadmin'), wrap(async (req, res) =>
  res.json({ success: true, data: await Deadline.find({ submittedBy: req.user._id }).sort({ createdAt: -1 }).lean() })));
r.get('/:id', wrap(async (req, res) => {
  const d = await Deadline.findById(req.params.id).lean();
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role);   // only admins may view unapproved items that aren't their own
  if (!d || (d.status !== 'approved' && String(d.submittedBy) !== String(req.user._id) && !isAdmin)) return res.status(404).json({ success: false, message: 'Not found' });
  await Access.create({ user: req.user._id, deadline: d._id });          // Recently Accessed log
  await Deadline.updateOne({ _id: d._id }, { $inc: { views: 1 } });
  res.json({ success: true, data: { deadline: d, ...score(d, req.user), readiness: readiness(d, req.user), tracked: await Application.findOne({ user: req.user._id, deadline: d._id }) } });
}));
// Volunteer (or admin) submission: ALWAYS pending until an admin approves; duplicate check first
r.post('/', requireRole('volunteer', 'admin', 'superadmin'), wrap(async (req, res) => {
  const b = req.body;
  if (!b.title || !b.category || !b.deadlineDate || isNaN(new Date(b.deadlineDate))) return res.status(400).json({ success: false, message: 'title, category and valid deadlineDate required' });
  const dup = await findDuplicate(b);
  if (dup) return res.status(409).json({ success: false, message: 'Similar opportunity already exists', data: dup });
  const { status, official, isPinned, approvedBy, rejectionReason, views, ...safe } = b;
  const d = await Deadline.create({ ...safe, status: 'pending', submittedBy: req.user._id });
  for (const a of await User.find({ role: { $in: ['admin', 'superadmin'] } })) await notify(a._id, 'submission', `New submission: ${d.title}`, d._id, `sub-${d._id}-${a._id}`);
  res.status(201).json({ success: true, data: d });
}));
module.exports = r;