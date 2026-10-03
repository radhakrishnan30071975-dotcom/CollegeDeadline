import { useEffect, useState } from 'react'; import { get } from '../services/api'; import { DeadlineCard, Empty } from './Common'; import { INTERESTS, BRANCHES } from './Auth';
export default function Browse() {
  const [p, setP] = useState({ q: '', category: '', branch: '', year: '', cgpa: '', status: 'upcoming', sort: 'nearest', page: 1 }); const [data, setData] = useState(null);
  const set = (k, v) => setP({ ...p, [k]: v, page: k === 'page' ? v : 1 });
  useEffect(() => { const t = setTimeout(() => get('/deadlines', Object.fromEntries(Object.entries(p).filter(([, v]) => v !== ''))).then(setData), 250); return () => clearTimeout(t); }, [p]);
  return <><h2>Browse</h2><div className="card row">
    <input placeholder="Search" onChange={e => set('q', e.target.value)} />
    <select onChange={e => set('category', e.target.value)}><option value="">All categories</option>{INTERESTS.map(i => <option key={i}>{i}</option>)}</select>
    <select onChange={e => set('branch', e.target.value)}><option value="">Any branch</option>{BRANCHES.map(i => <option key={i}>{i}</option>)}</select>
    <select onChange={e => set('year', e.target.value)}><option value="">Any year</option>{[1, 2, 3, 4].map(i => <option key={i}>{i}</option>)}</select>
    <input type="number" step="0.1" placeholder="My CGPA" style={{ width: 100 }} onChange={e => set('cgpa', e.target.value)} />
    <select value={p.status} onChange={e => set('status', e.target.value)}><option value="upcoming">Upcoming</option><option value="closed">Closed</option><option value="">All</option></select>
    <select onChange={e => set('sort', e.target.value)}><option value="nearest">Nearest deadline</option><option value="match">Highest match</option><option value="newest">Newest</option></select></div>
    {!data ? <p>Loading…</p> : data.items.length ? data.items.map(i => <DeadlineCard key={i.deadline._id} item={i} />) : <Empty text="No opportunities match these filters." />}
    {data && <div className="row"><button className="alt" disabled={p.page <= 1} onClick={() => set('page', p.page - 1)}>Previous</button><span>Page {data.page} · {data.total} results</span>
      <button className="alt" disabled={data.page * 12 >= data.total} onClick={() => set('page', p.page + 1)}>Next</button></div>}</>;
}
