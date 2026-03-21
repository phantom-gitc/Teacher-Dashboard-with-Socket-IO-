import React, { useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { useVivaStore } from "@/store";
import { Mic, Brain, Shield, Volume2, MicOff, PhoneOff, Award, Trophy, TrendingUp, AlertCircle, RefreshCw, Plus, Download, CheckCircle, ChevronDown, ChevronUp, FileText, Settings, Users } from "lucide-react";

// Mock Data for Results
const mockAnalysis = {
  overall_score: 85,
  grade_label: "Excellent",
  strong_topics: ["Normalization", "ACID Properties", "Indexing"],
  weak_topics: ["B+ Trees", "Concurrency Control"],
  summary_paragraph: "You demonstrated a strong understanding of core database concepts, particularly around database design and transactions. Your explanations were clear and well-structured.",
  revision_recommendations: [
    "Review the mechanics of B+ Tree splitting and balancing.",
    "Practice explaining the differences between optimistic and pessimistic concurrency control.",
  ],
  question_results: [
    {
      question_id: 1,
      question: "Can you explain the 3rd Normal Form (3NF)?",
      student_answer_extracted: "It's when a table is in 2NF and has no transitive dependencies.",
      score: 100,
      label: "Excellent",
      feedback: "Perfect, concise definition.",
      keywords_found: ["2NF", "transitive dependencies"],
      keywords_missed: [],
    },
    {
      question_id: 2,
      question: "How does a B+ Tree differ from a B-Tree?",
      student_answer_extracted: "B+ trees store data only in leaf nodes.",
      score: 60,
      label: "Average",
      feedback: "Correct, but you missed mentioning linked leaf nodes which improve range queries.",
      keywords_found: ["leaf nodes"],
      keywords_missed: ["linked leaves", "range queries"],
    }
  ]
};

const teacherPresets = [
  {
    id: "strict_professor",
    name: "Dr. Sharma",
    style: "Strict Professor",
    avatar_gradient: "from-[#667eea] to-[#764ba2]",
    traits: ["No hints", "Deep follow-ups", "Expects precision"],
  },
  {
    id: "friendly_mentor",
    name: "Prof. Verma",
    style: "Friendly Mentor",
    avatar_gradient: "from-[#f4956a] to-[#e8612a]",
    traits: ["Gives hints", "Encouraging", "Explains mistakes"],
  },
  {
    id: "industry_expert",
    name: "Mr. Kapoor",
    style: "Industry Expert",
    avatar_gradient: "from-[#11998e] to-[#38ef7d]",
    traits: ["Real-world focus", "Scenario-based", "Practical thinking"],
  },
  {
    id: "rapid_fire",
    name: "Dr. Quick",
    style: "Rapid Fire",
    avatar_gradient: "from-[#f7971e] to-[#ffd200]",
    traits: ["Short answers only", "Fast pace", "No elaboration"],
  },
  {
    id: "socratic",
    name: "Prof. Maya",
    style: "Socratic Method",
    avatar_gradient: "from-[#c471ed] to-[#f64f59]",
    traits: ["Questions with questions", "Critical thinking", "Deep reasoning"],
  },
  {
    id: "custom",
    name: "Custom",
    style: "Your Teacher",
    avatar_gradient: "from-gray-300 to-gray-500",
    traits: ["Your description", "Personalized", "Your choice"],
  }
];

const VivaAI = () => {
  // ── All state from useVivaStore ──
  const {
    phase, setPhase,
    config, setConfig,
    conversationLog, appendMessage, clearConversation,
    analysisResult, setAnalysisResult,
    isSpeaking, setIsSpeaking,
    isMuted, toggleMute,
    timer, incrementTimer, resetTimer,
    expandedQuestion, setExpandedQuestion,
    resetViva,
  } = useVivaStore();

  // Destructure config fields for convenience
  const {
    subject, topic, difficulty, questionCount,
    studentName, selectedPreset, customDescription,
  } = config;

  const teacher = teacherPresets.find((p) => p.id === selectedPreset);

  // ── Auto-scroll conversation log ──
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationLog]);

  // ── Timer — interval lives in useRef, calls store action each tick ──
  const timerRef = useRef(null);
  useEffect(() => {
    if (phase === "session") {
      timerRef.current = setInterval(() => {
        useVivaStore.getState().incrementTimer();
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStartGenerating = () => {
    setPhase("generating");
    // Mock API delay
    setTimeout(() => {
      setPhase("ready");
    }, 2500);
  };

  const handleConnect = () => {
    setPhase("session");
    resetTimer();
    clearConversation();
    appendMessage({
      role: "ai",
      text: `Hello ${studentName}! I am ${teacher.name}. Let us begin your viva on ${subject}. Are you ready?`,
    });
  };

  const handleEndSession = () => {
    setPhase("analyzing");
    // Mock Analysis Delay
    setTimeout(() => {
      setAnalysisResult(mockAnalysis);
      setPhase("results");
    }, 3500);
  };

  // Mock UI functions to toggle speaking states (since no real backend)
  const simulateLiveEvent = (type) => {
    if (type === "ai-speak") {
      setIsSpeaking("ai");
      appendMessage({ role: "ai", text: "Can you explain how normalization reduces data redundancy?" });
      setTimeout(() => setIsSpeaking(null), 3000);
    } else if (type === "student-speak") {
      setIsSpeaking("student");
      appendMessage({ role: "student", text: "Normalization organizes data into multiple related tables..." });
      setTimeout(() => setIsSpeaking(null), 3000);
    }
  };

  return (
    <DashboardLayout title="Viva AI">
      <PageHeader 
        title="Viva AI" 
        subtitle="Practice your oral exam with an AI teacher. Real voice conversation — just like a real viva." 
      />

      {/* PHASE 1: SETUP */}
      {phase === "setup" && (
        <div className="w-full">
          {/* Tech Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="bg-purple-50 text-purple-600 border border-purple-200 rounded-full px-3 py-1 text-xs flex items-center gap-1.5 font-medium shadow-sm">
              <Mic size={14} /> Voice by Vapi
            </span>
            <span className="bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1 text-xs flex items-center gap-1.5 font-medium shadow-sm">
              <Brain size={14} /> Analysis by Gemini
            </span>
            <span className="bg-green-50 text-green-600 border border-green-200 rounded-full px-3 py-1 text-xs flex items-center gap-1.5 font-medium shadow-sm">
              <Shield size={14} /> Private Session
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Form Inputs */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
              
              <div className="bg-white rounded-2xl border border-[#f0ece8] p-6 lg:p-8 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5 flex items-center gap-2">
                   <FileText size={16} className="text-[#e8612a]" /> Subject & Topic
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Subject <span className="text-red-500">*</span></label>
                    <select 
                      value={subject} 
                      onChange={(e) => setConfig({ subject: e.target.value })}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 w-full hover:bg-white transition-colors cursor-pointer"
                    >
                      {[
                        "Database Management System (DBMS)", "Computer Networks (CN)", "Operating Systems (OS)", 
                        "Data Structures & Algorithms (DSA)", "Software Engineering (SE)", 
                        "Computer Organization & Architecture (COA)", "Theory of Computation (TOC)"
                      ].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Specific Topic (Optional)</label>
                    <input 
                      type="text" 
                      value={topic}
                      onChange={(e) => setConfig({ topic: e.target.value })}
                      placeholder="e.g. Normalization, Deadlock..."
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 w-full hover:bg-white transition-colors"
                    />
                    <p className="text-[10px] text-gray-400 mt-1.5 italic">Leave blank to cover the full subject</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#f0ece8] p-6 lg:p-8 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5 flex items-center gap-2">
                   <Settings size={16} className="text-[#e8612a]" /> Session Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Number of Questions</label>
                    <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
                      {["5", "10", "15", "20"].map((num) => (
                        <button
                          key={num}
                          onClick={() => setConfig({ questionCount: num })}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${questionCount === num ? "bg-[#1a1a1a] text-white shadow-md transform scale-105" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Difficulty Level</label>
                    <div className="flex flex-col gap-2">
                      <select 
                        value={difficulty} 
                        onChange={(e) => setConfig({ difficulty: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 w-full hover:bg-white transition-colors cursor-pointer"
                      >
                        <option value="easy">🟢 Easy</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="hard">🔴 Hard</option>
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Your Name</label>
                    <input 
                      type="text" 
                      value={studentName}
                      onChange={(e) => setConfig({ studentName: e.target.value })}
                      placeholder="e.g. Rahul"
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 w-full hover:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Examiner & Start */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
              
              <div className="bg-white rounded-2xl border border-[#f0ece8] p-6 lg:p-8 shadow-sm flex-1 flex flex-col">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-2">
                   <Users size={16} className="text-[#e8612a]" /> Choose Your Examiner
                </h3>
                <p className="text-[10px] md:text-xs text-gray-400 mb-5">Select a preset teacher or describe your own. The AI simulates their exact personality and voice.</p>
                
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {teacherPresets.map((preset) => (
                    <div 
                      key={preset.id}
                      onClick={() => setConfig({ selectedPreset: preset.id })}
                      className={selectedPreset === preset.id 
                        ? "border-2 border-[#e8612a] bg-[#e8612a]/5 rounded-2xl p-4 cursor-pointer transition-all text-left shadow-sm flex flex-col items-center text-center justify-center transform scale-[1.02]" 
                        : "border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-[#e8612a]/40 hover:shadow-sm transition-all text-left flex flex-col items-center text-center justify-center group"
                      }
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${preset.avatar_gradient} flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform`}>
                        {preset.id === "custom" ? "?" : preset.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <h4 className="font-semibold text-sm text-[#1a1a1a] mt-3">{preset.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight">{preset.style}</p>
                    </div>
                  ))}
                </div>

                {/* Custom Fields */}
                {selectedPreset === "custom" && (
                  <div className="mt-5 p-5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl animate-in slide-in-from-top-2 duration-300 grid grid-cols-1 gap-4 shadow-inner">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Teacher Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dr. Rao"
                        onChange={(e) => setConfig({ customTeacherName: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-white w-full shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Style & Personality</label>
                      <textarea 
                        value={customDescription}
                        onChange={(e) => setConfig({ customDescription: e.target.value })}
                        placeholder="e.g. Very strict about definitions. Asks follow-up questions on edge cases..."
                        rows={3}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-white w-full custom-scrollbar shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Start Button */}
              <button 
                onClick={handleStartGenerating}
                disabled={!subject || (selectedPreset === "custom" && !customDescription)}
                className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white rounded-2xl py-5 text-base font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl group"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#e8612a] transition-colors">
                  <Mic size={20} className="animate-pulse" /> 
                </div>
                Start Viva Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 1B: GENERATING */}
      {phase === "generating" && (
        <div className="min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br ${teacher?.avatar_gradient || "from-gray-400 to-gray-600"} animate-pulse flex items-center justify-center shadow-lg`}>
            <Brain className="text-white w-10 h-10" />
          </div>
          <h2 className="font-['DM_Serif_Display'] text-2xl md:text-3xl mt-6 text-[#1a1a1a]">
            Preparing {selectedPreset === "custom" ? "Custom Examiner" : teacher.name}...
          </h2>
          <p className="text-xs md:text-sm text-[#888] mt-2 max-w-sm">Generating {questionCount} questions on {subject}</p>
          <div className="flex gap-2 mt-6">
            <div className="w-2.5 h-2.5 bg-[#e8612a] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2.5 h-2.5 bg-[#e8612a] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2.5 h-2.5 bg-[#e8612a] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {/* PHASE 1C: READY */}
      {phase === "ready" && (
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-2xl border border-[#f0ece8] p-8 md:p-10 shadow-sm relative overflow-hidden">
             
             <div className="relative z-10">
               <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${teacher?.avatar_gradient || "from-gray-400 to-gray-600"} mx-auto flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg ring-4 ring-white`}>
                 {teacher?.name?.split(" ").map(n => n[0]).join("") || "?"}
               </div>
               <h2 className="font-['DM_Serif_Display'] text-2xl text-[#1a1a1a] mt-4">{selectedPreset === "custom" ? "Your Examiner" : teacher?.name}</h2>
               <span className="bg-[#e8612a]/10 text-[#e8612a] rounded-full px-3 py-1 text-[10px] md:text-xs font-medium mx-auto mt-2 inline-block">
                 {teacher?.style}
               </span>
               <p className="text-xs md:text-sm text-[#888] mt-4 max-w-xs mx-auto">
                 Your examiner is ready. Click below to connect and begin your viva session. Make sure your microphone is working.
               </p>

               <div className="mt-6 bg-gray-50 rounded-xl p-4 text-left flex flex-col gap-2.5">
                 <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                   <div className="w-6 flex justify-center"><Brain size={16} className="text-[#e8612a]"/></div>
                   <span className="truncate">{subject}</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                   <div className="w-6 flex justify-center"><Mic size={16} className="text-[#e8612a]"/></div>
                   <span>{questionCount} Questions · {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                   <div className="w-6 flex justify-center"><Volume2 size={16} className="text-[#e8612a]"/></div>
                   <span>Estimated {questionCount * 2} minutes</span>
                 </div>
               </div>

               <button 
                 onClick={handleConnect}
                 className="w-full bg-[#e8612a] hover:bg-[#d4541f] text-white rounded-xl py-4 font-semibold mt-6 text-sm flex items-center justify-center gap-2 shadow-md transition-all"
               >
                 <PhoneOff size={18} className="rotate-135" style={{ transform: "rotate(135deg)" }} /> Connect & Begin Viva
               </button>
               
               <p 
                 onClick={() => setPhase("setup")}
                 className="text-[10px] md:text-xs text-gray-400 hover:text-gray-600 cursor-pointer mt-4 inline-flex items-center gap-1 transition-colors"
               >
                 Change settings
               </p>
             </div>
          </div>
        </div>
      )}

      {/* PHASE 2: SESSION */}
      {phase === "session" && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel */}
          <div className="flex-1 w-full min-w-0">
            {/* Topbar */}
            <div className="bg-white rounded-2xl border border-[#f0ece8] px-4 md:px-6 py-3 md:py-4 flex flex-wrap items-center justify-between gap-3 mb-4 shadow-sm">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] md:text-xs font-bold text-gray-700 tracking-wider">LIVE</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-gray-200" />
                <span className="bg-[#e8612a]/10 text-[#e8612a] rounded-full px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium truncate max-w-[150px] md:max-w-xs">{subject}</span>
                <span className="hidden sm:inline-block border border-gray-200 text-gray-500 text-[10px] md:text-xs rounded-full px-2 md:px-3 py-1 truncate">{teacher?.name}</span>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-xs md:text-sm font-mono text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{formatTime(timer)}</span>
                <button 
                  onClick={toggleMute}
                  className={`border ${isMuted ? "border-red-200 text-red-500 bg-red-50" : "border-gray-200 text-gray-600"} rounded-xl px-2.5 md:px-3 py-2 text-sm transition-all`}
                >
                  {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button 
                  onClick={handleEndSession}
                  className="border border-red-200 text-red-500 hover:bg-red-50 rounded-xl px-3 md:px-4 py-2 text-[10px] md:text-sm font-medium transition-all flex items-center gap-1.5"
                >
                  <PhoneOff size={14} className="hidden sm:block" /> End <span className="hidden sm:inline">Session</span>
                </button>
              </div>
            </div>

            {/* Teacher Card */}
            <div className="bg-white rounded-2xl border border-[#f0ece8] p-5 md:p-8 mb-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f4956a]/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-start gap-4 md:gap-5 relative z-10">
                <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${teacher?.avatar_gradient || "from-gray-400 to-gray-600"} flex items-center justify-center text-white font-bold text-xl flex-shrink-0 ${isSpeaking === "ai" ? "ring-4 ring-[#e8612a]/40 ring-offset-2 animate-pulse" : ""}`}>
                  {teacher?.name?.split(" ").map(n => n[0]).join("") || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-[#1a1a1a] text-sm md:text-base">{teacher?.name}</h4>
                    <span className="text-[10px] text-gray-400">AI Examiner</span>
                  </div>
                  
                  <div className="mt-2 md:mt-3 text-gray-700 text-xs md:text-sm leading-relaxed min-h-[60px] md:min-h-[80px]">
                    {conversationLog.filter(m => m.role === "ai").length > 0 ? (
                      conversationLog.filter(m => m.role === "ai").pop().text
                    ) : (
                      <span className="italic text-gray-400">Waiting for examiner...</span>
                    )}
                  </div>
                  
                  {isSpeaking === "ai" && (
                    <div className="flex items-end gap-0.5 h-6 md:h-8 mt-3">
                       {[1,2,3,4,5].map(i => (
                         <div key={i} className="w-1 bg-[#e8612a] rounded-full animate-pulse transition-all" style={{ height: `${Math.random() * 100}%` }} />
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Student Card */}
            <div className="bg-white rounded-2xl border border-[#f0ece8] p-5 md:p-6 shadow-sm relative">
              <h3 className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 md:mb-4">Your Response</h3>
              
              {isSpeaking === "student" && !isMuted ? (
                <div className="flex items-center justify-center gap-1 h-12 md:h-16 mb-4">
                   {[1,2,3,4,5,6,7,8,9].map((i, idx) => (
                      <div key={i} className={`rounded-full transition-all flex-shrink-0 ${idx === 4 ? "bg-[#e8612a] w-1.5 md:w-2" : "bg-[#1a1a1a] w-1 md:w-1.5"}`} style={{ height: `${Math.random() * 80 + 20}%` }} />
                   ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 mb-2">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-50 border-2 ${isMuted ? "border-red-100 flex items-center justify-center" : "border-gray-100 flex items-center justify-center"}`}>
                    {isMuted ? <MicOff className="text-red-300 w-5 h-5 md:w-6 md:h-6" /> : <Mic className="text-gray-300 w-5 h-5 md:w-6 md:h-6" />}
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-400 mt-2 text-center">
                    {isMuted ? "Your microphone is muted" : "Your microphone is active — speak your answer"}
                  </p>
                </div>
              )}

              <div className="mt-2 md:mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 text-[10px] md:text-sm text-gray-700 min-h-[50px] italic">
                {conversationLog.filter(m => m.role === "student").length > 0 ? (
                  conversationLog.filter(m => m.role === "student").pop().text
                ) : (
                  <span className="text-gray-400">Your words will appear here as you speak...</span>
                )}
              </div>

              {isMuted && (
                <div className="mt-3 flex items-center justify-center gap-2 text-[10px] md:text-xs text-red-500 bg-red-50 rounded-xl py-2 px-3 text-center">
                  <MicOff size={14} className="flex-shrink-0" />
                  <span>You are muted — click the mute button above to unmute</span>
                </div>
              )}
            </div>

            {/* Conversation Log Mini */}
            {conversationLog.length > 0 && (
              <div className="mt-4 bg-white rounded-2xl border border-[#f0ece8] p-4 md:p-5 max-h-40 md:max-h-52 overflow-y-auto custom-scrollbar">
                <h3 className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 sticky top-0 bg-white/90 backdrop-blur pb-1">Conversation History</h3>
                <div className="space-y-3">
                  {conversationLog.map((msg, idx) => (
                    <div key={idx} className={`flex items-start gap-2 ${msg.role === "student" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white flex-shrink-0 ${msg.role === "ai" ? `bg-gradient-to-br ${teacher?.avatar_gradient}` : "bg-[#1a1a1a]"}`}>
                        {msg.role === "ai" ? teacher?.name[0] : "S"}
                      </div>
                      <div className={`rounded-xl px-3 py-2 text-[10px] md:text-xs max-w-[85%] ${msg.role === "student" ? "bg-[#1a1a1a] text-white rounded-tr-sm" : "bg-gray-50 text-gray-700 rounded-tl-sm"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
            
            {/* Visual Testing Helpers (Since no backend) */}
            <div className="flex gap-2 mt-4 opacity-30 hover:opacity-100 transition-opacity justify-center text-[10px]">
               <button onClick={() => simulateLiveEvent("ai-speak")} className="bg-gray-200 px-2 py-1 rounded">Sim. AI</button>
               <button onClick={() => simulateLiveEvent("student-speak")} className="bg-gray-200 px-2 py-1 rounded">Sim. Student</button>
            </div>
            
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
            
            <div className="bg-white rounded-2xl border border-[#f0ece8] p-5 text-center shadow-sm">
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${teacher?.avatar_gradient || "from-gray-400 to-gray-600"} mx-auto flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md`}>
                {teacher?.name?.split(" ").map(n => n[0]).join("") || "?"}
              </div>
              <h3 className="font-['DM_Serif_Display'] text-base md:text-lg text-[#1a1a1a] mt-3">{teacher?.name}</h3>
              <span className="bg-[#e8612a]/10 text-[#e8612a] rounded-full px-2 py-0.5 text-[10px] font-medium mt-1 inline-block">
                Examiner Profile
              </span>
              <div className="mt-4 flex flex-col gap-2 border-t border-gray-50 pt-3">
                {teacher?.traits?.map((trait, idx) => (
                  <div key={idx} className="text-[10px] md:text-xs text-gray-600 flex items-center gap-2 text-left">
                    <div className="w-1.5 h-1.5 bg-[#e8612a] rounded-full flex-shrink-0" />
                    <span className="truncate">{trait}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#f4956a] via-[#e8704a] to-[#e8612a] rounded-2xl p-5 text-white relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl opacity-20" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full blur-3xl opacity-20" />
              <h3 className="font-semibold text-xs md:text-sm mb-3 relative z-10 flex items-center gap-2"><Brain size={16}/> Viva Tips</h3>
              <div className="space-y-2 relative z-10">
                {["Speak clearly at normal pace", "Define terms before explaining", "Take a breath before answering", "Structure: define → explain → example"].map((tip, idx) => (
                  <div key={idx} className="text-[10px] md:text-xs text-white flex items-start gap-2 leading-snug">
                    <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5 opacity-80" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#f0ece8] p-4 shadow-sm text-center">
              <button 
                onClick={handleEndSession}
                className="w-full border border-red-200 text-red-500 hover:bg-red-50 rounded-xl py-2.5 md:py-3 text-[10px] md:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <PhoneOff size={16} /> End Viva Session
              </button>
              <p className="text-[9px] md:text-[10px] text-gray-400 mt-2">Ending will generate your full report</p>
            </div>
            
          </div>
        </div>
      )}

      {/* PHASE 2B: ANALYZING */}
      {phase === "analyzing" && (
        <div className="min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shadow-md animate-[spin_3s_linear_infinite]">
            <Brain className="text-blue-500 w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h2 className="font-['DM_Serif_Display'] text-2xl md:text-3xl mt-6 text-[#1a1a1a]">Gemini is analyzing your performance...</h2>
          <p className="text-[10px] md:text-xs text-[#888] mt-2 mb-8">Evaluating your answers and preparing your report</p>
          
          <div className="space-y-4 max-w-xs mx-auto text-left">
             <div className="flex items-center gap-3 text-sm">
               <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
               <span className="text-gray-700">Transcribing conversation</span>
             </div>
             <div className="flex items-center gap-3 text-sm">
               <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
               <span className="text-gray-700">Evaluating each answer</span>
             </div>
             <div className="flex items-center gap-3 text-sm opacity-60">
               <div className="w-5 h-5 border-2 border-[#e8612a] border-t-transparent rounded-full animate-spin flex-shrink-0" />
               <span className="text-gray-700">Generating performance report</span>
             </div>
          </div>
        </div>
      )}

      {/* PHASE 3: RESULTS */}
      {phase === "results" && analysisResult && (
        <div className="max-w-4xl mx-auto">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-[#f4956a] via-[#e8704a] to-[#fde8cc] rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl opacity-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl opacity-20" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
              <div>
                <span className="text-[10px] md:text-xs text-[#2a1a0e]/60 font-semibold uppercase tracking-wide">Viva Complete ✓</span>
                <h2 className="font-['DM_Serif_Display'] text-3xl md:text-4xl text-[#1e0f06] mt-2 mb-1">Here is how you did, {studentName}</h2>
                <p className="text-xs md:text-sm text-[#2a1a0e]/70">{subject} · {teacher?.name} · {questionCount} Questions</p>
                <p className="text-[10px] md:text-xs text-[#2a1a0e]/50 mt-1">Duration: {formatTime(timer)}</p>
              </div>
              
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[120px] self-end md:self-auto border border-white/20 shadow-sm">
                <div className="flex items-end justify-center gap-1">
                  <span className="font-['DM_Serif_Display'] text-5xl md:text-6xl text-[#1e0f06] leading-none">{analysisResult.overall_score}</span>
                  <span className="text-sm md:text-base text-[#1e0f06]/50 mb-1">/ 100</span>
                </div>
                <div className="text-lg md:text-xl font-bold text-[#e8612a] mt-1">{analysisResult.grade_label}</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {[
              { label: "Overall Score", value: `${analysisResult.overall_score}%`, icon: Trophy, color: "text-[#e8612a]", bg: "bg-[#e8612a]/10" },
              { label: "Grade", value: analysisResult.grade_label, icon: Award, color: "text-purple-500", bg: "bg-purple-100" },
              { label: "Strong Topics", value: analysisResult.strong_topics.length.toString(), icon: TrendingUp, color: "text-green-500", bg: "bg-green-100" },
              { label: "Needs Revision", value: analysisResult.weak_topics.length.toString(), icon: AlertCircle, color: "text-red-500", bg: "bg-red-100" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[#f0ece8] p-4 md:p-5 flex items-center gap-3 md:gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{stat.label}</p>
                  <p className="text-base md:text-xl font-bold text-[#1a1a1a]">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Summary and Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-[#f0ece8] p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Brain size={16} />
                </div>
                <h3 className="font-['DM_Serif_Display'] text-lg md:text-xl text-[#1a1a1a]">AI Performance Summary</h3>
              </div>
              <p className="text-[10px] md:text-xs text-gray-400 mb-4 italic">In the words of {teacher?.name}</p>
              <div className="text-xs md:text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {analysisResult.summary_paragraph}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#f0ece8] p-5 md:p-6 shadow-sm">
              <h3 className="font-['DM_Serif_Display'] text-lg md:text-xl text-[#1a1a1a] mb-5">Topic Breakdown</h3>
              
              <div className="mb-5">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-3">Strong Areas</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.strong_topics.map((t, idx) => (
                    <span key={idx} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle size={12} /> {t}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-100 my-4" />
              
              <div>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-3">Revise These</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.weak_topics.map((t, idx) => (
                    <span key={idx} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle size={12} /> {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="bg-white rounded-2xl border border-[#f0ece8] p-5 md:p-6 mb-6 shadow-sm">
            <h3 className="font-['DM_Serif_Display'] text-lg md:text-xl text-[#1a1a1a] mb-5">Question-by-Question Review</h3>
            <div className="space-y-3">
              {analysisResult.question_results.map((q) => (
                <div key={q.question_id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-[#e8612a]/30 transition-colors">
                  <div 
                    onClick={() => setExpandedQuestion(q.question_id)}
                    className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 cursor-pointer hover:bg-gray-50 gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="bg-[#e8612a]/10 text-[#e8612a] px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 mt-0.5">Q{q.question_id}</span>
                      <p className="text-xs md:text-sm font-medium text-[#1a1a1a] truncate">{q.question}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end md:justify-start">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${q.score >= 80 ? "bg-green-100 text-green-700" : q.score >= 50 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                        {q.score} / 100
                      </span>
                      {expandedQuestion === q.question_id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                  
                  {expandedQuestion === q.question_id && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Your Answer</p>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs md:text-sm text-gray-700">
                          {q.student_answer_extracted}
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-[#e8612a] uppercase tracking-widest mb-1.5">Feedback</p>
                        <div className="text-xs md:text-sm text-gray-600 italic">
                          "{q.feedback}"
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Key Concepts</p>
                        <div className="flex flex-wrap gap-2 text-[10px]">
                          {q.keywords_found.map((kw, idx) => (
                            <span key={idx} className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={10} /> {kw}</span>
                          ))}
                          {q.keywords_missed.map((kw, idx) => (
                            <span key={idx} className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded flex items-center gap-1 text-decoration-line-through opacity-70"><AlertCircle size={10} /> {kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button 
              onClick={resetViva}
              className="flex-1 bg-[#1a1a1a] hover:bg-[#333] text-white rounded-xl py-3.5 text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> New Viva Session
            </button>
            <button 
              onClick={() => { alert("Downloading report mock feature"); }}
              className="flex-1 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 rounded-xl py-3.5 text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} /> Download Report
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VivaAI;
