import { create } from "zustand";
import { mockNotifications, mockAssignments } from "@/lib/mockData";

// ── useDashboardStore: Shared state across all dashboard pages ──
// Avoids prop drilling for notifications, assignments, sidebar state
// No persist — resets on refresh intentionally

export const useDashboardStore = create((set) => ({
  // ── State ──
  notifications: [...mockNotifications],
  assignments: [...mockAssignments],
  activeSection: "",
  sidebarCollapsed: false,

  // Derived count — unread notifications
  unreadCount: mockNotifications.filter((n) => n.unread).length,

  // ── Actions ──

  // Update active sidebar section
  setActiveSection: (section) => set({ activeSection: section }),

  // Toggle sidebar collapsed state
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Mark a single notification as read, recalculate unreadCount
  markNotificationRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, unread: false } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => n.unread).length,
      };
    }),

  // Mark all notifications read
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, unread: false })),
      unreadCount: 0,
    })),

  // Update a single assignment by id — status + optional submission data
  updateAssignmentStatus: (id, status, submissionData = {}) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.id === id ? { ...a, status, ...submissionData } : a
      ),
    })),
}));
