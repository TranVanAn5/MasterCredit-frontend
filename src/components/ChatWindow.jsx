import { useState, useEffect, useRef } from "react";
import { FiSend, FiPaperclip, FiSettings, FiUser, FiPhone, FiMail } from "react-icons/fi";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  conversation,
  messages = [],
  onSendMessage,
  onMarkAsRead,
  loading = false,
  sending = false
}) {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when conversation changes
  useEffect(() => {
    if (conversation && onMarkAsRead) {
      onMarkAsRead(conversation.id);
    }
  }, [conversation?.id, onMarkAsRead]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [messageText]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending || !conversation) return;

    const content = messageText.trim();
    setMessageText("");

    try {
      await onSendMessage(conversation.id, { content, messageType: "Text" });
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message text on error
      setMessageText(content);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <FiSettings size={64} className="mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Chào mừng đến với MasterCredit Support</h3>
        <p className="text-center max-w-md">
          Chọn một cuộc hội thoại từ danh sách bên trái hoặc bắt đầu cuộc hội thoại mới để được hỗ trợ.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <FiSettings size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{conversation.subject}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className={`font-medium ${
                  conversation.status === "Active" ? "text-green-600" :
                  conversation.status === "Waiting" ? "text-yellow-600" : "text-gray-600"
                }`}>
                  {conversation.status === "Active" ? "Đang hoạt động" :
                   conversation.status === "Waiting" ? "Chờ phản hồi" : "Đã đóng"}
                </span>
                {conversation.assignedAgentName && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{conversation.assignedAgentName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="Gọi điện hỗ trợ"
            >
              <FiPhone size={18} />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="Gửi email hỗ trợ"
            >
              <FiMail size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-gray-500">Đang tải tin nhắn...</span>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiSettings size={48} className="text-gray-300 mb-4" />
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Cuộc hội thoại mới
            </h4>
            <p className="text-xs text-gray-500 max-w-xs">
              Hãy bắt đầu bằng cách mô tả vấn đề bạn cần hỗ trợ. AI Assistant sẽ phản hồi ngay lập tức!
            </p>
          </div>
        )}

        {!loading && messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderType === "Customer"}
          />
        ))}

        {/* Typing indicator nếu đang gửi */}
        {sending && (
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <FiSettings size={14} />
            </div>
            <div className="bg-gray-200 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      {conversation.status === "Active" && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-3">
            <button
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="Đính kèm tệp"
            >
              <FiPaperclip size={20} />
            </button>

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
                disabled={sending}
                rows={1}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sending}
              className={`p-3 rounded-2xl transition-all ${
                messageText.trim() && !sending
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              title="Gửi tin nhắn"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiSend size={20} />
              )}
            </button>
          </div>

          {/* Quick actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Thông tin thẻ tín dụng",
              "Phí thường niên",
              "Cách đăng ký thẻ",
              "Ưu đãi hiện tại"
            ].map((quickText, index) => (
              <button
                key={index}
                onClick={() => setMessageText(quickText)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
              >
                {quickText}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation closed message */}
      {conversation.status === "Closed" && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
          <p className="text-gray-500 text-sm">
            Cuộc hội thoại này đã được đóng. Tạo cuộc hội thoại mới nếu bạn cần hỗ trợ thêm.
          </p>
        </div>
      )}
    </div>
  );
}