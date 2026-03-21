import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";
import { useDashboardStore } from "@/store";
import { Calendar, Upload, UploadCloud, X, CheckCircle2 } from "lucide-react";

const subjectColors = {
  DBMS: "bg-purple-100 text-purple-700",
  CN: "bg-blue-100 text-blue-700",
  OS: "bg-green-100 text-green-700",
  DS: "bg-orange-100 text-orange-700",
  SE: "bg-pink-100 text-pink-700",
};

const statusColors = {
  Pending: "bg-orange-100 text-[#e8612a]",
  Submitted: "bg-blue-100 text-blue-700",
  Graded: "bg-green-100 text-green-700",
};

const tabs = ["All", "Pending", "Submitted", "Graded"];

const Assignments = () => {
  // ── Shared state from store ──
  const { assignments, updateAssignmentStatus } = useDashboardStore();

  // ── Local UI state stays as useState ──
  const [activeTab, setActiveTab] = useState("All");
  const [uploadModal, setUploadModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadNote, setUploadNote] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const filtered = activeTab === "All" ? assignments : assignments.filter((a) => a.status === activeTab);

  const handleUpload = () => {
    updateAssignmentStatus(uploadModal.id, "Submitted", {
      submittedAt: new Date().toISOString(),
      fileName: selectedFile?.name || null,
    });
    setUploadModal(null);
    setSelectedFile(null);
    setUploadNote("");
    setSuccessToast("Assignment submitted successfully!");
    setTimeout(() => setSuccessToast(""), 3000);
  };

  return (
    <DashboardLayout title="Assignments">
      <PageHeader title="Assignments" subtitle="View, submit, and track all your assignments in one place." />

      {/* Tabs */}
      <div className="border-b border-gray-100 mb-6 flex gap-4 md:gap-6 overflow-x-auto custom-scrollbar whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm transition-all ${activeTab === tab ? "border-b-2 border-[#e8612a] text-[#e8612a] font-medium" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Assignment Cards */}
      <div className="space-y-4">
        {filtered.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-2xl p-4 md:p-5 border border-[#f0ece8] flex flex-col md:flex-row items-start md:justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between md:block">
                <span className={`inline-block rounded-full px-3 py-1 text-[10px] md:text-xs font-medium ${subjectColors[assignment.subject] || "bg-gray-100 text-gray-600"}`}>
                  {assignment.subject}
                </span>
                <span className={`md:hidden px-3 py-1 rounded-full text-[10px] font-medium ${statusColors[assignment.status]}`}>
                  {assignment.status}
                </span>
              </div>
              <h4 className="font-semibold text-base md:text-lg text-[#1a1a1a] mt-2 md:mt-3">{assignment.title}</h4>
              <p className="text-xs md:text-sm text-gray-500 mt-1">{assignment.description}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-2 md:mt-3">
                <Calendar size={12} />
                Due: {formatDate(assignment.dueDate)}
              </div>
            </div>
            
            <div className="w-full md:w-auto md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 pt-3 border-t border-gray-100 md:border-0 md:pt-0">
              <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[assignment.status]}`}>
                {assignment.status}
              </span>
              {assignment.status === "Graded" && (
                <div>
                  <p className="text-xl font-bold text-[#1a1a1a]">{assignment.marks}</p>
                  <p className="text-[10px] text-gray-400 max-w-[150px]">{assignment.feedback}</p>
                </div>
              )}
              {assignment.status === "Pending" && (
                <button onClick={() => setUploadModal(assignment)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8612a] text-white rounded-lg text-xs font-medium hover:bg-[#d4541f] transition-all">
                  <Upload size={12} /> Upload
                </button>
              )}
              {assignment.status === "Submitted" && (
                <span className="text-xs text-blue-500 italic">Awaiting Review</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setUploadModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1a1a1a]">{uploadModal.title}</h3>
              <button onClick={() => setUploadModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <label className="block border-2 border-dashed border-[#e8612a]/30 rounded-2xl p-8 text-center cursor-pointer hover:border-[#e8612a]/50 transition-all mb-4">
              <UploadCloud size={40} className="text-[#e8612a] mx-auto mb-2" />
              <p className="text-sm text-gray-600">{selectedFile ? selectedFile.name : "Drop files here or click to browse"}</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, ZIP</p>
              <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
            </label>

            <textarea
              value={uploadNote}
              onChange={(e) => setUploadNote(e.target.value)}
              placeholder="Add a note (optional)"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 resize-none mb-4"
            />

            <button onClick={handleUpload} disabled={!selectedFile} className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Submit Assignment
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 bg-green-50 border border-green-300 text-green-700 rounded-xl px-4 py-3 flex items-center gap-2 shadow-lg z-50 animate-in slide-in-from-bottom-4">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Assignments;
