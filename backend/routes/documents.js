const r = require('express').Router();
const { StudentDocument, User } = require('../models');
const { authenticateToken, wrap } = require('../middleware/auth');
const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB per file
r.use(authenticateToken);   // every route here works only on the logged-in student's own files

// list my files (metadata only, never the file bytes)
r.get('/', wrap(async (req, res) => {
  res.json({ success: true, data: await StudentDocument.find({ user: req.user._id }).select('-data').sort({ type: 1 }) });
}));

// upload (or replace) the file for one document type
r.post('/', wrap(async (req, res) => {
  const { type, filename, mime, data } = req.body;
  if (!type || typeof type !== 'string' || type.length > 60 || !filename || !data) return res.status(400).json({ success: false, message: 'type, filename and file data are required' });
  if (!ALLOWED.includes(mime)) return res.status(400).json({ success: false, message: 'Only PDF, JPG or PNG files are allowed' });
  const buf = Buffer.from(data, 'base64');
  if (!buf.length || buf.length > MAX_BYTES) return res.status(400).json({ success: false, message: 'File must be under 2 MB' });
  const doc = await StudentDocument.findOneAndUpdate(
    { user: req.user._id, type },
    { filename: String(filename).slice(0, 120), mime, size: buf.length, data: buf },
    { upsert: true, new: true, setDefaultsOnInsert: true });
  await User.updateOne({ _id: req.user._id }, { $addToSet: { myDocuments: type } });   // uploading also marks "I have this"
  res.status(201).json({ success: true, data: { _id: doc._id, type, filename: doc.filename, mime, size: doc.size } });
}));

// download: only the owner can fetch the file
r.get('/:id/download', wrap(async (req, res) => {
  const doc = await StudentDocument.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) return res.status(404).json({ success: false, message: 'File not found' });
  res.set({ 'Content-Type': doc.mime, 'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(doc.filename)}` });
  res.send(doc.data);
}));

r.delete('/:id', wrap(async (req, res) => {
  await StudentDocument.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ success: true, data: 'Deleted' });
}));
module.exports = r;