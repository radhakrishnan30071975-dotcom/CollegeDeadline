import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import { get, send } from '../services/api'; import { fmt } from './Common';
const STAGES = ['Interested', 'Planning', 'Application Started', 'Application Submitted', 'Selected', 'Rejected', 'Withdrawn'];
export default function Tracker() {
  const [apps, setApps] = useState([]); const load = () => get('/applications').then(setApps); useEffect(() => { load(); }, []);
  const move = async (a, stage) => { await send('put', '/applications/' + a._id, { stage }); load(); };
  const soon = a => a.stage === 'Planning' && a.deadline && new Date(a.deadline.deadlineDate) - Date.now() < 3 * 864e5 && new Date(a.deadline.deadlineDate) > Date.now();
  return <><h2>Application tracker</h2><div className="kanban">{STAGES.map(s => <div className="col" key={s}><h4>{s} ({apps.filter(a => a.stage === s).length})</h4>
    {apps.filter(a => a.stage === s && a.deadline).map(a => <div className="card" key={a._id}>{soon(a) && <div className="warn">⚠ Closing soon, still planning</div>}
      <Link to={`/deadline/${a.deadline._id}`}><b>{a.deadline.title}</b></Link><div className="muted">Closes {fmt(a.deadline.deadlineDate)}</div>
      <select value={a.stage} onChange={e => move(a, e.target.value)}>{STAGES.map(x => <option key={x}>{x}</option>)}</select>
      <button className="danger" style={{ marginLeft: 6 }} onClick={() => confirm('Remove from tracker?') && send('delete', '/applications/' + a._id).then(load)}>×</button></div>)}</div>)}</div></>;
}
