import React, { useState, useRef, useCallback } from "react";
import { Send, X, Reply } from "lucide-react";
import { emitTypingStart, emitTypingStop } from "@/lib/socket";

// ── ChatInput: unified input area for all 3 chat pages ──
const ChatInput = ({
  onSend,
  roomId,
  placeholder = "Type a message...",
  disabled = false,
  replyingTo = null,
  onCancelReply,
  selfId,
  selfName,
}) => {
  const [value, setValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const debounceRef = useRef(null);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      emitTypingStop(roomId, selfId);
      setIsTyping(false);
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, [isTyping, roomId, selfId]);

  const handleChange = (e) => {
    setValue(e.target.value);

    if (!isTyping) {
      emitTypingStart(roomId, selfId, selfName);
      setIsTyping(true);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      emitTypingStop(roomId, selfId);
      setIsTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    stopTyping();
    onSend(trimmed, replyingTo || null);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charsLeft = 500 - value.length;
  const showCount = value.length > 200;

  return (
    <div className="border-t border-[#f0ece8] bg-white">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-[#f0ece8]">
          <div className="flex items-center gap-2 min-w-0">
            <Reply size={13} className="text-[#e8612a] flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#e8612a]">
                Replying to {replyingTo.senderName || "message"}
              </span>
              <p className="text-xs text-gray-500 truncate">{replyingTo.content || replyingTo.text}</p>
            </div>
          </div>
          <button onClick={onCancelReply} className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3 p-4">
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 max-h-36 overflow-y-auto leading-relaxed disabled:opacity-50"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {showCount && (
            <span className={`text-[10px] ${charsLeft < 50 ? "text-red-400" : "text-gray-400"}`}>
              {value.length}/500
            </span>
          )}
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="w-11 h-11 rounded-xl bg-[#e8612a] hover:bg-[#d4541f] flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
