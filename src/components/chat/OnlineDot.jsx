import React from "react";
import { useSocketStore } from "@/store";

// ── OnlineDot: green/gray dot based on useSocketStore onlineUsers ──
// Parent element MUST have `relative` class for absolute positioning
const OnlineDot = ({ userId, size = "md" }) => {
  const { onlineUsers } = useSocketStore();
  const isOnline = onlineUsers.includes(String(userId));

  const sizeMap = {
    sm: "w-2 h-2 border-[1.5px]",
    md: "w-2.5 h-2.5 border-2",
    lg: "w-3 h-3 border-2",
  };

  return (
    <span
      className={`absolute bottom-0 right-0 rounded-full border-white transition-colors duration-500 ${sizeMap[size] || sizeMap.md} ${isOnline ? "bg-green-500" : "bg-gray-300"}`}
    />
  );
};

export default OnlineDot;
