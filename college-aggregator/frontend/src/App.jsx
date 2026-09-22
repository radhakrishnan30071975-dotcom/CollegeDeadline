import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import SignupStudent from "./pages/SignupStudent.jsx";
import SignupAdmin from "./pages/SignupAdmin.jsx";
import SignupSuperAdmin from "./pages/SignupSuperAdmin.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";

import Dashboard from "./pages/student/Dashboard.jsx";
import Browse from "./pages/student/Browse.jsx";
import DeadlineDetails from "./pages/student/DeadlineDetails.jsx";
import Calendar from "./pages/student/Calendar.jsx";
import Submit from "./pages/student/Submit.jsx";
import Notifications from "./pages/student/Notifications.jsx";
import Profile from "./pages/student/Profile.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import PendingSubmissions from "./pages/admin/PendingSubmissions.jsx";
import AddOpportunity from "./pages/admin/AddOpportunity.jsx";
import Categories from "./pages/admin/Categories.jsx";

import SuperAdminDashboard from "./pages/superadmin/Dashboard.jsx";
import Users from "./pages/superadmin/Users.jsx";
import Admins from "./pages/superadmin/Admins.jsx";

function App() {
  return (
    <Routes>
      {/* Root: only the login page, as required */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup/student" element={<SignupStudent />} />
      <Route path="/signup/admin" element={<SignupAdmin />} />
      <Route path="/signup/superadmin" element={<SignupSuperAdmin />} />

      {/* Student area - shared browse/deadline/calendar routes are also reachable by staff */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["student", "admin", "superadmin"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/browse" element={<Browse />} />
        <Route path="/deadline/:id" element={<DeadlineDetails />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin area */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/pending" element={<PendingSubmissions />} />
        <Route path="/admin/add" element={<AddOpportunity />} />
        <Route path="/admin/categories" element={<Categories />} />
      </Route>

      {/* Super Admin area */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/users" element={<Users />} />
        <Route path="/superadmin/admins" element={<Admins />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
