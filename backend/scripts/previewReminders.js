// Shows how the reminder wording escalates as the deadline gets closer. Needs no database or internet.
// Run from the backend folder:  node scripts/previewReminders.js
const { compose } = require('../services/urgency');
const d = { title: 'GATE 2027 Registration', deadlineDate: new Date('2026-10-15'), applicationLink: 'https://gate2027.iitm.ac.in', documentsRequired: ['College ID card', 'Passport-size photo'] };
const u = { name: 'Student', myDocuments: ['College ID card'] };
for (const left of [14, 7, 3, 1, 0]) {
  const m = compose(d, u, left);
  console.log(`\n=== ${left} day(s) left  [${m.level}]`);
  console.log('In-app :', m.message);
  console.log('Subject:', m.subject);
}
console.log('\n=== Full email body at 1 day left ===\n' + compose(d, u, 1).text);
