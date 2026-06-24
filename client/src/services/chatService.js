import api from "./api";

export const chatService = {
  getConversations:       ()               => api.get("/chat/conversations"),
  getOrCreateConversation:(receiverId)     => api.post("/chat/conversation", { receiverId }),
  getMessages:            (conversationId) => api.get(`/chat/messages/${conversationId}`),
  sendMessage:            (data)           => api.post("/chat/messages", data),
  getChatUsers:           ()               => api.get("/chat/users"),
};