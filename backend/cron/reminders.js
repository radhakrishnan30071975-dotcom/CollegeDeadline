const cron = require('node-cron');
const { Deadline, User, Application } = require('../models');
const { score } = require('../services/match');
const { notify } = require('../services/notify');
const { autoTrackAll } = require('../services/autoTrack');
const { compose } = require('../services/urgency');

// Runs every day at 8:00 AM, and once whenever the backend starts (so a missed 8 AM is caught up).
// For testing, add REMINDER_CRON="* * * * *" to backend/.env (every minute), then delete it.
const SCHEDULE = process.env.REMINDER_CRON || '0 8 * * *';
// Students who did NOT register get a reminder only on these days before the deadline (if the opportunity matches them).
const NEAR_DAYS = (process.env.REMINDER_DAYS || '3,1').split(',').map(Number).filter(n => n >= 0);
// Once a registered student reaches one of these stages, daily reminders stop.
const FINISHED = ['Application Submitted', 'Selected', 'Rejected', 'Withdrawn'];

const midnight = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const stamp = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

module.exports = () => {
  console.log(`Reminder job scheduled: ${SCHEDULE} (daily for registered students; ${NEAR_DAYS.join(', ')} day(s) before for matched students)`);

  const run = async () => {
    try {
      await autoTrackAll();   // first, add any matching opportunities to students' trackers automatically
      const today = midnight(new Date()), todayKey = stamp(today);
      const students = await User.find({ role: 'student' });
      const open = await Deadline.find({ status: 'approved', deadlineDate: { $gte: new Date() } });
      for (const d of open) {
        const left = Math.round((midnight(d.deadlineDate) - today) / 864e5);
        const stages = new Map((await Application.find({ deadline: d._id })).map(a => [String(a.user), a.stage]));
        for (const u of students) {
          const stage = stages.get(String(u._id));
          let key;
          if (stage) { if (FINISHED.includes(stage)) continue; key = `rem-${d._id}-${todayKey}`; }          // registered: every day until the deadline
          else if (NEAR_DAYS.includes(left) && score(d, u).matchScore >= 65) key = `rem-${d._id}-${left}`;  // not registered: only near the deadline
          else continue;
          const m = compose(d, u, left);   // escalating wording: calm early, urgent near the deadline
          await notify(u._id, 'deadline_reminder', m.message, d._id, key, { subject: m.subject, text: m.text });
        }
      }
      await Deadline.updateMany({ status: 'approved', deadlineDate: { $lt: new Date() } }, { status: 'expired' });
    } catch (e) { console.error('Reminder job failed:', e.message); }
  };

  run();                                  // catch up when the backend starts (e.g. laptop was off at 8 AM)
  return cron.schedule(SCHEDULE, run);
};