import React from "react";

// ── AuthCard: Shared split-panel card wrapper for all auth pages ──
// Props:
//   leftEyebrow — small muted text above the tagline (e.g., "Welcome back")
//   leftTagline — large serif heading on the left panel (e.g., "Your academic hub is ready and waiting.")
//   children    — form content rendered in the right white panel
const AuthCard = ({ leftEyebrow, leftTagline, children }) => {
  return (
    <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center p-4 sm:p-6">
      <div className="flex flex-col md:flex-row w-full max-w-[780px] md:min-h-[500px] rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Left Panel: Orange gradient with decorative blobs ── */}
        <div className="w-full md:w-80 flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-[#f4956a] via-[#e8704a] to-[#fde8cc] p-6 sm:p-8 flex flex-col justify-between min-h-[180px] md:min-h-0">

          {/* Decorative blurred circles for gradient mesh depth */}
          <div className="absolute top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-10 right-0 w-36 h-36 bg-orange-900 rounded-full blur-3xl opacity-20" />

          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-sm text-[#2a1a0e] relative z-10">
            {/* Leaf / drop icon SVG */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="#2a1a0e"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8.17 20C12.32 20 15.5 16.22 16.42 13.37C17.86 15.94 22 20 22 20C22 20 26 4 17 8Z" />
            </svg>
            <span>CSIT Hub</span>
          </div>

          {/* Bottom copy — eyebrow + serif tagline */}
          <div className="relative z-10 mt-4 md:mt-0">
            <p className="text-xs text-[#5a3520] mb-2 tracking-wide uppercase">
              {leftEyebrow}
            </p>
            <h2
              className="text-xl sm:text-2xl text-[#1e0f06] leading-snug"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {leftTagline}
            </h2>
          </div>
        </div>

        {/* ── Right Panel: White form area ── */}
        <div className="flex-1 bg-white p-5 sm:p-8 flex flex-col justify-center sm:overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
