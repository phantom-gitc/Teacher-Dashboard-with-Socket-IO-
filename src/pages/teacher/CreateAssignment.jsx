import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "@/components/layout/TeacherLayout";
import PageHeader from "@/components/shared/PageHeader";
import { useTeacherStore } from "@/store";
import { UploadCloud, X, Sparkles, CheckCircle } from "lucide-react";

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

const inputClass =
  "border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 w-full";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
const errorClass = "text-xs text-red-500 mt-1";

const Toast = ({ msg, onClose }) => (
  <div className="fixed bottom-6 right-6 z-50 bg-[#1a1a1a] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
    <CheckCircle size={16} className="text-green-400" />
    <span className="text-sm font-medium">{msg}</span>
    <button onClick={onClose} className="ml-2 text-white/60 hover:text-white"><X size={14} /></button>
  </div>
);

const CreateAssignment = () => {
  const navigate = useNavigate();
  const { aiGeneratedAssignment, clearAIAssignment, addAssignment } = useTeacherStore();
  const fileRef = useRef();

  const [prefilled, setPrefilled] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignTo, setAssignTo] = useState("all");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // On mount: read AI content from store and prefill
  useEffect(() => {
    if (aiGeneratedAssignment) {
      const lines = aiGeneratedAssignment.split("\n");
      const titleLine = lines.find((l) => l.startsWith("# ") || l.startsWith("**"));
      setTitle(titleLine ? titleLine.replace(/^#+ /, "").replace(/\*\*/g, "").trim() : "");
      setDescription(aiGeneratedAssignment);
      setPrefilled(true);
      clearAIAssignment();
    }
  }, []);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Assignment title is required.";
    if (!subject) e.subject = "Please select a subject.";
    if (!description.trim()) e.description = "Description is required.";
    if (!dueDate) e.dueDate = "Due date is required.";
    else if (new Date(dueDate) <= new Date()) e.dueDate = "Due date must be in the future.";
    return e;
  };

  const handleSubmit = (status) => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    addAssignment({
      title: title.trim(),
      subject,
      description: description.trim(),
      totalMarks: totalMarks ? parseInt(totalMarks) : null,
      dueDate: new Date(dueDate).toISOString(),
      status,
      assignTo,
      fileName: file ? file.name : null,
    });
    const msg = status === "published" ? "Assignment published successfully!" : "Saved as draft.";
    setToast(msg);
    setTimeout(() => { setToast(null); navigate("/teacher/submissions"); }, 1800);
  };

  return (
    <TeacherLayout title="Create Assignment">
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Create Assignment" subtitle="Fill in the details and publish to your students." />

        <div className="bg-white rounded-2xl border border-[#f0ece8] p-8 shadow-sm space-y-5">
          {prefilled && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#e8612a]/8 border border-[#e8612a]/20 rounded-xl">
              <Sparkles size={15} className="text-[#e8612a] flex-shrink-0" />
              <p className="text-xs text-[#e8612a] font-medium">Pre-filled from AI Generator — review and edit before publishing.</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className={labelClass}>Assignment Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ER Diagram for Hospital Management System" className={inputClass} />
            {errors.title && <p className={errorClass}>{errors.title}</p>}
          </div>

          {/* Subject */}
          <div>
            <label className={labelClass}>Subject *</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass + " cursor-pointer"}>
              <option value="">Select subject...</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.subject && <p className={errorClass}>{errors.subject}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Assignment Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={8} placeholder="Detailed description, questions, tasks, and requirements..."
              className={inputClass + " resize-y"} />
            {errors.description && <p className={errorClass}>{errors.description}</p>}
          </div>

          {/* Marks + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Total Marks</label>
              <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="e.g. 20" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Due Date *</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className={inputClass} />
              {errors.dueDate && <p className={errorClass}>{errors.dueDate}</p>}
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className={labelClass}>Assign To</label>
            <div className="space-y-2">
              {[
                { value: "all", label: "All Students", desc: "Visible to every enrolled student" },
                { value: "specific", label: "Specific Students", desc: "Choose individual students" },
              ].map((opt) => (
                <label key={opt.value}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${assignTo === opt.value ? "border-[#e8612a] bg-[#e8612a]/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" value={opt.value} checked={assignTo === opt.value}
                    onChange={() => setAssignTo(opt.value)} className="mt-0.5 accent-[#e8612a]" />
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
                      {opt.label}
                      {opt.value === "specific" && (
                        <span className="bg-gray-100 text-gray-400 rounded-full px-2 py-0.5 text-[10px]">Coming Soon</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className={labelClass}>Attachment (Optional)</label>
            {file ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <UploadCloud size={16} className="text-[#e8612a]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div onClick={() => fileRef.current.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#e8612a]/40 hover:bg-[#e8612a]/3 transition-all">
                <UploadCloud size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to browse or drag & drop</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, ZIP, PNG, JPG</p>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.zip,.png,.jpg"
                  className="hidden" onChange={(e) => setFile(e.target.files[0] || null)} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => handleSubmit("draft")}
              className="flex-1 border border-gray-200 text-gray-600 hover:border-gray-400 rounded-xl px-6 py-3 font-semibold text-sm transition-all">
              Save as Draft
            </button>
            <button onClick={() => handleSubmit("published")}
              className="flex-1 bg-[#e8612a] hover:bg-[#d4541f] text-white rounded-xl px-6 py-3 font-semibold text-sm transition-all">
              Publish Assignment
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateAssignment;
