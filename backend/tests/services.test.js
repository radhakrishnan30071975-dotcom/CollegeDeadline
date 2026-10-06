const test = require('node:test'), assert = require('node:assert');
const { score } = require('../services/match'), { analyze } = require('../services/workload'), { similarity } = require('../services/duplicate');
const day = n => new Date(Date.now() + n * 864e5);
test('match score: spec example is 90+', () => {
  const r = score({ category: 'Internship', eligibilityBranches: ['CSE'], eligibilityYears: [2, 3, 4], minimumCGPA: 8, deadlineDate: day(5) }, { branch: 'CSE', year: 3, cgpa: 8.5, interests: ['Internship'] });
  assert.ok(r.matchScore >= 90); assert.equal(r.matchReasons[0].ok, true);
});
test('match score: ineligible branch loses 30', () => {
  const r = score({ category: 'X', eligibilityBranches: ['ECE'], deadlineDate: day(40) }, { branch: 'CSE', year: 1, cgpa: 7, interests: [] });
  assert.ok(r.matchScore < 60);
});
test('workload levels', () => {
  assert.equal(analyze([{ deadlineDate: day(1) }]).level, 'Low');
  assert.equal(analyze([{ deadlineDate: day(1) }, { deadlineDate: day(2) }]).level, 'Medium');
  assert.equal(analyze([1, 1.5, 2, 2.5].map(n => ({ deadlineDate: day(n) }))).level, 'High');
});
test('duplicate similarity', () => {
  assert.ok(similarity('Smart India Hackathon 2026', 'Smart India Hackathon') > 0.6);
  assert.ok(similarity('Google Internship', 'Hostel Renewal Form') < 0.2);
});
