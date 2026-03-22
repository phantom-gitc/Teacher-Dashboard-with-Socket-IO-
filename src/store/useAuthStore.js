// src/store/useAuthStore.js — Authentication store backed by real backend API

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Register student ──
      registerStudent: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post("/auth/register/student", formData);
          const { accessToken, user } = res.data;
          localStorage.setItem("csit_token", accessToken);
          set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
          connectSocket();
          return { success: true };
        } catch (err) {
          const msg = err.message || "Registration failed";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      // ── Register teacher ──
      registerTeacher: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/auth/register/teacher", formData);
          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.message || "Registration failed";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      // ── Login ──
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post("/auth/login", { email, password });
          const { accessToken, user } = res.data;
          localStorage.setItem("csit_token", accessToken);
          set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
          connectSocket();
          return { success: true, role: user.role };
        } catch (err) {
          const msg = err.message || "Login failed";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      // ── Logout ──
      logout: async () => {
        try {
          await api.post("/auth/logout", {});
        } catch {}
        disconnectSocket();
        localStorage.removeItem("csit_token");
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      // ── Load fresh user from /me (with token validation) ──
      loadUser: async () => {
        const token = localStorage.getItem("csit_token");
        if (!token) return false;
        try {
          const res = await api.get("/auth/me");
          set({ user: res.data, isAuthenticated: true, error: null });
          return true;
        } catch (error) {
          // Token invalid or expired — clear state
          console.warn("⚠️ Token validation failed:", error.message);
          localStorage.removeItem("csit_token");
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            error: null 
          });
          return false;
        }
      },

      // ── Forgot password ──
      forgotPassword: async (email) => {
        try {
          await api.post("/auth/forgot-password", { email });
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      // ── Verify OTP ──
      verifyOtp: async (email, otp) => {
        try {
          const res = await api.post("/auth/verify-otp", { email, otp });
          return { success: true, resetToken: res.data.resetToken };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      // ── Reset password ──
      resetPassword: async (resetToken, newPassword) => {
        try {
          await api.post("/auth/reset-password", { resetToken, newPassword });
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      // ── Clear error ──
      clearError: () => set({ error: null }),

      // ── Initialize authentication on app load ──
      // This is called in ProtectedRoute and checks both localStorage and server
      initAuth: async () => {
        const storedToken = localStorage.getItem("csit_token");
        
        // If no token in localStorage, clear auth state
        if (!storedToken) {
          set({ user: null, token: null, isAuthenticated: false, error: null });
          return;
        }

        // Try to validate token with server
        try {
          const res = await api.get("/auth/me");
          const userData = res.data;
          
          // Update store with fresh user data from server
          set({ 
            user: userData, 
            token: storedToken,
            isAuthenticated: true,
            error: null 
          });
          connectSocket();
          return;
        } catch (error) {
          // Token validation failed - might be expired or invalid
          // Check if it's a 401 (unauthorized) 
          if (error.status === 401) {
            console.warn("⚠️ Token validation failed (401), attempting refresh...");
            
            // Try to refresh the token
            try {
              const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
              const refreshRes = await fetch(`${apiBase}/auth/refresh`, {
                method: "POST",
                credentials: "include",
              });

              if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                if (refreshData.success && refreshData.data?.accessToken) {
                  const newToken = refreshData.data.accessToken;
                  localStorage.setItem("csit_token", newToken);
                  
                  // Now try to load user again with new token
                  const meRes = await api.get("/auth/me");
                  const userData = meRes.data;
                  
                  set({ 
                    user: userData, 
                    token: newToken,
                    isAuthenticated: true,
                    error: null 
                  });
                  connectSocket();
                  return;
                }
              }
            } catch (refreshError) {
              console.error("❌ Token refresh failed during init:", refreshError.message);
            }
          }
          
          // If we get here, authentication failed — clear state
          console.error("❌ Authentication initialization failed:", error.message);
          localStorage.removeItem("csit_token");
          localStorage.removeItem("csit-auth");
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            error: null 
          });
        }
      },
    }),
    {
      name: "csit-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
