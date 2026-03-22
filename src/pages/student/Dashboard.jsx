import React, { useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatDate } from "@/lib/utils";
import { useDashboardStore, useAuthStore } from "@/store";
import { ClipboardList, FileText, BrainCircuit, MessageCircle, Calendar } from "lucide-react";

const Dashboard = () => {
  const { assignments, notifications, unreadCount, dashboardData, fetchDashboard, isLoading } = useDashboardStore();
  const { user } = useAuthStore();

  // Fetch real dashboard data on mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const pendingAssignments = assignments.filter((a) => a.status === "pending" || a.status === "Pending").slice(0, 3);
  const recentNotifications = notifications.slice(0, 4);

  // Real stats from API, fall back to 0 while loading
  const stats = [
    {
      label: "Pending Assignments",
      value: dashboardData?.pendingAssignments?.count ?? pendingAssignments.length,
      icon: ClipboardList,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Notes Created",
      value: dashboardData?.notesCount ?? 0,
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Quiz Score Avg",
      value: dashboardData?.quizStats?.avgScore != null
        ? `${Math.round(dashboardData.quizStats.avgScore)}%`
        : "—",
      icon: BrainCircuit,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Unread Messages",
      value: unreadCount,
      icon: MessageCircle,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* ── Welcome Banner ── */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#f4956a] via-[#e8704a] to-[#fde8cc] p-8 relative">
          <div className="absolute top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-5 right-10 w-36 h-36 bg-orange-900 rounded-full blur-3xl opacity-20" />
          <div className="relative z-10">
            <p className="text-[#2a1a0e]/60 text-sm mb-1">Good morning,</p>
            <h1
              className="text-3xl text-[#1e0f06] mb-2"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {user?.fullName?.split(" ")[0]} 👋
            </h1>
            <p className="text-[#2a1a0e]/70 text-sm">
              You have {pendingAssignments.length} pending assignments and {unreadCount} new messages.
            </p>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-4 md:p-5 border border-[#f0ece8] shadow-sm flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-[#1a1a1a]">
                  {isLoading ? <span className="text-gray-300 text-base">…</span> : card.value}
                </p>
                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-0">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Two Column Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Assignments */}
          <div className="bg-white rounded-2xl p-6 border border-[#f0ece8] shadow-sm">
            <h3 className="text-base font-semibold text-[#1a1a1a] mb-4">Pending Assignments</h3>
            <div className="space-y-0">
              {pendingAssignments.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No pending assignments 🎉</p>
              ) : (
                pendingAssignments.map((assignment) => (
                  <div key={assignment._id || assignment.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1a1a1a]">{assignment.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{assignment.subject}</p>
                    </div>
                    <div className="text-right">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={12} />
                        {formatDate(assignment.dueDate)}
                      </span>
                      <span className="text-[10px] bg-orange-100 text-[#e8612a] px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                        Pending
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-2xl p-6 border border-[#f0ece8] shadow-sm">
            <h3 className="text-base font-semibold text-[#1a1a1a] mb-4">Recent Notifications</h3>
            <div className="space-y-0">
              {recentNotifications.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No notifications yet</p>
              ) : (
                recentNotifications.map((notif) => (
                  <div key={notif._id || notif.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.isRead ? "bg-[#e8612a]" : "bg-gray-200"}`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{notif.time || notif.createdAt}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

