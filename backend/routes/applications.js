const r = require('express').Router();
const { Application, Deadline } = require('../models'), { authenticateToken, wrap } = require('../middleware/auth');
const { notify } = require('../services/notify');
r.use(authenticateToken);
const day = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
r.get('/', wrap(async (req, res) => res.json({ success: true, data: await Application.find({ user: req.user._id }).populate('deadline') })));
r.post('/', wrap(async (req, res) => {
  const d = await Deadline.findById(req.body.deadline);
  if (!d) return res.status(404).json({ success: false, message: 'Opportunity not found' });
  const a = await Application.create({ user: req.user._id, deadline: d._id, stage: req.body.stage });
  // Confirmation: in-app notification + email to the student's registered / Google email
  try {
    const lines = [
      `Hi ${req.user.name},`, '',
      `You have registered "${d.title}" in your application tracker.`, '',
      d.organization && `Organization: ${d.organization}`,
      `Deadline: ${day(d.deadlineDate)}`,
      d.applicationLink && `Apply here: ${d.applicationLink}`,
      d.documentsRequired?.length > 0 && `Documents to keep ready: ${d.documentsRequired.join(', ')}`,
      d.sourceUrl && `Official notice: ${d.sourceUrl}`, '',
      'We will remind you 3 days and 1 day before the deadline.', '', '- Campus Deadlines',
    ].filter(x => typeof x === 'string');   // drops fields that are empty
    await notify(req.user._id, 'registered', `You registered "${d.title}" (closes ${day(d.deadlineDate)})`, d._id, `reg-${req.user._id}-${d._id}`,
      { subject: `Registered: ${d.title}`, text: lines.join('\n') });
  } catch (e) { console.error('Registration notification failed:', e.message); }
  res.status(201).json({ success: true, data: a });
}));
r.put('/:id', wrap(async (req, res) => {
  const a = await Application.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { stage: req.body.stage, notes: req.body.notes }, { new: true, runValidators: true, omitUndefined: true });
  a ? res.json({ success: true, data: a }) : res.status(404).json({ success: false, message: 'Not found' });
}));
r.delete('/:id', wrap(async (req, res) => { await Application.deleteOne({ _id: req.params.id, user: req.user._id }); res.json({ success: true, data: 'Removed' }); }));
module.exports = r;