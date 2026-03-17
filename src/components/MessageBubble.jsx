import { FiUser, FiSettings, FiClock } from "react-icons/fi";

// Format thời gian hiển thị
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Vừa xong";
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// Lấy icon dựa trên loại sender
const getSenderIcon = (senderType) => {
  switch (senderType) {
    case "Customer": return <FiUser size={16} className="text-blue-500" />;
    case "Agent": return <FiUser size={16} className="text-green-500" />;
    case "System": return <FiSettings size={16} className="text-orange-500" />;
    default: return <FiSettings size={16} className="text-gray-500" />;
  }
};

// Lấy màu bubble dựa trên loại sender
const getBubbleStyle = (senderType, isOwn) => {
  if (isOwn) {
    return "bg-blue-500 text-white ml-auto max-w-[70%]";
  }

  switch (senderType) {
    case "Agent":
      return "bg-green-50 text-gray-800 border border-green-200 max-w-[80%]";
    case "System":
      return "bg-orange-50 text-gray-800 border border-orange-200 max-w-[80%]";
    default:
      return "bg-gray-100 text-gray-800 max-w-[80%]";
  }
};

export default function MessageBubble({ message, isOwn = false }) {
  const bubbleStyle = getBubbleStyle(message.senderType, isOwn);

  return (
    <div className={`flex flex-col mb-4 ${isOwn ? 'items-end' : 'items-start'}`}>
      {/* Sender info - chỉ hiển thị cho tin nhắn không phải của user */}
      {!isOwn && (
        <div className="flex items-center gap-2 mb-1 px-2">
          {getSenderIcon(message.senderType)}
          <span className="text-xs text-gray-500 font-medium">
            {message.senderName}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">
            {formatTime(message.sentAt)}
          </span>
        </div>
      )}

      {/* Message bubble */}
      <div className={`rounded-2xl px-4 py-3 ${bubbleStyle}`}>
        {/* Message content */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>

        {/* Attachment nếu có */}
        {message.attachmentUrl && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-200 hover:text-blue-100 text-sm underline"
            >
              📎 Tệp đính kèm
            </a>
          </div>
        )}

        {/* System message styling */}
        {message.messageType === "System" && (
          <div className="mt-2 pt-2 border-t border-orange-200">
            <span className="text-xs text-orange-600 font-medium">
              Tin nhắn hệ thống
            </span>
          </div>
        )}
      </div>

      {/* Time stamp cho tin nhắn của user */}
      {isOwn && (
        <div className="flex items-center gap-2 mt-1 px-2">
          <FiClock size={12} className="text-gray-400" />
          <span className="text-xs text-gray-400">
            {formatTime(message.sentAt)}
          </span>
          {!message.isRead && (
            <span className="text-xs text-blue-500 font-medium">Đã gửi</span>
          )}
        </div>
      )}
    </div>
  );
}