const { readiness } = require('./readiness');
const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

// Escalating reminders: the closer the deadline, the stronger the subject line and the message.
// tier by days left: 0 = last, 1 = final, 2-3 = urgent, 4-7 = soon, 8+ = early
exports.tierFor = left => (left <= 0 ? 'last' : left === 1 ? 'final' : left <= 3 ? 'urgent' : left <= 7 ? 'soon' : 'early');

exports.compose = (d, u, left) => {
  const level = exports.tierFor(left), t = d.title;
  const when = left <= 0 ? 'closes today' : `closes in ${left} day(s)`;
  const message = { last: `LAST DAY: ${t} closes today`, final: `Final day tomorrow: ${t}`, urgent: `Urgent: ${t} ${when}`,
    soon: `Closing soon: ${t} ${when}`, early: `${t} ${when}` }[level];
  const subject = { last: `🚨 LAST DAY: ${t} closes TODAY`, final: `⏰ FINAL DAY TOMORROW: ${t}`, urgent: `⚠️ Only ${left} day(s) left: ${t}`,
    soon: `Closing soon: ${t} ${when}`, early: `Reminder: ${t} ${when}` }[level];
  const headline = {
    last: 'Today is the LAST DAY. Submit your application before it closes.',
    final: 'Tomorrow is the last day. Please submit your application today.',
    urgent: `Only ${left} day(s) left. Finish your documents and apply now.`,
    soon: 'The deadline is coming up. Time to start your application.',
    early: 'You have time, but start gathering your documents and read the eligibility details.',
  }[level];

  // Readiness-aware: name the documents the student has not marked as ready
  const r = readiness(d, u);
  const docs = r.total === 0 ? '' : r.missing.length
    ? `Documents still missing from your profile: ${r.missing.join(', ')}. Upload them in "My documents".`
    : 'All required documents are ready. You can apply now.';

  const text = [
    `Hi ${u.name},`, '',
    `${level === 'early' ? 'Reminder' : level === 'soon' ? 'Closing soon' : level === 'urgent' ? 'URGENT' : level === 'final' ? 'FINAL DAY TOMORROW' : 'LAST DAY'}: "${t}" ${when}. Deadline: ${fmt(d.deadlineDate)}.`, '',
    headline,
    docs && `\n${docs}`,
    d.applicationLink && `\nApply here: ${d.applicationLink}`,
    '\nAlready applied? Open your Application tracker and set the stage to "Application Submitted" to stop these reminders.',
    '\n- Campus Deadlines',
  ].filter(x => typeof x === 'string').join('\n');
  return { level, message, subject, text };
};