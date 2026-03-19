import { useState, useCallback } from "react";

// ── useChat: Local chat state manager ──
// Manages messages array with add/clear operations
// Each message: { id, role: 'user'|'assistant', content, timestamp }

export function useChat() {
  const [messages, setMessages] = useState([]);

  const addMessage = useCallback((role, content) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, addMessage, clearChat };
}
