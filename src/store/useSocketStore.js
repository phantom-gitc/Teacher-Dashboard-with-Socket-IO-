import { create } from "zustand";

// ── Mock online users — seeded immediately ──
// These simulate 2 users already online when app loads
const MOCK_ONLINE_SEED = ["1", "3"]; // matches teacher ids in mockTeachers

export const useSocketStore = create((set, get) => ({
  // ── State ──
  isConnected: false,
  onlineUsers: [...MOCK_ONLINE_SEED],
  typingUsers: {}, // keyed by roomId → [{userId, userName}]
  connectionError: null,
  reconnectAttempts: 0,

  // ── Actions ──
  setConnected: (bool) => set({ isConnected: bool }),

  setOnlineUsers: (usersArray) => set({ onlineUsers: usersArray }),

  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),

  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
    })),

  setTyping: (roomId, userId, userName) =>
    set((state) => {
      const current = state.typingUsers[roomId] || [];
      if (current.find((u) => u.userId === userId)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [roomId]: [...current, { userId, userName }],
        },
      };
    }),

  clearTyping: (roomId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [roomId]: (state.typingUsers[roomId] || []).filter((u) => u.userId !== userId),
      },
    })),

  clearAllTyping: (roomId) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [roomId]: [] },
    })),

  setConnectionError: (msg) => set({ connectionError: msg }),

  incrementReconnectAttempts: () =>
    set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),

  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
}));
