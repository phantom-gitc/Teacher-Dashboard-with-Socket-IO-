import React, { useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { mockTeachers } from "@/lib/mockData";
import { useChatStore } from "@/store";
import { emitMessage } from "@/lib/socket";
import { Search } from "lucide-react";
import { useState } from "react";

// Chat sub-components
import MessageBubble from "@/components/chat/MessageBubble";
import MessageDateDivider from "@/components/chat/MessageDateDivider";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import EmptyChatState from "@/components/chat/EmptyChatState";
import OnlineDot from "@/components/chat/OnlineDot";
import UnreadBadge from "@/components/chat/UnreadBadge";

// Helper: should we show date divider between two consecutive messages?
const needsDivider = (prev, curr) => {
  if (!prev) return true;
  const a = prev.timestamp ? new Date(prev.timestamp) : null;
  const b = curr.timestamp ? new Date(curr.timestamp) : null;
  if (!a || !b) return false;
  return a.toDateString() !== b.toDateString();
};

// Helper: are two consecutive messages grouped (same sender, within 2 min)?
const isSameGroup = (prev, curr) => {
  if (!prev) return false;
  const sameSender = prev.sender === curr.sender;
  if (!sameSender) return false;
  if (!prev.timestamp || !curr.timestamp) return true;
  return Math.abs(new Date(curr.timestamp) - new Date(prev.timestamp)) < 2 * 60 * 1000;
};

const AskTeacher = () => {
  const {
    teacherChats, selectedTeacherId, setSelectedTeacher, sendTeacherMessage,
    unreadCounts, lastMessages, reactions, replyingTo, setReplyingTo,
    clearReplyingTo, addReaction, messageStatuses, updateMessageStatus,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedTeacher = mockTeachers.find((t) => t.id === selectedTeacherId) || null;
  const currentMessages = selectedTeacherId ? (teacherChats[selectedTeacherId] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [teacherChats, selectedTeacherId]);

  const filteredTeachers = mockTeachers.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: unread first, then by last message
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    const ua = unreadCounts[a.id] || 0;
    const ub = unreadCounts[b.id] || 0;
    if (ub !== ua) return ub - ua;
    const la = lastMessages[a.id];
    const lb = lastMessages[b.id];
    if (la && lb) return new Date(lb.timestamp || 0) - new Date(la.timestamp || 0);
    return la ? -1 : lb ? 1 : 0;
  });

  const handleSend = (text, replyTo) => {
    if (!selectedTeacherId) return;
    const msgId = sendTeacherMessage(selectedTeacherId, text);
    const roomId = `st_${Math.min(selectedTeacherId, 0)}_${Math.max(selectedTeacherId, 0)}`;
    emitMessage(roomId, { id: msgId, content: text, replyTo });
    // Mock status progression
    setTimeout(() => updateMessageStatus(msgId, "delivered"), 1000);
    setTimeout(() => updateMessageStatus(msgId, "read"), 4000);
  };

  const handleReact = (messageId, emoji) => {
    addReaction(messageId, emoji, "student_self", "You");
  };

  const handleClearChat = () => {
    // No-op in frontend-only mode — state resets on refresh
  };

  return (
    <DashboardLayout title="Ask Teacher">
      <PageHeader title="Ask Teacher" subtitle="Connect directly with your teachers for guidance and support." />

      <div className="flex gap-0 md:gap-6 h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
        {/* ── Teacher List Panel ── */}
        <div className={`w-full md:w-72 bg-white rounded-2xl border border-[#f0ece8] overflow-hidden flex-col flex-shrink-0 shadow-sm ${showChatOnMobile ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Teachers</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers..."
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sortedTeachers.map((teacher) => {
              const last = lastMessages[teacher.id];
              const unread = unreadCounts[teacher.id] || 0;
              return (
                <div key={teacher.id} onClick={() => { setSelectedTeacher(teacher.id); setShowChatOnMobile(true); }}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-50 transition-all ${selectedTeacherId === teacher.id ? "bg-[#e8612a]/5 border-l-2 border-l-[#e8612a]" : "hover:bg-gray-50"}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-sm font-bold">
                      {teacher.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                    </div>
                    <OnlineDot userId={String(teacher.id)} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{teacher.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {last ? (last.content || last.text) : teacher.subject}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {last?.timestamp && (
                      <span className="text-[10px] text-gray-400">
                        {new Date(last.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    <UnreadBadge count={unread} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Chat Panel ── */}
        <div className={`flex-1 bg-white rounded-2xl border border-[#f0ece8] flex-col overflow-hidden shadow-sm ${!showChatOnMobile ? "hidden md:flex" : "flex"}`}>
          {!selectedTeacher ? (
            <EmptyChatState type="teacher" />
          ) : (
            <>
              <ChatHeader
                avatarInitials={selectedTeacher.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                name={selectedTeacher.name}
                subtitle={selectedTeacher.subject}
                userId={String(selectedTeacher.id)}
                onClearChat={handleClearChat}
                onSearchMessages={(q) => {}}
              />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50/50">
                {currentMessages.map((msg, idx) => {
                  const prev = currentMessages[idx - 1] || null;
                  const isSelf = msg.sender === "student";
                  const showAvatar = !isSameGroup(prev, msg) || !isSelf;
                  const divider = needsDivider(prev, msg);

                  return (
                    <React.Fragment key={msg.id}>
                      {divider && msg.timestamp && <MessageDateDivider date={msg.timestamp} />}
                      <div className={isSameGroup(prev, msg) && msg.sender === prev?.sender ? "mt-0.5" : "mt-3"}>
                        <MessageBubble
                          message={{ ...msg, status: messageStatuses[msg.id] || msg.status }}
                          isSelf={isSelf}
                          showAvatar={showAvatar}
                          onReact={handleReact}
                          onReply={setReplyingTo}
                          reactions={reactions[msg.id] || []}
                        />
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicator */}
              <div className="bg-gray-50/50 px-4">
                <TypingIndicator roomId={`st_${selectedTeacherId}`} selfId="student_self" />
              </div>

              <ChatInput
                onSend={handleSend}
                roomId={`st_${selectedTeacherId}`}
                selfId="student_self"
                selfName="Rahul Kumar"
                placeholder="Type your message to the teacher..."
                replyingTo={replyingTo}
                onCancelReply={clearReplyingTo}
              />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AskTeacher;
