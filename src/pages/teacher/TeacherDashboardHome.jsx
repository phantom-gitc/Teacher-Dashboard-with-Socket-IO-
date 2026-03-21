import React from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "@/components/layout/TeacherLayout";
import EmptyState from "@/components/shared/EmptyState";
import { useAuthStore, useTeacherStore } from "@/store";
import {
  Users, ClipboardList, Clock, MessageCircle,
  Sparkles, FilePlus, Megaphone, Calendar, Inbox,
} from "lucide-react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const statusColors = {
  published: "bg-green-50 text-green-600 rounded-full px-3 py-1 text-xs font-medium",
  draft: "bg-gray-100 text-gray-500 rounded-full px-3 py-1 text-xs font-medium",
  submitted: "bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-xs font-medium",
  checked: "bg-green-50 text-green-600 rounded-full px-3 py-1 text-xs font-medium",
  pending: "bg-gray-100 text-gray-500 rounded-full px-3 py-1 text-xs font-medium",
};

const TeacherDashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { assignments, submissions, students, unreadChats } = useTeacherStore();

  const publishedCount = assignments.filter((a) => a.status === "published").length;
  const pendingCount = submissions.filter((s) => s.status !== "checked").length;
  const recentAssignments = [...assignments].slice(0, 3);
  const recentSubmissions = [...submissions].slice(0, 4);

  const statCards = [
    { label: "Total Students", icon: Users, color: "text-[#e8612a]", bg: "bg-[#e8612a]/10", value: students.length },
    { label: "Active Assignments", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50", value: publishedCount },
    { label: "Pending Submissions", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50", value: pendingCount },
    { label: "Unread Messages", icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-50", value: unreadChats },
  ];

  const quickActions = [
    { label: "Generate with AI", icon: Sparkles, desc: "Create assignments using Gemini AI", path: "/teacher/ai-generator", dark: true },
    { label: "Create Assignment", icon: FilePlus, desc: "Manually create and publish", path: "/teacher/create-assignment", dark: false },
    { label: "Make Announcement", icon: Megaphone, desc: "Broadcast to all students", path: "/teacher/announcements", dark: false },
  ];

  return (
    <TeacherLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#f4956a] via-[#e8704a] to-[#fde8cc] p-5 md:p-8 relative">
          <div className="absolute top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-20 pointer-events-none" />
          <div className="absolute bottom-5 right-10 w-36 h-36 bg-orange-900 rounded-full blur-3xl opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[#2a1a0e]/60 text-sm mb-1">Good morning,</p>
            <h1 className="text-3xl text-[#1e0f06] mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {user?.name || "Teacher"} 👋
            </h1>
            <p className="text-[#2a1a0e]/70 text-sm">Your class is waiting. {pendingCount} submissions need evaluation.</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-[#f0ece8] shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                <card.icon size={22} className={card.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1a1a]">{card.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Assignments */}
          <div className="bg-white rounded-2xl border border-[#f0ece8] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h3 className="font-semibold text-[#1a1a1a]">Recent Assignments</h3>
              <button onClick={() => navigate("/teacher/submissions")} className="text-xs text-[#e8612a] hover:underline">View All</button>
            </div>
            {recentAssignments.length === 0 ? (
              <EmptyState icon={FilePlus} title="No assignments yet" subtitle="Create your first one." />
            ) : (
              <div>
                {recentAssignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">{a.title}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} /> Due {formatDate(a.dueDate)}
                      </p>
                    </div>
                    <span className={`ml-3 flex-shrink-0 ${statusColors[a.status]}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Submissions */}
          <div className="bg-white rounded-2xl border border-[#f0ece8] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h3 className="font-semibold text-[#1a1a1a]">Recent Submissions</h3>
              <button onClick={() => navigate("/teacher/submissions")} className="text-xs text-[#e8612a] hover:underline">View All</button>
            </div>
            {recentSubmissions.length === 0 ? (
              <EmptyState icon={Inbox} title="No submissions yet" subtitle="They will appear here once students submit." />
            ) : (
              <div>
                {recentSubmissions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.studentName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1a1a1a] truncate">{s.studentName}</p>
                        <p className="text-xs text-gray-400 truncate">{s.assignmentTitle}</p>
                      </div>
                    </div>
                    <span className={`ml-3 flex-shrink-0 ${statusColors[s.status]}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {quickActions.map((action) => (
            <div
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all ${action.dark ? "bg-[#1a1a1a] text-white" : "bg-white border border-[#f0ece8]"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${action.dark ? "bg-white/10" : "bg-[#e8612a]/10"}`}>
                <action.icon size={20} className={action.dark ? "text-[#e8612a]" : "text-[#e8612a]"} />
              </div>
              <p className={`font-semibold text-sm ${action.dark ? "text-white" : "text-[#1a1a1a]"}`}>{action.label}</p>
              <p className={`text-xs mt-1 ${action.dark ? "text-white/50" : "text-gray-400"}`}>{action.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboardHome;
