import React, { useEffect, useState } from "react";
import api from "../../services/api";
import OpportunityCard from "../../components/OpportunityCard.jsx";

const CATEGORIES = [
  "All",
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

const Browse = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [year, setYear] = useState("All");
  const [branch, setBranch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDeadlines = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      if (year !== "All") params.year = year;
      if (branch) params.branch = branch;

      const res = await api.get("/deadlines", { params });
      setDeadlines(res.data.deadlines);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeadlines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadDeadlines();
  };

  return (
    <div>
      <h2>Browse Opportunities</h2>

      <form className="filter-bar" onSubmit={handleFilter}>
        <input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="All">All Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>
        <input
          placeholder="Branch (e.g. CSE)"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" type="submit">
          Filter
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : deadlines.length === 0 ? (
        <div className="empty-state">No opportunities match your filters.</div>
      ) : (
        <div className="opportunity-list">
          {deadlines.map((d) => (
            <OpportunityCard key={d._id} deadline={d} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;
