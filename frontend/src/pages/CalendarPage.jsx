import { useEffect, useState } from 'react'; import FullCalendar from '@fullcalendar/react'; import dayGrid from '@fullcalendar/daygrid'; import timeGrid from '@fullcalendar/timegrid';
import { useNavigate } from 'react-router-dom'; import { get } from '../services/api'; import { INTERESTS } from './Auth';
const COLORS = ['#e08a00', '#1b8a5a', '#3b5bdb', '#c0392b', '#7048e8', '#0c8599', '#d6336c', '#5c940d', '#495057', '#f08c00', '#1971c2'];
export default function CalendarPage() {
  const nav = useNavigate(); const [ev, setEv] = useState([]); const [cat, setCat] = useState(''); useEffect(() => { get('/deadlines/calendar').then(setEv); }, []);
  const events = ev.filter(e => !cat || e.category === cat).map(e => ({ ...e, start: String(e.start).slice(0, 10), allDay: true, color: COLORS[INTERESTS.indexOf(e.category) % COLORS.length] }));
  return <><h2>Calendar</h2><select onChange={e => setCat(e.target.value)}><option value="">All categories</option>{INTERESTS.map(i => <option key={i}>{i}</option>)}</select>
    <div className="card"><FullCalendar plugins={[dayGrid, timeGrid]} initialView="dayGridMonth" headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
      events={events} eventClick={i => nav('/deadline/' + i.event.id)} height="auto" /></div></>;
}
