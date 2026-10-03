import { Link } from 'react-router-dom';
export const fmt = d => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
export const Match = ({ item }) => <div><span className="score">{item.matchScore}% Match</span> <span className="muted">{item.matchLabel}</span></div>;
export const Reasons = ({ list }) => <ul style={{ listStyle: 'none', padding: 0 }}>{list.map((r, i) => <li key={i} className={r.ok ? 'ok-t' : 'bad-t'}>{r.ok ? '✓' : '✗'} {r.text}</li>)}</ul>;
export const DeadlineCard = ({ item }) => { const d = item.deadline || item; return <Link to={`/deadline/${d._id}`} className="card opportunity-card" style={{ display: 'block' }}>
  <div className="opportunity-header">
    <div className="opportunity-title-wrap">
      <b>{d.title}</b>
      <div className="opportunity-meta"><span className="opportunity-category">{d.category}</span>{d.official && <span className="badge ok">Official</span>}{d.isPinned && <span className="badge off">Pinned</span>}</div>
    </div>
    <span className="opportunity-arrow">→</span>
  </div>
  <div className="opportunity-detail">Closes {fmt(d.deadlineDate)}</div>
  {item.matchScore !== undefined && <Match item={item} />}
</Link>; };
export const Empty = ({ text }) => <div className="card empty-card"><span className="empty-icon">•</span><span>{text}</span></div>;
