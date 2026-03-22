// src/lib/socket.js — Socket.IO client with JWT authentication
// Connects to real backend — no more mock simulation

import { io } from "socket.io-client";
import { useSocketStore } from "@/store/useSocketStore";
import { useChatStore } from "@/store/useChatStore";
import { useTeacherStore } from "@/store/useTeacherStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Single socket instance, lazy JWT injection
let socket = null;

const createSocket = () => {
  const token = localStorage.getItem("csit_token");

  return io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    auth: { token: token || "" },
  });
};

// ── Connect with fresh JWT ──
export const connectSocket = () => {
  if (socket?.connected) return;

  // Recreate socket so latest token is always used
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = createSocket();
  socket.connect();

  socket.on("connect", () => {
    try { useSocketStore.getState().setConnected(true); } catch {}
    try { useSocketStore.getState().resetReconnectAttempts?.(); } catch {}
  });

  socket.on("disconnect", () => {
    try { useSocketStore.getState().setConnected(false); } catch {}
  });

  socket.on("connect_error", (err) => {
    try { useSocketStore.getState().setConnectionError?.(err.message); } catch {}
    try { useSocketStore.getState().incrementReconnectAttempts?.(); } catch {}
  });

  // ── Online / Offline ──
  socket.on("user_online", ({ userId }) => {
    try { useSocketStore.getState().addOnlineUser(userId); } catch {}
  });

  socket.on("user_offline", ({ userId }) => {
    try { useSocketStore.getState().removeOnlineUser(userId); } catch {}
  });

  // ── Typing ──
  socket.on("typing_start", ({ roomId, userId, userName }) => {
    try { useSocketStore.getState().setTyping(roomId, userId, userName); } catch {}
  });

  socket.on("typing_stop", ({ roomId, userId }) => {
    try { useSocketStore.getState().clearTyping(roomId, userId); } catch {}
  });

  // ── Personal message events ──
  socket.on("new_message", (message) => {
    try { useChatStore.getState().addIncomingMessage?.(message); } catch {}
  });

  socket.on("message_delivered", ({ messageId }) => {
    try { useChatStore.getState().updateMessageStatus?.(messageId, "delivered"); } catch {}
    try { useTeacherStore.getState().updateStudentMessageStatus?.(messageId, "delivered"); } catch {}
  });

  socket.on("message_read", ({ messageId }) => {
    try { useChatStore.getState().updateMessageStatus?.(messageId, "read"); } catch {}
    try { useTeacherStore.getState().updateStudentMessageStatus?.(messageId, "read"); } catch {}
  });

  socket.on("message_reaction", ({ messageId, reactions }) => {
    try { useChatStore.getState().setReactions?.(messageId, reactions); } catch {}
  });

  // ── Group message events ──
  socket.on("new_group_message", (message) => {
    try { useChatStore.getState().addIncomingGroupMessage?.(message); } catch {}
  });

  // ── Notification ──
  socket.on("new_notification", (notification) => {
    try { useChatStore.getState().addNotification?.(notification); } catch {}
  });

  // ── Assignment / Submission events ──
  socket.on("new_assignment", (data) => {
    try { useSocketStore.getState().addSocketEvent?.("new_assignment", data); } catch {}
  });

  socket.on("new_submission", (data) => {
    try { useTeacherStore.getState().addLiveSubmission?.(data); } catch {}
  });

  socket.on("submission_evaluated", (data) => {
    try { useSocketStore.getState().addSocketEvent?.("submission_evaluated", data); } catch {}
  });

  // ── Viva complete ──
  socket.on("viva_session_complete", ({ sessionId }) => {
    try { useSocketStore.getState().addSocketEvent?.("viva_complete", { sessionId }); } catch {}
  });
};

export const disconnectSocket = () => {
  try {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
    useSocketStore.getState().setConnected(false);
  } catch {}
};

export const joinRoom = (roomId) => {
  try { if (socket?.connected) socket.emit("join_room", roomId); } catch {}
};

export const leaveRoom = (roomId) => {
  try { if (socket?.connected) socket.emit("leave_room", roomId); } catch {}
};

export const emitMessage = (receiverId, content, replyTo = null) => {
  try {
    if (socket?.connected) {
      socket.emit("send_message", { receiverId, content, replyTo });
    }
  } catch {}
};

export const emitGroupMessage = (groupId, content, replyTo = null) => {
  try {
    if (socket?.connected) {
      socket.emit("send_group_message", { groupId, content, replyTo });
    }
  } catch {}
};

export const emitTypingStart = (roomId) => {
  try { if (socket?.connected) socket.emit("typing_start", { roomId }); } catch {}
};

export const emitTypingStop = (roomId) => {
  try { if (socket?.connected) socket.emit("typing_stop", { roomId }); } catch {}
};

export const emitMarkRead = (messageId) => {
  try { if (socket?.connected) socket.emit("mark_read", { messageId }); } catch {}
};

export const emitReaction = (messageId, emoji, roomId, isGroup = false) => {
  try {
    if (socket?.connected) {
      socket.emit("add_reaction", { messageId, emoji, roomId, isGroup });
    }
  } catch {}
};

export const getSocket = () => socket;

export default socket;
