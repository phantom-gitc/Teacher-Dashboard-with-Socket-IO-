import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore, useChatStore } from "@/store";
import {
  LayoutDashboard, FileText, Search, Bot, BrainCircuit,
  ClipboardList, MessageCircle, Users, TrendingUp, LogOut, X, Mic
} from "lucide-react";
import UnreadBadge from "@/components/chat/UnreadBadge";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
  { label: "Notes Generator", icon: FileText, path: "/student/notes" },
  { label: "PYQ Analyzer", icon: Search, path: "/student/pyq" },
  { label: "AI Assistant", icon: Bot, path: "/student/ai" },
  { label: "Viva AI", icon: Mic, path: "/student/viva" },
  { label: "Quiz", icon: BrainCircuit, path: "/student/quiz" },
  { label: "Assignments", icon: ClipboardList, path: "/student/assignments" },
  { label: "Ask Teacher", icon: MessageCircle, path: "/student/ask-teacher" },
  { label: "Collaboration", icon: Users, path: "/student/collaboration" },
  { label: "Progress", icon: TrendingUp, path: "/student/progress" },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { getTotalTeacherUnread, getTotalCollabUnread } = useChatStore();
  const teacherUnread = getTotalTeacherUnread();
  const collabUnread = getTotalCollabUnread();

  return (
    <aside className={`fixed left-0 top-0 h-full w-64 bg-[#1a1a1a] flex flex-col z-30 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      {/* Logo + User Info */}
      <div className="p-6 border-b border-white/10 relative">
        <button 
          onClick={() => setIsOpen(false)} 
          className="absolute top-6 right-4 text-gray-400 hover:text-white md:hidden"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#e8612a" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8.17 20C12.32 20 15.5 16.22 16.42 13.37C17.86 15.94 22 20 22 20C22 20 26 4 17 8Z" />
          </svg>
          <span
            className="text-xl text-white truncate pr-6"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            CSIT Hub
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#e8612a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.fullName?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.fullName || "Student"}</p>
            <span className="text-[10px] bg-[#e8612a]/10 text-[#e8612a] px-2 py-0.5 rounded-full font-medium inline-block mt-0.5">
              {user?.branch || "Student"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)} // Close on mobile click
              className={
                isActive
                  ? "flex items-center gap-3 px-4 py-3 mx-3 rounded-xl text-sm bg-[#e8612a]/15 text-[#e8612a] font-medium border border-[#e8612a]/20 mb-1"
                  : "flex items-center gap-3 px-4 py-3 mx-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all cursor-pointer mb-1"
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.path === "/student/ask-teacher" && <UnreadBadge count={teacherUnread} />}
              {item.path === "/student/collaboration" && <UnreadBadge count={collabUnread} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
