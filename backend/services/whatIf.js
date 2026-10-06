// What-if simulator: for opportunities the student is NOT eligible for, find the single change that would unlock them.
// Only opportunities blocked by exactly ONE rule are considered (fixing one thing must be enough).
// Branch cannot be changed, so a branch problem is only suggested when the profile has no branch yet.
exports.whatIf = (deadlines, u, now = new Date()) => {
  const fixes = [], cgpaItems = [], yearGroups = new Map(), profile = new Map();
  const brief = d => ({ _id: d._id, title: d.title, deadlineDate: d.deadlineDate });

  for (const d of deadlines) {
    if (new Date(d.deadlineDate) < now) continue;                       // already closed: nothing to unlock
    const branches = d.eligibilityBranches || [], years = d.eligibilityYears || [], need = d.minimumCGPA || 0;
    const blockers = [
      !(!branches.length || branches.includes(u.branch)) && 'branch',
      !(!years.length || years.includes(u.year)) && 'year',
      !((u.cgpa ?? 0) >= need) && 'cgpa',
    ].filter(Boolean);
    if (blockers.length !== 1) continue;                                // eligible already, or needs more than one change
    const b = blockers[0];

    if (b === 'branch' && !u.branch) profile.set('branch', [...(profile.get('branch') || []), d]);
    else if (b === 'year' && !u.year) profile.set('year', [...(profile.get('year') || []), d]);
    else if (b === 'cgpa' && u.cgpa == null) profile.set('cgpa', [...(profile.get('cgpa') || []), d]);
    else if (b === 'cgpa') cgpaItems.push({ need, d });
    else if (b === 'year') {
      const next = Math.min(...years.filter(y => y > u.year));          // the first eligible year the student can still reach
      if (Number.isFinite(next)) yearGroups.set(next, [...(yearGroups.get(next) || []), d]);
    }
  }

  for (const [field, list] of profile)
    fixes.push({ type: 'profile', action: `Add your ${field === 'cgpa' ? 'CGPA' : field} to your profile`, detail: 'Your profile is incomplete, so these opportunities cannot be checked for you.', unlocks: list.map(brief) });

  // CGPA is cumulative: reaching 8.0 also unlocks everything that needs 7.5
  const needs = [...new Set(cgpaItems.map(x => x.need))].sort((a, b) => a - b).slice(0, 3);
  for (const n of needs)
    fixes.push({ type: 'cgpa', action: `Raise your CGPA to ${n}`, detail: `You are ${(n - u.cgpa).toFixed(1)} short (you have ${u.cgpa}).`, unlocks: cgpaItems.filter(x => x.need <= n).map(x => brief(x.d)) });

  for (const [yr, list] of yearGroups)
    fixes.push({ type: 'year', action: `Reach year ${yr}`, detail: `You are in year ${u.year}. These open to year ${yr}.`, unlocks: list.map(brief) });

  return fixes.sort((a, b) => b.unlocks.length - a.unlocks.length).slice(0, 4);
};