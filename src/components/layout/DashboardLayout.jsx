import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

// ── DashboardLayout: Responsive wrapper for all dashboard pages ──
const DashboardLayout = ({ title, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#e8e6e1]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64 transition-all duration-300 w-full">
        <TopBar title={title} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="mt-16 flex-1 overflow-y-auto p-4 md:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
