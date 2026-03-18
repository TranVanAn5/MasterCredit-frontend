import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiHome, FiUser, FiCreditCard, FiActivity, FiSave,
  FiDollarSign, FiSettings, FiLogOut, FiBell,
  FiCheck, FiX, FiArrowLeft, FiAward
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { compareCardTypes } from "../services/cardService";
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

// ── Comparison Feature Row ────────────────────────────────
function ComparisonRow({ label, values, highlight = false, type = "text" }) {
  // Find best value for highlighting
  let bestIndex = -1;
  if (highlight) {
    if (type === "number") {
      const max = Math.max(...values.map(v => Number(v) || 0));
      bestIndex = values.findIndex(v => Number(v) === max);
    } else if (type === "fee") {
      const min = Math.min(...values.map(v => Number(v) || Infinity));
      bestIndex = values.findIndex(v => Number(v) === min);
    }
  }

  const gridColsClass = values.length === 2 ? "grid-cols-2" : values.length === 3 ? "grid-cols-3" : "grid-cols-1";

  return (
    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100">
      <div className="p-4 bg-gray-50 font-semibold text-gray-700 border-r border-gray-100">
        {label}
      </div>
      <div className={`grid ${gridColsClass} divide-x divide-gray-100`}>
        {values.map((value, idx) => (
          <div
            key={idx}
            className={`p-4 text-center font-medium ${
              bestIndex === idx
                ? "bg-green-50 text-green-700 font-bold"
                : "text-gray-900"
            }`}
          >
            {type === "check" ? (
              value ? (
                <FiCheck size={20} className="mx-auto text-green-600" />
              ) : (
                <FiX size={20} className="mx-auto text-gray-400" />
              )
            ) : (
              value
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function CardComparePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => { logout(); navigate("/login"); };

  useEffect(() => {
    (async () => {
      try {
        const ids = searchParams.get("ids");
        if (!ids) {
          toast.error("Không có thẻ nào được chọn để so sánh.");
          navigate("/browse-cards");
          return;
        }

        const cardTypeIds = ids.split(",").map(id => parseInt(id, 10));

        if (cardTypeIds.length < 2 || cardTypeIds.length > 3) {
          toast.error("Vui lòng chọn 2-3 thẻ để so sánh.");
          navigate("/browse-cards");
          return;
        }

        const res = await compareCardTypes(cardTypeIds);
        if (res.success) {
          setCards(res.data);
        } else {
          toast.error(res.message);
          navigate("/browse-cards");
        }
      } catch (err) {
        toast.error("Không thể tải thông tin so sánh.");
        navigate("/browse-cards");
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, navigate]);

  const sidebarItems = [
    { icon: <FiHome size={18} />,       label: "Bảng điều khiển", path: "/dashboard" },
    { icon: <FiUser size={18} />,       label: "Tài khoản",       path: null },
    { icon: <FiCreditCard size={18} />, label: "Thẻ",             path: "/cards" },
    { icon: <FiActivity size={18} />,   label: "Giao dịch",       path: null },
    { icon: <FiSave size={18} />,       label: "Tiết kiệm",       path: null },
    { icon: <FiDollarSign size={18} />, label: "Khoản vay",       path: null },
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
              <span className="font-medium">Quay lại danh sách</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">So sánh thẻ tín dụng</h1>
            <p className="text-gray-500">So sánh chi tiết các loại thẻ để chọn thẻ phù hợp nhất</p>
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

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Đang tải thông tin so sánh...</p>
          </div>
        )}

        {/* Comparison Content */}
        {!loading && cards.length > 0 && (
          <div className="space-y-6">

            {/* Card Visual Preview */}
            <div className={`grid gap-6 mb-8 ${cards.length === 2 ? "grid-cols-2" : cards.length === 3 ? "grid-cols-3" : "grid-cols-1"}`}>
              {cards.map((card) => {
                const style = cardStyle(card.cardName);
                return (
                  <div key={card.id} className="space-y-4">
                    <div className={`rounded-2xl p-5 text-white bg-gradient-to-br ${style.bg} shadow-lg`}>
                      {/* Badge */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">MasterCredit</p>
                          <p className="text-sm font-bold tracking-wide mt-1">{card.cardName.toUpperCase()}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${style.badge} text-white/90`}>
                          {style.label}
                        </span>
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
                          <p className="text-sm font-semibold uppercase">{card.cardNetwork}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/60 uppercase tracking-widest mb-0.5">Hoàn tiền</p>
                          <p className="text-sm font-semibold">{card.cashbackRate}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-md">
                      <FiCheck size={18} />
                      Chọn thẻ này
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiAward size={20} />
                  Bảng so sánh chi tiết
                </h2>
              </div>

              {/* Card Names Header */}
              <div className="grid grid-cols-[200px_1fr] border-b-2 border-gray-200">
                <div className="p-4 bg-gray-100 font-bold text-gray-900 border-r border-gray-200">
                  Loại thẻ
                </div>
                <div className={`grid divide-x divide-gray-200 ${cards.length === 2 ? "grid-cols-2" : cards.length === 3 ? "grid-cols-3" : "grid-cols-1"}`}>
                  {cards.map((card) => (
                    <div key={card.id} className="p-4 text-center font-bold text-gray-900 bg-gray-100">
                      {card.cardName}
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Rows */}
              <ComparisonRow
                label="Mạng lưới"
                values={cards.map(c => c.cardNetwork)}
              />
              <ComparisonRow
                label="Hạn mức tín dụng"
                values={cards.map(c => fmt(c.creditLimit))}
                highlight={true}
                type="number"
              />
              <ComparisonRow
                label="Phí thường niên"
                values={cards.map(c => c.annualFee === 0 ? "Miễn phí" : fmt(c.annualFee))}
                highlight={true}
                type="fee"
              />
              <ComparisonRow
                label="Tỷ lệ hoàn tiền"
                values={cards.map(c => c.cashbackRate + "%")}
                highlight={true}
                type="number"
              />
              <ComparisonRow
                label="Mô tả"
                values={cards.map(c => c.description || "Không có mô tả")}
              />
            </div>

            {/* Winner Recommendation */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiAward size={22} className="text-green-600" />
                Gợi ý lựa chọn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Hạn mức cao nhất</p>
                  <p className="font-bold text-green-700">
                    {cards.reduce((prev, curr) =>
                      Number(curr.creditLimit) > Number(prev.creditLimit) ? curr : prev
                    ).cardName}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Hoàn tiền tốt nhất</p>
                  <p className="font-bold text-green-700">
                    {cards.reduce((prev, curr) =>
                      curr.cashbackRate > prev.cashbackRate ? curr : prev
                    ).cardName}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Phí thấp nhất</p>
                  <p className="font-bold text-green-700">
                    {cards.reduce((prev, curr) =>
                      Number(curr.annualFee) < Number(prev.annualFee) ? curr : prev
                    ).cardName}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
