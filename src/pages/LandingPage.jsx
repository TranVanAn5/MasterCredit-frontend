import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCreditCard, FiDollarSign, FiUser, FiSave, FiMessageCircle, FiSmartphone,
  FiChevronLeft, FiChevronRight, FiStar, FiShield, FiTrendingUp, FiGift,
  FiPhone, FiMail, FiMapPin, FiArrowRight, FiPlay, FiCheck, FiMenu, FiX
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getAllCardTypes } from "../services/cardService";
import Logo from "../components/Logo";

// Card styling helper
const getCardGradient = (cardName) => {
  const name = cardName?.toLowerCase() || '';
  if (name.includes('platinum')) return 'from-gray-700 via-gray-800 to-gray-900';
  if (name.includes('gold')) return 'from-yellow-500 via-amber-500 to-orange-500';
  if (name.includes('business')) return 'from-blue-700 via-blue-800 to-blue-900';
  return 'from-slate-500 via-slate-600 to-slate-700';
};

export default function LandingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cardTypes, setCardTypes] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auto logout when entering LandingPage
  useEffect(() => {
    if (user) {
      logout();
    }
  }, [user, logout]);

  // Banner slides
  const banners = [
    {
      title: "Hoàn đến 5% cao nhất thị trường",
      subtitle: "Bộ Thẻ Thanh toán Quốc tế Nexus với đặc quyền ưu đãi vượt trội cho chủ thẻ.",
      buttonText: "Xem chi tiết",
      action: () => navigate('/browse-cards')
    },
    {
      title: "Đăng ký online nhanh chóng",
      subtitle: "Chỉ 7 bước đơn giản, phê duyệt tự động trong 24h. Nhận thẻ ngay sau khi đăng ký.",
      buttonText: "Đăng ký ngay",
      action: () => navigate('/login')
    },
    {
      title: "Ưu đãi đặc biệt tháng này",
      subtitle: "Miễn phí thường niên năm đầu + Cashback 10% cho 5 giao dịch đầu tiên.",
      buttonText: "Tham gia ngay",
      action: () => navigate('/browse-cards')
    }
  ];

  // Services
  const services = [
    { icon: <FiCreditCard size={32} />, label: "Thẻ tín dụng", badge: null, path: "/browse-cards" },
    { icon: <FiDollarSign size={32} />, label: "Thẻ thanh toán", badge: "NEW", path: "/browse-cards" },
    { icon: <FiUser size={32} />, label: "Tài khoản", badge: "HOT", path: "/login" },
    { icon: <FiSave size={32} />, label: "Tiền gửi", badge: null, path: null },
    { icon: <FiMessageCircle size={32} />, label: "Hỗ trợ", badge: null, path: "/login" },
    { icon: <FiSmartphone size={32} />, label: "Ngân hàng số", badge: null, path: null }
  ];

  // Featured offers
  const offers = [
    {
      title: "Nạp điện thoại giảm 50%",
      description: "Dành cho Khách hàng mới trên MyNexus số dụng thuê bao trả trước",
      action: "Xem chi tiết",
      image: "💱"
    },
    {
      title: "Hoàn tiền đến 1 triệu đồng",
      description: "Khi chi tiêu với thẻ thanh toán Nexus tại các cửa hàng liên kết",
      action: "Xem chi tiết",
      image: "💰"
    },
    {
      title: "Miễn phí buffet tại Haidilao",
      description: "Khi chi tiêu thẻ tín dụng Nexus Premium Boundless trên toàn quốc",
      action: "Xem chi tiết",
      image: "🍲"
    }
  ];

  useEffect(() => {
    // Load card types
    (async () => {
      try {
        const res = await getAllCardTypes();
        if (res.success) {
          setCardTypes(res.data);
        }
      } catch (error) {
        console.error('Error loading card types:', error);
      }
    })();
  }, []);

  // Auto slide banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Auto slide cards
  useEffect(() => {
    if (cardTypes.length > 0) {
      const interval = setInterval(() => {
        setCurrentCardIndex(prev => prev + 1);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [cardTypes.length]);

  // Reset index for infinite scroll
  useEffect(() => {
    if (cardTypes.length > 0 && currentCardIndex >= cardTypes.length) {
      const timer = setTimeout(() => {
        setCurrentCardIndex(0);
      }, 500); // Wait for transition to complete
      return () => clearTimeout(timer);
    }
  }, [currentCardIndex, cardTypes.length]);

  const handleServiceClick = (service) => {
    if (service.path) {
      navigate(service.path);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <Logo className="w-32 h-32" showText={false} />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => navigate('/browse-cards')} className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Sản phẩm
              </button>
              <button className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Khuyến mãi
              </button>
              <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Hỗ trợ
              </button>
              <button className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Về chúng tôi
              </button>
            </nav>

            {/* Always show Login/Register */}
            <div className="hidden md:flex items-center space-x-4">
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

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t">
            <div className="px-4 py-2 space-y-2">
              <button onClick={() => navigate('/browse-cards')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">
                Sản phẩm
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">
                Khuyến mãi
              </button>
              <button onClick={() => navigate('/login')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">
                Hỗ trợ
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">
                Về chúng tôi
              </button>
              <div className="pt-2 border-t">
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="block w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Đăng ký
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-green-500 to-green-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1 text-white mb-10 lg:mb-0">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                {banners[currentBannerIndex].title}
              </h1>
              <p className="text-lg lg:text-xl mb-8 text-green-100 max-w-2xl">
                {banners[currentBannerIndex].subtitle}
              </p>
              <button
                onClick={banners[currentBannerIndex].action}
                className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all inline-flex items-center gap-2 text-lg"
              >
                {banners[currentBannerIndex].buttonText}
                <FiArrowRight size={20} />
              </button>
            </div>

            {/* Card Preview */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 border border-white/30">
                  <div className="w-full h-48 bg-white/10 rounded-2xl border-2 border-white/50 flex items-center justify-center text-white/60">
                    <FiCreditCard size={64} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Indicators */}
          <div className="flex justify-center mt-12 space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentBannerIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Slide Navigation */}
        <button
          onClick={() => setCurrentBannerIndex(prev => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={() => setCurrentBannerIndex(prev => (prev + 1) % banners.length)}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
        >
          <FiChevronRight size={24} />
        </button>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {services.map((service, index) => (
              <button
                key={index}
                onClick={() => handleServiceClick(service)}
                className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all text-center border hover:border-orange-200"
              >
                <div className="flex justify-center mb-4 text-gray-600 group-hover:text-orange-500 transition-colors">
                  {service.icon}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {service.label}
                </h3>
                {service.badge && (
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full ${
                    service.badge === 'NEW' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {service.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Hệ sinh thái MasterCredit
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Tạo tài khoản MasterCredit
            </button>
            <button
              onClick={() => navigate('/browse-cards')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold transition-all"
            >
              Xem sản phẩm thẻ
            </button>
          </div>
        </div>
      </section>

      {/* Chat Assistant */}
      <section className="py-16 bg-gradient-to-br from-green-500 to-green-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1 mb-10 lg:mb-0 lg:mr-10">
              <div className="relative">
                {/* iPhone mockup */}
                <div className="w-72 h-[580px] bg-black rounded-[3rem] p-2 mx-auto relative shadow-2xl">
                  {/* Screen */}
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col relative">

                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20">
                      {/* Speaker */}
                      <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-800 rounded-full"></div>
                      {/* Front camera */}
                      <div className="absolute top-1 right-3 w-2 h-2 bg-gray-900 rounded-full"></div>
                    </div>

                    {/* Status bar */}
                    <div className="flex justify-between items-center px-6 pt-8 pb-2 text-black text-sm font-medium">
                      <div>9:41</div>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-black rounded-full"></div>
                          <div className="w-1 h-1 bg-black rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="ml-1 text-xs">📶</div>
                        <div className="text-xs">🔋</div>
                      </div>
                    </div>

                    {/* App content */}
                    <div className="flex-1 flex items-center justify-center flex-col px-6">
                      {/* App icon */}
                      <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-3xl mb-6 shadow-lg">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                          <Logo className="w-32 h-32" showText={false} />
                        </div>
                      </div>

                      {/* App name */}
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">MasterCredit</h4>
                      <p className="text-gray-600 text-center text-sm mb-6 leading-relaxed">
                        Ngân hàng số thông minh<br />
                        Quản lý tài chính dễ dàng
                      </p>

                      {/* QR Code placeholder */}
                      <div className="bg-gray-100 rounded-2xl p-4 mb-4">
                        <div className="w-32 h-32 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
                          <div className="grid grid-cols-8 gap-1">
                            {Array.from({ length: 64 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} rounded-sm`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 text-center">
                        Quét mã để tải ứng dụng
                      </p>
                    </div>

                    {/* Home indicator */}
                    <div className="flex justify-center pb-2">
                      <div className="w-32 h-1 bg-black rounded-full opacity-60"></div>
                    </div>
                  </div>

                  {/* Side buttons */}
                  <div className="absolute -left-0.5 top-20 w-1 h-8 bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute -left-0.5 top-32 w-1 h-12 bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute -left-0.5 top-48 w-1 h-12 bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute -right-0.5 top-32 w-1 h-16 bg-gray-700 rounded-r-sm"></div>
                </div>
              </div>
            </div>

            <div className="flex-1 text-white text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Xin chào bạn!
              </h2>
              <p className="text-xl text-green-100 mb-8">
                Tôi nay bạn muốn tìm kiếm gì?
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
                <div className="flex items-center gap-4">
                  <FiMessageCircle size={24} className="text-green-200" />
                  <input
                    type="text"
                    placeholder="Tôi đang cần..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-green-200"
                    onFocus={() => navigate('/login')}
                  />
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-white text-green-600 p-2 rounded-lg hover:shadow-lg transition-all"
                  >
                    <FiArrowRight size={20} />
                  </button>
                </div>
              </div>

              
              
            </div>
          </div>
        </div>
      </section>

      {/* Featured Offers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Ưu đãi nổi bật
            </h2>
            <button className="text-orange-500 hover:text-orange-600 font-semibold inline-flex items-center gap-2">
              Xem tất cả <FiArrowRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offers.map((offer, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-6xl">
                  {offer.image}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {offer.description}
                  </p>
                  <button className="text-orange-500 hover:text-orange-600 font-semibold inline-flex items-center gap-2">
                    {offer.action} <FiArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Card Types */}
      <section className="py-16 bg-gradient-to-br from-green-500 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Các Loại Thẻ MasterCredit
            </h2>
            <div className="flex gap-2">
              <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all">
                Thẻ tín dụng
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white/70 p-2 rounded-lg transition-all">
                Thẻ thanh toán
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentCardIndex * 320}px)`
              }}
            >
              {/* Create extended array for infinite scroll */}
              {[...cardTypes, cardTypes[0] || {}].map((card, index) => {
                const actualIndex = index % cardTypes.length;
                const isClone = index >= cardTypes.length;

                return (
                  <div
                    key={isClone ? `clone-${actualIndex}` : index}
                    className={`flex-none w-80 transition-all duration-300 ${
                      index === currentCardIndex ? 'scale-105' : 'scale-95 opacity-60'
                    }`}
                  >
                    <div className="bg-white rounded-3xl p-8 shadow-xl">
                      <div className={`h-48 bg-gradient-to-br ${getCardGradient(card.cardName)} rounded-2xl p-6 text-white relative mb-6`}>
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">MasterCredit</p>
                            <p className="text-lg font-bold tracking-wide mt-1">{card.cardName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/60">Hoàn tiền</p>
                            <p className="text-lg font-bold">{card.cashbackRate}%</p>
                          </div>
                        </div>
                        <p className="font-mono text-lg tracking-widest text-white/80 mb-4">
                          •••• •••• •••• ••••
                        </p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-white/60 uppercase">Network</p>
                            <p className="text-sm font-semibold">{card.cardNetwork}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hạn mức</span>
                          <span className="font-bold">
                            {(Number(card.creditLimit) / 1_000_000).toFixed(0)}M VND
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phí thường niên</span>
                          <span className="font-bold">
                            {card.annualFee === 0 ? 'Miễn phí' : `${(Number(card.annualFee) / 1_000_000).toFixed(1)}M VND`}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-4 rounded-xl font-bold mt-6 hover:shadow-lg transition-all"
                      >
                        Đăng ký ngay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation arrows */}
            <button
              onClick={() => {
                if (currentCardIndex <= 0) {
                  setCurrentCardIndex(cardTypes.length - 1);
                } else {
                  setCurrentCardIndex(prev => prev - 1);
                }
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrentCardIndex(prev => prev + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Products */}
            <div>
              <h3 className="font-bold text-lg mb-4">Sản phẩm</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/browse-cards')} className="text-gray-400 hover:text-white transition-colors">Thẻ tín dụng</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Tài khoản</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Tiết kiệm</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Vay</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Bảo hiểm</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Nguồn vốn và ngoại hối</button></li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h3 className="font-bold text-lg mb-4">Thông tin khác</h3>
              <ul className="space-y-2">
                <li><button className="text-gray-400 hover:text-white transition-colors">Về chúng tôi</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Nhà đầu tư</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Tuyển dụng</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Ưu đãi</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Tin tức</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-lg mb-4">Hỗ trợ</h3>
              <ul className="space-y-2">
                <li><button className="text-gray-400 hover:text-white transition-colors">Liên hệ</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Tỷ giá</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Điều khoản sử dụng</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">An toàn bảo mật</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Sơ đồ trang</button></li>
                <li><button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white transition-colors">Góp ý Website MasterCredit</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4">Liên hệ</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiMapPin size={20} className="text-green-500" />
                  <div>
                    <p className="font-semibold">ATM & Chi nhánh</p>
                    <p className="text-gray-400 text-sm">Tìm địa điểm gần nhất</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone size={20} className="text-green-500" />
                  <div>
                    <p className="font-semibold">Tổng đài 1800 1234</p>
                    <p className="text-gray-400 text-sm">Hỗ trợ 24/7</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold mb-2">Ngân hàng di động MasterCredit</p>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                      <FiSmartphone size={16} />
                    </div>
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                      <FiSmartphone size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MasterCredit. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}