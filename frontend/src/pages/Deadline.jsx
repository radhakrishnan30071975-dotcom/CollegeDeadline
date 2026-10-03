import { useEffect, useState } from 'react'; import { useParams } from 'react-router-dom'; import { get, send, errMsg } from '../services/api'; import { Match, Reasons, fmt } from './Common';
export default function DeadlinePage() {
  const { id } = useParams(); const [x, setX] = useState(null); const [msg, setMsg] = useState('');
  useEffect(() => { get('/deadlines/' + id).then(setX).catch(e => setMsg(errMsg(e))); }, [id]);
  if (!x) return <p className="err">{msg || 'Loading…'}</p>;
  const d = x.deadline, rd = x.readiness;
  const act = async fn => { try { await fn(); setMsg('Done'); } catch (e) { setMsg(errMsg(e)); } };
  return <div className="card"><div className="row"><h2 style={{ margin: 0 }}>{d.title}</h2>{d.official ? <span className="badge ok">Official</span> : <span className="badge off">Student submitted</span>}</div>
    <p className="muted">{d.category} · closes {fmt(d.deadlineDate)} {d.deadlineTime}</p><p>{d.description}</p>
    <Match item={x} /><Reasons list={x.matchReasons} />
    {x.gaps?.length > 0 && <div className="warn"><b>Why you may not qualify</b>{x.gaps.map(g => <div key={g}>• {g}</div>)}</div>}
    <p>Eligible branches: {d.eligibilityBranches?.join(', ') || 'All'} · Years: {d.eligibilityYears?.join(', ') || 'All'} · Min CGPA: {d.minimumCGPA}</p>
    {rd?.total > 0 && <div className="card"><b>Document readiness: {rd.ready.length} of {rd.total} ready</b>
      {rd.ready.map(r => <div key={r} className="ok-t">✓ {r}</div>)}{rd.missing.map(r => <div key={r} className="bad-t">✗ Missing: {r}</div>)}
      {rd.missing.length > 0 && <p className="muted">Tick the documents you have on your Profile page to update this.</p>}</div>}
    {d.contactPerson && <p>Contact: {d.contactPerson} {d.contactEmail}</p>}
    <div className="row">{d.applicationLink && <a href={d.applicationLink} target="_blank" rel="noreferrer"><button>Apply</button></a>}
      {d.sourceUrl && <a href={d.sourceUrl} target="_blank" rel="noreferrer"><button className="alt">Source / Official notice</button></a>}
      <button className="alt" disabled={!!x.tracked} onClick={() => act(() => send('post', '/applications', { deadline: id }))}>{x.tracked ? 'In tracker' : 'Add to tracker'}</button>
      <button className="alt" onClick={() => act(() => send('post', '/notifications/remind', { deadline: id, message: `Reminder: ${d.title}` }))}>Remind me</button>
      <button className="alt" onClick={() => navigator.clipboard.writeText(location.href).then(() => setMsg('Link copied'))}>Share</button></div>{msg && <p className="muted">{msg}</p>}</div>;
}