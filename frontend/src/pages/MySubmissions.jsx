import { useEffect, useState } from 'react';
import { get } from '../services/api';
import { fmt, Empty } from './Common';

const LABEL = {
  pending: 'Waiting for admin approval',
  approved: 'Approved – live for students',
  rejected: 'Rejected',
};

export default function MySubmissions() {
  const [items, setItems] = useState(null);
  useEffect(() => { get('/deadlines/mine/list').then(setItems); }, []);
  if (!items) return <p>Loading…</p>;
  return (
    <>
      <h2>My submissions</h2>
      {items.length ? items.map(d => (
        <div className="card" key={d._id}>
          <b>{d.title}</b> <span className="muted">{d.category} · closes {fmt(d.deadlineDate)}</span>
          <p><b>{LABEL[d.status] || d.status}</b></p>
          {d.status === 'rejected' && d.rejectionReason && <div className="warn">Reason: {d.rejectionReason}</div>}
        </div>
      )) : <Empty text="You haven't submitted anything yet." />}
    </>
  );
}
