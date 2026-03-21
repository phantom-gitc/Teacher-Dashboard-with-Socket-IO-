import React from "react";

// ── UnreadBadge: orange pill badge for unread message counts ──
const UnreadBadge = ({ count }) => {
  if (!count || count <= 0) return null;

  const display = count > 99 ? "99+" : String(count);
  const widthClass = count > 99 ? "min-w-[2rem] px-1.5" : count > 9 ? "min-w-[1.5rem] px-1" : "w-5";

  return (
    <span
      className={`bg-[#e8612a] text-white font-bold rounded-full h-5 flex items-center justify-center text-[10px] leading-none ${widthClass}`}
    >
      {display}
    </span>
  );
};

export default UnreadBadge;
