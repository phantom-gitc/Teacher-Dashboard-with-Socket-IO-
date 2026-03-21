import React from "react";

// ── ChatSearchBar: standalone search component for in-chat message search ──
// Note: search is handled inline in ChatHeader — this is an alternative standalone version
const ChatSearchBar = ({ messages = [], onResults, onClear }) => {
  const [query, setQuery] = React.useState("");

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (!q.trim()) { onResults?.([]); return; }
    const matches = messages
      .filter((m) => (m.content || m.text || "").toLowerCase().includes(q.toLowerCase()))
      .map((m) => m.id);
    onResults?.(matches);
  };

  const handleClear = () => {
    setQuery("");
    onResults?.([]);
    onClear?.();
  };

  return (
    <div className="flex items-center gap-2 bg-gray-50 border-b border-[#f0ece8] px-4 py-2">
      <input
        value={query}
        onChange={handleChange}
        placeholder="Search in chat..."
        autoFocus
        className="flex-1 text-sm bg-transparent border-none outline-none placeholder-gray-400"
      />
      {query && (
        <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 text-xs">
          Clear
        </button>
      )}
    </div>
  );
};

export default ChatSearchBar;
