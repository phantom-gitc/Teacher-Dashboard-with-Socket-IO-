import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── useAuthStore: Global authentication state ──
// Replaces useAuth.js hook entirely
// Persists to localStorage under key "csit-auth"
// Actions: login(token), logout(), initAuth()

export const useAuthStore = create(
  persist(
    (set) => ({
      // ── State ──
      user: null,
      token: null,
      isAuthenticated: false,

      // ── login: decode token, save to localStorage, set state ──
      login: (token) => {
        localStorage.setItem("csit_token", token);
        const payload = JSON.parse(atob(token));
        set({ user: payload, token, isAuthenticated: true });
      },

      // ── logout: clear token, reset state ──
      logout: () => {
        localStorage.removeItem("csit_token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      // ── initAuth: called on app load to validate existing token ──
      initAuth: () => {
        try {
          const token = localStorage.getItem("csit_token");
          if (token) {
            const payload = JSON.parse(atob(token));
            if (payload.exp > Date.now() / 1000) {
              set({ user: payload, token, isAuthenticated: true });
            } else {
              // Token expired — clean up
              localStorage.removeItem("csit_token");
              set({ user: null, token: null, isAuthenticated: false });
            }
          }
        } catch (error) {
          // Corrupted token — remove it
          console.error("Failed to parse auth token:", error);
          localStorage.removeItem("csit_token");
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "csit-auth",
      // Only persist state fields — not action functions
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
