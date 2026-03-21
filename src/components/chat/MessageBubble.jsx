import React, { useState } from "react";
import MessageStatusIcon from "./MessageStatusIcon";
import ReactionPicker from "./ReactionPicker";
import { Reply } from "lucide-react";

const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d)) return ts; // fallback for legacy "Just now" strings
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ── MessageBubble: unified bubble for all chat pages ──
const MessageBubble = ({
  message,
  isSelf,
  isGroup = false,
  showAvatar = true,
  onReact,
  onReply,
  reactions = [],
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const {
    id,
    content,
    text, // legacy field
    senderName,
    senderInitials,
    timestamp,
    time, // legacy field
    status,
    replyTo,
  } = message;

  const displayText = content || text || "";
  const displayTime = timestamp ? formatTime(timestamp) : (time || "");
  const initials = senderInitials || (senderName ? senderName.split(" ").map((n) => n[0]).join("").substring(0, 2) : "??");

  // Group reactions by emoji
  const emojiCounts = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  if (isSelf) {
    return (
      <div className="ml-auto flex flex-col items-end max-w-[65%]">
        {/* Reply preview */}
        {replyTo && (
          <div className="bg-white/20 border-l-2 border-white/50 rounded-lg px-3 py-1.5 mb-1 text-xs text-white/70 max-w-full truncate">
            ↩ {replyTo.senderName || "You"}: {replyTo.content || replyTo.text}
          </div>
        )}

        <div className="relative group">
          {/* Hover actions */}
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
            {onReply && (
              <button onClick={() => onReply(message)}
                className="w-7 h-7 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all">
                <Reply size={13} className="text-gray-400" />
              </button>
            )}
            <div className="relative">
              <button onClick={() => setShowPicker(!showPicker)}
                className="w-7 h-7 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all text-sm">
                😊
              </button>
              {showPicker && (
                <ReactionPicker onReact={(emoji) => onReact?.(id, emoji)} onClose={() => setShowPicker(false)} />
              )}
            </div>
          </div>

          <div className="bg-[#1a1a1a] text-white rounded-2xl rounded-br-sm px-4 py-2.5">
            {isGroup && senderName && (
              <p className="text-[10px] font-semibold text-[#e8612a] mb-1">You</p>
            )}
            <p className="text-sm leading-relaxed">{displayText}</p>
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(emojiCounts).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(emojiCounts).map(([emoji, count]) => (
              <button key={emoji} onClick={() => onReact?.(id, emoji)}
                className="bg-white border border-[#e8612a] bg-[#e8612a]/5 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 hover:bg-[#e8612a]/10 transition-all">
                {emoji} <span className="text-gray-600">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-gray-400">{displayTime}</span>
          {status && <MessageStatusIcon status={status} />}
        </div>
      </div>
    );
  }

  // ── Other person's bubble ──
  return (
    <div className="mr-auto flex items-end gap-2 max-w-[65%]">
      {/* Avatar */}
      {showAvatar ? (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
      ) : (
        <div className="w-7 flex-shrink-0" />
      )}

      <div className="flex flex-col items-start">
        {/* Reply preview */}
        {replyTo && (
          <div className="bg-gray-100 border-l-2 border-[#e8612a] rounded-lg px-3 py-1.5 mb-1 text-xs text-gray-500 max-w-full truncate">
            ↩ {replyTo.senderName || senderName}: {replyTo.content || replyTo.text}
          </div>
        )}

        <div className="relative group">
          <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
            {isGroup && senderName && (
              <p className="text-[10px] font-semibold text-[#e8612a] mb-1">{senderName}</p>
            )}
            <p className="text-sm leading-relaxed">{displayText}</p>
          </div>

          {/* Hover actions */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
            {onReply && (
              <button onClick={() => onReply(message)}
                className="w-7 h-7 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all">
                <Reply size={13} className="text-gray-400" />
              </button>
            )}
            <div className="relative">
              <button onClick={() => setShowPicker(!showPicker)}
                className="w-7 h-7 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all text-sm">
                😊
              </button>
              {showPicker && (
                <ReactionPicker onReact={(emoji) => onReact?.(id, emoji)} onClose={() => setShowPicker(false)} />
              )}
            </div>
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(emojiCounts).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(emojiCounts).map(([emoji, count]) => (
              <button key={emoji} onClick={() => onReact?.(id, emoji)}
                className="bg-white border border-gray-100 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 hover:border-[#e8612a] transition-all">
                {emoji} <span className="text-gray-500">{count}</span>
              </button>
            ))}
          </div>
        )}

        <span className="text-[10px] text-gray-400 mt-0.5 px-1">{displayTime}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
