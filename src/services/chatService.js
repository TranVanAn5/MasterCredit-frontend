import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ═══════════════════════════════════════════════════════════════
//  CONVERSATION MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// Tạo cuộc hội thoại mới
export const startConversation = (dto) =>
  api.post("/api/chat/conversations", dto).then((r) => r.data);

// Lấy danh sách conversations của user
export const getConversations = () =>
  api.get("/api/chat/conversations").then((r) => r.data);

// Lấy chi tiết conversation với tất cả messages
export const getConversationDetail = (conversationId) =>
  api.get(`/api/chat/conversations/${conversationId}`).then((r) => r.data);

// Đóng conversation
export const closeConversation = (conversationId) =>
  api.put(`/api/chat/conversations/${conversationId}/close`).then((r) => r.data);

// ═══════════════════════════════════════════════════════════════
//  MESSAGE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// Gửi tin nhắn trong conversation
export const sendMessage = (conversationId, dto) =>
  api.post(`/api/chat/conversations/${conversationId}/messages`, dto).then((r) => r.data);

// Đánh dấu tin nhắn đã đọc
export const markMessagesAsRead = (conversationId) =>
  api.put(`/api/chat/conversations/${conversationId}/mark-read`).then((r) => r.data);

// Lấy tin nhắn mới (polling)
export const getNewMessages = (conversationId, since) =>
  api.get(`/api/chat/conversations/${conversationId}/messages/new?since=${since}`).then((r) => r.data);

// ═══════════════════════════════════════════════════════════════
//  SERVICE INFO
// ═══════════════════════════════════════════════════════════════

// Lấy trạng thái dịch vụ hỗ trợ
export const getServiceStatus = () =>
  api.get("/api/chat/status").then((r) => r.data);

// Lấy FAQ
export const getFAQ = () =>
  api.get("/api/chat/faq").then((r) => r.data);