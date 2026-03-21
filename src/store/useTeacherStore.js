import { create } from "zustand";

// ── Minimal seed data — backend will replace all of this ──
const seedAssignments = [
  {
    id: "a1",
    title: "ER Diagram for Hospital Management System",
    subject: "DBMS",
    description: "Design a complete ER diagram for a hospital management system covering patients, doctors, wards, and appointments.",
    totalMarks: 20,
    dueDate: "2026-03-28T23:59:00.000Z",
    status: "published",
    assignTo: "all",
    createdAt: "2026-03-18T10:00:00.000Z",
  },
  {
    id: "a2",
    title: "Deadlock Detection in OS",
    subject: "OS",
    description: "Write a short report explaining the Banker's algorithm for deadlock avoidance with an example.",
    totalMarks: 15,
    dueDate: "2026-04-02T23:59:00.000Z",
    status: "draft",
    assignTo: "all",
    createdAt: "2026-03-20T09:30:00.000Z",
  },
];

const seedStudents = [
  { id: "s1", name: "Rahul Kumar", roll: "CS2021001" },
  { id: "s2", name: "Priya Mehta", roll: "CS2021002" },
  { id: "s3", name: "Aman Singh", roll: "CS2021003" },
  { id: "s4", name: "Neha Joshi", roll: "CS2021004" },
];

const seedSubmissions = [
  {
    id: "sub1",
    assignmentId: "a1",
    assignmentTitle: "ER Diagram for Hospital Management System",
    subject: "DBMS",
    totalMarks: 20,
    studentId: "s1",
    studentName: "Rahul Kumar",
    studentRoll: "CS2021001",
    submittedAt: "2026-03-22T14:30:00.000Z",
    status: "submitted",
    fileName: "er_diagram_rahul.pdf",
    fileSize: "1.2 MB",
    studentNotes: "I have included all the entities and relationships as discussed in class.",
    marks: null,
    feedback: null,
    privateNotes: null,
  },
  {
    id: "sub2",
    assignmentId: "a1",
    assignmentTitle: "ER Diagram for Hospital Management System",
    subject: "DBMS",
    totalMarks: 20,
    studentId: "s2",
    studentName: "Priya Mehta",
    studentRoll: "CS2021002",
    submittedAt: "2026-03-21T11:00:00.000Z",
    status: "checked",
    fileName: "hospital_er_priya.pdf",
    fileSize: "980 KB",
    studentNotes: null,
    marks: 18,
    feedback: "Excellent work! Your ER diagram is well-structured and covers all entities.",
    privateNotes: "Very capable student.",
  },
  {
    id: "sub3",
    assignmentId: "a2",
    assignmentTitle: "Deadlock Detection in OS",
    subject: "OS",
    totalMarks: 15,
    studentId: "s3",
    studentName: "Aman Singh",
    studentRoll: "CS2021003",
    submittedAt: "2026-03-23T09:15:00.000Z",
    status: "submitted",
    fileName: "deadlock_aman.docx",
    fileSize: "450 KB",
    studentNotes: "Referenced the textbook example for the Banker's algorithm.",
    marks: null,
    feedback: null,
    privateNotes: null,
  },
];

const seedAnnouncements = [
  {
    id: "ann1",
    title: "Mid-term exam schedule released",
    type: "exam",
    message: "The mid-term examination schedule has been uploaded on the college portal. Please check and prepare accordingly. All exams begin at 10:00 AM.",
    pinned: true,
    createdAt: "2026-03-20T08:00:00.000Z",
    author: "Dr. Priya Sharma",
  },
];

const genId = () => `tmsg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const seedStudentChats = {
  s1: [
    { id: "ts1_1", sender: "student", senderId: "s1", senderName: "Rahul Kumar", senderInitials: "RK", content: "Ma'am, I had a doubt about the ER diagram assignment. Should I include weak entities?", text: "Ma'am, I had a doubt about the ER diagram assignment. Should I include weak entities?", timestamp: new Date(Date.now() - 86400000).toISOString(), time: "Yesterday, 3:00 PM", status: "read" },
    { id: "ts1_2", sender: "teacher", senderId: "teacher_self", senderName: "Dr. Priya Sharma", senderInitials: "PS", content: "Yes, Rahul! Weak entities like Appointment (depends on Doctor and Patient) should definitely be included. Good thinking.", text: "Yes, Rahul! Weak entities like Appointment (depends on Doctor and Patient) should definitely be included. Good thinking.", timestamp: new Date(Date.now() - 82800000).toISOString(), time: "Yesterday, 4:15 PM", status: "read" },
  ],
};

// ── useTeacherStore ──
export const useTeacherStore = create((set, get) => ({
  // ── State ──
  assignments: [...seedAssignments],
  submissions: [...seedSubmissions],
  students: [...seedStudents],
  announcements: [...seedAnnouncements],
  studentChats: { ...seedStudentChats },
  selectedStudentChatId: null,
  activeSection: "dashboard",
  notifications: [],
  unreadChats: 1,
  aiGeneratedAssignment: null,
  isAIGenerating: false,
  analyticsData: null,
  evaluationDraft: {},

  // ── Socket-ready chat state ──
  unreadStudentChats: { s1: 1 }, // seed: 1 unread from Rahul
  lastStudentMessages: {
    s1: seedStudentChats.s1[seedStudentChats.s1.length - 1],
  },
  studentMessageStatuses: {},
  studentReactions: {},
  teacherReplyingTo: null,

  // ── Assignment Actions ──
  addAssignment: (assignment) =>
    set((state) => ({
      assignments: [
        { id: `a${Date.now()}`, createdAt: new Date().toISOString(), ...assignment },
        ...state.assignments,
      ],
    })),

  updateAssignment: (id, updates) =>
    set((state) => ({
      assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  deleteAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
    })),

  publishAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.id === id ? { ...a, status: "published" } : a
      ),
    })),

  // ── Submission Actions ──
  addSubmission: (submission) =>
    set((state) => ({
      submissions: [{ id: `sub${Date.now()}`, ...submission }, ...state.submissions],
    })),

  updateSubmissionEvaluation: (submissionId, marks, feedback, privateNotes) =>
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === submissionId
          ? { ...s, marks, feedback, privateNotes, status: "checked" }
          : s
      ),
    })),

  markSubmissionChecked: (submissionId) =>
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === submissionId ? { ...s, status: "checked" } : s
      ),
    })),

  // ── Announcement Actions ──
  addAnnouncement: (announcement) =>
    set((state) => ({
      announcements: [
        { id: `ann${Date.now()}`, createdAt: new Date().toISOString(), ...announcement },
        ...state.announcements,
      ],
    })),

  deleteAnnouncement: (id) =>
    set((state) => ({
      announcements: state.announcements.filter((a) => a.id !== id),
    })),

  // ── Chat Actions ──
  sendStudentMessage: (studentId, text, isMock = false, mockSenderName = null) => {
    const id = genId();
    const timestamp = new Date().toISOString();
    const isSelf = !isMock;
    const newMsg = {
      id,
      sender: isSelf ? "teacher" : "student",
      senderId: isSelf ? "teacher_self" : studentId,
      senderName: isSelf ? "Dr. Priya Sharma" : (mockSenderName || "Student"),
      senderInitials: isSelf ? "PS" : (mockSenderName ? mockSenderName.split(" ").map((n) => n[0]).join("").substring(0, 2) : "S"),
      content: text,
      text, // legacy compat
      timestamp,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: isSelf ? "sent" : "delivered",
      replyTo: null,
    };
    set((state) => ({
      studentChats: {
        ...state.studentChats,
        [studentId]: [...(state.studentChats[studentId] || []), newMsg],
      },
      lastStudentMessages: { ...state.lastStudentMessages, [studentId]: newMsg },
      unreadStudentChats: isMock && state.selectedStudentChatId !== studentId
        ? { ...state.unreadStudentChats, [studentId]: (state.unreadStudentChats[studentId] || 0) + 1 }
        : state.unreadStudentChats,
      studentMessageStatuses: isSelf ? { ...state.studentMessageStatuses, [id]: "sent" } : state.studentMessageStatuses,
    }));
    return id;
  },

  setSelectedStudentChat: (id) => set((state) => ({
    selectedStudentChatId: id,
    unreadStudentChats: { ...state.unreadStudentChats, [id]: 0 },
  })),

  // ── Unread / Last message ──
  incrementStudentUnread: (studentId) =>
    set((state) => ({
      unreadStudentChats: { ...state.unreadStudentChats, [studentId]: (state.unreadStudentChats[studentId] || 0) + 1 },
    })),

  clearStudentUnread: (studentId) =>
    set((state) => ({
      unreadStudentChats: { ...state.unreadStudentChats, [studentId]: 0 },
    })),

  getTotalStudentUnread: () =>
    Object.values(get().unreadStudentChats).reduce((sum, v) => sum + v, 0),

  setLastStudentMessage: (studentId, msg) =>
    set((state) => ({ lastStudentMessages: { ...state.lastStudentMessages, [studentId]: msg } })),

  // ── Message statuses ──
  updateStudentMessageStatus: (messageId, status) =>
    set((state) => ({
      studentMessageStatuses: { ...state.studentMessageStatuses, [messageId]: status },
    })),

  // ── Reactions ──
  addStudentReaction: (messageId, emoji, userId, userName) =>
    set((state) => {
      const existing = state.studentReactions[messageId] || [];
      const alreadyReacted = existing.find((r) => r.emoji === emoji && r.userId === userId);
      return {
        studentReactions: {
          ...state.studentReactions,
          [messageId]: alreadyReacted
            ? existing.filter((r) => !(r.emoji === emoji && r.userId === userId))
            : [...existing, { emoji, userId, userName }],
        },
      };
    }),

  // ── Reply ──
  setTeacherReplyingTo: (message) => set({ teacherReplyingTo: message }),
  clearTeacherReplyingTo: () => set({ teacherReplyingTo: null }),

  // ── AI Actions ──
  setAIGeneratedAssignment: (content) => set({ aiGeneratedAssignment: content }),
  setIsAIGenerating: (bool) => set({ isAIGenerating: bool }),
  clearAIAssignment: () => set({ aiGeneratedAssignment: null }),

  // ── Evaluation Draft ──
  setEvaluationDraft: (submissionId, field, value) =>
    set((state) => ({
      evaluationDraft: {
        ...state.evaluationDraft,
        [submissionId]: {
          ...(state.evaluationDraft[submissionId] || {}),
          [field]: value,
        },
      },
    })),

  // ── Misc ──
  setActiveSection: (section) => set({ activeSection: section }),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
}));
