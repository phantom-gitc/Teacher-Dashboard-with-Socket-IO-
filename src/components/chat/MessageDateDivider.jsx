import React from "react";

// ── MessageDateDivider: visual date label between different-day messages ──
const formatDate = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDay.getTime() === today.getTime()) return "Today";
  if (msgDay.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const MessageDateDivider = ({ date }) => (
  <div className="flex items-center gap-3 my-4 px-2">
    <hr className="flex-1 border-gray-100" />
    <span className="text-xs text-gray-400 whitespace-nowrap bg-transparent px-2">
      {formatDate(date)}
    </span>
    <hr className="flex-1 border-gray-100" />
  </div>
);

export default MessageDateDivider;
