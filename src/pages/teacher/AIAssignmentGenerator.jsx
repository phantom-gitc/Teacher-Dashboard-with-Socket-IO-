import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "@/components/layout/TeacherLayout";
import PageHeader from "@/components/shared/PageHeader";
import { useTeacherStore } from "@/store";
import { Sparkles, Copy, Pencil, Check, Loader2, Trash2 } from "lucide-react";

const SUBJECTS = [
  "Database Management System (DBMS)",
  "Computer Networks (CN)",
  "Operating Systems (OS)",
  "Data Structures & Algorithms (DSA)",
  "Software Engineering (SE)",
  "Computer Organization & Architecture (COA)",
  "Theory of Computation (TOC)",
  "Mathematics",
  "Digital Electronics",
  "Object Oriented Programming (OOP)",
];

const ASSIGNMENT_TYPES = [
  "Theory Questions",
  "Practical / Lab Work",
  "Case Study",
  "Research Report",
  "Coding Problem",
  "MCQ Set",
  "Project Proposal",
];

const AIAssignmentGenerator = () => {
  const navigate = useNavigate();
  const { aiGeneratedAssignment, isAIGenerating, setAIGeneratedAssignment, setIsAIGenerating, clearAIAssignment } = useTeacherStore();

  // Form state
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [assignmentType, setAssignmentType] = useState("Theory Questions");
  const [difficulty, setDifficulty] = useState("Medium");
  const [marks, setMarks] = useState("");
  const [deadlineDays, setDeadlineDays] = useState("");
  const [extraInstructions, setExtraInstructions] = useState("");

  // UI state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [copied, setCopied] = useState(false);

  const currentContent = isEditMode ? editedContent : aiGeneratedAssignment;

  const handleGenerate = async () => {
    if (!subject || !topic) return;
    setIsAIGenerating(true);
    clearAIAssignment();
    setIsEditMode(false);

    const prompt = `You are an experienced CSIT professor. Generate a complete, professional assignment for CSIT students.\n\nSubject: ${subject}\nTopic: ${topic}\nType: ${assignmentType}\nDifficulty: ${difficulty}\nTotal Marks: ${marks || "Not specified"}\nDeadline: ${deadlineDays || "7"} days\nExtra Instructions: ${extraInstructions || "None"}\n\nGenerate a well-structured assignment with: clear title, objectives, detailed questions or tasks, marking scheme, and submission guidelines. Be professional and academic.`;

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
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate content. Please try again.";
      setAIGeneratedAssignment(text);
      setEditedContent(text);
    } catch (err) {
      setAIGeneratedAssignment("Error connecting to Gemini API. Please check your API key.");
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleClear = () => {
    clearAIAssignment();
    setIsEditMode(false);
    setSubject("");
    setTopic("");
    setMarks("");
    setDeadlineDays("");
    setExtraInstructions("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseAssignment = () => {
    if (isEditMode) setAIGeneratedAssignment(editedContent);
    navigate("/teacher/create-assignment");
  };

  const renderContent = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold text-[#1a1a1a] mb-3 mt-4" style={{ fontFamily: "'DM Serif Display', serif" }}>{line.slice(2)}</h1>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold text-[#1a1a1a] mb-2 mt-4">{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-bold text-gray-700 mb-1 mt-3">{line.slice(4)}</h3>;
      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="text-sm font-semibold text-[#1a1a1a] my-1">{line.slice(2, -2)}</p>;
      if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-sm text-gray-700 ml-4 list-disc leading-relaxed my-0.5">{line.slice(2)}</li>;
      if (line.match(/^\d+\./)) return <li key={i} className="text-sm text-gray-700 ml-4 list-decimal leading-relaxed my-0.5">{line.replace(/^\d+\.\s/, "")}</li>;
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm text-gray-700 leading-relaxed my-1">{line}</p>;
    });
  };

  const inputClass = "border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 w-full";

  return (
    <TeacherLayout title="AI Assignment Generator">
      <PageHeader title="AI Assignment Generator" subtitle="Describe what you want — Gemini will generate a complete assignment for you." />

      <div className="flex flex-col xl:grid xl:grid-cols-5 gap-6">
        {/* Input Panel */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#f0ece8] p-5 md:p-6 h-fit space-y-4 shadow-sm">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Subject *</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass + " cursor-pointer"}>
              <option value="">Select subject...</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Topic *</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Normalization in DBMS" className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Assignment Type</label>
            <select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)} className={inputClass + " cursor-pointer"}>
              {ASSIGNMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Difficulty</label>
            <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
              {["Easy", "Medium", "Hard"].map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${difficulty === d ? "bg-[#1a1a1a] text-white shadow" : "text-gray-500 hover:text-gray-800"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Total Marks</label>
              <input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="e.g. 20" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Days to Complete</label>
              <input type="number" value={deadlineDays} onChange={(e) => setDeadlineDays(e.target.value)} placeholder="e.g. 7" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Additional Instructions</label>
            <textarea value={extraInstructions} onChange={(e) => setExtraInstructions(e.target.value)}
              placeholder="e.g. Include at least 2 diagrams..." rows={3}
              className={inputClass + " resize-none"} />
          </div>

          <button onClick={handleGenerate} disabled={!subject || !topic || isAIGenerating}
            className="w-full bg-[#e8612a] hover:bg-[#d4541f] text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isAIGenerating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Assignment</>}
          </button>

          <button onClick={handleClear}
            className="w-full border border-gray-200 text-gray-500 hover:text-red-400 hover:border-red-200 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all">
            <Trash2 size={14} /> Clear
          </button>
        </div>

        {/* Output Panel */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-[#f0ece8] min-h-[400px] xl:min-h-[600px] flex flex-col shadow-sm">
          {!aiGeneratedAssignment && !isAIGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-[#e8612a]/10 flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-[#e8612a]" />
              </div>
              <p className="text-base font-medium text-gray-600 mb-1">Your assignment will appear here</p>
              <p className="text-sm text-gray-400">Fill in the form and click Generate</p>
            </div>
          ) : isAIGenerating ? (
            <div className="flex-1 p-6 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-4 bg-gray-100 rounded-lg animate-pulse ${i % 3 === 0 ? "w-1/2" : i % 2 === 0 ? "w-3/4" : "w-full"}`} />
              ))}
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 border-b border-[#f0ece8]">
                <span className="bg-[#e8612a]/10 text-[#e8612a] rounded-full px-3 py-1 text-xs font-medium">Generated Assignment</span>
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:border-gray-400 rounded-lg px-3 py-1.5 text-xs transition-all">
                    {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={() => { setIsEditMode(!isEditMode); if (!isEditMode) setEditedContent(aiGeneratedAssignment); }}
                    className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-xs transition-all ${isEditMode ? "border-[#e8612a] text-[#e8612a] bg-[#e8612a]/5" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                    <Pencil size={13} /> {isEditMode ? "Preview" : "Edit"}
                  </button>
                  <button onClick={handleUseAssignment}
                    className="bg-[#1a1a1a] hover:bg-[#333] text-white rounded-xl px-4 py-1.5 text-xs font-semibold transition-all">
                    Use This Assignment
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {isEditMode ? (
                  <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-full p-6 font-mono text-sm resize-none border-none focus:outline-none focus:ring-0 bg-transparent" />
                ) : (
                  <div className="p-6">
                    {renderContent(aiGeneratedAssignment)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default AIAssignmentGenerator;
