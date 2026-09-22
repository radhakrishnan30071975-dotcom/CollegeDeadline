import React, { useState } from "react";
import api from "../../services/api";

const CATEGORIES = [
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

const emptyForm = {
  title: "",
  organization: "",
  category: "Internships",
  description: "",
  deadlineDate: "",
  deadlineTime: "23:59",
  eligibilityBranches: "ALL",
  eligibilityYears: "ALL",
  minimumCGPA: "",
  applicationLink: "",
  documentsRequired: "",
  contactInformation: "",
  posterImage: "",
  isPinned: false,
  isOfficial: true,
  sendNotification: false,
};

const AddOpportunity = () => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        eligibilityBranches: form.eligibilityBranches.split(",").map((s) => s.trim()).filter(Boolean),
        eligibilityYears: form.eligibilityYears.split(",").map((s) => s.trim()).filter(Boolean),
        minimumCGPA: form.minimumCGPA ? Number(form.minimumCGPA) : 0,
      };
      await api.post("/admin/deadlines", payload);
      setSuccess("Opportunity published.");
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create opportunity.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Add Opportunity</h2>

      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="field">
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Organization</label>
          <input name="organization" value={form.organization} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Deadline Date</label>
          <input type="date" name="deadlineDate" value={form.deadlineDate} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Deadline Time</label>
          <input type="time" name="deadlineTime" value={form.deadlineTime} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Eligible Branches (comma separated, or ALL)</label>
          <input name="eligibilityBranches" value={form.eligibilityBranches} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Eligible Years (comma separated, or ALL)</label>
          <input name="eligibilityYears" value={form.eligibilityYears} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Minimum CGPA</label>
          <input type="number" step="0.01" name="minimumCGPA" value={form.minimumCGPA} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Application Link</label>
          <input name="applicationLink" value={form.applicationLink} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Documents Required</label>
          <input name="documentsRequired" value={form.documentsRequired} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Contact Information</label>
          <input name="contactInformation" value={form.contactInformation} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Poster/Image URL</label>
          <input name="posterImage" value={form.posterImage} onChange={handleChange} />
        </div>

        <div className="field">
          <label>
            <input type="checkbox" name="isPinned" checked={form.isPinned} onChange={handleChange} /> Pin to Top
          </label>
        </div>
        <div className="field">
          <label>
            <input type="checkbox" name="isOfficial" checked={form.isOfficial} onChange={handleChange} /> Official
            College Notice
          </label>
        </div>
        <div className="field">
          <label>
            <input
              type="checkbox"
              name="sendNotification"
              checked={form.sendNotification}
              onChange={handleChange}
            />{" "}
            Send Notification
          </label>
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button className="btn btn-success" type="submit" disabled={submitting}>
          {submitting ? "Publishing..." : "Publish Opportunity"}
        </button>
      </form>
    </div>
  );
};

export default AddOpportunity;
