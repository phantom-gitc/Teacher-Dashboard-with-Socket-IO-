import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { mockGroups, mockStudents, mockGroupMessages, mockStudentMessages } from "@/lib/mockData";
import { Send, Users, MessageCircle, Search, Plus, X, Settings, ArrowLeft } from "lucide-react";

const Collaboration = () => {
  const [activeTab, setActiveTab] = useState("Groups");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState(null); // "group" | "student"
  const [messages, setMessages] = useState({});
  const [studentMsgs, setStudentMsgs] = useState({});
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groups, setGroups] = useState(mockGroups);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(mockGroupMessages);
    setStudentMsgs(mockStudentMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, studentMsgs, selectedChat]);

  const filteredStudents = mockStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = chatType === "group"
    ? (messages[selectedChat?.id] || [])
    : (studentMsgs[selectedChat?.id] || []);

  const handleSend = () => {
    if (!input.trim() || !selectedChat) return;
    const newMsg = { id: Date.now(), sender: "You", text: input.trim(), time: "Just now" };
    if (chatType === "group") {
      setMessages((prev) => ({ ...prev, [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg] }));
    } else {
      setStudentMsgs((prev) => ({ ...prev, [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg] }));
    }
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    setGroups((prev) => [...prev, { id: Date.now(), name: newGroupName, members: 1, lastMessage: "Group created" }]);
    setNewGroupName("");
    setShowCreateModal(false);
  };

  return (
    <DashboardLayout title="Collaboration">
      <PageHeader title="Collaboration" subtitle="Work together with your classmates in groups or private chats." />

      <div className="flex gap-0 md:gap-6 h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
        {/* Left Panel */}
        <div className={`w-full md:w-72 bg-white rounded-2xl border border-[#f0ece8] overflow-hidden flex-col flex-shrink-0 ${showChatOnMobile ? "hidden md:flex" : "flex"}`}>
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {["Groups", "Students"].map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSelectedChat(null); setChatType(null); }}
                className={`flex-1 py-3 text-xs font-medium transition-all ${activeTab === tab ? "border-b-2 border-[#e8612a] text-[#e8612a]" : "text-gray-500"}`}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Groups" && (
            <div className="p-3 border-b border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">{groups.length} groups</span>
              <button onClick={() => setShowCreateModal(true)} className="w-7 h-7 rounded-lg bg-[#e8612a]/10 flex items-center justify-center text-[#e8612a] hover:bg-[#e8612a]/20 transition-all">
                <Plus size={14} />
              </button>
            </div>
          )}

          {activeTab === "Students" && (
            <div className="p-3 border-b border-gray-50">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search students..."
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50" />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {activeTab === "Groups" ? groups.map((group) => (
              <div key={group.id} onClick={() => { setSelectedChat(group); setChatType("group"); setShowChatOnMobile(true); }}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-50 transition-all ${selectedChat?.id === group.id && chatType === "group" ? "bg-[#e8612a]/5 border-l-2 border-l-[#e8612a]" : "hover:bg-gray-50"}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {group.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{group.name}</p>
                  <p className="text-xs text-gray-400 truncate">{group.members} members · {group.lastMessage}</p>
                </div>
              </div>
            )) : filteredStudents.map((student) => (
              <div key={student.id} onClick={() => { setSelectedChat(student); setChatType("student"); setShowChatOnMobile(true); }}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-50 transition-all ${selectedChat?.id === student.id && chatType === "student" ? "bg-[#e8612a]/5 border-l-2 border-l-[#e8612a]" : "hover:bg-gray-50"}`}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {student.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  {student.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{student.name}</p>
                  <p className="text-xs text-gray-400">{student.roll}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`flex-1 bg-white rounded-2xl border border-[#f0ece8] flex-col overflow-hidden ${!showChatOnMobile ? "hidden md:flex" : "flex"}`}>
          {!selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#e8612a]/10 flex items-center justify-center mb-4">
                <MessageCircle size={28} className="text-[#e8612a]" />
              </div>
              <p className="text-sm text-gray-400">Select a group or student to start chatting</p>
            </div>
          ) : (
            <>
              <div className="p-3 md:p-4 border-b border-gray-100 flex items-center gap-3">
                <button 
                  onClick={() => setShowChatOnMobile(false)}
                  className="md:hidden p-1 -ml-1 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {chatType === "group" ? selectedChat.name[0] : selectedChat.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{selectedChat.name}</p>
                  <p className="text-[10px] md:text-xs text-gray-400 truncate">{chatType === "group" ? `${selectedChat.members} members` : selectedChat.roll}</p>
                </div>
                {chatType === "group" && (<Settings size={18} className="text-gray-400 cursor-pointer hover:text-gray-600 flex-shrink-0" />)}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[85%] md:max-w-[70%] text-left">
                      {msg.sender !== "You" && chatType === "group" && (
                        <p className="text-[10px] text-[#e8612a] font-medium mb-0.5 px-1">{msg.sender}</p>
                      )}
                      <div className={msg.sender === "You"
                        ? "bg-[#1a1a1a] text-white rounded-2xl rounded-br-sm px-3 md:px-4 py-2 text-sm"
                        : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-3 md:px-4 py-2 text-sm shadow-sm"}>
                        {msg.text}
                      </div>
                      <p className={`text-[10px] text-gray-400 mt-1 px-1 ${msg.sender === "You" ? "text-right" : ""}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 md:p-4 border-t border-gray-100 bg-white flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Type a message..." className="flex-1 border border-gray-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50" />
                <button onClick={handleSend} disabled={!input.trim()}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#e8612a] hover:bg-[#d4541f] flex items-center justify-center text-white transition-all disabled:opacity-50 flex-shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1a1a1a]">Create Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Group Name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 mb-4" />
            <button onClick={handleCreateGroup} disabled={!newGroupName.trim()}
              className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-50">
              Create Group
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Collaboration;
