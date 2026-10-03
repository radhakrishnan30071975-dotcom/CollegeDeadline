import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { get, send, errMsg } from '../services/api'; import { INTERESTS, BRANCHES, DOCUMENT_TYPES } from './Auth'; import { fmt, Empty } from './Common';
const Chart = ({ title, data, x = '_id' }) => <div className="card"><b>{title}</b><div style={{ height: 200 }}><ResponsiveContainer><BarChart data={data}><XAxis dataKey={x} fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey={data?.[0]?.views !== undefined ? 'views' : 'count'} fill="#e08a00" /></BarChart></ResponsiveContainer></div></div>;
export function AdminDashboard() {
  const [a, setA] = useState(null); const [p, setP] = useState([]); const load = () => { get('/admin/analytics').then(setA); get('/admin/pending').then(setP); }; useEffect(() => { load(); }, []);
  const reject = async d => { const reason = prompt('Reason for rejection (required)'); if (reason) { await send('put', `/admin/deadlines/${d._id}/reject`, { reason }); load(); } };
  if (!a) return <p>Loading…</p>; const T = a.totals;
  return <><div className="row"><h2>Admin dashboard</h2><Link to="/admin/add"><button>Add official opportunity</button></Link></div>
    <div className="grid">{[['Active', T.active], ['Pending', T.pending], ['Approved this week', T.approvedThisWeek], ['Rejected', T.rejected], ['Expiring soon', T.expiringSoon], ['Top category', a.byCategory[0]?._id || '—']].map(([l, v]) => <div key={l} className="card stat"><b>{v}</b>{l}</div>)}</div>
    <h3>Pending submissions</h3>{p.length ? p.map(d => <div className="card" key={d._id}><b>{d.title}</b> <span className="muted">{d.category} · closes {fmt(d.deadlineDate)} · by {d.submittedBy?.name}</span><p>{d.description}</p>
      {d.sourceUrl && <a href={d.sourceUrl} target="_blank" rel="noreferrer">Source</a>}
      {d.duplicate && <div className="warn">⚠ Similar to "{d.duplicate.existing.title}" ({Math.round(d.duplicate.similarity * 100)}%)</div>}
      <div className="row"><button onClick={() => send('put', `/admin/deadlines/${d._id}/approve`).then(load)}>Approve</button><button className="danger" onClick={() => reject(d)}>Reject</button>
        <button className="alt" onClick={() => confirm('Delete as spam?') && send('delete', `/admin/deadlines/${d._id}`).then(load)}>Delete</button></div></div>) : <Empty text="No pending submissions." />}
    <div className="grid"><Chart title="Opportunities by category" data={a.byCategory} /><Chart title="Submissions by status" data={a.byStatus} /><Chart title="Deadlines per month" data={a.perMonth} />
      <Chart title="Most viewed" data={a.mostViewed} x="title" /><Chart title="Tracker stages" data={a.trackerStages} /></div></>;
}
export function AdminAdd() {
  const [f, setF] = useState({ title: '', category: 'Internship', organization: '', description: '', deadlineDate: '', applicationLink: '', sourceUrl: '', minimumCGPA: 0, eligibilityBranches: [], eligibilityYears: [], documentsRequired: [], isPinned: false, notifyStudents: true });
  const [msg, setMsg] = useState('');
  const s = k => e => setF({ ...f, [k]: e.target.value });
  const pick = (k, v) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] });
  const go = async e => {
    e.preventDefault();
    try { await send('post', '/admin/deadlines', { ...f, minimumCGPA: +f.minimumCGPA }); setMsg('Published'); }
    catch (x) { setMsg(errMsg(x)); }
  };
  return <div className="card" style={{ maxWidth: 600 }}>
    <h2>Add official opportunity</h2>
    <p className="muted">Enter only verified information and always include the official source URL.</p>
    <form onSubmit={go}>
      <input placeholder="Title" onChange={s('title')} />
      <input placeholder="Organization" onChange={s('organization')} />
      <select onChange={s('category')}>{INTERESTS.map(i => <option key={i}>{i}</option>)}</select>
      <textarea placeholder="Description" onChange={s('description')} />
      <input type="date" onChange={s('deadlineDate')} />
      <div><b>Eligible branches</b> <span className="muted">(none ticked = all)</span>
        <div className="row">{BRANCHES.map(b => <label key={b}><input type="checkbox" checked={f.eligibilityBranches.includes(b)} onChange={() => pick('eligibilityBranches', b)} /> {b}</label>)}</div></div>
      <div><b>Eligible years</b> <span className="muted">(none ticked = all)</span>
        <div className="row">{[1, 2, 3, 4].map(y => <label key={y}><input type="checkbox" checked={f.eligibilityYears.includes(y)} onChange={() => pick('eligibilityYears', y)} /> Year {y}</label>)}</div></div>
      <input type="number" step="0.1" placeholder="Minimum CGPA (0 = none)" onChange={s('minimumCGPA')} />
      <div><b>Documents required</b> <span className="muted">(as listed in the official notice)</span>
        <div className="row">{DOCUMENT_TYPES.map(x => <label key={x}><input type="checkbox" checked={f.documentsRequired.includes(x)} onChange={() => pick('documentsRequired', x)} /> {x}</label>)}</div></div>
      <input placeholder="Application link" onChange={s('applicationLink')} />
      <input placeholder="Official notice / source URL" onChange={s('sourceUrl')} />
      <label><input type="checkbox" onChange={e => setF({ ...f, isPinned: e.target.checked })} /> Pin to top</label>
      <label><input type="checkbox" checked={f.notifyStudents} onChange={e => setF({ ...f, notifyStudents: e.target.checked })} /> Notify eligible students</label>
      <button>Publish</button>
    </form>
    {msg && <p>{msg}</p>}
  </div>;
}