import React, { useState, useRef, useEffect } from "react";
import TeacherLayout from "@/components/layout/TeacherLayout";
import PageHeader from "@/components/shared/PageHeader";
import { useTeacherStore } from "@/store";
import { emitMessage } from "@/lib/socket";
import { Search } from "lucide-react";

import MessageBubble from "@/components/chat/MessageBubble";
import MessageDateDivider from "@/components/chat/MessageDateDivider";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import EmptyChatState from "@/components/chat/EmptyChatState";
import OnlineDot from "@/components/chat/OnlineDot";
import UnreadBadge from "@/components/chat/UnreadBadge";

const needsDivider = (prev, curr) => {
  if (!prev) return true;
  const a = prev.timestamp ? new Date(prev.timestamp) : null;
  const b = curr.timestamp ? new Date(curr.timestamp) : null;
  if (!a || !b) return false;
  return a.toDateString() !== b.toDateString();
};

const isSameGroup = (prev, curr) => {
  if (!prev) return false;
  if (prev.sender !== curr.sender) return false;
  if (!prev.timestamp || !curr.timestamp) return true;
  return Math.abs(new Date(curr.timestamp) - new Date(prev.timestamp)) < 2 * 60 * 1000;
};

const StudentChats = () => {
  const {
    students, studentChats, selectedStudentChatId, setSelectedStudentChat,
    sendStudentMessage, unreadStudentChats, lastStudentMessages,
    studentReactions, studentMessageStatuses, updateStudentMessageStatus,
    addStudentReaction, teacherReplyingTo, setTeacherReplyingTo, clearTeacherReplyingTo,
  } = useTeacherStore();

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentChatId) || null;
  const messages = selectedStudentChatId ? (studentChats[selectedStudentChatId] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [studentChats, selectedStudentChatId]);

  const filtered = students
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => tab === "unread" ? (unreadStudentChats[s.id] || 0) > 0 : true)
    .sort((a, b) => {
      const ua = unreadStudentChats[a.id] || 0;
      const ub = unreadStudentChats[b.id] || 0;
      if (ub !== ua) return ub - ua;
      const la = lastStudentMessages[a.id];
      const lb = lastStudentMessages[b.id];
      if (la && lb) return new Date(lb.timestamp || 0) - new Date(la.timestamp || 0);
      return la ? -1 : lb ? 1 : 0;
    });

  const handleSend = (text, replyTo) => {
    if (!selectedStudentChatId) return;
    const msgId = sendStudentMessage(selectedStudentChatId, text);
    const roomId = `st_${selectedStudentChatId}_teacher`;
    emitMessage(roomId, { id: msgId, content: text, replyTo });
    setTimeout(() => updateStudentMessageStatus(msgId, "delivered"), 1000);
    setTimeout(() => updateStudentMessageStatus(msgId, "read"), 4000);
  };

  const handleReact = (messageId, emoji) => {
    addStudentReaction(messageId, emoji, "teacher_self", "Dr. Priya Sharma");
  };

  const initials = (name) => name.split(" ").map((n) => n[0]).join("").substring(0, 2);

  return (
    <TeacherLayout title="Student Chats">
      <PageHeader title="Student Chats" subtitle="Reply to student questions and doubts directly." />

      <div className="flex gap-0 md:gap-6 h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
        {/* ── Student List ── */}
        <div className={`w-full md:w-72 bg-white rounded-2xl border border-[#f0ece8] flex-col flex-shrink-0 shadow-sm overflow-hidden ${showChatOnMobile ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-[#1a1a1a] mb-3">Student Messages</h3>
            {/* Tabs */}
            <div className="flex border-b border-gray-100 -mx-4 px-4 mb-3">
              {[["all", "All"], ["unread", "Unread"]].map(([val, label]) => (
                <button key={val} onClick={() => setTab(val)}
                  className={`text-xs font-medium pb-2 mr-4 transition-all ${tab === val ? "text-[#e8612a] border-b-2 border-[#e8612a]" : "text-gray-400 hover:text-gray-600"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="bg-transparent text-sm focus:outline-none w-full" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((student) => {
              const last = lastStudentMessages[student.id];
              const unread = unreadStudentChats[student.id] || 0;
              const isActive = selectedStudentChatId === student.id;
              return (
                <div key={student.id} onClick={() => { setSelectedStudentChat(student.id); setShowChatOnMobile(true); }}
                  className={`flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer transition-all ${isActive ? "bg-[#e8612a]/5 border-l-2 border-l-[#e8612a]" : "hover:bg-gray-50"}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white font-bold text-sm">
                      {initials(student.name)}
                    </div>
                    <OnlineDot userId={student.id} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a]">{student.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {last ? (last.content || last.text) : student.roll}
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
          {!selectedStudent ? (
            <EmptyChatState type="student" />
          ) : (
            <>
              <ChatHeader
                avatarInitials={initials(selectedStudent.name)}
                name={selectedStudent.name}
                subtitle={selectedStudent.roll}
                userId={selectedStudent.id}
                onSearchMessages={() => {}}
              />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50/50">
                {messages.map((msg, idx) => {
                  const prev = messages[idx - 1] || null;
                  const isSelf = msg.sender === "teacher";
                  const divider = needsDivider(prev, msg);
                  return (
                    <React.Fragment key={msg.id}>
                      {divider && msg.timestamp && <MessageDateDivider date={msg.timestamp} />}
                      <div className={isSameGroup(prev, msg) && msg.sender === prev?.sender ? "mt-0.5" : "mt-3"}>
                        <MessageBubble
                          message={{ ...msg, status: studentMessageStatuses[msg.id] || msg.status }}
                          isSelf={isSelf}
                          showAvatar={!isSameGroup(prev, msg) || isSelf}
                          onReact={handleReact}
                          onReply={setTeacherReplyingTo}
                          reactions={studentReactions[msg.id] || []}
                        />
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-gray-50/50 px-4">
                <TypingIndicator roomId={`st_${selectedStudentChatId}_teacher`} selfId="teacher_self" />
              </div>

              <ChatInput
                onSend={handleSend}
                roomId={`st_${selectedStudentChatId}_teacher`}
                selfId="teacher_self"
                selfName="Dr. Priya Sharma"
                placeholder="Type a message to the student..."
                replyingTo={teacherReplyingTo}
                onCancelReply={clearTeacherReplyingTo}
              />
            </>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default StudentChats;
