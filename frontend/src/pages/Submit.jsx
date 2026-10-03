import { useState } from 'react'; import { send, errMsg } from '../services/api'; import { INTERESTS, BRANCHES } from './Auth'; import { fmt } from './Common';
export default function Submit() {
  const [f, setF] = useState({ title: '', category: 'Internship', organization: '', description: '', deadlineDate: '', applicationLink: '', sourceUrl: '', minimumCGPA: 0, eligibilityBranches: [], eligibilityYears: [], documentsRequired: [] });
  const [dup, setDup] = useState(null); const [msg, setMsg] = useState(''); const s = k => e => setF({ ...f, [k]: e.target.value });
  const list = (k, conv) => e => setF({ ...f, [k]: e.target.value.split(',').map(x => x.trim()).filter(Boolean).map(conv) });
  const go = async ev => { ev.preventDefault(); setDup(null); setMsg(''); try { await send('post', '/deadlines', { ...f, minimumCGPA: +f.minimumCGPA }); setMsg('Submitted. It will be visible to students only after an admin approves it.'); }
    catch (e) { e.response?.status === 409 ? setDup(e.response.data.data) : setMsg(errMsg(e)); } };
  return <div className="card" style={{ maxWidth: 600 }}><h2>Submit an opportunity</h2>
    {dup && <div className="warn">⚠ Similar opportunity already exists ({Math.round(dup.similarity * 100)}% similar): <b>{dup.existing.title}</b>, closes {fmt(dup.existing.deadlineDate)}</div>}
    <form onSubmit={go}><input placeholder="Title" onChange={s('title')} /><input placeholder="Organization" onChange={s('organization')} />
      <select onChange={s('category')}>{INTERESTS.map(i => <option key={i}>{i}</option>)}</select><textarea placeholder="Description" onChange={s('description')} />
      <input type="date" onChange={s('deadlineDate')} /><input placeholder="Eligible branches (comma separated, blank = all) e.g. CSE, IT" onChange={list('eligibilityBranches', x => x)} />
      <input placeholder="Eligible years e.g. 3, 4" onChange={list('eligibilityYears', Number)} /><input type="number" step="0.1" placeholder="Minimum CGPA" onChange={s('minimumCGPA')} />
      <input placeholder="Documents required (comma separated) e.g. Resume, Aadhaar card" onChange={list('documentsRequired', x => x)} />
      <input placeholder="Application link" onChange={s('applicationLink')} /><input placeholder="Source / official notice URL" onChange={s('sourceUrl')} /><button>Submit for review</button></form>{msg && <p>{msg}</p>}</div>;
}