import { FiPlus, FiMessageCircle, FiClock, FiCheckCircle, FiX } from "react-icons/fi";

// Format thời gian cho conversation list
const formatLastMessageTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Vừa xong";
  if (diffInMinutes < 60) return `${diffInMinutes}p`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày`;

  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

// Lấy màu status
const getStatusColor = (status) => {
  switch (status) {
    case "Active": return "text-green-500";
    case "Waiting": return "text-yellow-500";
    case "Closed": return "text-gray-500";
    default: return "text-gray-500";
  }
};

// Truncate message content
const truncateMessage = (content, maxLength = 60) => {
  if (!content) return "Chưa có tin nhắn";
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
};

export default function ConversationList({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  onCloseConversation,
  totalUnread = 0,
  loading = false
}) {

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Hỗ trợ khách hàng</h2>
            <p className="text-sm text-gray-500">
              {totalUnread > 0 ? `${totalUnread} tin nhắn mới` : "Không có tin nhắn mới"}
            </p>
          </div>
          <button
            onClick={onNewConversation}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            title="Bắt đầu hội thoại mới"
          >
            <FiPlus size={20} />
          </button>
        </div>

        {/* Service status */}
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-medium">Đang online</span>
          <span className="text-gray-500">• Phản hồi trong vòng 2 phút</span>
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-500">Đang tải...</span>
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <FiMessageCircle size={48} className="text-gray-300 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Chưa có cuộc hội thoại nào
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Bắt đầu cuộc hội thoại đầu tiên để được hỗ trợ
            </p>
            <button
              onClick={onNewConversation}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              Bắt đầu chat ngay
            </button>
          </div>
        )}

        {!loading && conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors relative ${
              selectedConversationId === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
          >
            {/* Conversation header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {conversation.subject}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium ${getStatusColor(conversation.status)}`}>
                    {conversation.status === "Active" ? "Đang hoạt động" :
                     conversation.status === "Waiting" ? "Chờ phản hồi" : "Đã đóng"}
                  </span>
                  {conversation.assignedAgentName && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {conversation.assignedAgentName}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2">
                {conversation.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                  </span>
                )}

                {conversation.status === "Active" && onCloseConversation && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseConversation(conversation.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Đóng hội thoại"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Last message preview */}
            <div className="text-xs text-gray-600">
              {conversation.lastMessage ? (
                <div className="flex items-center justify-between">
                  <span className="flex-1 truncate">
                    {conversation.lastMessage.senderType === "Customer" ? "Bạn: " : ""}
                    {truncateMessage(conversation.lastMessage.content)}
                  </span>
                  <span className="ml-2 text-gray-400 flex items-center gap-1">
                    <FiClock size={10} />
                    {formatLastMessageTime(conversation.lastMessageAt)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Chưa có tin nhắn</span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <FiClock size={10} />
                    {formatLastMessageTime(conversation.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FiCheckCircle size={12} className="text-green-500" />
            <span>Hỗ trợ 24/7 bằng AI Assistant</span>
          </div>
          <div>Kết nối với nhân viên trong giờ hành chính</div>
        </div>
      </div>
    </div>
  );
}