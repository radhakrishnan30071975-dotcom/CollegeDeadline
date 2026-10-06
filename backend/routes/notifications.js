const r = require('express').Router();
const { Notification } = require('../models'), { authenticateToken, wrap } = require('../middleware/auth'), { notify } = require('../services/notify');
r.use(authenticateToken);
r.get('/', wrap(async (req, res) => res.json({ success: true, data: await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50) })));
r.put('/read-all', wrap(async (req, res) => { await Notification.updateMany({ user: req.user._id }, { read: true }); res.json({ success: true, data: 'ok' }); }));
r.put('/:id/read', wrap(async (req, res) => { await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true }); res.json({ success: true, data: 'ok' }); }));
r.post('/remind', wrap(async (req, res) => { await notify(req.user._id, 'deadline_reminder', req.body.message || 'Reminder set', req.body.deadline, `manual-${req.body.deadline}`); res.json({ success: true, data: 'Reminder set' }); }));
module.exports = r;
