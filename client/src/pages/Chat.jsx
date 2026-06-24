import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { chatService } from "../services/chatService";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Send, Search, MessageCircle, Circle } from "lucide-react";

export default function Chat() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const queryClient = useQueryClient();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Get all conversations
  const { data: convsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatService.getConversations().then(r => r.data.data),
    refetchInterval: 10000,
  });

  // Get chat users
  const { data: usersData } = useQuery({
    queryKey: ["chatUsers"],
    queryFn: () => chatService.getChatUsers().then(r => r.data.data),
  });

  const conversations = convsData?.conversations || [];
  const chatUsers = usersData?.users || [];

  // Auto open conversation if navigated from another page
  useEffect(() => {
    if (location.state?.receiverId) {
      handleStartChat(location.state.receiverId);
    }
  }, [location.state]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (data) => {
      if (activeConversation?._id === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
      }
      queryClient.invalidateQueries(["conversations"]);
    });

    socket.on("user_typing", (data) => {
      if (data.userId !== user._id) setOtherTyping(true);
    });

    socket.on("user_stop_typing", () => setOtherTyping(false));

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [socket, activeConversation]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Open a conversation
  const openConversation = async (conv) => {
    setActiveConversation(conv);
    socket?.emit("join_conversation", conv._id);
    const res = await chatService.getMessages(conv._id);
    setMessages(res.data.data.messages);
    queryClient.invalidateQueries(["conversations"]);
  };

  // Start new chat with a user
  const handleStartChat = async (receiverId) => {
    const res = await chatService.getOrCreateConversation(receiverId);
    const conv = res.data.data.conversation;
    openConversation(conv);
  };

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content) => chatService.sendMessage({
      conversationId: activeConversation._id,
      content,
    }),
    onSuccess: (res) => {
      const msg = res.data.data.message;
      setMessages(prev => [...prev, msg]);
      socket?.emit("send_message", {
        conversationId: activeConversation._id,
        message: msg,
      });
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const handleSend = () => {
    if (!newMessage.trim() || !activeConversation) return;
    sendMutation.mutate(newMessage.trim());
    setNewMessage("");
    socket?.emit("stop_typing", { conversationId: activeConversation._id });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !activeConversation) return;
    socket.emit("typing", {
      conversationId: activeConversation._id,
      userId: user._id,
      name: user.name,
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId: activeConversation._id });
    }, 1500);
  };

  // Get other participant from conversation
  const getOtherParticipant = (conv) =>
    conv.participants?.find(p => p._id !== user._id);

  // Filter users by search
  const filteredUsers = chatUsers.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          style={{ height: "calc(100vh - 140px)" }}>
          <div className="flex h-full">
            {/* ── Left Sidebar ── */}
            <div className={`${activeConversation ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-gray-100 flex-col`}>

              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchUser}
                    onChange={e => setSearchUser(e.target.value)}
                    className="input-field pl-9 text-sm py-2"
                    placeholder="Search users..."
                  />
                </div>
              </div>

              {/* User list to start new chat */}
              {searchUser && (
                <div className="border-b border-gray-100 max-h-40 overflow-y-auto">
                  <p className="text-xs text-gray-400 px-4 py-2 font-medium">START NEW CHAT</p>
                  {filteredUsers.map(u => (
                    <button key={u._id} onClick={() => { handleStartChat(u._id); setSearchUser(""); }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700">
                        {u.name[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{u.role}</p>
                      </div>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-xs text-gray-400 px-4 py-3">No users found</p>
                  )}
                </div>
              )}

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessageCircle size={36} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No conversations yet</p>
                    <p className="text-xs text-gray-300 mt-1">Search for a user to start chatting</p>
                  </div>
                ) : (
                  conversations.map(conv => {
                    const other = getOtherParticipant(conv);
                    const isOnline = onlineUsers.includes(other?._id);
                    const isActive = activeConversation?._id === conv._id;
                    const unread = conv.unreadCount?.get?.(user._id) || 0;

                    return (
                      <button key={conv._id} onClick={() => openConversation(conv)}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-50 ${isActive ? "bg-primary-50" : "hover:bg-gray-50"
                          }`}>
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">
                            {other?.name?.[0] || "?"}
                          </div>
                          {isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${isActive ? "font-bold text-primary-700" : "font-medium text-gray-800"}`}>
                              {other?.name}
                            </p>
                            {unread > 0 && (
                              <span className="w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                {unread}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {conv.lastMessage || "Start a conversation"}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Chat Area ── */}
            {/* ── Chat Area ── */}
            <div className={`${activeConversation ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
              {!activeConversation ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle size={56} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Select a conversation</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Choose from existing chats or search for a user
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  {(() => {
                    const other = getOtherParticipant(activeConversation);
                    const isOnline = onlineUsers.includes(other?._id);
                    return (
                      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 bg-white">
                        {/* Back button - mobile only */}
                        <button
                          onClick={() => setActiveConversation(null)}
                          className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                          ←
                        </button>
                        <div className="relative">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">
                            {other?.name?.[0] || "?"}
                          </div>
                          {isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{other?.name}</p>
                          <p className="text-xs text-gray-400 capitalize flex items-center gap-1">
                            <Circle size={8} className={isOnline ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300"} />
                            {isOnline ? "Online" : "Offline"} · {other?.role}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-sm">No messages yet. Say hello! 👋</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isMe = msg.sender._id === user._id || msg.sender === user._id;
                        return (
                          <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            {!isMe && (
                              <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700 mr-2 flex-shrink-0 self-end">
                                {msg.sender?.name?.[0] || "?"}
                              </div>
                            )}
                            <div className={`max-w-xs lg:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                                ? "bg-primary-600 text-white rounded-br-sm"
                                : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                                }`}>
                                {msg.content}
                              </div>
                              <p className="text-xs text-gray-400 mt-1 px-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Typing Indicator */}
                    {otherTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="px-6 py-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                      <input
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                        className="flex-1 input-field"
                        placeholder="Type a message... (Enter to send)"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="w-11 h-11 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}