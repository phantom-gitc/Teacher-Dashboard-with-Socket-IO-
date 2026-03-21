import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

// ── ReactionPicker: emoji reaction panel shown on message hover ──
const ReactionPicker = ({ onReact, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 bg-white rounded-2xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-1 bottom-full mb-2"
      style={{ left: "50%", transform: "translateX(-50%)" }}
    >
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => { onReact(emoji); onClose(); }}
          className="text-xl cursor-pointer hover:scale-125 transition-transform duration-100 p-1 rounded-lg hover:bg-gray-50"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;
