// Largest number of tracked deadlines inside any 3-day window. 0-1 Low, 2-3 Medium, 4+ High.
exports.analyze = (deadlines, now = new Date()) => {
  const dates = deadlines.map(d => ({ id: d._id, title: d.title, date: new Date(d.deadlineDate) })).filter(d => d.date >= now).sort((a, b) => a.date - b.date);
  let max = 0, window = [];
  dates.forEach((d, i) => { const w = dates.filter((x, j) => j >= i && x.date - d.date < 3 * 864e5); if (w.length > max) { max = w.length; window = w; } });
  const level = max >= 4 ? 'High' : max >= 2 ? 'Medium' : 'Low';
  return { level, count: max, message: max >= 2 ? `You have ${max} deadlines within 3 days.` : 'Your deadline load is light.', clash: window, nearest: dates.slice(0, 3) };
};
