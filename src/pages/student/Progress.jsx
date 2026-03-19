import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { mockUser, mockProgressData } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, ClipboardList, BookOpen, BrainCircuit, Lightbulb } from "lucide-react";

const Progress = () => {
  const { subjectMarks, performanceTrend, weakAreas, assignmentStats } = mockProgressData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-lg text-sm">
          <p className="font-semibold text-[#1a1a1a] mb-1">{label}</p>
          <p className="text-[#e8612a]">Score: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout title="My Progress">
      <PageHeader title="My Progress" subtitle="Track your academic performance and identify areas for improvement." />

      <div className="space-y-6 pb-6">
        {/* Overall Performance Banner */}
        <div className="bg-gradient-to-br from-[#f4956a] via-[#e8704a] to-[#fde8cc] rounded-2xl p-8 relative overflow-hidden text-[#1e0f06]">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-20" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="w-full md:w-auto">
              <p className="text-[#2a1a0e]/60 text-xs md:text-sm font-medium uppercase tracking-wide mb-1">Overall GPA</p>
              <h2 className="text-4xl md:text-5xl mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>{mockUser.gpa}</h2>
              <div className="flex items-center gap-2 md:gap-3">
                <span className="bg-white/40 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold">{mockUser.semester}</span>
                <span className="bg-[#1a1a1a] text-[#f4956a] px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold">Rank: {mockUser.rank}</span>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex justify-between md:justify-start gap-4 md:gap-6 md:border-l border-[#2a1a0e]/10 pt-4 md:pt-0 border-t md:border-t-0 md:pl-6">
              <div className="text-center flex-1 md:flex-none">
                <p className="text-xl md:text-2xl font-bold">{mockUser.attendancePercent}%</p>
                <p className="text-[10px] md:text-xs text-[#2a1a0e]/70 flex items-center gap-1 justify-center"><BookOpen size={10} className="md:w-3 md:h-3" /> Att.</p>
              </div>
              <div className="text-center flex-1 md:flex-none">
                <p className="text-xl md:text-2xl font-bold">{mockUser.assignmentsCompleted}</p>
                <p className="text-[10px] md:text-xs text-[#2a1a0e]/70 flex items-center gap-1 justify-center"><ClipboardList size={10} className="md:w-3 md:h-3" /> Assign.</p>
              </div>
              <div className="text-center flex-1 md:flex-none">
                <p className="text-xl md:text-2xl font-bold">{mockUser.quizzesTaken}</p>
                <p className="text-[10px] md:text-xs text-[#2a1a0e]/70 flex items-center gap-1 justify-center"><BrainCircuit size={10} className="md:w-3 md:h-3" /> Quizzes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject-wise Marks */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-[#f0ece8]">
          <h3 className="text-base font-semibold text-[#1a1a1a] mb-6">Subject-wise Marks</h3>
          <div className="h-[240px] md:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectMarks} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece8" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888888" }} dy={10} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888888" }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0ece8", opacity: 0.4 }} />
                <Bar dataKey="marks" radius={[6, 6, 0, 0]} barSize={30}>
                  {subjectMarks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.marks > 80 ? "#22c55e" : entry.marks > 70 ? "#e8612a" : "#f4956a"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Column Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-[#f0ece8]">
            <h3 className="text-base font-semibold text-[#1a1a1a] mb-6">Performance Trend</h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece8" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888888" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888888" }} domain={['auto', 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" stroke="#e8612a" strokeWidth={3} dot={{ fill: "#e8612a", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#e8612a", stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weak Areas */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-[#f0ece8]">
            <h3 className="text-base font-semibold text-[#1a1a1a] mb-4">Focus Areas</h3>
            <div className="space-y-4">
              {weakAreas.map((area, idx) => (
                <div key={idx} className="group relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="text-xs md:text-sm font-medium text-[#1a1a1a] truncate">{area.topic}</span>
                      <span className="hidden sm:inline-block text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex-shrink-0">{area.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-red-500">{area.score}%</span>
                      <div className="relative">
                        <Lightbulb size={14} className="text-yellow-500 cursor-help" />
                        {/* Custom Tooltip */}
                        <div className="absolute right-0 bottom-full mb-2 w-48 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all bg-[#1a1a1a] text-white text-xs p-2 rounded-lg shadow-xl z-20 pointer-events-none">
                          AI Tip: Review previous quiz mistakes for this topic.
                          <div className="absolute top-full right-1 -mt-1 border-4 border-transparent border-t-[#1a1a1a]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-red-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${area.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Progress;
