import React, { useState } from "react";
import TeacherSidebar from "./TeacherSidebar";
import { Bell, Menu } from "lucide-react";
import { useAuthStore } from "@/store";

// ── TeacherLayout: responsive sidebar + fixed topbar + scrollable content ──
const TeacherLayout = ({ title, children }) => {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "T";

  return (
    <div className="flex h-screen overflow-hidden bg-[#e8e6e1]">
      {/* Sidebar — controlled open state for mobile */}
      <TeacherSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main area — pushes right on md+ */}
      <div className="flex flex-col flex-1 overflow-hidden md:ml-64">
        {/* Fixed Top Bar */}
        <header className="fixed top-0 left-0 right-0 md:left-64 h-14 md:h-16 bg-white/90 backdrop-blur-md border-b border-[#f0ece8] flex items-center justify-between px-4 md:px-8 z-10">
          {/* Hamburger — mobile only */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-base md:text-lg font-semibold text-[#1a1a1a] truncate">{title}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={18} className="text-gray-500" />
            </button>
            {/* Avatar */}
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#e8612a] flex items-center justify-center text-white text-xs md:text-sm font-bold cursor-pointer flex-shrink-0">
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="mt-14 md:mt-16 flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
