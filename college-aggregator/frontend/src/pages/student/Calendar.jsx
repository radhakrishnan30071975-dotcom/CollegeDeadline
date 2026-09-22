import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../../services/api";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [scope, setScope] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/deadlines/calendar", { params: { mine: scope === "mine" } })
      .then((res) => setEvents(res.data.events))
      .catch((err) => console.error(err));
  }, [scope]);

  return (
    <div>
      <h2>Calendar</h2>

      <div className="filter-bar">
        <select value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="all">All</option>
          <option value="mine">My Opportunities</option>
        </select>
      </div>

      <div className="card">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
          eventClick={(info) => navigate(`/deadline/${info.event.id}`)}
        />
      </div>
    </div>
  );
};

export default Calendar;
