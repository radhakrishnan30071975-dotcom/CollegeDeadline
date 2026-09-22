import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext.jsx";

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [error, setError] = useState("");
  const canManage = user.role === "superadmin";

  const load = async () => {
    const res = await api.get("/admin/categories");
    setCategories(res.data.categories);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/superadmin/categories", { name, color });
      setName("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add category.");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/superadmin/categories/${id}`);
    load();
  };

  return (
    <div>
      <h2>Categories</h2>

      {canManage && (
        <form className="filter-bar" onSubmit={handleAdd}>
          <input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <button className="btn btn-primary btn-sm" type="submit">
            Add Category
          </button>
        </form>
      )}
      {error && <p className="error-text">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Color</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>
                  <span className="tag" style={{ background: `${c.color}22`, color: c.color }}>
                    {c.color}
                  </span>
                </td>
                {canManage && (
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
