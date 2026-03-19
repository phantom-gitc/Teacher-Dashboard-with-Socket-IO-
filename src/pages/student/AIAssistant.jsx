import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { useAI } from "@/hooks/useAI";
import { useChat } from "@/hooks/useChat";
import { Send, Trash2, Bot } from "lucide-react";

const suggestionChips = [
  "Explain OSI Model",
  "What is Normalization?",
  "Explain Deadlock",
  "Binary Search Algorithm",
];

const AIAssistant = () => {
  const { callAI, loading } = useAI();
  const { messages, addMessage, clearChat } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    addMessage("user", userText);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Build conversation history for context
    const conversationHistory = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userText },
    ];

    const result = await callAI({
      systemPrompt: "You are a helpful academic tutor for CSIT students. Answer questions clearly and concisely. Use examples when helpful. For code, use proper formatting.",
      messages: conversationHistory,
    });

    addMessage("assistant", result || "Sorry, I couldn't process that request. Please try again.");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-expand textarea
  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  // Simple markdown renderer for AI messages
  const renderContent = (text) => {
    return text
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-green-300 rounded-lg p-3 text-xs overflow-x-auto my-2 font-mono">$2</pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-[#e8612a] px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <DashboardLayout title="AI Assistant">
      <PageHeader title="AI Assistant" subtitle="Ask anything about your subjects — powered by Claude AI." />

      <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#f0ece8] p-4 md:p-6 space-y-4 pt-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-[#e8612a]/10 flex items-center justify-center mb-4">
                <Bot size={28} className="text-[#e8612a]" />
              </div>
              <h3 className="text-base font-semibold text-[#1a1a1a] mb-1">Hi Rahul! I'm your AI tutor.</h3>
              <p className="text-sm text-gray-400 mb-6">Ask me anything about your subjects.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestionChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="px-4 py-2 rounded-full border border-[#e8612a]/30 text-[#e8612a] text-sm hover:bg-[#e8612a]/5 transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-[#e8612a] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      AI
                    </div>
                  )}
                  <div>
                    <div
                      className={
                        msg.role === "user"
                          ? "max-w-[85%] md:max-w-[500px] bg-[#1a1a1a] text-white rounded-2xl rounded-br-sm px-3 md:px-4 py-2.5 md:py-3 text-sm"
                          : "max-w-[90%] md:max-w-[600px] bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-3 md:px-4 py-2.5 md:py-3 text-sm text-gray-800"
                      }
                    >
                      {msg.role === "assistant" ? (
                        <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                      ) : (
                        msg.content
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#e8612a] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    AI
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#e8612a] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#e8612a] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#e8612a] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="mt-3 md:mt-4 flex gap-2 md:gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-white"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-[#e8612a] hover:bg-[#d4541f] flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={18} />
          </button>
          <button
            onClick={clearChat}
            className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-200 transition-all flex-shrink-0"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;
