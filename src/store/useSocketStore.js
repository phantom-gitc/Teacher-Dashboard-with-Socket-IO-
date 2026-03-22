import { create } from "zustand";

// ── useSocketStore: Socket.IO connection state ──
// Tracks online users, typing indicators, and real-time events

export const useSocketStore = create((set, get) => ({
  // ── State ──
  isConnected: false,
  onlineUsers: [],
  typingUsers: {}, // keyed by roomId → [{userId, userName}]
  connectionError: null,
  reconnectAttempts: 0,
  socketEvents: [], // generic event queue for assignment/submission/viva events

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

  // ── Socket event queue (for assignment, submission, viva events) ──
  addSocketEvent: (type, data) =>
    set((state) => ({
      socketEvents: [...state.socketEvents, { type, data, timestamp: Date.now() }],
    })),

  clearSocketEvents: () => set({ socketEvents: [] }),
}));

