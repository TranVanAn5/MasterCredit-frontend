import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiHome, FiUser, FiCreditCard, FiActivity, FiSave,
  FiDollarSign, FiSettings, FiLogOut, FiBell,
  FiArrowLeft, FiCheck, FiStar, FiShield, FiZap,
  FiTrendingUp, FiGift, FiPhone, FiMail, FiChevronRight
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getCardTypeById } from "../services/cardService";
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

// ── Main Page ─────────────────────────────────────────────
export default function CardDetailPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [cardType, setCardType] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => { logout(); navigate("/login"); };

  useEffect(() => {
    (async () => {
      try {
        if (!id) {
          toast.error("ID thẻ không hợp lệ.");
          navigate("/browse-cards");
          return;
        }

        const res = await getCardTypeById(parseInt(id, 10));
        if (res.success) {
          setCardType(res.data);
        } else {
          toast.error(res.message);
          navigate("/browse-cards");
        }
      } catch {
        toast.error("Không thể tải thông tin thẻ.");
        navigate("/browse-cards");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const sidebarItems = [
    { icon: <FiHome size={18} />,       label: "Bảng điều khiển", path: "/dashboard" },
    { icon: <FiUser size={18} />,       label: "Tài khoản",       path: null },
    { icon: <FiCreditCard size={18} />, label: "Thẻ",             path: "/cards" },
    { icon: <FiActivity size={18} />,   label: "Giao dịch",       path: null },
    { icon: <FiSave size={18} />,       label: "Tiết kiệm",       path: null },
    { icon: <FiDollarSign size={18} />, label: "Khoản vay",       path: null },
    { icon: <FiSettings size={18} />,   label: "Cài đặt",         path: null },
  ];

  const style = cardType ? cardStyle(cardType.cardName) : null;

  // Sample benefits - có thể extend thêm từ database sau
  const benefits = [
    { icon: <FiStar className="text-yellow-500" />, title: "Ưu đãi độc quyền", desc: "Giảm giá tại hàng nghìn đối tác" },
    { icon: <FiShield className="text-blue-500" />, title: "Bảo hiểm toàn diện", desc: "Bảo vệ tài chính 24/7" },
    { icon: <FiZap className="text-orange-500" />, title: "Duyệt nhanh 24h", desc: "Nhận thẻ trong 1-2 ngày làm việc" },
    { icon: <FiTrendingUp className="text-green-500" />, title: "Tích điểm nhanh", desc: "Quy đổi điểm thành tiền mặt" },
    { icon: <FiGift className="text-pink-500" />, title: "Quà tặng hấp dẫn", desc: "Nhận quà khi mở thẻ mới" },
  ];

  const features = [
    { label: "Rút tiền mặt", value: "Tối đa 50% hạn mức" },
    { label: "Miễn lãi", value: "Lên đến 45 ngày" },
    { label: "Trả góp 0%", value: "Tại các đối tác liên kết" },
    { label: "Bảo hiểm mua hàng", value: "Lên đến 50 triệu VND" },
    { label: "Hỗ trợ khẩn cấp", value: "24/7 toàn cầu" },
    { label: "Thanh toán quốc tế", value: "Tại hơn 200 quốc gia" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Conditional Layout based on login status */}
      {user ? (
        // Logged in user layout with sidebar
        <div className="flex">
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

          {/* ── Main Content for logged in users ── */}
          <div className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/browse-cards")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
            >
              <FiArrowLeft size={20} />
              <span className="font-medium">Quay lại danh sách</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Chi tiết thẻ tín dụng</h1>
            <p className="text-gray-500">Thông tin đầy đủ về loại thẻ</p>
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
            <p className="text-gray-500">Đang tải thông tin thẻ...</p>
          </div>
        )}

        {/* Detail Content */}
        {!loading && cardType && (
          <div className="space-y-6">

            {/* Hero Section - Card Visual + Quick Info */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className={`p-8 bg-gradient-to-br ${style.bg} text-white relative`}>
                <div className="max-w-5xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Card Preview */}
                    <div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">MasterCredit</p>
                            <p className="text-lg font-bold tracking-wide mt-1">{cardType.cardName.toUpperCase()}</p>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.badge} text-white/90`}>
                            {style.label}
                          </span>
                        </div>
                        <div className="mb-6">
                          <p className="font-mono text-2xl tracking-[0.25em] text-white/80">
                            •••• •••• •••• ••••
                          </p>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Network</p>
                            <p className="text-base font-semibold uppercase">{cardType.cardNetwork}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Hoàn tiền</p>
                            <p className="text-base font-semibold">{cardType.cashbackRate}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold mb-4">{cardType.cardName}</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <p className="text-xs text-white/70 mb-1">Hạn mức tín dụng</p>
                          <p className="text-xl font-bold">{(Number(cardType.creditLimit) / 1_000_000).toFixed(0)}M VND</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <p className="text-xs text-white/70 mb-1">Phí thường niên</p>
                          <p className="text-xl font-bold">
                            {cardType.annualFee === 0 ? "Miễn phí" : (Number(cardType.annualFee) / 1_000_000).toFixed(1) + "M"}
                          </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <p className="text-xs text-white/70 mb-1">Hoàn tiền</p>
                          <p className="text-xl font-bold">{cardType.cashbackRate}%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <p className="text-xs text-white/70 mb-1">Mạng lưới</p>
                          <p className="text-xl font-bold">{cardType.cardNetwork}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/apply-card/${id}`)}
                        className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2 mt-6">
                        <FiCheck size={20} />
                        Đăng ký ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {cardType.description && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Mô tả</h3>
                <p className="text-gray-700 leading-relaxed">{cardType.description}</p>
              </div>
            )}

            {/* Benefits Grid */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quyền lợi nổi bật</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{benefit.title}</p>
                      <p className="text-sm text-gray-600">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900">Tính năng chi tiết</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-700">{feature.label}</span>
                    <span className="text-green-600 font-semibold">{feature.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Sẵn sàng đăng ký thẻ này?</h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Hoàn thành hồ sơ trong 5 phút và nhận thẻ trong vòng 1-2 ngày làm việc.
                  Đăng ký ngay để tận hưởng các ưu đãi hấp dẫn!
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => navigate(`/apply-card/${id}`)}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center gap-2">
                    <FiCheck size={20} />
                    Đăng ký ngay
                  </button>
                  <button
                    onClick={() => navigate("/browse-cards")}
                    className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-colors border-2 border-gray-300"
                  >
                    Xem thẻ khác
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── Right Sidebar ── */}
      <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col gap-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Hành động nhanh</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/apply-card/${id}`)}
              className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
              <FiCheck size={18} className="text-green-600" />
              <span className="font-medium text-green-700">Đăng ký thẻ này</span>
            </button>
            <button
              onClick={() => navigate("/browse-cards")}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <FiCreditCard size={18} className="text-gray-600" />
              <span className="font-medium text-gray-700">So sánh với thẻ khác</span>
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-green-50 rounded-xl p-4 mt-auto">
          <h4 className="font-semibold text-gray-900 mb-3">CẦN TƯ VẤN?</h4>
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
      ) : (
        // Public user layout without sidebar
        <div>
          {/* Public Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo & Back button */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate("/browse-cards")}
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

          {/* Public Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500">Đang tải thông tin thẻ...</p>
              </div>
            )}

            {/* Detail Content */}
            {!loading && cardType && (
              <div className="space-y-6">

                {/* Hero Section - Card Visual + Quick Info */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className={`p-8 bg-gradient-to-br ${style.bg} text-white relative`}>
                    <div className="max-w-5xl mx-auto">
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Card Preview */}
                        <div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">MasterCredit</p>
                                <p className="text-lg font-bold tracking-wide mt-1">{cardType.cardName.toUpperCase()}</p>
                              </div>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.badge} text-white/90`}>
                                {style.label}
                              </span>
                            </div>
                            <p className="font-mono text-lg tracking-widest mb-6 text-white/80">
                              •••• •••• •••• ••••
                            </p>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-xs text-white/60 uppercase tracking-widest">Network</p>
                                <p className="text-sm font-semibold">{cardType.cardNetwork}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-white/60 uppercase tracking-widest">Hoàn tiền</p>
                                <p className="text-sm font-semibold">{cardType.cashbackRate}%</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Key Stats */}
                        <div className="space-y-4">
                          <h1 className="text-3xl font-bold mb-2">{cardType.cardName}</h1>
                          <p className="text-white/80 text-lg mb-6">{cardType.description}</p>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                              <p className="text-white/60 text-sm">Hạn mức</p>
                              <p className="text-xl font-bold">{fmt(cardType.creditLimit)}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                              <p className="text-white/60 text-sm">Phí thường niên</p>
                              <p className="text-xl font-bold">
                                {cardType.annualFee === 0 ? "Miễn phí" : fmt(cardType.annualFee)}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-4 mt-6">
                            <button
                              onClick={() => navigate('/login')}
                              className="flex-1 bg-white text-gray-800 py-3 px-6 rounded-xl font-bold hover:shadow-lg transition-all"
                            >
                              Đăng ký ngay
                            </button>
                            <button
                              onClick={() => navigate('/browse-cards')}
                              className="flex-1 bg-white/10 border border-white/30 text-white py-3 px-6 rounded-xl font-bold hover:bg-white/20 transition-all"
                            >
                              So sánh thẻ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-100">
                    <div className="p-6">
                      <p className="text-sm text-gray-500 mb-1">Hạn mức tín dụng</p>
                      <p className="text-lg font-bold text-gray-900">{fmt(cardType.creditLimit)}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-500 mb-1">Phí thường niên</p>
                      <p className="text-lg font-bold text-gray-900">
                        {cardType.annualFee === 0 ? "Miễn phí" : fmt(cardType.annualFee)}
                      </p>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-500 mb-1">Hoàn tiền</p>
                      <p className="text-lg font-bold text-green-600">{cardType.cashbackRate}%</p>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-500 mb-1">Mạng lưới</p>
                      <p className="text-lg font-bold text-gray-900">{cardType.cardNetwork}</p>
                    </div>
                  </div>
                </div>

                {/* Benefits & Features Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Benefits */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quyền lợi nổi bật</h2>
                    <div className="space-y-4">
                      {benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 flex items-center justify-center">{benefit.icon}</div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">{benefit.title}</p>
                            <p className="text-sm text-gray-600">{benefit.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Tính năng đặc biệt</h2>
                    <div className="space-y-3">
                      {features.map((feature, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                          <span className="text-gray-700">{feature.label}</span>
                          <span className="font-semibold text-gray-900">{feature.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Sẵn sàng đăng ký {cardType.cardName}?
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
