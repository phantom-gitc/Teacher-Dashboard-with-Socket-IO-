import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "@/components/layout/TeacherLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useTeacherStore } from "@/store";
import {
  TrendingUp, CheckCircle, ClipboardList, AlertTriangle,
  Users, MessageCircle,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const Analytics = () => {
  const navigate = useNavigate();
  const { students, assignments, submissions } = useTeacherStore();

  // Derived analytics
  const analytics = useMemo(() => {
    const gradedSubs = submissions.filter((s) => s.marks !== null);
    const classAvg = gradedSubs.length > 0
      ? Math.round(gradedSubs.reduce((acc, s) => acc + (s.marks / s.totalMarks) * 100, 0) / gradedSubs.length)
      : null;

    const submissionRate = students.length > 0
      ? Math.round((submissions.length / (students.length * Math.max(assignments.length, 1))) * 100)
      : null;

    // Per-student stats
    const studentStats = students.map((student) => {
      const studentSubs = submissions.filter((s) => s.studentId === student.id);
      const graded = studentSubs.filter((s) => s.marks !== null);
      const avg = graded.length > 0
        ? Math.round(graded.reduce((acc, s) => acc + (s.marks / s.totalMarks) * 100, 0) / graded.length)
        : null;
      return { ...student, submitted: studentSubs.length, avg };
    });

    const atRisk = studentStats.filter((s) => s.avg !== null && s.avg < 40).length;

    // Pie chart data
    const pieData = [
      { name: "Submitted", value: submissions.filter((s) => s.status === "submitted").length },
      { name: "Checked", value: submissions.filter((s) => s.status === "checked").length },
      { name: "Pending", value: submissions.filter((s) => s.status === "pending").length },
    ].filter((d) => d.value > 0);

    // Bar chart data
    const barData = assignments.map((a) => ({
      name: a.title.length > 16 ? a.title.substring(0, 16) + "…" : a.title,
      submitted: submissions.filter((s) => s.assignmentId === a.id).length,
      total: students.length,
    }));

    return { classAvg, submissionRate, atRisk, studentStats, pieData, barData };
  }, [students, assignments, submissions]);

  const PIE_COLORS = { Submitted: "#e8612a", Checked: "#1a1a1a", Pending: "#e8e6e1" };

  const getStatusBadge = (avg) => {
    if (avg === null) return <span className="bg-gray-100 text-gray-500 rounded-full px-3 py-1 text-xs font-medium">Insufficient Data</span>;
    if (avg >= 75) return <span className="bg-green-50 text-green-600 rounded-full px-3 py-1 text-xs font-medium">On Track</span>;
    if (avg >= 40) return <span className="bg-[#e8612a]/10 text-[#e8612a] rounded-full px-3 py-1 text-xs font-medium">Needs Attention</span>;
    return <span className="bg-red-50 text-red-500 rounded-full px-3 py-1 text-xs font-medium">At Risk</span>;
  };

  const statCards = [
    { label: "Class Average", icon: TrendingUp, color: "text-[#e8612a]", bg: "bg-[#e8612a]/10", value: analytics.classAvg !== null ? `${analytics.classAvg}%` : "—" },
    { label: "Submission Rate", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", value: analytics.submissionRate !== null ? `${analytics.submissionRate}%` : "—" },
    { label: "Assignments Created", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50", value: assignments.length },
    { label: "Students at Risk", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-50", value: analytics.atRisk || "—" },
  ];

  const weakStudents = analytics.studentStats.filter((s) => s.avg !== null && s.avg < 50);

  return (
    <TeacherLayout title="Analytics">
      <PageHeader title="Analytics" subtitle="Track class performance, submission trends, and identify students who need support." />

      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-[#f0ece8] p-5 shadow-sm flex items-center gap-4">
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

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Pie */}
          <div className="bg-white rounded-2xl border border-[#f0ece8] p-6 shadow-sm">
            <h3 className="font-semibold text-[#1a1a1a] mb-4">Submission Status</h3>
            {analytics.pieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 relative">
                <div className="w-32 h-32 rounded-full border-8 border-gray-100" />
                <p className="absolute text-xs text-gray-400 text-center">Data will appear once<br />backend is connected</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={analytics.pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {analytics.pieData.map((entry) => (
                      <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex gap-4 mt-2 flex-wrap">
              {Object.entries(PIE_COLORS).map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Bar */}
          <div className="bg-white rounded-2xl border border-[#f0ece8] p-6 shadow-sm">
            <h3 className="font-semibold text-[#1a1a1a] mb-4">Assignment Completion</h3>
            {analytics.barData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48">
                <p className="text-xs text-gray-400 text-center">Data will appear once<br />backend is connected</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip />
                  <Bar dataKey="submitted" fill="#e8612a" radius={[6, 6, 0, 0]} name="Submitted" />
                  <Bar dataKey="total" fill="#f0ece8" radius={[6, 6, 0, 0]} name="Total Students" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Student Performance Table */}
        <div className="bg-white rounded-2xl border border-[#f0ece8] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#f0ece8]">
            <h3 className="text-xl text-[#1a1a1a]" style={{ fontFamily: "'DM Serif Display', serif" }}>Student Performance Overview</h3>
          </div>
          {students.length === 0 ? (
            <EmptyState icon={Users} title="No student data yet" subtitle="Students will appear here after backend integration." />
          ) : (
            <>
              {/* Desktop header only */}
              <div className="hidden md:grid md:grid-cols-4 px-6 py-3 border-b border-gray-50">
                {["Student", "Assignments Submitted", "Average Marks", "Status"].map((h) => (
                  <p key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</p>
                ))}
              </div>
              {analytics.studentStats.map((s) => (
                <div key={s.id}>
                  {/* Mobile card */}
                  <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1a1a1a] truncate">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.submitted}/{assignments.length} submitted</p>
                      </div>
                    </div>
                    {getStatusBadge(s.avg)}
                  </div>
                  {/* Desktop row */}
                  <div className="hidden md:grid md:grid-cols-4 px-6 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.roll}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{s.submitted} of {assignments.length}</p>
                    <p className="text-sm font-semibold text-[#1a1a1a]">{s.avg !== null ? `${s.avg}%` : "—"}</p>
                    {getStatusBadge(s.avg)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Students Needing Attention */}
        <div className="bg-white rounded-2xl border border-[#f0ece8] p-6 shadow-sm">
          <h3 className="text-xl text-[#1a1a1a] mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>Students Needing Attention</h3>
          {weakStudents.length === 0 ? (
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle size={20} className="text-green-500" />
              <p className="text-sm font-medium">All students are performing well or data not available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weakStudents.map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-4 bg-red-50/50 border border-red-100 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {s.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">{s.name}</p>
                    <p className="text-xs text-gray-500">Average: {s.avg}%</p>
                  </div>
                  <button onClick={() => { useTeacherStore.getState().setSelectedStudentChat(s.id); navigate("/teacher/chats"); }}
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:border-[#e8612a] hover:text-[#e8612a] rounded-xl px-3 py-1.5 text-xs font-medium transition-all">
                    <MessageCircle size={13} /> Message
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Analytics;
