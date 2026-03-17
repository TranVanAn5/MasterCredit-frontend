import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiHome, FiUser, FiCreditCard, FiActivity, FiSave,
  FiDollarSign, FiSettings, FiLogOut, FiBell, FiPlus,
  FiEye, FiEyeOff, FiShield, FiAlertCircle, FiCheckCircle,
  FiChevronRight, FiPhone, FiMail, FiMessageCircle
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getMyCards } from "../services/cardService";
import Logo from "../components/Logo";

// ── Card gradient by type ──────────────────────────────────
const cardStyle = (cardName = "") => {
  const name = cardName.toLowerCase();
  if (name.includes("platinum"))
    return { bg: "from-gray-700 via-gray-800 to-gray-900", badge: "bg-gray-600", label: "Bạch Kim" };
  if (name.includes("gold"))
    return { bg: "from-yellow-500 via-amber-500 to-orange-500", badge: "bg-yellow-600", label: "Vàng" };
  return { bg: "from-slate-500 via-slate-600 to-slate-700", badge: "bg-slate-600", label: "Chuẩn" };
};

const statusConfig = (status = "") => {
  const s = status.toLowerCase();
  if (s === "active")   return { text: "Đang hoạt động", color: "text-green-600", bg: "bg-green-50", icon: <FiCheckCircle size={14} /> };
  if (s === "blocked")  return { text: "Đã khóa",         color: "text-red-600",   bg: "bg-red-50",   icon: <FiAlertCircle size={14} /> };
  return { text: status || "Không xác định", color: "text-gray-600", bg: "bg-gray-50", icon: <FiShield size={14} /> };
};

const fmt = (n) =>
  Number(n).toLocaleString("vi-VN") + " VND";

// ── Visual Credit Card Component ──────────────────────────
function CreditCardVisual({ card, selected, onClick, showNumber }) {
  const style = cardStyle(card.cardType.cardName);
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl p-5 text-white bg-gradient-to-br ${style.bg}
        transition-all duration-200 select-none
        ${selected ? "ring-4 ring-green-400 ring-offset-2 scale-[1.02] shadow-xl" : "hover:scale-[1.01] shadow-md"}`}
    >
      {/* Top row */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">MasterCredit</p>
          <p className="text-sm font-bold tracking-wide">{card.cardType.cardName.toUpperCase()}</p>
        </div>
        {/* Chip + network */}
        <div className="flex flex-col items-end gap-1">
          <div className="w-8 h-6 bg-yellow-300/80 rounded-sm" />
          <span className="text-[10px] text-white/60 font-semibold">{card.cardType.cardNetwork}</span>
        </div>
      </div>

      {/* Card number */}
      <div className="mb-5">
        <p className="font-mono text-lg tracking-[0.25em]">
          {showNumber ? card.cardNumber : "•••• •••• •••• " + card.cardNumber.slice(-4)}
        </p>
      </div>

      {/* Bottom row */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] text-white/60 uppercase tracking-widest mb-0.5">Chủ thẻ</p>
          <p className="text-sm font-semibold uppercase">{card.holderName}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/60 uppercase tracking-widest mb-0.5">Hết hạn</p>
          <p className="text-sm font-semibold">{card.expiryDate}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function CardsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showNumber, setShowNumber] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyCards();
        if (res.success) {
          setCards(res.data);
          if (res.data.length > 0) setSelectedCard(res.data[0]);
        } else {
          toast.error(res.message);
        }
      } catch {
        toast.error("Không thể tải danh sách thẻ.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sidebarItems = [
    { icon: <FiHome size={18} />,       label: "Bảng điều khiển", path: "/dashboard" },
    { icon: <FiUser size={18} />,       label: "Tài khoản",       path: null },
    { icon: <FiCreditCard size={18} />, label: "Thẻ",             path: "/cards", active: true },
    { icon: <FiActivity size={18} />,   label: "Giao dịch",       path: null },
    { icon: <FiSave size={18} />,       label: "Tiết kiệm",       path: null },
    { icon: <FiDollarSign size={18} />, label: "Khoản vay",       path: null },
    { icon: <FiMessageCircle size={18} />, label: "Hỗ trợ",       path: "/chat" },
    { icon: <FiSettings size={18} />,   label: "Cài đặt",         path: null },
  ];

  const totalLimit = cards.reduce((s, c) => s + Number(c.cardType.creditLimit), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── */}
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
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
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

      {/* ── Main Content ── */}
      <div className="flex-1 flex">
        <div className="flex-1 p-8 overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Thẻ của tôi</h1>
              <p className="text-gray-500">Quản lý tất cả thẻ tín dụng của bạn</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FiBell size={20} className="text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{user?.name?.charAt(0) || "U"}</span>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          {!loading && cards.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Tổng số thẻ</p>
                <p className="text-2xl font-bold text-gray-900">{cards.length}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Tổng hạn mức</p>
                <p className="text-2xl font-bold text-green-600">{fmt(totalLimit)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Thẻ đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cards.filter((c) => c.cardStatus.toLowerCase() === "active").length}
                </p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Đang tải danh sách thẻ...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && cards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiCreditCard size={36} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bạn chưa có thẻ nào</h3>
              <p className="text-gray-500 mb-6 text-center max-w-xs">
                Đăng ký thẻ tín dụng MasterCredit để tận hưởng các ưu đãi hấp dẫn.
              </p>
              <button
                onClick={() => navigate("/catalog")}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <FiPlus size={18} />
                Xem danh sách thẻ
              </button>
            </div>
          )}

          {/* Card grid */}
          {!loading && cards.length > 0 && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Danh sách thẻ</h2>
                  <button
                    onClick={() => navigate("/catalog")}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    <FiPlus size={16} />
                    Xem danh sách thẻ
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {cards.map((card) => (
                    <CreditCardVisual
                      key={card.id}
                      card={card}
                      selected={selectedCard?.id === card.id}
                      onClick={() => setSelectedCard(card)}
                      showNumber={showNumber && selectedCard?.id === card.id}
                    />
                  ))}
                </div>
              </div>

              {/* Selected card details */}
              {selectedCard && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Detail header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cardStyle(selectedCard.cardType.cardName).bg} flex items-center justify-center`}>
                        <FiCreditCard size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedCard.cardType.cardName}
                        </p>
                        <p className="text-xs text-gray-500">{selectedCard.cardNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Show/hide card number */}
                      <button
                        onClick={() => setShowNumber(!showNumber)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        title={showNumber ? "Ẩn số thẻ" : "Hiện số thẻ"}
                      >
                        {showNumber ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                      {/* Status badge */}
                      {(() => {
                        const sc = statusConfig(selectedCard.cardStatus);
                        return (
                          <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${sc.color} ${sc.bg}`}>
                            {sc.icon}{sc.text}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Detail body */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-100">
                    <div className="p-5">
                      <p className="text-xs text-gray-500 mb-1">Hạn mức tín dụng</p>
                      <p className="text-base font-bold text-gray-900">
                        {fmt(selectedCard.cardType.creditLimit)}
                      </p>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-gray-500 mb-1">Phí thường niên</p>
                      <p className="text-base font-bold text-gray-900">
                        {selectedCard.cardType.annualFee === 0
                          ? "Miễn phí"
                          : fmt(selectedCard.cardType.annualFee)}
                      </p>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-gray-500 mb-1">Hoàn tiền</p>
                      <p className="text-base font-bold text-green-600">
                        {selectedCard.cardType.cashbackRate}%
                      </p>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-gray-500 mb-1">Ngày hết hạn</p>
                      <p className="text-base font-bold text-gray-900">{selectedCard.expiryDate}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedCard.cardType.description && (
                    <div className="px-6 pb-5 pt-2 border-t border-gray-50">
                      <p className="text-sm text-gray-500">{selectedCard.cardType.description}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-72 bg-white border-l border-gray-200 p-6 flex flex-col gap-6">
          {/* Quick card preview */}
          {selectedCard && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Thẻ đang chọn</h3>
              <div className={`rounded-xl p-4 text-white bg-gradient-to-br ${cardStyle(selectedCard.cardType.cardName).bg}`}>
                <p className="text-[10px] font-semibold tracking-widest mb-3 text-white/70 uppercase">
                  {selectedCard.cardType.cardNetwork}
                </p>
                <p className="font-mono text-sm tracking-widest mb-3">{selectedCard.cardNumber}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-white/60 uppercase tracking-widest">Chủ thẻ</p>
                    <p className="text-xs font-semibold uppercase">{selectedCard.holderName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-white/60 uppercase tracking-widest">Hết hạn</p>
                    <p className="text-xs font-semibold">{selectedCard.expiryDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card type benefits */}
          {selectedCard && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Quyền lợi thẻ</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-3">
                  <span className="text-sm text-gray-600">Hoàn tiền</span>
                  <span className="font-bold text-green-600">{selectedCard.cardType.cashbackRate}%</span>
                </div>
                <div className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3">
                  <span className="text-sm text-gray-600">Hạn mức</span>
                  <span className="font-bold text-blue-600 text-xs">
                    {(Number(selectedCard.cardType.creditLimit) / 1_000_000).toFixed(0)}M VND
                  </span>
                </div>
                <div className="flex items-center justify-between bg-orange-50 rounded-lg px-4 py-3">
                  <span className="text-sm text-gray-600">Phí thường niên</span>
                  <span className="font-bold text-orange-600 text-xs">
                    {selectedCard.cardType.annualFee === 0
                      ? "Miễn phí"
                      : (Number(selectedCard.cardType.annualFee) / 1_000_000).toFixed(1) + "M/năm"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Support */}
          <div className="bg-green-50 rounded-xl p-4 mt-auto">
            <h4 className="font-semibold text-gray-900 mb-3">CẦN HỖ TRỢ?</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  <FiPhone size={15} className="text-green-600" />
                  <span className="text-sm font-medium">Gọi ngay</span>
                </div>
                <FiChevronRight size={14} className="text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  <FiMail size={15} className="text-green-600" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <FiChevronRight size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
