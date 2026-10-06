const r = require('express').Router();
const { User, Deadline, Access, Application } = require('../models');
const { authenticateToken, wrap } = require('../middleware/auth');
const { autoTrackUser } = require('../services/autoTrack'), { whatIf } = require('../services/whatIf');
const { score } = require('../services/match'), { analyze } = require('../services/workload'), { plan } = require('../services/planner');
r.use(authenticateToken);
r.get('/me', (req, res) => res.json({ success: true, data: req.user }));
r.put('/me', wrap(async (req, res) => {
  const { name, collegeEmail, branch, year, cgpa, interests, notifyEmail, myDocuments } = req.body; // role cannot be changed here
  const u = await User.findByIdAndUpdate(req.user._id, { name, collegeEmail, branch, year, cgpa, interests, notifyEmail, myDocuments }, { new: true, runValidators: true, omitUndefined: true });
  autoTrackUser(u).catch(e => console.error('Auto-track failed:', e.message));   // profile changed: new matches may appear
  res.json({ success: true, data: u });
}));
r.get('/me/submissions', wrap(async (req, res) => res.json({ success: true, data: await Deadline.find({ submittedBy: req.user._id }).sort({ createdAt: -1 }) })));
r.get('/me/recently-accessed', wrap(async (req, res) => {
  const logs = await Access.find({ user: req.user._id }).sort({ accessedAt: -1 }).limit(30).populate('deadline').lean();
  const seen = new Set(), out = [];
  for (const l of logs) if (l.deadline && !seen.has(String(l.deadline._id))) { seen.add(String(l.deadline._id)); out.push({ deadline: l.deadline, accessedAt: l.accessedAt }); }
  res.json({ success: true, data: out.slice(0, 8) });
}));
r.get('/me/dashboard', wrap(async (req, res) => {
  const now = new Date(), week = new Date(now.getTime() + 7 * 864e5);
  const active = await Deadline.find({ status: 'approved', deadlineDate: { $gte: now } }).lean();
  const feed = active.map(d => ({ deadline: d, ...score(d, req.user) })).sort((a, b) => b.matchScore - a.matchScore);
  const mine = feed.filter(x => x.eligible);   // only opportunities this student qualifies for
  const urgentAll = mine.filter(x => x.deadline.deadlineDate <= week).map(x => x.deadline).sort((a, b) => a.deadlineDate - b.deadlineDate);
  const apps = await Application.find({ user: req.user._id }).populate('deadline').lean();
  const live = apps.filter(a => a.deadline && !['Selected', 'Rejected', 'Withdrawn'].includes(a.stage));
  const missed = apps.filter(a => a.deadline && a.deadline.deadlineDate < now && ['Interested', 'Planning', 'Application Started'].includes(a.stage)).length;
  const warnings = live.filter(a => a.stage === 'Planning' && a.deadline.deadlineDate - now < 3 * 864e5 && a.deadline.deadlineDate > now).map(a => `"${a.deadline.title}" is still in Planning and closes soon`);
  res.json({ success: true, data: {
    stats: { activeOpportunities: mine.length, closingThisWeek: urgentAll.length, applicationsInProgress: live.length, missedDeadlines: missed },
    urgent: urgentAll.slice(0, 5),
    recommended: mine.slice(0, 5), workload: analyze(live.map(a => a.deadline)),
       planner: plan(apps, req.user).slice(0, 5), warnings, whatIf: whatIf(active, req.user) } });
}));
module.exports = r;