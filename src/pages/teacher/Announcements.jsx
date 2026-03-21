import React, { useState } from "react";
import TeacherLayout from "@/components/layout/TeacherLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useTeacherStore, useAuthStore } from "@/store";
import { Megaphone, Clock, Pin, Trash2, X, CheckCircle } from "lucide-react";

const typeBadge = {
  general: "bg-gray-100 text-gray-500 rounded-full px-3 py-1 text-xs font-medium",
  urgent: "bg-red-50 text-red-500 rounded-full px-3 py-1 text-xs font-medium",
  assignment: "bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-xs font-medium",
  exam: "bg-purple-50 text-purple-600 rounded-full px-3 py-1 text-xs font-medium",
};

const inputClass = "border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 w-full";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

const formatTimeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
};

const Toast = ({ msg, onClose }) => (
  <div className="fixed bottom-6 right-6 z-50 bg-[#1a1a1a] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
    <CheckCircle size={16} className="text-green-400" />
    <span className="text-sm font-medium">{msg}</span>
    <button onClick={onClose} className="ml-2 text-white/60 hover:text-white"><X size={14} /></button>
  </div>
);

// Confirm Dialog
const ConfirmDialog = ({ onConfirm, onCancel }) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-50" onClick={onCancel} />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <h3 className="font-semibold text-[#1a1a1a] text-lg mb-2">Delete Announcement</h3>
        <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this announcement? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 font-semibold text-sm hover:border-gray-400 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 font-semibold text-sm transition-all">Delete</button>
        </div>
      </div>
    </div>
  </>
);

const Announcements = () => {
  const { announcements, addAnnouncement, deleteAnnouncement } = useTeacherStore();
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("general");
  const [message, setMessage] = useState("");
  const [pinned, setPinned] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleBroadcast = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!message.trim()) e.message = "Message is required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    addAnnouncement({ title: title.trim(), type, message: message.trim(), pinned, author: user?.name || "Teacher" });
    setTitle(""); setType("general"); setMessage(""); setPinned(false);
    showToast("Announcement broadcast to all students!");
  };

  const handleDelete = () => {
    deleteAnnouncement(confirmId);
    setConfirmId(null);
    showToast("Announcement deleted.");
  };

  const pinned_ = announcements.filter((a) => a.pinned);
  const unpinned = announcements.filter((a) => !a.pinned);

  const AnnouncementCard = ({ ann }) => (
    <div className="bg-white rounded-2xl border border-[#f0ece8] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-[#1a1a1a]">{ann.title}</p>
            <span className={typeBadge[ann.type] || typeBadge.general}>{ann.type}</span>
            {ann.pinned && <span className="bg-amber-50 text-amber-600 rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center gap-1"><Pin size={9} /> Pinned</span>}
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <Clock size={11} /> {formatTimeAgo(ann.createdAt)} · {ann.author}
          </p>
        </div>
        <button onClick={() => setConfirmId(ann.id)}
          className="p-1.5 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
          <Trash2 size={16} />
        </button>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mt-3">{ann.message}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="bg-gray-50 text-gray-400 rounded-full px-3 py-1 text-xs">
          Broadcast to all students
        </span>
      </div>
    </div>
  );

  return (
    <TeacherLayout title="Announcements">
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      {confirmId && <ConfirmDialog onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
      <PageHeader title="Announcements" subtitle="Broadcast important updates to all your students instantly." />

      <div className="flex flex-col xl:grid xl:grid-cols-5 gap-6">
        {/* Create Panel */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#f0ece8] p-5 md:p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-xl text-[#1a1a1a]" style={{ fontFamily: "'DM Serif Display', serif" }}>New Announcement</h3>

          <div>
            <label className={labelClass}>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Assignment deadline extended" className={inputClass} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className={labelClass}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass + " cursor-pointer"}>
              <option value="general">General</option>
              <option value="urgent">Urgent</option>
              <option value="assignment">Assignment Related</option>
              <option value="exam">Exam Notice</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Message *</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              rows={5} placeholder="Write your announcement here..."
              className={inputClass + " resize-none"} />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-[#e8612a]/40 transition-all">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4 rounded accent-[#e8612a]" />
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">Pin this announcement</p>
              <p className="text-xs text-gray-400">Pinned announcements appear at the top for students</p>
            </div>
          </label>

          <button onClick={handleBroadcast}
            className="w-full bg-[#e8612a] hover:bg-[#d4541f] text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-all">
            <Megaphone size={16} /> Broadcast to All Students
          </button>
        </div>

        {/* List */}
        <div className="xl:col-span-3 space-y-4">
          {announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements yet" subtitle="Create your first one using the form." />
          ) : (
            <>
              {pinned_.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Pin size={11} /> Pinned
                  </p>
                  {pinned_.map((a) => <AnnouncementCard key={a.id} ann={a} />)}
                </div>
              )}
              {unpinned.length > 0 && (
                <div className="space-y-3">
                  {pinned_.length > 0 && (
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Recent</p>
                  )}
                  {unpinned.map((a) => <AnnouncementCard key={a.id} ann={a} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Announcements;
