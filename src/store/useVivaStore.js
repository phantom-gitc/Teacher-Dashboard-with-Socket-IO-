import { create } from "zustand";

// ── useVivaStore: All Viva AI page state ──
// Replaces every useState inside VivaAI.jsx
// No persist — resets on refresh intentionally

export const useVivaStore = create((set, get) => ({
  // ── Phase ──
  phase: "setup", // setup | generating | ready | session | analyzing | results

  // ── Config (groups all setup form values) ──
  config: {
    subject: "Database Management System (DBMS)",
    topic: "",
    difficulty: "medium",
    questionCount: "10",
    studentName: "Student",
    selectedPreset: "friendly_mentor",
    customTeacherName: "",
    customDescription: "",
  },

  // ── Session State ──
  questions: [],
  conversationLog: [],
  analysisResult: null,
  reportText: "",
  isSpeaking: null, // null | "ai" | "student"
  isMuted: false,
  volume: 1,
  timer: 0,
  vapiError: null,
  geminiError: null,
  isGeneratingReport: false,
  expandedQuestion: null,

  // ── Actions ──

  // Update current phase
  setPhase: (phase) => set({ phase }),

  // Partial merge into config object
  setConfig: (updates) =>
    set((state) => ({ config: { ...state.config, ...updates } })),

  // Set questions array from Gemini
  setQuestions: (questions) => set({ questions }),

  // Append a new message to conversation log
  appendMessage: (message) =>
    set((state) => ({ conversationLog: [...state.conversationLog, message] })),

  // Clear conversation log (e.g. new session)
  clearConversation: () => set({ conversationLog: [] }),

  // Set Gemini analysis result object
  setAnalysisResult: (result) => set({ analysisResult: result }),

  // Set generated report string
  setReportText: (text) => set({ reportText: text }),

  // Set who is speaking: null | "ai" | "student"
  setIsSpeaking: (who) => set({ isSpeaking: who }),

  // Toggle mute state
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  // Set volume (0 to 1)
  setVolume: (volume) => set({ volume }),

  // Add 1 second to timer — called from interval in useRef
  incrementTimer: () => set((state) => ({ timer: state.timer + 1 })),

  // Reset timer to 0
  resetTimer: () => set({ timer: 0 }),

  // Set Vapi error string
  setVapiError: (error) => set({ vapiError: error }),

  // Set Gemini error string
  setGeminiError: (error) => set({ geminiError: error }),

  // Toggle report generation loading
  setIsGeneratingReport: (bool) => set({ isGeneratingReport: bool }),

  // Toggle expanded question — collapses if same id clicked again
  setExpandedQuestion: (id) =>
    set((state) => ({
      expandedQuestion: state.expandedQuestion === id ? null : id,
    })),

  // ── resetViva: reset all session/result state — keep config ──
  // Used for "Try Again" / "New Viva Session"
  resetViva: () =>
    set({
      phase: "setup",
      questions: [],
      conversationLog: [],
      analysisResult: null,
      reportText: "",
      isSpeaking: null,
      isMuted: false,
      timer: 0,
      vapiError: null,
      geminiError: null,
      isGeneratingReport: false,
      expandedQuestion: null,
    }),
}));
