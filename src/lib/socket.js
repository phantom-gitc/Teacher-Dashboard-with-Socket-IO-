import { io } from "socket.io-client";
import { useSocketStore } from "@/store/useSocketStore";
import { useChatStore } from "@/store/useChatStore";
import { useTeacherStore } from "@/store/useTeacherStore";

// ── Single Socket instance for the entire app ──
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

// ── Mock reply pools ──
const mockReplies = {
  teacher: [
    "Please check the textbook chapter on this topic.",
    "Good question — we will cover this in the next class.",
    "Your understanding is correct. Keep it up.",
    "Please refer to the notes I shared last week.",
    "Submit your doubts before Friday so I can address them.",
  ],
  student: [
    "Thank you, I will check.",
    "Okay, understood!",
    "Got it, thank you!",
    "Should I resubmit the assignment?",
    "Can you please share the reference material?",
  ],
  group: [
    "Has everyone submitted?",
    "Let us meet in the library.",
    "Can someone share the notes?",
    "The deadline is tomorrow right?",
    "I will create the WhatsApp group.",
  ],
};

const pickReply = (type) => {
  const pool = mockReplies[type] || mockReplies.student;
  return pool[Math.floor(Math.random() * pool.length)];
};

// ── Mock simulation when NOT connected to real server ──
const runMockSimulation = (roomId, messageObj) => {
  try {
    const otherId = "mock_peer";
    const otherName = roomId.startsWith("st_") ? "Dr. Priya Sharma"
      : roomId.startsWith("grp_") ? "Ananya Singh"
      : "Vikram Patel";
    const replyType = roomId.startsWith("st_") ? "teacher"
      : roomId.startsWith("grp_") ? "group"
      : "student";

    // Show typing
    setTimeout(() => {
      try { useSocketStore.getState().setTyping(roomId, otherId, otherName); } catch {}
    }, 400);

    // Send mock reply
    setTimeout(() => {
      try { useSocketStore.getState().clearTyping(roomId, otherId); } catch {}
      try {
        const reply = pickReply(replyType);
        if (roomId.startsWith("st_")) {
          // student asking teacher — get teacher id from room
          const teacherId = parseInt(roomId.split("_")[1]) || 1;
          useChatStore.getState().sendTeacherMessage(teacherId, reply, true, otherId, otherName);
        } else if (roomId.startsWith("grp_")) {
          const groupId = parseInt(roomId.replace("grp_", "")) || 1;
          useChatStore.getState().sendGroupMessage(groupId, reply, true, otherName);
        } else if (roomId.startsWith("ss_")) {
          const parts = roomId.split("_");
          const studentId = parseInt(parts[1]) || 1;
          useChatStore.getState().sendStudentMessage(studentId, reply, true, otherName);
        }
      } catch {}
    }, 1600);

    // Mark original message delivered→read
    if (messageObj?.id) {
      setTimeout(() => {
        try { useChatStore.getState().updateMessageStatus?.(messageObj.id, "delivered"); } catch {}
        try { useTeacherStore.getState().updateStudentMessageStatus?.(messageObj.id, "delivered"); } catch {}
      }, 1000);

      setTimeout(() => {
        try { useChatStore.getState().updateMessageStatus?.(messageObj.id, "read"); } catch {}
        try { useTeacherStore.getState().updateStudentMessageStatus?.(messageObj.id, "read"); } catch {}
      }, 4000);
    }
  } catch (e) {
    // Silent fail — never break the UI
  }
};

// ── Connect and register global event listeners ──
export const connectSocket = () => {
  if (socket.connected) return;
  socket.connect();

  socket.on("connect", () => {
    try { useSocketStore.getState().setConnected(true); } catch {}
    try { useSocketStore.getState().resetReconnectAttempts(); } catch {}
  });

  socket.on("disconnect", () => {
    try { useSocketStore.getState().setConnected(false); } catch {}
  });

  socket.on("connect_error", (err) => {
    try { useSocketStore.getState().setConnectionError(err.message); } catch {}
    try { useSocketStore.getState().incrementReconnectAttempts(); } catch {}
  });

  socket.on("online_users", (users) => {
    try { useSocketStore.getState().setOnlineUsers(users); } catch {}
  });

  socket.on("user_online", ({ userId }) => {
    try { useSocketStore.getState().addOnlineUser(userId); } catch {}
  });

  socket.on("user_offline", ({ userId }) => {
    try { useSocketStore.getState().removeOnlineUser(userId); } catch {}
  });

  socket.on("typing_start", ({ roomId, userId, userName }) => {
    try { useSocketStore.getState().setTyping(roomId, userId, userName); } catch {}
  });

  socket.on("typing_stop", ({ roomId, userId }) => {
    try { useSocketStore.getState().clearTyping(roomId, userId); } catch {}
  });

  socket.on("message_delivered", ({ messageId }) => {
    try { useChatStore.getState().updateMessageStatus?.(messageId, "delivered"); } catch {}
    try { useTeacherStore.getState().updateStudentMessageStatus?.(messageId, "delivered"); } catch {}
  });

  socket.on("message_read", ({ messageId }) => {
    try { useChatStore.getState().updateMessageStatus?.(messageId, "read"); } catch {}
    try { useTeacherStore.getState().updateStudentMessageStatus?.(messageId, "read"); } catch {}
  });
};

export const disconnectSocket = () => {
  try { socket.disconnect(); } catch {}
};

export const joinRoom = (roomId) => {
  try { if (socket.connected) socket.emit("join_room", { roomId }); } catch {}
};

export const leaveRoom = (roomId) => {
  try { if (socket.connected) socket.emit("leave_room", { roomId }); } catch {}
};

export const emitMessage = (roomId, messageObj) => {
  try {
    if (socket.connected) {
      socket.emit("send_message", { roomId, message: messageObj });
    } else {
      runMockSimulation(roomId, messageObj);
    }
  } catch {}
};

export const emitTypingStart = (roomId, userId, userName) => {
  try { if (socket.connected) socket.emit("typing_start", { roomId, userId, userName }); } catch {}
};

export const emitTypingStop = (roomId, userId) => {
  try { if (socket.connected) socket.emit("typing_stop", { roomId, userId }); } catch {}
};

export const emitMarkRead = (roomId, messageIds) => {
  try { if (socket.connected) socket.emit("mark_read", { roomId, messageIds }); } catch {}
};

export const emitReaction = (roomId, messageId, emoji, userId) => {
  try { if (socket.connected) socket.emit("message_reaction", { roomId, messageId, emoji, userId }); } catch {}
};

export default socket;
