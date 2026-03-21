import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore, useTeacherStore } from "@/store";
import {
  LayoutDashboard, Sparkles, FilePlus, ClipboardList,
  CheckSquare, MessageCircle, Megaphone, BarChart2, LogOut, X,
} from "lucide-react";
import UnreadBadge from "@/components/chat/UnreadBadge";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/teacher/dashboard" },
  { label: "AI Generator", icon: Sparkles, path: "/teacher/ai-generator" },
  { label: "Create Assignment", icon: FilePlus, path: "/teacher/create-assignment" },
  { label: "Submissions", icon: ClipboardList, path: "/teacher/submissions" },
  { label: "Evaluation", icon: CheckSquare, path: "/teacher/evaluation" },
  { label: "Student Chats", icon: MessageCircle, path: "/teacher/chats", showBadge: true },
  { label: "Announcements", icon: Megaphone, path: "/teacher/announcements" },
  { label: "Analytics", icon: BarChart2, path: "/teacher/analytics" },
];

// isOpen / setIsOpen are passed by TeacherLayout for mobile toggle
const TeacherSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { getTotalStudentUnread } = useTeacherStore();
  const studentUnread = getTotalStudentUnread();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "T";

  const close = () => setIsOpen?.(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#1a1a1a] flex flex-col z-30 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e8612a] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C5.5 2 4 4 4 6c0 3 4 8 4 8s4-5 4-8c0-2-1.5-4-4-4z" fill="white"/>
              </svg>
            </div>
            <span className="text-white text-lg" style={{ fontFamily: "'DM Serif Display', serif" }}>
              CSIT Hub
            </span>
          </div>
          {/* Close button — mobile only */}
          <button onClick={close} className="md:hidden text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Teacher Info */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || "Teacher"}</p>
            <span className="text-[10px] bg-[#e8612a]/20 text-[#e8612a] px-2 py-0.5 rounded-full">
              Teacher
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={close}
                className={
                  isActive
                    ? "flex items-center gap-3 px-4 py-3 mx-3 rounded-xl text-sm bg-[#e8612a]/15 text-[#e8612a] font-medium border border-[#e8612a]/20 mb-1"
                    : "flex items-center gap-3 px-4 py-3 mx-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all mb-1"
                }
              >
                <item.icon size={18} className="flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.showBadge && <UnreadBadge count={studentUnread} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => { close(); logout(); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default TeacherSidebar;
