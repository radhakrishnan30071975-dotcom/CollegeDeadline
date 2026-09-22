import React, { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext.jsx";

const INTERESTS = [
  "Internships",
  "Scholarships",
  "Hackathons",
  "Competitions",
  "Placements",
  "Cultural",
  "Sports",
  "Higher Studies",
  "Workshops",
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    branch: user.branch || "",
    year: user.year || "",
    cgpa: user.cgpa || "",
    interests: user.interests || [],
  });
  const [message, setMessage] = useState("");

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.put("/users/me", form);
      updateUser(res.data.user);
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile.");
    }
  };

  return (
    <div>
      <h2>My Profile</h2>
      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        <div className="field">
          <label>Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={user.email} disabled />
        </div>
        <div className="field">
          <label>Branch</label>
          <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
        </div>
        <div className="field">
          <label>Year</label>
          <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
            <option value="">Select</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div className="field">
          <label>CGPA</label>
          <input
            type="number"
            step="0.01"
            value={form.cgpa}
            onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Interests</label>
          <div className="checkbox-grid">
            {INTERESTS.map((interest) => (
              <label key={interest}>
                <input
                  type="checkbox"
                  checked={form.interests.includes(interest)}
                  onChange={() => toggleInterest(interest)}
                />
                {interest}
              </label>
            ))}
          </div>
        </div>

        {message && <p className="success-text">{message}</p>}

        <button className="btn btn-primary" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
