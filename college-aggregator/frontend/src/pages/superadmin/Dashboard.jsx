import React, { useEffect, useState } from "react";
import api from "../../services/api";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    studentCount: 0,
    adminCount: 0,
    deadlineCount: 0,
    pendingCount: 0,
    categoryCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/superadmin/stats")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Super Admin Dashboard</h2>
      <p>System-wide overview.</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="value">{stats.studentCount}</div>
            <div className="label">Students</div>
          </div>
          <div className="summary-card">
            <div className="value">{stats.adminCount}</div>
            <div className="label">Admins</div>
          </div>
          <div className="summary-card">
            <div className="value">{stats.deadlineCount}</div>
            <div className="label">Approved Opportunities</div>
          </div>
          <div className="summary-card">
            <div className="value">{stats.pendingCount}</div>
            <div className="label">Pending Review</div>
          </div>
          <div className="summary-card">
            <div className="value">{stats.categoryCount}</div>
            <div className="label">Categories</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
