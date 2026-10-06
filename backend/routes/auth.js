const r = require('express').Router(), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models'), { authenticateToken, wrap } = require('../middleware/auth');
const sign = u => ({ token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '1h' }),
  refreshToken: jwt.sign({ id: u._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }), user: { id: u._id, name: u.name, email: u.email, role: u.role } });
const bad = (res, m, c = 400) => res.status(c).json({ success: false, message: m });
r.post('/register', wrap(async (req, res) => {
  const { name, email, password, branch, year, cgpa, interests } = req.body;
  if (!name || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 6) return bad(res, 'Name, valid email and password (min 6) required');
  if (await User.findOne({ email: email.toLowerCase() })) return bad(res, 'Email already registered', 409);
  const u = await User.create({ name, email, branch, year, cgpa, interests, password: await bcrypt.hash(password, 10) }); // role always student
  require('../services/autoTrack').autoTrackUser(u).catch(e => console.error('Auto-track failed:', e.message));
  res.status(201).json({ success: true, data: sign(u) });
}));
r.post('/login', wrap(async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() }).select('+password');
  if (!u || !u.password || !(await bcrypt.compare(req.body.password || '', u.password))) return bad(res, 'Invalid email or password', 401);
  res.json({ success: true, data: sign(u) });
}));
// Google OAuth: frontend gets a Google ID token; backend verifies it with Google, then issues our JWT
r.post('/google', wrap(async (req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const p = (await client.verifyIdToken({ idToken: req.body.credential, audience: process.env.GOOGLE_CLIENT_ID })).getPayload();
  let u = await User.findOne({ email: p.email });
  if (!u) u = await User.create({ name: p.name, email: p.email, googleId: p.sub });
  res.json({ success: true, data: sign(u) });
}));
r.post('/refresh-token', wrap(async (req, res) => {
  try { const { id } = jwt.verify(req.body.refreshToken, process.env.JWT_REFRESH_SECRET); res.json({ success: true, data: sign(await User.findById(id)) }); }
  catch { bad(res, 'Invalid refresh token', 401); }
}));
r.get('/me', authenticateToken, (req, res) => res.json({ success: true, data: req.user }));
r.post('/logout', (req, res) => res.json({ success: true, data: 'Logged out (client discards tokens)' }));
module.exports = r;