import { useEffect, useState } from 'react'; import api, { get, send, errMsg } from '../services/api'; import { DOCUMENT_TYPES } from './Auth';
const size = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
export default function MyDocuments() {
  const [have, setHave] = useState([]); const [files, setFiles] = useState([]); const [msg, setMsg] = useState('');
  const load = () => { get('/users/me').then(u => setHave(u.myDocuments || [])); get('/documents').then(setFiles); };
  useEffect(() => { load(); }, []);
  const fileOf = t => files.find(f => f.type === t);
  const toggle = async t => { const next = have.includes(t) ? have.filter(x => x !== t) : [...have, t]; setHave(next); await send('put', '/users/me', { myDocuments: next }); };
  const upload = (type, file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setMsg('File must be under 2 MB');
    const rd = new FileReader();
    rd.onload = async () => {
      try { await send('post', '/documents', { type, filename: file.name, mime: file.type, data: String(rd.result).split(',')[1] }); setMsg(`${type} uploaded`); load(); }
      catch (e) { setMsg(errMsg(e)); }
    };
    rd.readAsDataURL(file);
  };
  const download = async f => {
    const res = await api.get(`/documents/${f._id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data); const a = window.document.createElement('a');
    a.href = url; a.download = f.filename; a.click(); URL.revokeObjectURL(url);
  };
  const remove = async f => { if (confirm(`Delete ${f.filename}?`)) { await send('delete', `/documents/${f._id}`); load(); } };
  return <><h2>My documents</h2>
    <p className="muted">Tick the documents you already have. Uploading a copy (PDF, JPG or PNG, up to 2 MB) lets you download it later. Only you can see your files. Opportunities use this list to show how ready you are.</p>
    {msg && <div className="warn">{msg}</div>}
    {DOCUMENT_TYPES.map(t => { const f = fileOf(t); return <div className="card" key={t}>
      <div className="row"><b style={{ flex: 1 }}>{t}</b>
        <label><input type="checkbox" checked={have.includes(t)} onChange={() => toggle(t)} /> I have this</label></div>
      {f ? <div className="row"><span className="muted">{f.filename} · {size(f.size)}</span>
        <button className="alt" onClick={() => download(f)}>Download</button><button className="danger" onClick={() => remove(f)}>Delete</button></div>
        : <span className="muted">No file uploaded</span>}
      <div><label className="muted">{f ? 'Replace file: ' : 'Upload file: '}<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { upload(t, e.target.files[0]); e.target.value = ''; }} /></label></div>
    </div>; })}</>;
}