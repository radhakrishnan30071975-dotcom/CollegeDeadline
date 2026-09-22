import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const DeadlineDetails = () => {
  const { id } = useParams();
  const [deadline, setDeadline] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/deadlines/${id}`)
      .then((res) => setDeadline(res.data.deadline))
      .catch(() => setMessage("Could not load this opportunity."))
      .finally(() => setLoading(false));
  }, [id]);

  const setReminder = async (days) => {
    setMessage("");
    try {
      await api.post("/notifications/remind", { deadlineId: id, remindBeforeDays: days });
      setMessage(`Reminder set for ${days} day${days > 1 ? "s" : ""} before the deadline.`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to set reminder.");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("Link copied to clipboard.");
    } catch {
      setMessage(window.location.href);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!deadline) return <div className="empty-state">Opportunity not found.</div>;

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <span className="tag">{deadline.category}</span>
      <h2 style={{ marginTop: 10 }}>{deadline.title}</h2>
      {deadline.organization && <p>{deadline.organization}</p>}

      <p>{deadline.description}</p>

      <table style={{ marginBottom: 16 }}>
        <tbody>
          <tr>
            <th>Deadline</th>
            <td>
              {formatDate(deadline.deadlineDate)} {deadline.deadlineTime}
            </td>
          </tr>
          <tr>
            <th>Eligibility</th>
            <td>{deadline.eligibilityBranches?.join(", ")} | Year: {deadline.eligibilityYears?.join(", ")}</td>
          </tr>
          <tr>
            <th>Minimum CGPA</th>
            <td>{deadline.minimumCGPA || "None"}</td>
          </tr>
          {deadline.documentsRequired && (
            <tr>
              <th>Documents Required</th>
              <td>{deadline.documentsRequired}</td>
            </tr>
          )}
          {deadline.contactInformation && (
            <tr>
              <th>Contact</th>
              <td>{deadline.contactInformation}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {deadline.applicationLink && (
          <a
            className="btn btn-success"
            href={deadline.applicationLink}
            target="_blank"
            rel="noreferrer"
          >
            Apply Now
          </a>
        )}
        <button className="btn btn-secondary" onClick={() => setReminder(1)}>
          Remind Me (1 day)
        </button>
        <button className="btn btn-secondary" onClick={() => setReminder(3)}>
          Remind Me (3 days)
        </button>
        <button className="btn btn-secondary" onClick={handleShare}>
          Share
        </button>
      </div>

      {message && <p className="success-text" style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
};

export default DeadlineDetails;
