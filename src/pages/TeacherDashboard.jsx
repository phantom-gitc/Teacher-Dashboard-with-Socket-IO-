import React from "react";
import { LogOut, Users, ClipboardList, Megaphone } from "lucide-react";
import { useAuthStore } from "@/store";

// ── TeacherDashboard: Stub dashboard for logged-in teachers ──
// Mirrors the StudentDashboard layout with teacher-specific placeholder cards
const TeacherDashboard = () => {
  const { user, logout } = useAuthStore();

  // Placeholder card data for teacher features
  const placeholderCards = [
    { title: "My Classes", icon: Users },
    { title: "Student Records", icon: ClipboardList },
    { title: "Announcements", icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Top Navbar ── */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-sm text-gray-900 flex-shrink-0">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="#1a1a1a"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8.17 20C12.32 20 15.5 16.22 16.42 13.37C17.86 15.94 22 20 22 20C22 20 26 4 17 8Z" />
          </svg>
          <span className="hidden sm:inline">CSIT Hub</span>
        </div>

        {/* User info + Logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right">
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
              {user?.name || "Teacher"}
            </p>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
              Teacher
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-red-50 flex-shrink-0"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          Welcome, {user?.name || "Teacher"} 👋
        </h1>
        <p className="text-sm text-gray-500 mb-6 sm:mb-8">
          Your teacher dashboard is ready. Backend coming soon.
        </p>

        {/* Placeholder cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {placeholderCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-gray-100 shadow-sm p-6 bg-white flex flex-col items-center gap-3"
            >
              <card.icon size={28} className="text-gray-300" />
              <p className="text-gray-400 italic text-sm">{card.title}</p>
              <span className="text-[10px] text-gray-300 bg-gray-50 px-2 py-0.5 rounded">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
