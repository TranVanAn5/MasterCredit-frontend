import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiHome, FiUser, FiCreditCard, FiActivity, FiSave,
  FiDollarSign, FiSettings, FiLogOut, FiBell, FiCheck,
  FiChevronRight, FiPhone, FiMail, FiArrowLeft, FiBarChart2, FiX, FiEye,
  FiMessageCircle
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getAllCardTypes } from "../services/cardService";
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

const fmt = (n) =>
  Number(n).toLocaleString("vi-VN") + " VND";

// ── Card Type Card Component ──────────────────────────────
function CardTypeCard({ cardType, isComparing, onCompareToggle }) {
  const style = cardStyle(cardType.cardName);
  const navigate = useNavigate();

  const handleCompareClick = (e) => {
    e.stopPropagation();
    onCompareToggle(cardType.id);
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 relative">
      {/* Compare checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <button
          onClick={handleCompareClick}
          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
            isComparing
              ? "bg-blue-500 border-blue-500"
              : "bg-white/90 border-gray-300 hover:border-blue-400"
          }`}
        >
          {isComparing && <FiCheck size={14} className="text-white font-bold" />}
        </button>
      </div>

      {/* Card visual preview */}
      <div className={`p-5 text-white bg-gradient-to-br ${style.bg} relative`}>
        {/* Badge */}
        <div className="absolute top-4 right-4">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${style.badge} text-white/90`}>
            {style.label}
          </span>
        </div>

        {/* Top row */}
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">MasterCredit</p>
          <p className="text-sm font-bold tracking-wide mt-1">{cardType.cardName.toUpperCase()}</p>
        </div>

        {/* Card number placeholder */}
        <div className="mb-5">
          <p className="font-mono text-lg tracking-[0.25em] text-white/80">
            •••• •••• •••• ••••
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-white/60 uppercase tracking-widest mb-0.5">Network</p>
            <p className="text-sm font-semibold uppercase">{cardType.cardNetwork}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/60 uppercase tracking-widest mb-0.5">Hoàn tiền</p>
            <p className="text-sm font-semibold">{cardType.cashbackRate}%</p>
          </div>
        </div>
      </div>

      {/* Card info */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Hạn mức</p>
            <p className="text-sm font-bold text-gray-900">
              {(Number(cardType.creditLimit) / 1_000_000).toFixed(0)}M VND
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Phí năm</p>
            <p className="text-sm font-bold text-gray-900">
              {cardType.annualFee === 0
                ? "Miễn phí"
                : (Number(cardType.annualFee) / 1_000_000).toFixed(1) + "M"}
            </p>
          </div>
        </div>

        {cardType.description && (
          <p className="text-xs text-gray-600 mb-4 line-clamp-2">
            {cardType.description}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/card-detail/${cardType.id}`)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <FiEye size={16} />
            Xem chi tiết
          </button>
          <button
            onClick={() => navigate(`/apply-card/${cardType.id}`)}
            className="flex-1 bg-gradient-to-r from-green-400 to-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FiCheck size={16} />
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function CardCatalogPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cardTypes, setCardTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState([]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleCompareToggle = (cardId) => {
    setCompareList((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      } else {
        if (prev.length >= 3) {
          toast.error("Chỉ có thể chọn tối đa 3 thẻ để so sánh.");
          return prev;
        }
        return [...prev, cardId];
      }
    });
  };

  const handleCompare = () => {
    if (compareList.length < 2) {
      toast.error("Vui lòng chọn ít nhất 2 thẻ để so sánh.");
      return;
    }
    navigate(`/compare-cards?ids=${compareList.join(",")}`);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllCardTypes();
        if (res.success) {
          setCardTypes(res.data);
        } else {
          toast.error(res.message);
        }
      } catch {
        toast.error("Không thể tải danh sách loại thẻ.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sidebarItems = [
    { icon: <FiHome size={18} />,       label: "Bảng điều khiển", path: "/dashboard" },
    { icon: <FiUser size={18} />,       label: "Tài khoản",       path: null },
    { icon: <FiCreditCard size={18} />, label: "Thẻ",             path: "/cards" },
    { icon: <FiActivity size={18} />,   label: "Giao dịch",       path: null },
    { icon: <FiSave size={18} />,       label: "Tiết kiệm",       path: null },
    { icon: <FiDollarSign size={18} />, label: "Khoản vay",       path: null },
    { icon: <FiMessageCircle size={18} />, label: "Hỗ trợ",       path: "/chat" },
    { icon: <FiSettings size={18} />,   label: "Cài đặt",         path: null },
  ];

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
      <div className="flex-1 p-8 overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => navigate("/cards")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
              >
                <FiArrowLeft size={20} />
                <span className="font-medium">Quay lại thẻ của tôi</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Chọn loại thẻ tín dụng</h1>
              <p className="text-gray-500">Khám phá và đăng ký loại thẻ phù hợp với bạn</p>
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
          {!loading && cardTypes.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Tổng loại thẻ</p>
                <p className="text-2xl font-bold text-gray-900">{cardTypes.length}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Hạn mức cao nhất</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.max(...cardTypes.map(c => Number(c.creditLimit))) / 1_000_000}M VND
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Hoàn tiền cao nhất</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.max(...cardTypes.map(c => c.cashbackRate))}%
                </p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Đang tải danh sách loại thẻ...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && cardTypes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiCreditCard size={36} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có loại thẻ nào</h3>
              <p className="text-gray-500 text-center max-w-xs">
                Hiện tại chưa có loại thẻ nào có sẵn. Vui lòng quay lại sau.
              </p>
            </div>
          )}

          {/* Card types grid */}
          {!loading && cardTypes.length > 0 && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Các loại thẻ có sẵn</h2>
                  <p className="text-sm text-gray-500">
                    {cardTypes.length} loại thẻ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cardTypes.map((cardType) => (
                    <CardTypeCard
                      key={cardType.id}
                      cardType={cardType}
                      isComparing={compareList.includes(cardType.id)}
                      onCompareToggle={handleCompareToggle}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      {/* ── Floating Compare Bar ── */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FiBarChart2 size={24} className="text-blue-600" />
                  <div>
                    <p className="font-bold text-gray-900">So sánh thẻ tín dụng</p>
                    <p className="text-sm text-gray-600">
                      Đã chọn {compareList.length}/3 thẻ
                    </p>
                  </div>
                </div>

                {/* Selected cards preview */}
                <div className="flex gap-2 ml-4">
                  {compareList.map((id) => {
                    const card = cardTypes.find((c) => c.id === id);
                    if (!card) return null;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm font-medium text-blue-900">{card.cardName}</span>
                        <button
                          onClick={() => handleCompareToggle(id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCompareList([])}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Xóa tất cả
                </button>
                <button
                  onClick={handleCompare}
                  disabled={compareList.length < 2}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg"
                >
                  <FiBarChart2 size={18} />
                  So sánh ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
