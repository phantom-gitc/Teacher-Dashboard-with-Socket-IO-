import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { mockTeachers, mockTeacherMessages } from "@/lib/mockData";
import { Send, MessageCircle, Search, ArrowLeft } from "lucide-react";

const AskTeacher = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize with mock messages
  useEffect(() => {
    setMessages(mockTeacherMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedTeacher]);

  const filteredTeachers = mockTeachers.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!input.trim() || !selectedTeacher) return;
    const newMsg = { id: Date.now(), sender: "student", text: input.trim(), time: "Just now" };
    setMessages((prev) => ({
      ...prev,
      [selectedTeacher.id]: [...(prev[selectedTeacher.id] || []), newMsg],
    }));
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentMessages = selectedTeacher ? (messages[selectedTeacher.id] || []) : [];

  return (
    <DashboardLayout title="Ask Teacher">
      <PageHeader title="Ask Teacher" subtitle="Connect directly with your teachers for guidance and support." />

      <div className="flex gap-0 md:gap-6 h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
        {/* Teacher List Panel */}
        <div className={`w-full md:w-72 bg-white rounded-2xl border border-[#f0ece8] overflow-hidden flex-col flex-shrink-0 ${showChatOnMobile ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Teachers</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers..."
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={() => {
                  setSelectedTeacher(teacher);
                  setShowChatOnMobile(true);
                }}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-50 transition-all ${selectedTeacher?.id === teacher.id ? "bg-[#e8612a]/5 border-l-2 border-l-[#e8612a]" : "hover:bg-gray-50"}`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-sm font-bold">
                    {teacher.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                  </div>
                  {teacher.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{teacher.name}</p>
                  <p className="text-xs text-gray-400 truncate">{teacher.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`flex-1 bg-white rounded-2xl border border-[#f0ece8] flex-col overflow-hidden ${!showChatOnMobile ? "hidden md:flex" : "flex"}`}>
          {!selectedTeacher ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-[#e8612a]/10 flex items-center justify-center mb-4">
                <MessageCircle size={28} className="text-[#e8612a]" />
              </div>
              <p className="text-sm text-gray-400">Select a teacher to start a conversation</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b border-gray-100 flex items-center gap-3">
                <button 
                  onClick={() => setShowChatOnMobile(false)}
                  className="md:hidden p-1 -ml-1 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {selectedTeacher.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{selectedTeacher.name}</p>
                  <p className="text-[10px] md:text-xs text-gray-400 truncate">{selectedTeacher.subject}</p>
                </div>
                {selectedTeacher.online && (
                  <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Online</span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[85%] md:max-w-[70%] text-left">
                      <div className={msg.sender === "student"
                        ? "bg-[#1a1a1a] text-white rounded-2xl rounded-br-sm px-3 md:px-4 py-2 text-sm"
                        : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-3 md:px-4 py-2 text-sm shadow-sm"
                      }>
                        {msg.text}
                      </div>
                      <p className={`text-[10px] text-gray-400 mt-1 px-1 ${msg.sender === "student" ? "text-right" : ""}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 md:p-4 border-t border-gray-100 bg-white flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 md:h-11 md:w-11 rounded-xl bg-[#e8612a] hover:bg-[#d4541f] flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AskTeacher;
