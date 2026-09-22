import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const AdminDashboard = () => {
  const [stats, setStats] = useState({ pendingCount: 0, activeCount: 0, submittedThisWeek: 0 });
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const [statsRes, pendingRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/pending"),
    ]);
    setStats(statsRes.data);
    setPending(pendingRes.data.deadlines.slice(0, 5));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await api.put(`/admin/deadlines/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    const reason = window.prompt("Enter a reason for rejection:");
    if (!reason) return;
    await api.put(`/admin/deadlines/${id}/reject`, { rejectionReason: reason });
    load();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="value">{stats.pendingCount}</div>
          <div className="label">Pending Submissions</div>
        </div>
        <div className="summary-card">
          <div className="value">{stats.activeCount}</div>
          <div className="label">Active Opportunities</div>
        </div>
        <div className="summary-card">
          <div className="value">{stats.submittedThisWeek}</div>
          <div className="label">Submissions This Week</div>
        </div>
      </div>

      <div className="section-header">
        <h2>Pending Submissions</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate("/admin/pending")}>
          View All
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : pending.length === 0 ? (
        <div className="empty-state">No pending submissions.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Submitted By</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((d) => (
                <tr key={d._id}>
                  <td>{d.title}</td>
                  <td>{d.category}</td>
                  <td>{d.submittedBy?.name || "-"}</td>
                  <td>{formatDate(d.deadlineDate)}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-success btn-sm" onClick={() => approve(d._id)}>
                      Approve
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => reject(d._id)}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
