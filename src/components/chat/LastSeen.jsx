import React from "react";
import { useSocketStore, useChatStore } from "@/store";
import { useAuthStore } from "@/store";

const formatLastSeen = (iso) => {
  if (!iso) return "a while ago";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 5) return "just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffDays === 0) return `today at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return `yesterday at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

// ── LastSeen: "Online" or "Offline" ──
const LastSeen = ({ userId }) => {
  const { onlineUsers } = useSocketStore();
  const isOnline = onlineUsers.includes(String(userId));

  if (isOnline) {
    return <span className="text-xs text-green-500 font-medium">Online</span>;
  }
  return <span className="text-xs text-gray-400">Offline</span>;
};

export default LastSeen;
