import { useEffect, useState } from 'react'; import { get, send } from '../services/api'; import { INTERESTS, BRANCHES } from './Auth'; import { DeadlineCard, Empty, fmt } from './Common';
export function Recent() { const [l, setL] = useState([]); useEffect(() => { get('/users/me/recently-accessed').then(setL); }, [])
  return <><h2>Recently accessed</h2>{l.length ? l.map(x => <DeadlineCard key={x.deadline._id} item={x.deadline} />) : <Empty text="Nothing opened yet." />}</>; }
export function Notifications() { const [l, setL] = useState([]); const load = () => get('/notifications').then(setL); useEffect(() => { load(); }, []);
  return <><h2>Notifications</h2><button className="alt" onClick={() => send('put', '/notifications/read-all').then(load)}>Mark all read</button>
    {l.length ? l.map(n => <div key={n._id} className="card" style={{ opacity: n.read ? .6 : 1 }} onClick={() => send('put', `/notifications/${n._id}/read`).then(load)}>{n.message}<div className="muted">{fmt(n.createdAt)}</div></div>) : <Empty text="No notifications yet." />}</>; }
export function Profile() {
  const [u, setU] = useState(null); const [msg, setMsg] = useState('');
  useEffect(() => { get('/users/me').then(setU); }, []);
  if (!u) return null;
  const toggle = (k, v) => setU({ ...u, [k]: (u[k] || []).includes(v) ? u[k].filter(x => x !== v) : [...(u[k] || []), v] });
  const save = async e => {
    e.preventDefault();
    const { myDocuments, ...rest } = u;   // documents are managed on the My documents page
    await send('put', '/users/me', { ...rest, year: u.year ? +u.year : undefined, cgpa: u.cgpa === '' || u.cgpa == null ? undefined : +u.cgpa });
    setMsg('Profile saved');
  };
  return <div className="card" style={{ maxWidth: 560 }}><h2>Profile</h2><form onSubmit={save}>
    <input value={u.name} onChange={e => setU({ ...u, name: e.target.value })} />
    <input placeholder="College email" value={u.collegeEmail || ''} onChange={e => setU({ ...u, collegeEmail: e.target.value })} />
    <div className="row">
      <select value={u.branch || ''} onChange={e => setU({ ...u, branch: e.target.value })}><option value="">Branch</option>{BRANCHES.map(b => <option key={b}>{b}</option>)}</select>
      <select value={u.year || ''} onChange={e => setU({ ...u, year: e.target.value })}><option value="">Year</option>{[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}</select>
      <input type="number" step="0.1" min="0" max="10" placeholder="CGPA" value={u.cgpa ?? ''} style={{ width: 100 }} onChange={e => setU({ ...u, cgpa: e.target.value })} />
    </div>
    <div><b>Interests</b><div className="row">{INTERESTS.map(i => <label key={i}><input type="checkbox" checked={(u.interests || []).includes(i)} onChange={() => toggle('interests', i)} /> {i}</label>)}</div></div>
    <label><input type="checkbox" checked={u.notifyEmail} onChange={e => setU({ ...u, notifyEmail: e.target.checked })} /> Email notifications</label>
    <button>Save</button></form>{msg && <p>{msg}</p>}</div>;
}