// src/store/useTeacherStore.js — Teacher store backed by real backend API
// All seed data removed — data comes from /api/teacher/* and /api/assignments/*

import { create } from "zustand";
import api from "@/lib/api";

export const useTeacherStore = create((set, get) => ({
  // ── State ──
  assignments: [],
  submissions: [],
  students: [],
  announcements: [],
  analyticsData: null,
  selectedStudentChatId: null,
  isLoading: false,
  error: null,

  // Chat state (received via Socket.IO)
  studentChats: {},
  unreadStudentChats: {},
  lastStudentMessages: {},
  studentMessageStatuses: {},
  studentReactions: {},
  teacherReplyingTo: null,

  // AI state
  aiGeneratedAssignment: null,
  isAIGenerating: false,
  evaluationDraft: {},

  // ── Dashboard ──
  dashboardData: null,
  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/teacher/dashboard");
      set({ dashboardData: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ── Assignments ──
  fetchAssignments: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/assignments?${params}`);
      set({ assignments: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  createAssignment: async (formData) => {
    set({ isLoading: true });
    try {
      const res = await api.upload("/assignments", formData);
      set((state) => ({
        assignments: [res.data, ...state.assignments],
        isLoading: false,
      }));
      return { success: true, assignment: res.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  updateAssignment: async (id, data) => {
    try {
      const res = await api.put(`/assignments/${id}`, data);
      set((state) => ({
        assignments: state.assignments.map((a) => (a._id === id ? res.data : a)),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  deleteAssignment: async (id) => {
    try {
      await api.delete(`/assignments/${id}`);
      set((state) => ({
        assignments: state.assignments.filter((a) => a._id !== id),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  publishAssignment: async (id) => {
    try {
      const res = await api.put(`/assignments/${id}/publish`, {});
      set((state) => ({
        assignments: state.assignments.map((a) => (a._id === id ? res.data : a)),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ── Submissions ──
  fetchSubmissions: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/submissions?${params}`);
      set({ submissions: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  evaluateSubmission: async (submissionId, { marks, feedback, privateNotes }) => {
    try {
      const res = await api.put(`/submissions/${submissionId}/evaluate`, { marks, feedback, privateNotes });
      set((state) => ({
        submissions: state.submissions.map((s) => (s._id === submissionId ? res.data : s)),
      }));
      return { success: true, submission: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ── Students ──
  fetchStudents: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/teacher/students");
      set({ students: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ── Announcements ──
  fetchAnnouncements: async () => {
    try {
      const res = await api.get("/teacher/announcements");
      set({ announcements: res.data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  addAnnouncement: async (data) => {
    try {
      const res = await api.post("/teacher/announcements", data);
      set((state) => ({ announcements: [res.data, ...state.announcements] }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  deleteAnnouncement: async (id) => {
    try {
      await api.delete(`/teacher/announcements/${id}`);
      set((state) => ({ announcements: state.announcements.filter((a) => a._id !== id) }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ── Analytics ──
  fetchAnalytics: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/teacher/analytics");
      set({ analyticsData: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ── AI Assignment Generation (calls backend proxy) ──
  generateAIAssignment: async ({ subject, topic, type, difficulty, marks, instructions }) => {
    set({ isAIGenerating: true, aiGeneratedAssignment: null });
    try {
      const res = await api.post("/ai/assignment/generate", { subject, topic, type, difficulty, marks, instructions });
      set({ aiGeneratedAssignment: res.data.content, isAIGenerating: false });
      return { success: true, content: res.data.content };
    } catch (err) {
      set({ isAIGenerating: false });
      return { success: false, error: err.message };
    }
  },

  clearAIAssignment: () => set({ aiGeneratedAssignment: null }),

  // ── Evaluation Draft ──
  setEvaluationDraft: (submissionId, field, value) =>
    set((state) => ({
      evaluationDraft: {
        ...state.evaluationDraft,
        [submissionId]: { ...(state.evaluationDraft[submissionId] || {}), [field]: value },
      },
    })),

  // ── Chat (Socket.IO driven — store just holds messages) ──
  addLiveMessage: (studentId, message) =>
    set((state) => ({
      studentChats: {
        ...state.studentChats,
        [studentId]: [...(state.studentChats[studentId] || []), message],
      },
      lastStudentMessages: { ...state.lastStudentMessages, [studentId]: message },
    })),

  addLiveSubmission: (data) =>
    set((state) => ({
      submissions: [data, ...state.submissions],
    })),

  setSelectedStudentChat: (id) =>
    set((state) => ({
      selectedStudentChatId: id,
      unreadStudentChats: { ...state.unreadStudentChats, [id]: 0 },
    })),

  updateStudentMessageStatus: (messageId, status) =>
    set((state) => ({
      studentMessageStatuses: { ...state.studentMessageStatuses, [messageId]: status },
    })),

  setTeacherReplyingTo: (msg) => set({ teacherReplyingTo: msg }),
  clearTeacherReplyingTo: () => set({ teacherReplyingTo: null }),
}));
