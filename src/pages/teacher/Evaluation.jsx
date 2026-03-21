import React, { useState, useMemo } from "react";
import TeacherLayout from "@/components/layout/TeacherLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useTeacherStore } from "@/store";
import {
  CheckSquare, Clock, Sparkles, Loader2, MessageSquare,
  FileText, Download, CheckCircle, X,
} from "lucide-react";

const statusBadge = {
  submitted: "bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 text-xs font-medium",
  checked: "bg-green-50 text-green-600 rounded-full px-2 py-0.5 text-xs font-medium",
  pending: "bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium",
};

const getGrade = (marks, total) => {
  if (!marks || !total) return null;
  const pct = (marks / total) * 100;
  if (pct >= 90) return { label: "A+", color: "bg-green-100 text-green-700" };
  if (pct >= 80) return { label: "A", color: "bg-green-50 text-green-600" };
  if (pct >= 70) return { label: "B", color: "bg-blue-50 text-blue-600" };
  if (pct >= 60) return { label: "C", color: "bg-yellow-50 text-yellow-600" };
  if (pct >= 40) return { label: "D", color: "bg-orange-50 text-orange-600" };
  return { label: "F", color: "bg-red-50 text-red-500" };
};

const Toast = ({ msg, onClose }) => (
  <div className="fixed bottom-6 right-6 z-50 bg-[#1a1a1a] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
    <CheckCircle size={16} className="text-green-400" />
    <span className="text-sm font-medium">{msg}</span>
    <button onClick={onClose} className="ml-2 text-white/60 hover:text-white"><X size={14} /></button>
  </div>
);

const Evaluation = () => {
  const { submissions, updateSubmissionEvaluation, setEvaluationDraft } = useTeacherStore();

  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const filtered = useMemo(() => {
    if (tab === "pending") return submissions.filter((s) => s.status !== "checked");
    if (tab === "checked") return submissions.filter((s) => s.status === "checked");
    return submissions;
  }, [submissions, tab]);

  const selected = submissions.find((s) => s.id === selectedId) || null;

  const handleSelect = (sub) => {
    setSelectedId(sub.id);
    setMarks(sub.marks !== null ? String(sub.marks) : "");
    setFeedback(sub.feedback || "");
    setPrivateNotes(sub.privateNotes || "");
    setAiSuggestion(null);
  };

  const marksNum = parseInt(marks) || 0;
  const grade = selected ? getGrade(marksNum, selected.totalMarks) : null;
  const marksExceed = selected && marksNum > selected.totalMarks;

  const handleSubmit = () => {
    if (!selected || marksExceed) return;
    updateSubmissionEvaluation(selected.id, marksNum, feedback, privateNotes);
    showToast("Evaluation submitted!");
    // Auto-advance to next pending
    const pending = filtered.filter((s) => s.id !== selected.id && s.status !== "checked");
    if (pending.length > 0) handleSelect(pending[0]);
    else setSelectedId(null);
  };

  const handleSaveDraft = () => {
    if (!selected) return;
    setEvaluationDraft(selected.id, "marks", marks);
    setEvaluationDraft(selected.id, "feedback", feedback);
    showToast("Draft saved.");
  };

  const handleAIEvaluate = async () => {
    if (!selected) return;
    setIsAILoading(true);
    setAiSuggestion(null);
    const prompt = `You are evaluating a CSIT student submission.\nAssignment: ${selected.assignmentTitle}\nDescription: (no text available)\nTotal marks: ${selected.totalMarks}\nStudent submission file: ${selected.fileName}\n\nSuggest marks out of ${selected.totalMarks}, list 2-3 strengths, list 2-3 improvements, and write 2-3 sentence feedback.\n\nReturn ONLY valid JSON (no markdown, no code fences) in this exact format:\n{"suggested_marks": number, "strengths": ["..."], "improvements": ["..."], "feedback": "..."}`;
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const clean = raw.replace(/```json\n?|```/g, "").trim();
      setAiSuggestion(JSON.parse(clean));
    } catch {
      setAiSuggestion({ error: true });
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <TeacherLayout title="Evaluation">
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <PageHeader title="Evaluation" subtitle="Grade submissions and provide feedback to students." />

      <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-14rem)]">
        {/* Left List */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-2xl border border-[#f0ece8] shadow-sm flex flex-col overflow-hidden" style={{ minHeight: '300px', maxHeight: '420px' }}
          /* on lg+ let flex naturally stretch */>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1a1a1a]">Submissions</h3>
              <span className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium">{filtered.length}</span>
            </div>
            <div className="flex border-b border-gray-100 -mx-4 px-4">
              {[["all", "All"], ["pending", "Pending"], ["checked", "Checked"]].map(([val, label]) => (
                <button key={val} onClick={() => setTab(val)}
                  className={`text-xs font-medium pb-2 mr-4 transition-all ${tab === val ? "text-[#e8612a] border-b-2 border-[#e8612a]" : "text-gray-400 hover:text-gray-600"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <EmptyState icon={Inbox} title="No submissions" subtitle="Try a different tab." />
            ) : (
              filtered.map((sub) => (
                <div key={sub.id} onClick={() => handleSelect(sub)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-all ${selectedId === sub.id ? "bg-[#e8612a]/5 border-l-2 border-l-[#e8612a]" : "hover:bg-gray-50"}`}>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {sub.studentName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">{sub.studentName}</p>
                      <p className="text-xs text-gray-400 truncate">{sub.assignmentTitle}</p>
                    </div>
                    <span className={statusBadge[sub.status]}>{sub.status}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 pl-10 flex items-center gap-1">
                    <Clock size={10} /> {new Date(sub.submittedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <CheckSquare size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Select a submission to evaluate</p>
              <p className="text-sm text-gray-400 mt-1">Choose from the list on the left.</p>
            </div>
          ) : (
            <>
              {/* Submission Header */}
              <div className="bg-white rounded-2xl border border-[#f0ece8] p-6 shadow-sm relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl text-[#1a1a1a]" style={{ fontFamily: "'DM Serif Display', serif" }}>{selected.studentName}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{selected.studentRoll}</p>
                    <p className="text-sm text-gray-500 mt-2">{selected.assignmentTitle}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-[#e8612a]/10 text-[#e8612a] rounded-full px-3 py-0.5 text-xs font-medium">{selected.subject}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Clock size={11} /> Submitted {new Date(selected.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <span className={statusBadge[selected.status]}>{selected.status}</span>
                </div>
              </div>

              {/* Submitted Work */}
              <div className="bg-white rounded-2xl border border-[#f0ece8] p-6 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Submitted Work</p>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <FileText size={22} className="text-[#e8612a]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a]">{selected.fileName}</p>
                    <p className="text-xs text-gray-400">{selected.fileSize}</p>
                  </div>
                  <button disabled className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 cursor-not-allowed opacity-50">
                    <Download size={13} /> Download
                  </button>
                </div>
                <p className="text-xs text-gray-400 italic mt-2">Real file preview available after backend integration.</p>
                {selected.studentNotes && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2">
                    <MessageSquare size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 italic">{selected.studentNotes}</p>
                  </div>
                )}
              </div>

              {/* AI Evaluation Assistant */}
              <div className="bg-white rounded-2xl border border-[#f0ece8] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-[#e8612a]" />
                    <h3 className="font-semibold text-[#1a1a1a]">AI Evaluation Assistant</h3>
                  </div>
                  <button onClick={handleAIEvaluate} disabled={isAILoading}
                    className="bg-[#e8612a]/10 text-[#e8612a] border border-[#e8612a]/20 rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#e8612a]/20 transition-all flex items-center gap-2 disabled:opacity-60">
                    {isAILoading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : "Generate Suggestions"}
                  </button>
                </div>

                {!aiSuggestion && !isAILoading && (
                  <p className="text-sm text-gray-400">Click "Generate Suggestions" to get AI marking recommendations.</p>
                )}
                {isAILoading && (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-4 bg-gray-100 rounded-lg animate-pulse ${i % 2 === 0 ? "w-3/4" : "w-full"}`} />
                    ))}
                  </div>
                )}
                {aiSuggestion && !aiSuggestion.error && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-[#1a1a1a]" style={{ fontFamily: "'DM Serif Display', serif" }}>{aiSuggestion.suggested_marks}</span>
                      <span className="text-sm text-gray-400">/ {selected.totalMarks} suggested marks</span>
                      <button onClick={() => setMarks(String(aiSuggestion.suggested_marks))}
                        className="ml-auto text-xs bg-[#e8612a]/10 text-[#e8612a] rounded-lg px-3 py-1.5 hover:bg-[#e8612a]/20 transition-all">
                        Use This
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">Strengths</p>
                      {aiSuggestion.strengths?.map((s, i) => (
                        <p key={i} className="text-sm text-gray-700 flex gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />{s}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">Improvements</p>
                      {aiSuggestion.improvements?.map((s, i) => (
                        <p key={i} className="text-sm text-gray-700 flex gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-[#e8612a] mt-1.5 flex-shrink-0" />{s}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Suggested Feedback</p>
                      <p className="text-sm text-gray-700 italic">{aiSuggestion.feedback}</p>
                      <button onClick={() => setFeedback(aiSuggestion.feedback)}
                        className="mt-2 text-xs text-[#e8612a] hover:underline">Use This Feedback</button>
                    </div>
                  </div>
                )}
                {aiSuggestion?.error && (
                  <p className="text-sm text-red-400">Could not generate suggestions. Check your API key.</p>
                )}
              </div>

              {/* Evaluation Form */}
              <div className="bg-white rounded-2xl border border-[#f0ece8] p-6 shadow-sm">
                <h3 className="text-xl text-[#1a1a1a] mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>Your Evaluation</h3>

                {/* Marks */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Marks Awarded</label>
                  <div className="flex items-center gap-4">
                    <input type="number" value={marks} onChange={(e) => setMarks(e.target.value)}
                      className={`w-24 h-16 text-center text-3xl font-bold border-2 rounded-xl focus:outline-none transition-colors ${marksExceed ? "border-red-400 text-red-500" : "border-gray-200 focus:border-[#e8612a] text-[#1a1a1a]"}`}
                      style={{ fontFamily: "'DM Serif Display', serif" }}
                      min={0} max={selected.totalMarks} />
                    <span className="text-gray-400 text-lg">/ {selected.totalMarks}</span>
                    {grade && (
                      <span className={`${grade.color} rounded-full px-4 py-1.5 text-sm font-bold`}>{grade.label}</span>
                    )}
                  </div>
                  {marksExceed && <p className="text-xs text-red-500 mt-1">Marks cannot exceed {selected.totalMarks}.</p>}
                </div>

                {/* Feedback */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Feedback to Student</label>
                  <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={5}
                    placeholder="Provide constructive feedback on their work..."
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 w-full resize-none" />
                </div>

                {/* Private Notes */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Private Notes (Only visible to you)</label>
                  <textarea value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} rows={2}
                    placeholder="Internal notes for your reference..."
                    className="border border-yellow-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-yellow-50 w-full resize-none" />
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSaveDraft}
                    className="border border-gray-200 text-gray-600 hover:border-gray-400 rounded-xl px-6 py-3 font-semibold text-sm transition-all">
                    Save Draft
                  </button>
                  <button onClick={handleSubmit} disabled={!marks || marksExceed}
                    className="flex-1 bg-[#1a1a1a] hover:bg-[#333] text-white rounded-xl px-6 py-3 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Submit Evaluation
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

const Inbox = ({ size, className }) => <CheckSquare size={size} className={className} />;

export default Evaluation;
