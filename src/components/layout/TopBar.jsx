import React from "react";
import { Bell, Menu } from "lucide-react";
import { mockUser } from "@/lib/mockData";
import { useDashboardStore } from "@/store";

// ── TopBar: Fixed header with notification bell and user avatar ──
const TopBar = ({ title, onMenuClick }) => {
  const { unreadCount } = useDashboardStore();

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-[#f0ece8] flex items-center justify-between px-4 md:px-8 z-10 transition-all duration-300">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-1 -ml-1 text-gray-600 hover:text-gray-900 md:hidden"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-[#1a1a1a] truncate max-w-[200px] sm:max-w-none">{title}</h2>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Notification bell */}
        <div className="relative cursor-pointer p-1">
          <Bell size={20} className="text-gray-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#e8612a] flex items-center justify-center text-white text-xs md:text-sm font-bold cursor-pointer flex-shrink-0">
          {mockUser.initials}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
