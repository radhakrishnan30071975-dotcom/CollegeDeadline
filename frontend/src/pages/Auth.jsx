import { useState, useEffect, useRef } from 'react'; import { useNavigate, Link } from 'react-router-dom'; import { useAuth } from '../context/AuthContext'; import { errMsg } from '../services/api';
export const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
export const INTERESTS = ['Internship', 'Scholarship', 'Hackathon', 'Placement', 'Higher Studies', 'Cultural', 'Sports', 'Club', 'Exam', 'Hostel', 'Exchange Program'];
export const DOCUMENT_TYPES = ['Aadhaar card', 'Income certificate', 'Community certificate', 'Bank passbook', 'Previous marksheet', 'College ID card', 'Bonafide certificate', 'Resume', 'Passport-size photo', 'Recommendation letter', 'Project abstract', 'Passport'];

const home = u => (u.role === 'volunteer' ? '/submit' : ['admin', 'superadmin'].includes(u.role) ? '/admin/dashboard' : '/dashboard');

export function Login({ admin, volunteer }) {
  const { login, google, logout } = useAuth(); const nav = useNavigate(); const [f, setF] = useState({ email: '', password: '' }); const [e, setE] = useState(''); const btn = useRef();
  const student = !admin && !volunteer;
  useEffect(() => { if (!student || !window.google) return; window.google.accounts.id.initialize({ client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: async r => { try { await google(r.credential); nav('/dashboard'); } catch (x) { setE(errMsg(x)); } } }); window.google.accounts.id.renderButton(btn.current, { text: 'continue_with' }); }, []);
  const go = async ev => {
    ev.preventDefault();
    try {
      const u = await login(f.email, f.password);
      if (admin && !['admin', 'superadmin'].includes(u.role)) {
        logout(); setE(u.role === 'volunteer' ? 'This is a volunteer account. Please use the volunteer login.' : 'This account is not an admin'); return;
      }
      if (volunteer && u.role !== 'volunteer') {
        logout(); setE(['admin', 'superadmin'].includes(u.role) ? 'This is an admin account. Please use the admin login.' : 'This account is not a volunteer'); return;
      }
      nav(home(u));
    } catch (x) { setE(errMsg(x)); }
  };
  return <div className="auth-shell">
    <div className="auth-brand">College Opportunity Aggregator</div>
    <div className="card auth-card"><h2>{admin ? 'Admin sign in' : volunteer ? 'Volunteer sign in' : 'Sign in'}</h2>
      <form onSubmit={go}><input placeholder="Email" value={f.email} onChange={x => setF({ ...f, email: x.target.value })} />
        <input type="password" placeholder="Password" value={f.password} onChange={x => setF({ ...f, password: x.target.value })} />
        {e && <div className="err">{e}</div>}<button>Sign in</button></form>
      {student && <><p className="muted">or</p><div ref={btn} /><p>New here? <Link to="/signup">Create an account</Link></p>
        <p className="muted"><Link to="/admin/login">Admin login</Link> · <Link to="/volunteer/login">Volunteer login</Link></p></>}
      {admin && <p className="muted"><Link to="/login">Student login</Link> · <Link to="/volunteer/login">Volunteer login</Link></p>}
      {volunteer && <p className="muted"><Link to="/login">Student login</Link> · <Link to="/admin/login">Admin login</Link></p>}</div>
  </div>;
}
export function Signup() {
  const { register } = useAuth(); const nav = useNavigate(); const [e, setE] = useState('');
  const [f, setF] = useState({ name: '', email: '', password: '', branch: 'CSE', year: 1, cgpa: 7, interests: [] });
  const tog = i => setF({ ...f, interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i] });
  const go = async ev => { ev.preventDefault(); try { await register({ ...f, year: +f.year, cgpa: +f.cgpa }); nav('/dashboard'); } catch (x) { setE(errMsg(x)); } };
  return <div className="card" style={{ maxWidth: 480, margin: '40px auto' }}><h2>Create account</h2><form onSubmit={go}>
    <input placeholder="Full name" onChange={x => setF({ ...f, name: x.target.value })} /><input placeholder="Email" onChange={x => setF({ ...f, email: x.target.value })} />
    <input type="password" placeholder="Password (min 6)" onChange={x => setF({ ...f, password: x.target.value })} />
    <div className="row"><select onChange={x => setF({ ...f, branch: x.target.value })}>{BRANCHES.map(b => <option key={b}>{b}</option>)}</select>
      <select onChange={x => setF({ ...f, year: x.target.value })}>{[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}</select>
      <input type="number" step="0.1" min="0" max="10" defaultValue={7} style={{ width: 90 }} onChange={x => setF({ ...f, cgpa: x.target.value })} /></div>
    <div className="row">{INTERESTS.map(i => <label key={i}><input type="checkbox" onChange={() => tog(i)} /> {i}</label>)}</div>
    {e && <div className="err">{e}</div>}<button>Sign up</button></form><p>Have an account? <Link to="/login">Sign in</Link></p></div>;
}