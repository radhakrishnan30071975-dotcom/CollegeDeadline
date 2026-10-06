const tokens = s => new Set((s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2));
// Jaccard similarity = shared words / all distinct words
exports.similarity = (a, b) => { const A = tokens(a), B = tokens(b); const i = [...A].filter(x => B.has(x)).length; return i / ((A.size + B.size - i) || 1); };
const day = d => new Date(d).toISOString().slice(0, 10);
exports.findDuplicate = async (input) => {
  const { Deadline } = require('../models');
  const pool = await Deadline.find({ status: { $in: ['approved', 'pending'] } }).lean();
  let best = null;
  for (const e of pool) {
    if (input._id && String(input._id) === String(e._id)) continue;
    const sim = exports.similarity(input.title, e.title);
    const sameLink = input.applicationLink && e.applicationLink && input.applicationLink.trim() === e.applicationLink.trim();
    const sameCat = input.category === e.category, sameDay = day(input.deadlineDate) === day(e.deadlineDate);
    const sameOrg = input.organization && e.organization && input.organization.toLowerCase() === e.organization.toLowerCase();
    let s = sim * 0.5 + (sameLink ? 0.3 : 0) + (sameCat ? 0.1 : 0) + (sameDay ? 0.1 : 0) + (sameOrg ? 0.1 : 0);
    if (sameLink) s = Math.max(s, 0.9);
    if (s >= 0.6 && (!best || s > best.similarity)) best = { existing: e, similarity: +s.toFixed(2) };
  }
  return best;
};
