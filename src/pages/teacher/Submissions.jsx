import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "@/components/layout/TeacherLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useTeacherStore } from "@/store";
import {
  Search, X, Eye, CheckSquare, Inbox, FileText,
  Download, Clock, ChevronDown,
} from "lucide-react";

const statusBadge = {
  submitted: "bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-xs font-medium",
  checked: "bg-green-50 text-green-600 rounded-full px-3 py-1 text-xs font-medium",
  pending: "bg-gray-100 text-gray-500 rounded-full px-3 py-1 text-xs font-medium",
};

const avatar = (name) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
    {name.split(" ").map((n) => n[0]).join("")}
  </div>
);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ── Side Drawer ──
const SubmissionDrawer = ({ sub, onClose, onEvaluate }) => {
  if (!sub) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-[#1a1a1a]">Submission Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Student */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white font-bold">
              {sub.studentName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="font-semibold text-[#1a1a1a]">{sub.studentName}</p>
              <p className="text-xs text-gray-400">{sub.studentRoll}</p>
            </div>
            <span className={`ml-auto ${statusBadge[sub.status]}`}>{sub.status}</span>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Assignment */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Assignment</p>
            <p className="text-sm font-medium text-[#1a1a1a]">{sub.assignmentTitle}</p>
            <span className="inline-block mt-1 bg-[#e8612a]/10 text-[#e8612a] rounded-full px-3 py-0.5 text-xs font-medium">{sub.subject}</span>
          </div>

          {/* Submitted On */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={13} />
            <span>Submitted on {formatDate(sub.submittedAt)}</span>
          </div>

          {/* File */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Submitted File</p>
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <FileText size={20} className="text-[#e8612a]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1a1a1a] truncate">{sub.fileName}</p>
                <p className="text-xs text-gray-400">{sub.fileSize}</p>
              </div>
              <button disabled className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 cursor-not-allowed opacity-50">
                <Download size={13} /> Download
              </button>
            </div>
            <p className="text-xs text-gray-400 italic mt-1.5">File preview available after backend integration.</p>
          </div>

          {/* Student Notes */}
          {sub.studentNotes && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Student Notes</p>
              <p className="text-sm text-gray-600 italic bg-amber-50 p-3 rounded-xl border border-amber-100">{sub.studentNotes}</p>
            </div>
          )}

          {/* Evaluation result */}
          {sub.marks !== null && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Evaluation</p>
              <p className="text-xl font-bold text-[#1a1a1a]">{sub.marks} <span className="text-sm font-normal text-gray-400">/ {sub.totalMarks}</span></p>
              {sub.feedback && <p className="text-sm text-gray-600 mt-2 italic">{sub.feedback}</p>}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100">
          <button onClick={onEvaluate}
            className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2">
            <CheckSquare size={16} /> Evaluate Submission
          </button>
        </div>
      </div>
    </>
  );
};

const Submissions = () => {
  const navigate = useNavigate();
  const { submissions, assignments } = useTeacherStore();

  const [search, setSearch] = useState("");
  const [filterAssignment, setFilterAssignment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [drawerSub, setDrawerSub] = useState(null);

  const hasFilters = search || filterAssignment !== "all" || filterStatus !== "all";

  const filtered = useMemo(() => {
    let list = [...submissions];
    if (search) list = list.filter((s) => s.studentName.toLowerCase().includes(search.toLowerCase()));
    if (filterAssignment !== "all") list = list.filter((s) => s.assignmentId === filterAssignment);
    if (filterStatus !== "all") list = list.filter((s) => s.status === filterStatus);
    if (sort === "newest") list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    else if (sort === "oldest") list.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    else if (sort === "name") list.sort((a, b) => a.studentName.localeCompare(b.studentName));
    return list;
  }, [submissions, search, filterAssignment, filterStatus, sort]);

  const selectClass = "border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#e8612a] cursor-pointer flex-1 min-w-[120px] md:flex-none md:w-auto";

  return (
    <TeacherLayout title="Submissions">
      <PageHeader title="Submissions" subtitle="Review and manage all student assignment submissions." />

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#f0ece8] px-4 md:px-5 py-4 flex flex-col md:flex-row flex-wrap md:items-center gap-3 mb-6 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full md:w-auto md:flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name..."
            className="bg-transparent text-sm focus:outline-none w-full" />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select value={filterAssignment} onChange={(e) => setFilterAssignment(e.target.value)} className={selectClass}>
            <option value="all">All Assignments</option>
            {assignments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="checked">Checked</option>
            <option value="pending">Pending</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">By Name</option>
          </select>
        </div>
        {hasFilters && (
          <button onClick={() => { setSearch(""); setFilterAssignment("all"); setFilterStatus("all"); }}
            className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-500 hover:text-red-400 hover:border-red-200 rounded-xl px-3 py-2 text-sm w-full md:w-auto transition-all">
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#f0ece8] overflow-hidden shadow-sm">
        {/* Desktop Table Header — hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-6 px-6 py-4 border-b border-[#f0ece8]">
          {["Student", "Assignment", "Submitted On", "Status", "Marks", "Actions"].map((h) => (
            <p key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Inbox} title="No submissions found" subtitle={hasFilters ? "Try adjusting your filters." : "Submissions will appear here once students submit."} />
        ) : (
          filtered.map((sub) => (
            <div key={sub.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              {/* Mobile card layout */}
              <div className="md:hidden flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  {avatar(sub.studentName)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{sub.studentName}</p>
                    <p className="text-xs text-gray-400 truncate">{sub.assignmentTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className={statusBadge[sub.status] || statusBadge.pending}>{sub.status}</span>
                  <button onClick={() => setDrawerSub(sub)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-400 text-gray-600 transition-all">
                    <Eye size={14} />
                  </button>
                </div>
              </div>
              {/* Desktop row — hidden on mobile */}
              <div className="hidden md:grid md:grid-cols-6 px-6 py-4 items-center">
                <div className="flex items-center gap-2.5 min-w-0">
                  {avatar(sub.studentName)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{sub.studentName}</p>
                    <p className="text-xs text-gray-400">{sub.studentRoll}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 truncate pr-2">{sub.assignmentTitle}</p>
                <p className="text-sm text-gray-500">{formatDate(sub.submittedAt)}</p>
                <span className={statusBadge[sub.status] || statusBadge.pending}>{sub.status}</span>
                <p className="text-sm font-semibold text-[#1a1a1a]">
                  {sub.marks !== null ? `${sub.marks}/${sub.totalMarks}` : "—"}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setDrawerSub(sub)}
                    className="flex items-center gap-1 border border-gray-200 text-gray-600 hover:border-gray-400 rounded-lg px-2.5 py-1.5 text-xs transition-all">
                    <Eye size={13} /> View
                  </button>
                  <button onClick={() => navigate("/teacher/evaluation")}
                    className="flex items-center gap-1 bg-[#e8612a]/10 text-[#e8612a] hover:bg-[#e8612a]/20 border border-[#e8612a]/20 rounded-lg px-2.5 py-1.5 text-xs transition-all">
                    <CheckSquare size={13} /> Evaluate
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Drawer */}
      {drawerSub && (
        <SubmissionDrawer
          sub={drawerSub}
          onClose={() => setDrawerSub(null)}
          onEvaluate={() => { setDrawerSub(null); navigate("/teacher/evaluation"); }}
        />
      )}
    </TeacherLayout>
  );
};

export default Submissions;
