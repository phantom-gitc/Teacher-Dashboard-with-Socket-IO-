import React from "react";
import { useSocketStore } from "@/store";

// ── TypingIndicator: animated dots + "[name] is typing..." ──
const TypingIndicator = ({ roomId, selfId }) => {
  const { typingUsers } = useSocketStore();
  const typers = (typingUsers[roomId] || []).filter((u) => u.userId !== selfId);

  if (typers.length === 0) return null;

  let text = "";
  if (typers.length === 1) text = `${typers[0].userName} is typing`;
  else if (typers.length === 2) text = `${typers[0].userName} and ${typers[1].userName} are typing`;
  else text = "Several people are typing";

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <p className="text-xs text-gray-400 italic">{text}</p>
    </div>
  );
};

export default TypingIndicator;
