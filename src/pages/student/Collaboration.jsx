import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { mockStudents } from "@/lib/mockData";
import { useChatStore } from "@/store";
import { emitMessage } from "@/lib/socket";
import { Search, Plus, X, Users } from "lucide-react";

import MessageBubble from "@/components/chat/MessageBubble";
import MessageDateDivider from "@/components/chat/MessageDateDivider";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import EmptyChatState from "@/components/chat/EmptyChatState";
import OnlineDot from "@/components/chat/OnlineDot";
import UnreadBadge from "@/components/chat/UnreadBadge";
import { useSocketStore } from "@/store";

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

const initials = (name) => name.split(" ").map((n) => n[0]).join("").substring(0, 2);

// ── Group Members Sheet ──
const MembersSheet = ({ group, onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
    <div className="fixed right-0 top-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 className="font-semibold text-[#1a1a1a]">Group Members</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {mockStudents.slice(0, group.members || 4).map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-xs font-bold">
                {initials(s.name)}
              </div>
              <OnlineDot userId={String(s.id)} size="sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">{s.name}</p>
              <p className="text-xs text-gray-400">{s.roll}</p>
            </div>
          </div>
        ))}
        {/* Also show yourself */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#e8612a]/5 border border-[#e8612a]/20">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-xs font-bold">RK</div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1a1a1a]">Rahul Kumar <span className="text-[10px] text-[#e8612a] ml-1">You</span></p>
            <p className="text-xs text-gray-400">CS2024001</p>
          </div>
        </div>
      </div>
    </div>
  </>
);

// ── Create Group Modal ──
const CreateGroupModal = ({ students, onlineUsers, onCreate, onClose }) => {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const toggle = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const handleCreate = () => {
    if (!name.trim() || selected.length === 0) return;
    onCreate({ name: name.trim(), members: selected.length + 1, selectedMemberIds: selected });
    onClose();
  };
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#1a1a1a] text-lg">Create Study Group</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Group Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DBMS Study Group"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add Members</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {students.map((s) => (
                  <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selected.includes(s.id) ? "border-[#e8612a] bg-[#e8612a]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)}
                      className="w-4 h-4 rounded accent-[#e8612a]" />
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-xs font-bold">
                        {initials(s.name)}
                      </div>
                      <OnlineDot userId={String(s.id)} size="sm" />
                    </div>
                    <p className="text-sm font-medium text-[#1a1a1a]">{s.name}</p>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 font-semibold text-sm hover:border-gray-400 transition-all">Cancel</button>
              <button onClick={handleCreate} disabled={!name.trim() || selected.length === 0}
                className="flex-1 bg-[#e8612a] hover:bg-[#d4541f] text-white rounded-xl py-3 font-semibold text-sm transition-all disabled:opacity-50">
                Create Group
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Collaboration = () => {
  const {
    activeCollabTab, setActiveCollabTab,
    groups, createGroup,
    groupChats, selectedGroupId, setSelectedGroup, sendGroupMessage,
    studentChats, selectedStudentId, setSelectedStudent, sendStudentMessage,
    unreadCounts, lastMessages, reactions, replyingTo, setReplyingTo,
    clearReplyingTo, addReaction, messageStatuses, updateMessageStatus,
  } = useChatStore();

  const { onlineUsers } = useSocketStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersSheet, setShowMembersSheet] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const messagesEndRef = useRef(null);

  const chatType = selectedGroupId ? "group" : selectedStudentId ? "student" : null;
  const selectedChat = chatType === "group"
    ? groups.find((g) => g.id === selectedGroupId) || null
    : chatType === "student"
    ? mockStudents.find((s) => s.id === selectedStudentId) || null
    : null;

  const currentMessages = chatType === "group"
    ? (groupChats[selectedGroupId] || [])
    : chatType === "student"
    ? (studentChats[selectedStudentId] || [])
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupChats, studentChats, selectedGroupId, selectedStudentId]);

  const filteredStudents = mockStudents
    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const ao = onlineUsers.includes(String(a.id));
      const bo = onlineUsers.includes(String(b.id));
      return ao === bo ? 0 : ao ? -1 : 1;
    });

  const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSend = (text, replyTo) => {
    if (!selectedChat) return;
    if (chatType === "group") {
      const msgId = sendGroupMessage(selectedGroupId, text);
      emitMessage(`grp_${selectedGroupId}`, { id: msgId, content: text, replyTo });
      setTimeout(() => updateMessageStatus(msgId, "delivered"), 1000);
      setTimeout(() => updateMessageStatus(msgId, "read"), 4000);
    } else {
      const msgId = sendStudentMessage(selectedStudentId, text);
      emitMessage(`ss_${Math.min(0, selectedStudentId)}_${Math.max(0, selectedStudentId)}`, { id: msgId, content: text, replyTo });
      setTimeout(() => updateMessageStatus(msgId, "delivered"), 1000);
      setTimeout(() => updateMessageStatus(msgId, "read"), 4000);
    }
  };

  const handleReact = (messageId, emoji) => {
    addReaction(messageId, emoji, "student_self", "You");
  };

  const handleCreateGroup = (data) => {
    createGroup({ id: Date.now(), name: data.name, members: data.members, selectedMemberIds: data.selectedMemberIds });
  };

  const groupOnlineCount = (group) => {
    const members = mockStudents.slice(0, group.members || 4);
    return members.filter((m) => onlineUsers.includes(String(m.id))).length + 1; // +1 for self
  };

  return (
    <DashboardLayout title="Collaboration">
      <PageHeader title="Collaboration" subtitle="Connect with classmates and study groups." />

      {showCreateModal && (
        <CreateGroupModal students={mockStudents} onlineUsers={onlineUsers} onCreate={handleCreateGroup} onClose={() => setShowCreateModal(false)} />
      )}
      {showMembersSheet && selectedChat && chatType === "group" && (
        <MembersSheet group={selectedChat} onClose={() => setShowMembersSheet(false)} />
      )}

      <div className="flex gap-0 md:gap-6 h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
        {/* ── List Panel ── */}
        <div className={`w-full md:w-72 bg-white rounded-2xl border border-[#f0ece8] flex-col flex-shrink-0 shadow-sm overflow-hidden ${showChatOnMobile ? "hidden md:flex" : "flex"}`}>
          {/* Tabs */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex border-b border-gray-100 -mx-4 px-4 mb-3">
              {[["Groups", "Groups"], ["Students", "Students"]].map(([val, label]) => (
                <button key={val} onClick={() => { setActiveCollabTab(val); setSelectedGroup(null); setSelectedStudent(null); }}
                  className={`text-sm font-medium pb-2 mr-5 transition-all ${activeCollabTab === val ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]" : "text-gray-400 hover:text-gray-600"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeCollabTab.toLowerCase()}...`}
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeCollabTab === "Groups" ? (
              <>
                {filteredGroups.map((group) => {
                  const chatKey = `group_${group.id}`;
                  const unread = unreadCounts[chatKey] || 0;
                  const last = lastMessages[chatKey];
                  return (
                    <div key={group.id} onClick={() => { setSelectedGroup(group.id); setSelectedStudent(null); setShowChatOnMobile(true); }}
                      className={`flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer transition-all ${selectedGroupId === group.id ? "bg-[#e8612a]/5 border-l-2 border-l-[#e8612a]" : "hover:bg-gray-50"}`}>
                      <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {group.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1a1a] truncate">{group.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {last ? (last.content || last.text) : `${group.members} members · ${groupOnlineCount(group)} online`}
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
                <button onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 w-full p-4 text-[#e8612a] hover:bg-[#e8612a]/5 transition-colors text-sm font-medium border-t border-gray-50">
                  <Plus size={16} /> Create New Group
                </button>
              </>
            ) : (
              filteredStudents.map((student) => {
                const chatKey = `peer_${student.id}`;
                const unread = unreadCounts[chatKey] || 0;
                const last = lastMessages[chatKey];
                return (
                  <div key={student.id} onClick={() => { setSelectedStudent(student.id); setSelectedGroup(null); setShowChatOnMobile(true); }}
                    className={`flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer transition-all ${selectedStudentId === student.id ? "bg-[#e8612a]/5 border-l-2 border-l-[#e8612a]" : "hover:bg-gray-50"}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f4956a] to-[#e8612a] flex items-center justify-center text-white text-sm font-bold">
                        {initials(student.name)}
                      </div>
                      <OnlineDot userId={String(student.id)} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">{student.name}</p>
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
              })
            )}
          </div>
        </div>

        {/* ── Chat Panel ── */}
        <div className={`flex-1 bg-white rounded-2xl border border-[#f0ece8] flex-col overflow-hidden shadow-sm ${!showChatOnMobile ? "hidden md:flex" : "flex"}`}>
          {!selectedChat ? (
            <EmptyChatState type="group" />
          ) : (
            <>
              <ChatHeader
                avatarInitials={chatType === "group"
                  ? selectedChat.name.split(" ").map((n) => n[0]).join("").substring(0, 2)
                  : initials(selectedChat.name)}
                avatarGradient={chatType === "group" ? "" : "from-[#f4956a] to-[#e8612a]"}
                name={selectedChat.name}
                subtitle={chatType === "group" ? `${selectedChat.members} members` : selectedChat.roll}
                userId={chatType === "student" ? String(selectedChat.id) : undefined}
                isGroup={chatType === "group"}
                memberCount={selectedChat.members}
                onViewMembers={() => setShowMembersSheet(true)}
                onSearchMessages={() => {}}
              />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50/50">
                {currentMessages.map((msg, idx) => {
                  const prev = currentMessages[idx - 1] || null;
                  const isSelf = msg.sender === "You" || msg.senderId === "student_self";
                  const divider = needsDivider(prev, msg);
                  const grouped = isSameGroup(prev, msg) && msg.sender === prev?.sender;
                  return (
                    <React.Fragment key={msg.id}>
                      {divider && msg.timestamp && <MessageDateDivider date={msg.timestamp} />}
                      <div className={grouped ? "mt-0.5" : "mt-3"}>
                        <MessageBubble
                          message={{ ...msg, status: messageStatuses[msg.id] || msg.status }}
                          isSelf={isSelf}
                          isGroup={chatType === "group"}
                          showAvatar={!grouped}
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

              <div className="bg-gray-50/50 px-4">
                <TypingIndicator
                  roomId={chatType === "group" ? `grp_${selectedGroupId}` : `ss_${selectedStudentId}`}
                  selfId="student_self"
                />
              </div>

              <ChatInput
                onSend={handleSend}
                roomId={chatType === "group" ? `grp_${selectedGroupId}` : `ss_${selectedStudentId}`}
                selfId="student_self"
                selfName="Rahul Kumar"
                placeholder={chatType === "group" ? "Message the group..." : "Message the student..."}
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

export default Collaboration;
