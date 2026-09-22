import React from "react";
import { useNavigate } from "react-router-dom";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const getUrgency = (date) => {
  const daysUntilDeadline = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  if (daysUntilDeadline <= 3) return "danger";
  if (daysUntilDeadline <= 7) return "warning";
  return "opportunity";
};

const OpportunityCard = ({ deadline }) => {
  const navigate = useNavigate();
  const urgency = getUrgency(deadline.deadlineDate);

  return (
    <div className={`opportunity-card opportunity-card--${urgency}`}>
      <div className="info">
        <h3>{deadline.title}</h3>
        <div className="meta">
          <span className={`tag tag-${urgency}`}>{deadline.category}</span>
          <span>Deadline: {formatDate(deadline.deadlineDate)}</span>
          {deadline.minimumCGPA > 0 && <span>Min CGPA: {deadline.minimumCGPA}</span>}
        </div>
      </div>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/deadline/${deadline._id}`)}>
        View Details
      </button>
    </div>
  );
};

export default OpportunityCard;
