import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store";

// ── ProtectedRoute: Route guard with role-based access control ──
// Props:
//   allowedRole — the role that is allowed to access this route ("student" or "teacher")
//
// Behavior:
//   1. Not authenticated → redirect to /login
//   2. Authenticated but role doesn't match → redirect to correct dashboard
//   3. Valid role → render child routes via <Outlet />
const ProtectedRoute = ({ allowedRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  // Not logged in — redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch — send to the correct dashboard instead
  if (allowedRole && user.role !== allowedRole) {
    const correctDashboard =
      user.role === "student" ? "/student/dashboard" : "/teacher/dashboard";
    return <Navigate to={correctDashboard} replace />;
  }

  // All checks passed — render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
