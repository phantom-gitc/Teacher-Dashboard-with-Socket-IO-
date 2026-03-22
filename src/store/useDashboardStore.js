// src/store/useDashboardStore.js — Student dashboard store backed by backend API
// No more mock data — data comes from /api/student/*

import { create } from "zustand";
import api from "@/lib/api";

export const useDashboardStore = create((set) => ({
  // ── State ──
  dashboardData: null,
  notifications: [],
  assignments: [],
  unreadCount: 0,
  activeSection: "",
  sidebarCollapsed: false,
  isLoading: false,
  error: null,

  // ── Fetch student dashboard ──
  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/student/dashboard");
      const data = res.data;
      set({
        dashboardData: data,
        notifications: data.notifications || [],
        assignments: data.pendingAssignments?.recent || [],
        unreadCount: data.notifications?.length || 0,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ── Fetch notifications ──
  fetchNotifications: async () => {
    try {
      const res = await api.get("/student/notifications");
      const list = res.data;
      set({
        notifications: list,
        unreadCount: list.filter((n) => !n.isRead).length,
      });
    } catch {}
  },

  // ── Fetch student assignments ──
  fetchAssignments: async () => {
    try {
      const res = await api.get("/assignments/student");
      set({ assignments: res.data });
    } catch {}
  },

  // ── Mark notification read ──
  markNotificationRead: async (id) => {
    try {
      await api.put(`/student/notifications/${id}/read`, {});
      set((state) => {
        const updated = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        return { notifications: updated, unreadCount: updated.filter((n) => !n.isRead).length };
      });
    } catch {}
  },

  // ── Mark all read ──
  markAllRead: async () => {
    try {
      await api.put("/student/notifications/read-all", {});
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  // ── UI state ──
  setActiveSection: (section) => set({ activeSection: section }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // ── Push a live notification from socket ──
  addLiveNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
}));
