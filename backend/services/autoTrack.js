const { Deadline, User, Application } = require('../models');
const { score } = require('./match');
const { notify } = require('./notify');

const THRESHOLD = 65;   // minimum match score for automatic tracking (student must also be eligible)
const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

// Adds one opportunity to one student's tracker if it is open, they are eligible and it matches their profile.
async function track(u, d) {
  if (u.role !== 'student' || new Date(d.deadlineDate) < new Date() || d.status !== 'approved') return false;
  if ((u.dismissed || []).some(x => String(x) === String(d._id))) return false;     // student removed it before: never re-add
  const s = score(d, u);
  if (!s.eligible || s.matchScore < THRESHOLD || !(u.interests || []).includes(d.category)) return false;   // eligible + matches a selected interest
  try { await Application.create({ user: u._id, deadline: d._id, stage: 'Interested', auto: true }); }
  catch (e) { if (e.code === 11000) return false; throw e; }                         // already in tracker
  const text = [
    `Hi ${u.name},`, '',
    `"${d.title}" matches your profile (${s.matchScore}% match), so we added it to your Application tracker.`, '',
    d.organization && `Organization: ${d.organization}`,
    `Deadline: ${fmt(d.deadlineDate)}`,
    d.applicationLink && `Apply here: ${d.applicationLink}`,
    d.documentsRequired?.length > 0 && `Documents to keep ready: ${d.documentsRequired.join(', ')}`, '',
    'We will remind you every day until the deadline. Not interested? Remove it from your tracker and we will not add it again.', '',
    '- Campus Deadlines',
  ].filter(x => typeof x === 'string').join('\n');
  await notify(u._id, 'auto_tracked', `Added to your tracker: "${d.title}" (${s.matchScore}% match, closes ${fmt(d.deadlineDate)})`, d._id,
    `auto-${u._id}-${d._id}`, { subject: `Added to your tracker: ${d.title}`, text });
  return true;
}

exports.autoTrackDeadline = async d => { for (const u of await User.find({ role: 'student' })) await track(u, d); };          // new / approved opportunity
exports.autoTrackUser = async u => { for (const d of await Deadline.find({ status: 'approved', deadlineDate: { $gte: new Date() } })) await track(u, d); };   // new student or profile change
exports.autoTrackAll = async () => {                                                                                         // daily safety net
  const students = await User.find({ role: 'student' });
  for (const d of await Deadline.find({ status: 'approved', deadlineDate: { $gte: new Date() } })) for (const u of students) await track(u, d);
};