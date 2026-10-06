// Priority planner. Each tracked, unfinished opportunity gets 0-100 points:
//   urgency (max 40) + work left in its stage (max 25) + match score / 5 (max 20) + missing documents (max 15)
const { score } = require('./match');
const { readiness } = require('./readiness');
const urgency = days => days <= 1 ? 40 : days <= 3 ? 34 : days <= 7 ? 26 : days <= 14 ? 16 : days <= 30 ? 8 : 3;
const WORK_LEFT = { Interested: 25, Planning: 20, 'Application Started': 10 }; // submitted/selected/rejected/withdrawn need no action

exports.plan = (apps, user, now = new Date()) => apps
  .filter(a => a.deadline && new Date(a.deadline.deadlineDate) >= now && a.stage in WORK_LEFT)
  .map(a => {
    const d = a.deadline, days = Math.max(0, Math.ceil((new Date(d.deadlineDate) - now) / 864e5));
    const m = score(d, user).matchScore, r = readiness(d, user);
    const docPts = r.total ? Math.round(15 * r.missing.length / r.total) : 0;
    const priority = urgency(days) + WORK_LEFT[a.stage] + Math.round(m / 5) + docPts;
    const reasons = [`Closes in ${days} day(s)`, `Stage: ${a.stage}`, `Match score ${m}/100`];
    if (r.missing.length) reasons.push(`Missing ${r.missing.length} of ${r.total} documents: ${r.missing.join(', ')}`);
    const action = r.missing.length ? 'Get your missing documents' : a.stage === 'Application Started' ? 'Finish and submit' : 'Start your application';
    return { deadline: d, stage: a.stage, priority, action, reasons };
  })
  .sort((a, b) => b.priority - a.priority);