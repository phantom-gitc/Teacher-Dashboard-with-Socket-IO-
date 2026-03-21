import React from "react";
import { MessageCircle, Users, Hash } from "lucide-react";

// ── EmptyChatState: shown when no chat is selected in any chat page ──
const icons = {
  teacher: MessageCircle,
  student: Users,
  group: Hash,
};

const subtitles = {
  teacher: "Select a teacher from the list to start a conversation.",
  student: "Select a student from the list to begin chatting.",
  group: "Select a group or student from the list to start chatting.",
};

const EmptyChatState = ({ type = "teacher" }) => {
  const Icon = icons[type] || MessageCircle;
  const subtitle = subtitles[type] || "Select a conversation to begin.";

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full">
      <div className="w-16 h-16 rounded-full bg-[#e8612a]/10 flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-[#e8612a]" />
      </div>
      <p
        className="text-lg text-gray-600 mb-2"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        {type === "teacher" ? "Chat with a Teacher" : type === "student" ? "Message a Student" : "Join a Conversation"}
      </p>
      <p className="text-sm text-gray-400 max-w-xs">{subtitle}</p>
    </div>
  );
};

export default EmptyChatState;
