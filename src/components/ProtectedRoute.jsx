import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store";


const ProtectedRoute = ({ allowedRole }) => {
  const { isAuthenticated, user, initAuth, error } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initAuth();
      } catch (err) {
        console.error("Failed to initialize auth:", err);
        setInitError(err.message || "Failed to initialize authentication");
      } finally {
        setIsInitializing(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wait for token validation before deciding
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-[#e8612a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Show initialization error if any
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-lg shadow max-w-md">
          <div className="text-red-500 text-2xl">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800">Authentication Error</h2>
          <p className="text-gray-600 text-center text-sm">{initError}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="mt-4 px-4 py-2 bg-[#e8612a] text-white rounded hover:bg-[#d14d1f] transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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
