import { create } from "zustand";
import { mockTeacherMessages, mockGroupMessages, mockStudentMessages, mockGroups } from "@/lib/mockData";

// ── useChatStore: All chat state for AIAssistant, AskTeacher, Collaboration ──
// No persist — resets on refresh intentionally

const genId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const nowTime = () => new Date().toISOString();

export const useChatStore = create((set, get) => ({
  // ── AI Assistant ──
  aiMessages: [],
  isAILoading: false,

  // ── Ask Teacher ──
  teacherChats: { ...mockTeacherMessages },
  selectedTeacherId: null,

  // ── Collaboration — Groups ──
  groupChats: { ...mockGroupMessages },
  groups: [...mockGroups],
  selectedGroupId: null,

  // ── Collaboration — Students ──
  studentChats: { ...mockStudentMessages },
  selectedStudentId: null,

  // Active tab in Collaboration page: "Groups" | "Students"
  activeCollabTab: "Groups",

  // ── New: Unread counts (keyed by teacher/group/student id) ──
  unreadCounts: {},

  // ── New: Last messages for preview (keyed by chatId) ──
  lastMessages: {},

  // ── New: Message delivery statuses (keyed by messageId) ──
  messageStatuses: {},

  // ── New: Reactions per message (keyed by messageId → [{emoji, userId, userName}]) ──
  reactions: {},

  // ── New: Chat search ──
  searchQuery: "",
  searchResults: [],

  // ── New: Pinned messages per room ──
  pinnedMessages: {},

  // ── New: Reply state ──
  replyingTo: null,

  // ── AI Assistant Actions ──
  addAIMessage: (message) =>
    set((state) => ({
      aiMessages: [
        ...state.aiMessages,
        {
          id: genId(),
          timestamp: nowTime(),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          ...message,
        },
      ],
    })),
  clearAIChat: () => set({ aiMessages: [] }),
  setAILoading: (bool) => set({ isAILoading: bool }),

  // Update content of an existing AI message by id.
  // contentOrUpdater can be a string (replaces) or a function (prev) => next (appends/transforms).
  updateAIMessage: (id, contentOrUpdater) =>
    set((state) => ({
      aiMessages: state.aiMessages.map((m) => {
        if (m.id !== id) return m;
        const newContent =
          typeof contentOrUpdater === "function"
            ? contentOrUpdater(m.content)
            : contentOrUpdater;
        return { ...m, content: newContent };
      }),
    })),

  // ── Teacher Chat Actions ──
  setSelectedTeacher: (id) => {
    set({ selectedTeacherId: id });
    get().clearUnread(id);
  },

  sendTeacherMessage: (teacherId, text, isMock = false, mockSenderId = null, mockSenderName = null) => {
    const id = genId();
    const timestamp = nowTime();
    const isSelf = !isMock;
    const newMsg = {
      id,
      content: text,
      text, // legacy compat
      sender: isSelf ? "student" : "teacher",
      senderId: isSelf ? "student_self" : mockSenderId,
      senderName: isSelf ? "You" : mockSenderName,
      senderInitials: isSelf ? "RK" : (mockSenderName ? mockSenderName.split(" ").map((n) => n[0]).join("").substring(0, 2) : "T"),
      timestamp,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: isSelf ? "sent" : "delivered",
      replyTo: null,
    };
    set((state) => ({
      teacherChats: {
        ...state.teacherChats,
        [teacherId]: [...(state.teacherChats[teacherId] || []), newMsg],
      },
      lastMessages: { ...state.lastMessages, [teacherId]: newMsg },
      // Only increment unread if mock (incoming) and not currently selected
      unreadCounts: isMock && state.selectedTeacherId !== teacherId
        ? { ...state.unreadCounts, [teacherId]: (state.unreadCounts[teacherId] || 0) + 1 }
        : state.unreadCounts,
      messageStatuses: isSelf ? { ...state.messageStatuses, [id]: "sent" } : state.messageStatuses,
    }));
    return id;
  },

  // ── Group Chat Actions ──
  setSelectedGroup: (id) => {
    set({ selectedGroupId: id });
    get().clearUnread(`group_${id}`);
  },

  sendGroupMessage: (groupId, text, isMock = false, mockSenderName = null) => {
    const id = genId();
    const timestamp = nowTime();
    const isSelf = !isMock;
    const newMsg = {
      id,
      content: text,
      text,
      sender: isSelf ? "You" : mockSenderName,
      senderId: isSelf ? "student_self" : `mock_${mockSenderName}`,
      senderName: isSelf ? "You" : mockSenderName,
      senderInitials: isSelf ? "RK" : (mockSenderName ? mockSenderName.split(" ").map((n) => n[0]).join("").substring(0, 2) : "?"),
      timestamp,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: isSelf ? "sent" : "delivered",
      replyTo: null,
    };
    const chatKey = `group_${groupId}`;
    set((state) => ({
      groupChats: {
        ...state.groupChats,
        [groupId]: [...(state.groupChats[groupId] || []), newMsg],
      },
      lastMessages: { ...state.lastMessages, [chatKey]: newMsg },
      unreadCounts: isMock && state.selectedGroupId !== groupId
        ? { ...state.unreadCounts, [chatKey]: (state.unreadCounts[chatKey] || 0) + 1 }
        : state.unreadCounts,
      messageStatuses: isSelf ? { ...state.messageStatuses, [id]: "sent" } : state.messageStatuses,
    }));
    return id;
  },

  // ── Student Chat Actions ──
  setSelectedStudent: (id) => {
    set({ selectedStudentId: id });
    get().clearUnread(`peer_${id}`);
  },

  sendStudentMessage: (studentId, text, isMock = false, mockSenderName = null) => {
    const id = genId();
    const timestamp = nowTime();
    const isSelf = !isMock;
    const newMsg = {
      id,
      content: text,
      text,
      sender: isSelf ? "You" : mockSenderName,
      senderId: isSelf ? "student_self" : `mock_${studentId}`,
      senderName: isSelf ? "You" : mockSenderName,
      senderInitials: isSelf ? "RK" : (mockSenderName ? mockSenderName.split(" ").map((n) => n[0]).join("").substring(0, 2) : "?"),
      timestamp,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: isSelf ? "sent" : "delivered",
      replyTo: null,
    };
    const chatKey = `peer_${studentId}`;
    set((state) => ({
      studentChats: {
        ...state.studentChats,
        [studentId]: [...(state.studentChats[studentId] || []), newMsg],
      },
      lastMessages: { ...state.lastMessages, [chatKey]: newMsg },
      unreadCounts: isMock && state.selectedStudentId !== studentId
        ? { ...state.unreadCounts, [chatKey]: (state.unreadCounts[chatKey] || 0) + 1 }
        : state.unreadCounts,
      messageStatuses: isSelf ? { ...state.messageStatuses, [id]: "sent" } : state.messageStatuses,
    }));
    return id;
  },

  // ── Collaboration Actions ──
  setActiveCollabTab: (tab) => set({ activeCollabTab: tab }),

  createGroup: (group) =>
    set((state) => ({
      groups: [...state.groups, group],
      groupChats: { ...state.groupChats, [group.id]: [] },
    })),

  // ── Unread Management ──
  incrementUnread: (chatId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [chatId]: (state.unreadCounts[chatId] || 0) + 1 },
    })),

  clearUnread: (chatId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [chatId]: 0 },
    })),

  getTotalTeacherUnread: () => {
    const s = get();
    return Object.entries(s.unreadCounts)
      .filter(([k]) => !k.startsWith("group_") && !k.startsWith("peer_"))
      .reduce((sum, [, v]) => sum + v, 0);
  },

  getTotalCollabUnread: () => {
    const s = get();
    return Object.entries(s.unreadCounts)
      .filter(([k]) => k.startsWith("group_") || k.startsWith("peer_"))
      .reduce((sum, [, v]) => sum + v, 0);
  },

  // ── Message Status ──
  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messageStatuses: { ...state.messageStatuses, [messageId]: status },
    })),

  // ── Reactions ──
  addReaction: (messageId, emoji, userId, userName) =>
    set((state) => {
      const existing = state.reactions[messageId] || [];
      const alreadyReacted = existing.find((r) => r.emoji === emoji && r.userId === userId);
      const updated = alreadyReacted
        ? existing.filter((r) => !(r.emoji === emoji && r.userId === userId))
        : [...existing, { emoji, userId, userName }];
      return { reactions: { ...state.reactions, [messageId]: updated } };
    }),

  // ── Search ──
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (ids) => set({ searchResults: ids }),
  clearSearch: () => set({ searchQuery: "", searchResults: [] }),

  // ── Pin Messages ──
  pinMessage: (roomId, message) =>
    set((state) => ({
      pinnedMessages: {
        ...state.pinnedMessages,
        [roomId]: [...(state.pinnedMessages[roomId] || []), message],
      },
    })),

  unpinMessage: (roomId, messageId) =>
    set((state) => ({
      pinnedMessages: {
        ...state.pinnedMessages,
        [roomId]: (state.pinnedMessages[roomId] || []).filter((m) => m.id !== messageId),
      },
    })),

  // ── Reply ──
  setReplyingTo: (message) => set({ replyingTo: message }),
  clearReplyingTo: () => set({ replyingTo: null }),

  // ── Helpers exposed for socket.js mock ──
  setLastMessage: (chatId, msg) =>
    set((state) => ({ lastMessages: { ...state.lastMessages, [chatId]: msg } })),
}));
