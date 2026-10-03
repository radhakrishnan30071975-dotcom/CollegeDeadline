import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import { get } from '../services/api'; import { useAuth } from '../context/AuthContext'; import { DeadlineCard, Empty, fmt } from './Common';
// Highlighted section heading: coloured accent bar + count pill
const H = ({ tone, n, children }) => <h3 className={`sec sec-${tone}`}>{children}{n !== undefined && <span className="count">{n}</span>}</h3>;
export default function Dashboard() {
  const { user } = useAuth(); const [d, setD] = useState(null); const [recent, setRecent] = useState([]); const [err, setErr] = useState('');
  useEffect(() => { get('/users/me/dashboard').then(setD).catch(e => setErr(e.message)); get('/users/me/recently-accessed').then(setRecent); }, []);
  if (err) return <div className="err">{err}</div>; if (!d) return <p>Loading…</p>;
  const h = new Date().getHours(), hi = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const S = [['Active opportunities', d.stats.activeOpportunities], ['Closing this week', d.stats.closingThisWeek], ['Applications in progress', d.stats.applicationsInProgress], ['Missed deadlines', d.stats.missedDeadlines]];
  return <>
    <h2>{hi}, {user.name}</h2>
    <div className="grid">{S.map(([l, v]) => <div key={l} className="card stat"><b>{v}</b>{l}</div>)}</div>
    {d.warnings.map(w => <div key={w} className="warn">⚠ {w}</div>)}
    <H tone="plan" n={d.planner.length}>What to do today</H>
    {d.planner.length ? d.planner.map((p, i) => { const left = Math.max(0, Math.ceil((new Date(p.deadline.deadlineDate) - Date.now()) / 864e5)), heat = left <= 1 ? 'hot' : left <= 3 ? 'warm' : '';
      return <Link key={p.deadline._id} to={`/deadline/${p.deadline._id}`} className={`card plan ${heat}`} style={{ display: 'block' }}>
      <div className="row"><b>{i + 1}. {p.deadline.title}</b><span className="badge off">Priority {p.priority}/100</span><span className={`days ${heat}`}>{left === 0 ? 'closes today' : `${left} day${left === 1 ? '' : 's'} left`}</span><span className="go">→</span></div>
      <div><b>{p.action}</b></div>
      {p.reasons.map(r => <div key={r} className="muted">• {r}</div>)}</Link>; })
      : <Empty text="Add opportunities to your tracker and your priorities will appear here." />}
    <div className="card"><div className="row"><b>Deadline workload</b><span className={`badge ${d.workload.level}`}>{d.workload.level}</span></div><p>{d.workload.message}</p>
      {d.workload.nearest.map(n => <div key={n.id} className="muted">{n.title} — {fmt(n.date)}</div>)}</div>
    {d.whatIf?.length > 0 && <><H tone="unlock" n={d.whatIf.length}>Unlock more opportunities</H>
      <div className="unlock-grid">{d.whatIf.map(f => <div key={f.action} className="card unlock">
        <div className="unlock-head"><b>{f.action}</b><span className="badge ok">unlocks {f.unlocks.length}</span></div>
        <div className="muted">{f.detail}</div>
        <div className="unlock-list">{f.unlocks.map(u => <Link key={u._id} to={`/deadline/${u._id}`} className="unlock-item"><span className="t">{u.title}</span><span className="muted">closes {fmt(u.deadlineDate)}</span></Link>)}</div>
      </div>)}</div></>}
    <H tone="urgent" n={d.urgent.length}>Urgent deadlines</H>{d.urgent.length ? d.urgent.map(x => <DeadlineCard key={x._id} item={x} />) : <Empty text="Nothing closing this week." />}
    <H tone="rec" n={d.recommended.length}>Recommended for you</H>{d.recommended.length ? d.recommended.map(x => <DeadlineCard key={x.deadline._id} item={x} />) : <Empty text="No opportunities match your profile yet. Complete your Profile." />}
    <H tone="recent" n={Math.min(recent.length, 4)}>Recently accessed</H>{recent.length ? recent.slice(0, 4).map(x => <DeadlineCard key={x.deadline._id} item={x.deadline} />) : <Empty text="Open an opportunity and it will show here." />}
    <Link to="/application-tracker">Open application tracker</Link></>;
}