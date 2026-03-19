import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// ── ProtectedRoute: Route guard with role-based access control ──
// Props:
//   allowedRole — the role that is allowed to access this route ("student" or "teacher")
//
// Behavior:
//   1. No token → redirect to /login
//   2. Token exists but role doesn't match → redirect to correct dashboard
//   3. Valid token + correct role → render child routes via <Outlet />
const ProtectedRoute = ({ allowedRole }) => {
  const token = localStorage.getItem("csit_token");

  // No token at all — user isn't logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token));

    // Token expired — clean up and redirect
    if (payload.exp <= Date.now() / 1000) {
      localStorage.removeItem("csit_token");
      return <Navigate to="/login" replace />;
    }

    // Role mismatch — send to the correct dashboard instead
    if (allowedRole && payload.role !== allowedRole) {
      const correctDashboard =
        payload.role === "student"
          ? "/student/dashboard"
          : "/teacher/dashboard";
      return <Navigate to={correctDashboard} replace />;
    }

    // All checks passed — render the protected content
    return <Outlet />;
  } catch (error) {
    // Corrupted token — remove and redirect to login
    console.error("Invalid auth token:", error);
    localStorage.removeItem("csit_token");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
