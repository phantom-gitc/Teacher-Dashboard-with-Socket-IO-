import React, { useState } from "react";
import { Search, MoreVertical, Users, X } from "lucide-react";
import OnlineDot from "./OnlineDot";
import LastSeen from "./LastSeen";

// ── ChatHeader: reusable chat panel header for all 3 chat pages ──
const ChatHeader = ({
  avatarInitials,
  avatarGradient = "from-[#f4956a] to-[#e8612a]",
  name,
  subtitle,
  userId,
  isGroup = false,
  memberCount,
  onViewMembers,
  onSearchMessages,
  onClearChat,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const handleSearch = (e) => {
    setSearchVal(e.target.value);
    onSearchMessages?.(e.target.value);
  };

  const clearSearch = () => {
    setSearchVal("");
    onSearchMessages?.("");
    setSearchOpen(false);
  };

  return (
    <div className="border-b border-[#f0ece8] bg-white">
      <div className="px-5 py-4 flex items-center justify-between">
        {/* Left: avatar + name + status */}
        <div className="flex items-center gap-3">
          <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
            {avatarInitials}
            {!isGroup && userId && <OnlineDot userId={userId} size="sm" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">{name}</p>
            {isGroup ? (
              <p className="text-xs text-gray-400">{memberCount} members</p>
            ) : userId ? (
              <LastSeen userId={userId} />
            ) : (
              subtitle && <p className="text-xs text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) clearSearch(); }}
            className="w-8 h-8 rounded-lg border border-gray-100 hover:border-gray-300 flex items-center justify-center transition-all"
          >
            <Search size={15} className="text-gray-400" />
          </button>

          {/* More menu */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-lg border border-gray-100 hover:border-gray-300 flex items-center justify-center transition-all">
              <MoreVertical size={15} className="text-gray-400" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-50 overflow-hidden">
                  {isGroup && onViewMembers && (
                    <button onClick={() => { onViewMembers(); setMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Users size={15} className="text-gray-400" /> View Members
                    </button>
                  )}
                  <button onClick={() => { setSearchOpen(true); setMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Search size={15} className="text-gray-400" /> Search in Chat
                  </button>
                  {onClearChat && (
                    <button onClick={() => { onClearChat(); setMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 transition-colors">
                      <X size={15} /> Clear Chat
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search bar (slides in) */}
      {searchOpen && (
        <div className="px-4 py-2 border-t border-[#f0ece8] bg-gray-50 flex items-center gap-2">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input value={searchVal} onChange={handleSearch} placeholder="Search messages..."
            autoFocus
            className="flex-1 text-sm bg-transparent border-none outline-none placeholder-gray-400" />
          <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
