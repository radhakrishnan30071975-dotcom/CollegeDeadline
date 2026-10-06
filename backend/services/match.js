// Smart Match Score: branch 30 + year 20 + CGPA 20 + interest 20 + urgency 10 = 100
// Also returns "gaps": exactly why the student is not eligible and how far off they are.
exports.score = (d, u, now = new Date()) => {
  let total = 0; const reasons = [], gaps = [];
  const add = (ok, pts, yes, no) => { if (ok) total += pts; reasons.push({ ok, text: ok ? yes : no }); return ok; };
  const branches = d.eligibilityBranches || [], years = d.eligibilityYears || [];

  const b = add(!branches.length || branches.includes(u.branch), 30, 'Your branch is eligible', 'Your branch is not listed as eligible');
  if (!b) gaps.push(u.branch ? `Open to ${branches.join(', ')} only (you are ${u.branch})` : 'Add your branch in Profile');

  const y = add(!years.length || years.includes(u.year), 20, 'Your year is eligible', 'Your year is not eligible');
  if (!y) {
    const lo = Math.min(...years), hi = Math.max(...years);
    gaps.push(!u.year ? 'Add your year in Profile'
      : u.year < lo ? `Opens from year ${lo} (you are in year ${u.year})`
      : u.year > hi ? `Only up to year ${hi} (you are in year ${u.year})`
      : `Open to year ${years.join(', ')} only (you are in year ${u.year})`);
  }

  const need = d.minimumCGPA || 0;
  const c = add((u.cgpa ?? 0) >= need, 20, 'Your CGPA meets the requirement', `Minimum CGPA ${need} required`);
  if (!c) gaps.push(u.cgpa == null ? 'Add your CGPA in Profile' : `You are ${(need - u.cgpa).toFixed(1)} CGPA short (need ${need}, you have ${u.cgpa})`);

  add((u.interests || []).includes(d.category), 20, 'Matches your interest', 'Outside your selected interests');
  const days = (new Date(d.deadlineDate) - now) / 864e5;
  const urg = days < 0 ? 0 : days <= 7 ? 10 : days <= 14 ? 7 : days <= 30 ? 4 : 2;
  total += urg; reasons.push({ ok: urg >= 7, text: days < 0 ? 'Deadline has passed' : `Closes in ${Math.ceil(days)} day(s)` });
  const label = total >= 85 ? 'Excellent match for your profile' : total >= 65 ? 'Good match' : total >= 40 ? 'Partial match' : 'Low match';
  return { matchScore: total, matchLabel: label, matchReasons: reasons, gaps, eligible: b && y && c };
};