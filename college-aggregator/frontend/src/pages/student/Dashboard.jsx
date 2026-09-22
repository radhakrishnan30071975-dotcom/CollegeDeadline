import React, { useEffect, useState } from "react";
import api from "../../services/api";
import OpportunityCard from "../../components/OpportunityCard.jsx";

const Dashboard = () => {
  const [feed, setFeed] = useState([]);
  const [closingSoon, setClosingSoon] = useState([]);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [feedRes, allRes, submissionsRes] = await Promise.all([
          api.get("/deadlines/feed"),
          api.get("/deadlines"),
          api.get("/users/me/submissions"),
        ]);

        const personalized = feedRes.data.deadlines;
        setFeed(personalized);
        setActiveCount(allRes.data.deadlines.length);
        setSubmissionsCount(submissionsRes.data.submissions.length);

        const soon = [...allRes.data.deadlines]
          .sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate))
          .slice(0, 3);
        setClosingSoon(soon);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <p>Here's what's relevant to you right now.</p>

      <div className="summary-grid">
        <div className="summary-card summary-card--opportunity">
          <div className="value">{activeCount}</div>
          <div className="label">Active Opportunities</div>
        </div>
        <div className="summary-card summary-card--danger">
          <div className="value">{closingSoon.length}</div>
          <div className="label">Closing Soon</div>
        </div>
        <div className="summary-card summary-card--normal">
          <div className="value">{submissionsCount}</div>
          <div className="label">My Submissions</div>
        </div>
      </div>

      <div className="section-header">
        <h2>Closing Soon</h2>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : closingSoon.length === 0 ? (
        <div className="empty-state">No upcoming deadlines right now.</div>
      ) : (
        <div className="opportunity-list">
          {closingSoon.map((d) => (
            <OpportunityCard key={d._id} deadline={d} />
          ))}
        </div>
      )}

      <div className="section-header">
        <h2>For You</h2>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : feed.length === 0 ? (
        <div className="empty-state">
          No personalized matches yet. Try adding more interests in your profile.
        </div>
      ) : (
        <div className="opportunity-list">
          {feed.map((d) => (
            <OpportunityCard key={d._id} deadline={d} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
