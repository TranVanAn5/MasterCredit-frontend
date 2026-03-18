import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiHome, FiUser, FiCreditCard, FiActivity, FiSave,
  FiDollarSign, FiSettings, FiLogOut, FiBell, FiMessageCircle
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import {
  getConversations,
  getConversationDetail,
  startConversation,
  sendMessage,
  markMessagesAsRead,
  getNewMessages,
  closeConversation
} from "../services/chatService";

export default function ChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State management
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const pollingRef = useRef(null);
  const lastMessageTimeRef = useRef(new Date());

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Load conversations khi component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Polling để cập nhật tin nhắn mới
  useEffect(() => {
    if (selectedConversation) {
      startPolling();
      return () => stopPolling();
    }
  }, [selectedConversation]);

  // Load danh sách conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await getConversations();
      if (response.success) {
        setConversations(response.data.conversations);
        setTotalUnread(response.data.totalUnreadMessages);

        // Auto-select first active conversation
        const activeConv = response.data.conversations.find(c => c.status === "Active");
        if (activeConv && !selectedConversation) {
          handleSelectConversation(activeConv);
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Không thể tải danh sách cuộc hội thoại.");
    } finally {
      setLoading(false);
    }
  };

  // Chọn conversation
  const handleSelectConversation = async (conversation) => {
    if (selectedConversation?.id === conversation.id) return;

    try {
      setMessagesLoading(true);
      setSelectedConversation(conversation);

      const response = await getConversationDetail(conversation.id);
      if (response.success) {
        setMessages(response.data.messages);
        lastMessageTimeRef.current = new Date();

        // Mark as read
        await markMessagesAsRead(conversation.id);

        // Update conversation list to remove unread count
        setConversations(prev =>
          prev.map(c =>
            c.id === conversation.id
              ? { ...c, unreadCount: 0 }
              : c
          )
        );

        // Update total unread count
        setTotalUnread(prev => Math.max(0, prev - conversation.unreadCount));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error loading conversation detail:", error);
      toast.error("Không thể tải chi tiết cuộc hội thoại.");
    } finally {
      setMessagesLoading(false);
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async (conversationId, messageDto) => {
    try {
      setSending(true);
      const response = await sendMessage(conversationId, messageDto);

      if (response.success) {
        const { message: userMessage, autoResponse } = response.data;

        // Add user message
        setMessages(prev => [...prev, userMessage]);

        // Add auto-response if exists
        if (autoResponse) {
          setTimeout(() => {
            setMessages(prev => [...prev, autoResponse]);
          }, 1000); // Delay để làm cho phản hồi tự nhiên hơn
        }

        // Update conversation in list
        setConversations(prev =>
          prev.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: userMessage,
                  lastMessageAt: userMessage.sentAt
                }
              : c
          )
        );

        lastMessageTimeRef.current = new Date();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  // Đánh dấu tin nhắn đã đọc
  const handleMarkAsRead = async (conversationId) => {
    try {
      await markMessagesAsRead(conversationId);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Polling tin nhắn mới
  const startPolling = () => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      if (!selectedConversation) return;

      try {
        const response = await getNewMessages(
          selectedConversation.id,
          lastMessageTimeRef.current.toISOString()
        );

        if (response.success && response.data.length > 0) {
          setMessages(prev => [...prev, ...response.data]);
          lastMessageTimeRef.current = new Date();

          // Update unread count if messages from others
          const othersMessages = response.data.filter(m => m.senderType !== "Customer");
          if (othersMessages.length > 0) {
            setTotalUnread(prev => prev + othersMessages.length);
          }
        }
      } catch (error) {
        console.error("Error polling new messages:", error);
      }
    }, 3000); // Poll every 3 seconds
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // Tạo cuộc hội thoại mới
  const handleNewConversation = () => {
    setShowNewChatModal(true);
  };

  const handleStartNewConversation = async (subject, initialMessage) => {
    try {
      const response = await startConversation({ subject, initialMessage });

      if (response.success) {
        setShowNewChatModal(false);
        await loadConversations(); // Reload conversations

        // Auto-select the new conversation
        setTimeout(() => {
          const newConv = response.data;
          handleSelectConversation(newConv);
        }, 500);

        toast.success("Cuộc hội thoại mới đã được tạo!");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error starting new conversation:", error);
      toast.error("Không thể tạo cuộc hội thoại mới.");
    }
  };

  // Đóng cuộc hội thoại
  const handleCloseConversation = async (conversationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn đóng cuộc hội thoại này?")) return;

    try {
      const response = await closeConversation(conversationId);

      if (response.success) {
        // Update conversation status
        setConversations(prev =>
          prev.map(c =>
            c.id === conversationId
              ? { ...c, status: "Closed" }
              : c
          )
        );

        // Update selected conversation if it's the one being closed
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(prev => ({ ...prev, status: "Closed" }));
        }

        toast.success("Cuộc hội thoại đã được đóng.");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error closing conversation:", error);
      toast.error("Không thể đóng cuộc hội thoại.");
    }
  };

  const sidebarItems = [
    { icon: <FiHome size={18} />, label: "Bảng điều khiển", path: "/dashboard" },
    { icon: <FiUser size={18} />, label: "Tài khoản", path: "/profile" },
    { icon: <FiCreditCard size={18} />, label: "Thẻ", path: "/cards" },
    { icon: <FiActivity size={18} />, label: "Giao dịch", path: null },
    { icon: <FiSave size={18} />, label: "Tiết kiệm", path: null },
    { icon: <FiDollarSign size={18} />, label: "Khoản vay", path: null },
    { icon: <FiMessageCircle size={18} />, label: "Hỗ trợ", path: "/chat", active: true },
    { icon: <FiSettings size={18} />, label: "Cài đặt", path: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Logo className="w-32 h-32" showText={false} />
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item, i) => (
              <li key={i}>
                <button
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    item.active
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  {item.label === "Hỗ trợ" && totalUnread > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-auto">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut size={18} />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        <div className="flex-1 flex overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 right-0 p-6 z-10">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FiBell size={20} className="text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{user?.name?.charAt(0) || "U"}</span>
              </div>
            </div>
          </div>

          {/* Chat layout */}
          <div className="flex-1 flex h-screen">
            {/* Conversation list */}
            <div className="w-80 border-r border-gray-200">
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversation?.id}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onCloseConversation={handleCloseConversation}
                totalUnread={totalUnread}
                loading={loading}
              />
            </div>

            {/* Chat window */}
            <div className="flex-1">
              <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                onMarkAsRead={handleMarkAsRead}
                loading={messagesLoading}
                sending={sending}
              />
            </div>
          </div>
        </div>
      </div>

      {/* New conversation modal */}
      {showNewChatModal && (
        <NewConversationModal
          onStart={handleStartNewConversation}
          onClose={() => setShowNewChatModal(false)}
        />
      )}
    </div>
  );
}

// Modal để tạo cuộc hội thoại mới
function NewConversationModal({ onStart, onClose }) {
  const [subject, setSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const quickTopics = [
    "Hỏi về thẻ tín dụng",
    "Vấn đề với tài khoản",
    "Tra cứu giao dịch",
    "Ưu đãi và khuyến mãi",
    "Khiếu nại dịch vụ",
    "Hỗ trợ kỹ thuật"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setLoading(true);
    try {
      await onStart(subject.trim(), initialMessage.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Bắt đầu cuộc hội thoại mới</h3>
          <p className="text-sm text-gray-500 mt-1">
            Mô tả vấn đề bạn cần hỗ trợ để chúng tôi có thể giúp bạn tốt nhất.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chủ đề cuộc hội thoại *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="VD: Hỏi về thẻ tín dụng"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chủ đề thường gặp
            </label>
            <div className="flex flex-wrap gap-2">
              {quickTopics.map((topic, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSubject(topic)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-sm rounded-full transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tin nhắn đầu tiên (tùy chọn)
            </label>
            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề của bạn..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!subject.trim() || loading}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang tạo..." : "Bắt đầu chat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}