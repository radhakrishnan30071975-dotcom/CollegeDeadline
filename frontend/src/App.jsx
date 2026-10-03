import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, CalendarDays, ListChecks, PlusCircle, History, Bell, User, ShieldCheck, LogOut, FileText } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { Login, Signup } from './pages/Auth'; import Dashboard from './pages/Dashboard'; import Browse from './pages/Browse'; import DeadlinePage from './pages/Deadline';
import Tracker from './pages/Tracker'; import Submit from './pages/Submit'; import CalendarPage from './pages/CalendarPage'; import MyDocuments from './pages/MyDocuments';
import MySubmissions from './pages/MySubmissions'; import { Profile, Recent, Notifications } from './pages/Misc'; import { AdminDashboard, AdminAdd } from './pages/Admin';

// admin = admin/superadmin only; staff = volunteer + admin + superadmin
const Guard = ({ children, admin, staff }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to={admin ? '/admin/login' : staff ? '/volunteer/login' : '/login'} />;
  if (admin && !['admin', 'superadmin'].includes(user.role)) return <Navigate to={user.role === 'volunteer' ? '/submit' : '/dashboard'} />;
  if (staff && user.role === 'student') return <Navigate to="/dashboard" />;
  return children;
};

const LINKS = [
  ['/dashboard', 'Dashboard', LayoutDashboard], ['/browse', 'Browse', Search], ['/calendar', 'Calendar', CalendarDays],
  ['/application-tracker', 'Application tracker', ListChecks], ['/my-documents', 'My documents', FileText],
  ['/recently-accessed', 'Recently accessed', History], ['/notifications', 'Notifications', Bell], ['/profile', 'Profile', User],
];
const item = ({ isActive }) => (isActive ? 'active' : '');

export default function App() {
  const { user, logout } = useAuth();
  const isAdmin = user && ['admin', 'superadmin'].includes(user.role);
  const isVolunteer = user && user.role === 'volunteer';

  const routes = (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<Login admin />} />
      <Route path="/volunteer/login" element={<Login volunteer />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} /><Route path="/browse" element={<Guard><Browse /></Guard>} />
      <Route path="/deadline/:id" element={<Guard><DeadlinePage /></Guard>} /><Route path="/calendar" element={<Guard><CalendarPage /></Guard>} />
      <Route path="/my-documents" element={<Guard><MyDocuments /></Guard>} />
      <Route path="/submit" element={<Guard staff><Submit /></Guard>} />
      <Route path="/my-submissions" element={<Guard staff><MySubmissions /></Guard>} />
      <Route path="/notifications" element={<Guard><Notifications /></Guard>} />
      <Route path="/profile" element={<Guard><Profile /></Guard>} /><Route path="/recently-accessed" element={<Guard><Recent /></Guard>} />
      <Route path="/application-tracker" element={<Guard><Tracker /></Guard>} />
      <Route path="/admin/dashboard" element={<Guard admin><AdminDashboard /></Guard>} /><Route path="/admin/submissions" element={<Guard admin><AdminDashboard /></Guard>} />
      <Route path="/admin/analytics" element={<Guard admin><AdminDashboard /></Guard>} /><Route path="/admin/add" element={<Guard admin><AdminAdd /></Guard>} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );

  if (!user) return <main>{routes}</main>;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="logo">CD</span><span>Campus Deadlines</span></div>
        {LINKS.map(([to, label, Icon]) => <NavLink key={to} to={to} className={item}><Icon size={18} />{label}</NavLink>)}
        {isAdmin && <>
          <div className="sep">Admin</div>
          <NavLink to="/admin/dashboard" className={item}><ShieldCheck size={18} />Admin dashboard</NavLink>
          <NavLink to="/admin/add" className={item}><PlusCircle size={18} />Add opportunity</NavLink>
          <NavLink to="/submit" className={item}><PlusCircle size={18} />Submit opportunity</NavLink>
        </>}
        {isVolunteer && <>
          <div className="sep">Volunteer</div>
          <NavLink to="/submit" className={item}><PlusCircle size={18} />Submit opportunity</NavLink>
          <NavLink to="/my-submissions" className={item}><ListChecks size={18} />My submissions</NavLink>
        </>}
        <div className="spacer" />
        <button className="logout" onClick={logout}><LogOut size={18} />Logout</button>
      </aside>
      <div className="content"><main>{routes}</main></div>
    </div>
  );
}