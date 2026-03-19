import React from "react";

// ── PageHeader: Reusable heading with orange asterisk ──
// Matches the auth page right panel heading style exactly
const PageHeader = ({ asterisk = true, title, subtitle }) => {
  return (
    <div className="mb-8">
      {asterisk && (
        <span className="text-[#e8612a] text-2xl font-bold leading-none mb-3 block">*</span>
      )}
      <h1
        className="text-2xl text-[#1a1a1a]"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default PageHeader;
