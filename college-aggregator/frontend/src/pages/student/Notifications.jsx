import React, { useEffect, useState } from "react";
import api from "../../services/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/notifications");
    setNotifications(res.data.notifications);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    load();
  };

  return (
    <div>
      <div className="section-header">
        <h2>Notifications</h2>
        <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
          Mark All as Read
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="empty-state">No notifications yet.</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {notifications.map((n) => (
            <div key={n._id} className={`notification-item ${n.isRead ? "" : "unread"}`}>
              <div>
                <div>{n.message}</div>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
              {!n.isRead && (
                <button className="btn btn-secondary btn-sm" onClick={() => markRead(n._id)}>
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
