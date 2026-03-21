import React, { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { useChatStore } from "@/store";
import { Send, Trash2, Bot, Square, Loader2, PauseCircle } from "lucide-react";

const suggestionChips = [
  "Explain OSI Model",
  "What is Normalization?",
  "Explain Deadlock",
  "Binary Search Algorithm",
];

const SYSTEM_PROMPT =
  "You are a helpful academic tutor for CSIT students. Answer questions clearly and concisely. Use examples when helpful. For code, use proper formatting.";

// ── Simple markdown renderer for AI messages ──
const renderContent = (text) =>
  text
    .replace(
      /```(\w*)\n([\s\S]*?)```/g,
      '<pre class="bg-gray-900 text-green-300 rounded-lg p-3 text-xs overflow-x-auto my-2 font-mono">$2</pre>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 text-[#e8612a] px-1.5 py-0.5 rounded text-xs font-mono">$1</code>'
    )
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");

const AIAssistant = () => {
  // ── Zustand store ──
  const { aiMessages, addAIMessage, clearAIChat, updateAIMessage } = useChatStore();

  // ── Local state ──
  const [input, setInput] = useState("");

  // isLoading  → true from send until FIRST chunk arrives
  // isStreaming → true from first chunk until stream ends / is stopped
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [stoppedIds, setStoppedIds] = useState(new Set()); // tracks msgs stopped early
  const [error, setError] = useState(null);

  // ── Refs ──
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const readerRef = useRef(null); // holds the ReadableStreamDefaultReader

  // ── Auto-scroll on every message / content update ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, isLoading]);

  // ── Cancel stream on unmount (prevents setState on unmounted component) ──
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel();
        readerRef.current = null;
      }
    };
  }, []);

  // ── Stop streaming manually ──
  const stopStreaming = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    setIsStreaming(false);
    setStoppedIds((prev) => new Set([...prev, streamingMessageId]));
    setStreamingMessageId(null);
  }, [streamingMessageId]);

  // ── Clear chat — cancel stream first if active ──
  const handleClearChat = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    setIsLoading(false);
    setIsStreaming(false);
    setStreamingMessageId(null);
    setStoppedIds(new Set());
    setError(null);
    clearAIChat();
  }, [clearAIChat]);

  // ── Main send / stream handler ──
  const sendMessage = useCallback(
    async (text) => {
      const userText = text || input.trim();
      if (!userText || isLoading || isStreaming) return;

      setError(null);

      // 1. Append user message
      addAIMessage({ role: "user", content: userText });
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      // 2. Create empty assistant message and remember its id
      const assistantId = `ai-${Date.now()}`;
      addAIMessage({ id: assistantId, role: "assistant", content: "" });
      setStreamingMessageId(assistantId);
      setIsLoading(true);
      setIsStreaming(false);

      // 3. Build conversation history (include the new user message)
      const history = [
        ...aiMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userText },
      ];

      // 4. Build Gemini-compatible contents array
      // Gemini roles: "user" and "model"
      const contents = history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingMessageId(null);
        setError("Gemini API key not found. Add VITE_GEMINI_API_KEY to your .env file.");
        updateAIMessage(assistantId, "⚠️ API key not configured.");
        return;
      }

      const streamingUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

      try {
        const response = await fetch(streamingUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: { maxOutputTokens: 1000 },
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error?.message || `API error: ${response.status}`
          );
        }

        const reader = response.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let firstChunk = true;

        // 5. Read SSE stream
        // eslint-disable-next-line no-constant-condition
        while (true) {
          let done, value;
          try {
            ({ done, value } = await reader.read());
          } catch {
            // Reader was cancelled (stop button / unmount) — exit silently
            break;
          }
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Each SSE event is separated by newlines
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const dataStr = line.slice(5).trim();
            if (!dataStr || dataStr === "[DONE]") continue;

            let parsed;
            try {
              parsed = JSON.parse(dataStr);
            } catch {
              // Partial or malformed chunk — skip silently
              continue;
            }

            const text =
              parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            if (!text) continue;

            // Transition: loading → streaming on first chunk
            if (firstChunk) {
              setIsLoading(false);
              setIsStreaming(true);
              firstChunk = false;
            }

            // Append text to the assistant message in state
            updateAIMessage(assistantId, (prev) => prev + text);
          }
        }
      } catch (err) {
        setError(err.message);
        updateAIMessage(
          assistantId,
          "Sorry, I encountered an error. Please try again."
        );
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingMessageId(null);
        readerRef.current = null;
      }
    },
    [input, isLoading, isStreaming, aiMessages, addAIMessage, updateAIMessage]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const isBusy = isLoading || isStreaming;

  return (
    <DashboardLayout title="AI Assistant">
      <PageHeader
        title="AI Assistant"
        subtitle="Ask anything about your subjects — powered by Gemini AI."
      />

      {/* Error alert */}
      {error && (
        <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
        {/* ── Chat Window ── */}
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#f0ece8] p-4 md:p-6 space-y-4 pt-4">
          {aiMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-[#e8612a]/10 flex items-center justify-center mb-4">
                <Bot size={28} className="text-[#e8612a]" />
              </div>
              <h3 className="text-base font-semibold text-[#1a1a1a] mb-1">
                Hi! I'm your AI tutor.
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Ask me anything about your subjects.
              </p>
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
              {aiMessages.map((msg) => {
                const isActiveStream =
                  isStreaming && msg.id === streamingMessageId;
                const wasStopped = stoppedIds.has(msg.id);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
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
                          <span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: renderContent(msg.content),
                              }}
                            />
                            {/* Blinking cursor — only on the actively streaming message */}
                            {isActiveStream && (
                              <span className="inline-block w-0.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle" />
                            )}
                          </span>
                        ) : (
                          msg.content
                        )}
                      </div>

                      <div className="flex items-center gap-2 px-1 mt-1">
                        <p className="text-[10px] text-gray-400">
                          {msg.timestamp}
                        </p>
                        {/* "Stopped" label for early-cancelled messages */}
                        {wasStopped && (
                          <p className="text-[10px] text-gray-400 italic">
                            · Stopped
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator — shown while waiting for first chunk */}
              {isLoading && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#e8612a] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    AI
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 bg-[#e8612a] rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#e8612a] rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#e8612a] rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ── Input Area ── */}
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

          {/* Stop streaming button — only visible while streaming */}
          {isStreaming && (
            <button
              onClick={stopStreaming}
              title="Stop generating"
              className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-400 transition-all flex-shrink-0"
            >
              <Square size={18} />
            </button>
          )}

          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isBusy}
            title={isLoading ? "Waiting…" : isStreaming ? "Streaming…" : "Send"}
            className="w-11 h-11 rounded-xl bg-[#e8612a] hover:bg-[#d4541f] flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isStreaming ? (
              <PauseCircle size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>

          {/* Clear chat button */}
          <button
            onClick={handleClearChat}
            title="Clear chat"
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
