import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ── Custom authentication hook ──
// Manages user session via localStorage token (base64-encoded JSON payload)
// Exposes: user, loading, login, logout, isAuthenticated
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── On mount: check for existing token and restore session ──
  useEffect(() => {
    try {
      const token = localStorage.getItem("csit_token");
      if (token) {
        const payload = JSON.parse(atob(token));
        // Check if token hasn't expired
        if (payload.exp > Date.now() / 1000) {
          setUser(payload);
        } else {
          // Token expired — clean it up
          localStorage.removeItem("csit_token");
        }
      }
    } catch (error) {
      // Corrupted token — remove it
      console.error("Failed to parse auth token:", error);
      localStorage.removeItem("csit_token");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login: save token, decode payload, set user ──
  const login = useCallback((token) => {
    localStorage.setItem("csit_token", token);
    const payload = JSON.parse(atob(token));
    setUser(payload);
  }, []);

  // ── Logout: clear token, reset user, redirect to login ──
  const logout = useCallback(() => {
    localStorage.removeItem("csit_token");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  // ── Derived authentication state ──
  const isAuthenticated = !!user;

  return { user, loading, login, logout, isAuthenticated };
}
