import React, { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { Bell, LogOut, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = {
  student: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/browse", label: "Browse" },
    { to: "/calendar", label: "Calendar" },
    { to: "/submit", label: "Submit" },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/pending", label: "Pending Submissions" },
    { to: "/admin/add", label: "Add Opportunity" },
    { to: "/admin/categories", label: "Categories" },
  ],
  superadmin: [
    { to: "/superadmin/dashboard", label: "Dashboard" },
    { to: "/superadmin/users", label: "Users" },
    { to: "/superadmin/admins", label: "Admins" },
    { to: "/browse", label: "Opportunities" },
    { to: "/admin/categories", label: "Categories" },
  ],
};

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = NAV_ITEMS[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">College Opportunity Aggregator</div>
        <nav>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <button className="hamburger" onClick={() => setMenuOpen((v) => !v)}>
            ☰
          </button>
          <strong>{user.name}</strong>
        </div>
        <header className="app-header">
          <div className="app-header-user">
            <strong className="greeting-prefix">Hi, </strong>
            <strong className="greeting-name">{user.name.split(" ")[0]}</strong>
          </div>
          <nav className="header-actions" aria-label="Account actions">
            {user.role === "student" && (
              <>
                <NavLink
                  to="/notifications"
                  className="header-icon-button header-icon-button--notification"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell size={20} strokeWidth={2} aria-hidden="true" />
                </NavLink>
                <NavLink
                  to="/profile"
                  className="header-icon-button"
                  aria-label="Profile management"
                  title="Profile management"
                >
                  <UserRound size={20} strokeWidth={2} aria-hidden="true" />
                </NavLink>
              </>
            )}
            <button
              className="header-icon-button header-icon-button--danger"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </nav>
        </header>
        <div className="container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
