import React, { useEffect, useState } from "react";
import api from "../../services/api";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const PendingSubmissions = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/admin/pending");
    setPending(res.data.deadlines);
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
      <h2>Pending Submissions</h2>

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
                <th>Submitted Date</th>
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
                  <td>{formatDate(d.createdAt)}</td>
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

export default PendingSubmissions;
