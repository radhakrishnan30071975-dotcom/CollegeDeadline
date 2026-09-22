import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext.jsx";

const Admins = () => {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/superadmin/admins");
    setAdmins(res.data.admins);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this admin account? This cannot be undone.")) return;
    await api.delete(`/superadmin/users/${id}`);
    load();
  };

  return (
    <div>
      <div className="section-header">
        <h2>Admins</h2>
      </div>
      <p>
        New admin accounts are created via the "Create Account &rarr; Admin" signup page using the
        admin verification code configured in the backend environment variables.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a._id}>
                  <td>{a.name}</td>
                  <td>{a.email}</td>
                  <td>
                    <span className="tag">{a.role}</span>
                  </td>
                  <td>
                    {a._id !== currentUser._id && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>
                        Remove
                      </button>
                    )}
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

export default Admins;
