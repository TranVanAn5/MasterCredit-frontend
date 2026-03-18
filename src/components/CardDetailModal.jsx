import { useState, useEffect } from "react";
import { FiX, FiCreditCard, FiShield, FiCalendar, FiEye, FiEyeOff, FiCopy, FiCheck } from "react-icons/fi";
import { getCardDetail } from "../services/cardService";
import toast from "react-hot-toast";

const cardStyle = (cardName = "") => {
  const name = cardName.toLowerCase();
  if (name.includes("platinum"))
    return { bg: "from-gray-700 via-gray-800 to-gray-900", badge: "bg-gray-600", label: "Bạch Kim" };
  if (name.includes("gold"))
    return { bg: "from-yellow-500 via-amber-500 to-orange-500", badge: "bg-yellow-600", label: "Vàng" };
  return { bg: "from-slate-500 via-slate-600 to-slate-700", badge: "bg-slate-600", label: "Chuẩn" };
};

export default function CardDetailModal({ cardId, onClose }) {
  const [cardDetail, setCardDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const fetchCardDetail = async () => {
      try {
        const response = await getCardDetail(cardId);
        if (response.success) {
          setCardDetail(response.data);
        } else {
          toast.error(response.message || "Không thể tải thông tin thẻ");
          onClose();
        }
      } catch (error) {
        console.error("Error fetching card detail:", error);
        toast.error("Đã có lỗi xảy ra khi tải thông tin thẻ");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (cardId) {
      fetchCardDetail();
    }
  }, [cardId, onClose]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Đã sao chép ${field}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatCardNumber = (number) => {
    if (!showCardNumber) {
      return `•••• •••• •••• ${number.slice(-4)}`;
    }
    return number.replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  if (!cardDetail && !loading) return null;

  const style = cardDetail ? cardStyle(cardDetail.cardType.cardName) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Chi tiết thẻ tín dụng</h2>
            <p className="text-sm text-gray-500">Thông tin đầy đủ về thẻ của bạn</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Đang tải thông tin thẻ...</p>
          </div>
        )}

        {/* Content */}
        {!loading && cardDetail && (
          <div className="p-6 space-y-6">
            {/* Card Visual */}
            <div className={`rounded-2xl p-6 text-white bg-gradient-to-br ${style.bg} shadow-xl`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">MasterCredit</p>
                  <p className="text-lg font-bold tracking-wide mt-1">{cardDetail.cardType.cardName.toUpperCase()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-10 h-8 bg-yellow-300/80 rounded-sm" />
                  <span className="text-xs text-white/60 font-semibold">{cardDetail.cardType.cardNetwork}</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs text-white/60 uppercase tracking-widest">Số thẻ</p>
                  <button
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    {showCardNumber ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
                <p className="font-mono text-2xl tracking-[0.25em]">
                  {formatCardNumber(cardDetail.cardNumber)}
                </p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Chủ thẻ</p>
                  <p className="text-base font-semibold uppercase">{cardDetail.holderName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Hết hạn</p>
                  <p className="text-base font-semibold">{cardDetail.expiryDate}</p>
                </div>
              </div>
            </div>

            {/* Security Warning */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <FiShield className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-yellow-800 mb-1">Bảo mật thông tin</p>
                  <p className="text-sm text-yellow-700">
                    Không chia sẻ số thẻ, CVV và các thông tin nhạy cảm với bất kỳ ai.
                    Ngân hàng không bao giờ yêu cầu thông tin này qua điện thoại hoặc email.
                  </p>
                </div>
              </div>
            </div>

            {/* Card Details Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Card Number */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FiCreditCard className="text-green-600" size={18} />
                    <label className="text-sm font-medium text-gray-700">Số thẻ</label>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowCardNumber(!showCardNumber)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      title={showCardNumber ? "Ẩn số thẻ" : "Hiện số thẻ"}
                    >
                      {showCardNumber ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                    <button
                      onClick={() => handleCopy(cardDetail.cardNumber, "số thẻ")}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Sao chép"
                    >
                      {copiedField === "số thẻ" ? (
                        <FiCheck size={16} className="text-green-600" />
                      ) : (
                        <FiCopy size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <p className="font-mono text-lg text-gray-900">
                  {formatCardNumber(cardDetail.cardNumber)}
                </p>
              </div>

              {/* CVV */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FiShield className="text-green-600" size={18} />
                    <label className="text-sm font-medium text-gray-700">CVV</label>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowCVV(!showCVV)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      title={showCVV ? "Ẩn CVV" : "Hiện CVV"}
                    >
                      {showCVV ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                    <button
                      onClick={() => handleCopy(cardDetail.cvv, "CVV")}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Sao chép"
                    >
                      {copiedField === "CVV" ? (
                        <FiCheck size={16} className="text-green-600" />
                      ) : (
                        <FiCopy size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <p className="font-mono text-lg text-gray-900">
                  {showCVV ? cardDetail.cvv : "•••"}
                </p>
              </div>

              {/* Expiry Date */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar className="text-green-600" size={18} />
                  <label className="text-sm font-medium text-gray-700">Ngày hết hạn</label>
                </div>
                <p className="text-lg text-gray-900 font-semibold">{cardDetail.expiryDate}</p>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiShield className="text-green-600" size={18} />
                  <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  cardDetail.cardStatus.toLowerCase() === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {cardDetail.cardStatus === "Active" ? "Đang hoạt động" : cardDetail.cardStatus}
                </span>
              </div>
            </div>

            {/* Card Type Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin loại thẻ</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Hạn mức tín dụng</p>
                  <p className="text-xl font-bold text-gray-900">
                    {(cardDetail.cardType.creditLimit / 1_000_000).toFixed(0)}M VND
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phí thường niên</p>
                  <p className="text-xl font-bold text-gray-900">
                    {cardDetail.cardType.annualFee === 0
                      ? "Miễn phí"
                      : (cardDetail.cardType.annualFee / 1_000_000).toFixed(1) + "M"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Hoàn tiền</p>
                  <p className="text-xl font-bold text-green-600">
                    {cardDetail.cardType.cashbackRate}%
                  </p>
                </div>
              </div>
            </div>

            {/* Issued Date */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiCalendar className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Ngày phát hành</p>
                  <p className="font-semibold text-gray-900">{formatDate(cardDetail.issuedDate)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
