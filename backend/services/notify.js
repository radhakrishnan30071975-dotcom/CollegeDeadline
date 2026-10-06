const nodemailer = require('nodemailer');
const { Notification, User } = require('../models');
const port = +process.env.SMTP_PORT || 587;
const mailer = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST, port, secure: port === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
}) : null;
if (!mailer) console.log('Email is OFF: set SMTP_HOST, SMTP_USER and SMTP_PASSWORD in backend/.env to enable it');

// Saves an in-app notification and also emails the user (to the email they signed up / signed in with Google).
// `email` is optional: { subject, text } for a richer email; otherwise the message is used.
exports.notify = async (userId, type, message, deadline, key, email) => {
  try { await Notification.create({ user: userId, type, message, deadline, key }); } catch (e) { if (e.code === 11000) return null; throw e; }
  const u = await User.findById(userId);
  if (mailer && u?.notifyEmail && u.email)
    mailer.sendMail({
      from: `"Campus Deadlines" <${process.env.SMTP_USER}>`, to: u.email,
      subject: email?.subject || message, text: email?.text || message,
    }).then(() => console.log('Email sent to', u.email)).catch(e => console.error('Email failed:', e.message));
};