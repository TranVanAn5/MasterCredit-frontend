import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiHome, FiCreditCard, FiEye, FiCheck, FiArrowLeft, FiSearch, FiFilter
} from "react-icons/fi";
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

// ── Card Type Card Component ──────────────────────────────
function PublicCardTypeCard({ cardType }) {
  const style = cardStyle(cardType.cardName);
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200">
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
            Chi tiết
          </button>
          <button
            onClick={() => navigate('/login')}
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
export default function PublicCardsPage() {
  const navigate = useNavigate();
  const [cardTypes, setCardTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCards, setFilteredCards] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllCardTypes();
        if (res.success) {
          setCardTypes(res.data);
          setFilteredCards(res.data);
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

  // Filter cards based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCards(cardTypes);
    } else {
      const filtered = cardTypes.filter(card =>
        card.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.cardNetwork.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCards(filtered);
    }
  }, [searchTerm, cardTypes]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Back button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft size={20} />
                <span className="font-medium">Quay lại</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <Logo className="w-32 h-32" showText={false} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách thẻ tín dụng</h1>
          <p className="text-gray-600">Khám phá và so sánh các loại thẻ tín dụng MasterCredit</p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên thẻ, mạng lưới..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
              <FiFilter size={18} />
              Lọc
            </button>
          </div>
        </div>

        {/* Summary stats */}
        {!loading && cardTypes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
        {!loading && filteredCards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiCreditCard size={36} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "Không tìm thấy kết quả" : "Chưa có loại thẻ nào"}
            </h3>
            <p className="text-gray-500 text-center max-w-xs">
              {searchTerm
                ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
                : "Hiện tại chưa có loại thẻ nào có sẵn. Vui lòng quay lại sau."
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        )}

        {/* Card types grid */}
        {!loading && filteredCards.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {searchTerm ? `Kết quả tìm kiếm (${filteredCards.length})` : "Các loại thẻ có sẵn"}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredCards.length} loại thẻ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCards.map((cardType) => (
                <PublicCardTypeCard
                  key={cardType.id}
                  cardType={cardType}
                />
              ))}
            </div>
          </div>
        )}

        {/* Call to action */}
        {!loading && filteredCards.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Sẵn sàng đăng ký thẻ tín dụng MasterCredit?
            </h3>
            <p className="text-green-100 mb-6">
              Đăng ký ngay hôm nay để tận hưởng những ưu đãi tốt nhất và dịch vụ chuyên nghiệp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-green-600 px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Tạo tài khoản ngay
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-white/10 border border-white/30 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                Đã có tài khoản? Đăng nhập
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}