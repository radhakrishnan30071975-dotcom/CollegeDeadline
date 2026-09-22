import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ROLE_HOME = {
  student: "/dashboard",
  admin: "/admin/dashboard",
  superadmin: "/superadmin/dashboard",
};

const DEMO_TOKEN = "frontend-demo-token";

const DEMO_ACCOUNTS = {
  "viji@gmail.com": {
    password: "Viji!890",
    user: {
      _id: "student-viji",
      name: "Viji",
      email: "viji@gmail.com",
      role: "student",
      branch: "CSE",
      year: 3,
      cgpa: 8.5,
      interests: ["Internships", "Hackathons"],
    },
  },
  "priya@gmail.com": {
    password: "Priya!890",
    user: {
      _id: "admin-priya",
      name: "Priya",
      email: "priya@gmail.com",
      role: "admin",
    },
  },
  "rahul@gmail.com": {
    password: "Rahul!890",
    user: {
      _id: "superadmin-rahul",
      name: "Rahul",
      email: "rahul@gmail.com",
      role: "superadmin",
    },
  },
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const account = DEMO_ACCOUNTS[email.trim().toLowerCase()];

    if (!account || account.password !== password) {
      setError("Invalid email or password.");
      setSubmitting(false);
      return;
    }

    login(DEMO_TOKEN, account.user);
    navigate(ROLE_HOME[account.user.role]);
    setSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-box login-box">
        <div className="auth-title">
          <h1>College Opportunity & Deadline Aggregator</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <div>Create Account</div>
          <div className="role-links">
            <Link to="/signup/student">Student</Link>
            <span>|</span>
            <Link to="/signup/admin">Admin</Link>
            <span>|</span>
            <Link to="/signup/superadmin">Super Admin</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
