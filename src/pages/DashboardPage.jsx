import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome, FiUser, FiCreditCard, FiActivity, FiSave,
  FiDollarSign, FiSettings, FiLogOut, FiSend, FiFileText,
  FiSmartphone, FiTrendingUp, FiPhone, FiMail, FiChevronRight,
  FiBell, FiEye, FiEyeOff, FiMessageCircle
} from "react-icons/fi";
import Logo from "../components/Logo";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get current date
  const getCurrentDate = () => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `Hôm nay là ${dayName}, ngày ${day} tháng ${month} năm ${year}`;
  };

  const sidebarItems = [
    { icon: <FiHome size={18} />,       label: "Bảng điều khiển", path: "/dashboard", active: true },
    { icon: <FiUser size={18} />,       label: "Tài khoản",       path: null },
    { icon: <FiCreditCard size={18} />, label: "Thẻ",             path: "/cards" },
    { icon: <FiActivity size={18} />,   label: "Giao dịch",       path: null },
    { icon: <FiSave size={18} />,       label: "Tiết kiệm",       path: null },
    { icon: <FiDollarSign size={18} />, label: "Khoản vay",       path: null },
    { icon: <FiMessageCircle size={18} />, label: "Hỗ trợ",       path: "/chat" },
    { icon: <FiSettings size={18} />,   label: "Cài đặt",         path: null },
  ];

  const quickActions = [
    { icon: <FiSend size={20} />, label: "Chuyển tiền", bg: "bg-blue-100", text: "text-blue-600" },
    { icon: <FiFileText size={20} />, label: "Hóa đơn", bg: "bg-green-100", text: "text-green-600" },
    { icon: <FiSmartphone size={20} />, label: "Nạp ĐT", bg: "bg-purple-100", text: "text-purple-600" },
    { icon: <FiTrendingUp size={20} />, label: "Tiết kiệm", bg: "bg-orange-100", text: "text-orange-600" },
  ];

  const recentTransactions = [
    { id: 1, type: "Chuyển tiền", amount: "-2,500,000", date: "24/05/2024", status: "Thành công" },
    { id: 2, type: "Nạp tiền điện thoại", amount: "-100,000", date: "23/05/2024", status: "Thành công" },
    { id: 3, type: "Thanh toán hóa đơn điện", amount: "-450,000", date: "23/05/2024", status: "Thành công" },
    { id: 4, type: "Nhận tiền từ ABC Bank", amount: "+5,000,000", date: "22/05/2024", status: "Thành công" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Logo className="w-32 h-32" showText={false} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    item.active
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
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

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Content Area */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Chào mừng trở lại, {user?.name || 'Alex'}!
              </h1>
              <p className="text-gray-600">
                {getCurrentDate()}. Chúc bạn một ngày tốt lành.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FiBell size={20} className="text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Hạn mức khả dụng</h3>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 hover:bg-white/20 rounded"
              >
                {showBalance ? <FiEye size={18} /> : <FiEyeOff size={18} />}
              </button>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold mb-1">
                  {showBalance ? '125.450.000 VND' : '••••••••••'}
                </p>
                <p className="text-green-100 text-sm">Số dư khả dụng</p>
              </div>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                Thanh toán thẻ
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động nhanh</h3>
            <div className="grid grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
                >
                  <div className={`w-12 h-12 ${action.bg} ${action.text} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    {action.icon}
                  </div>
                  <p className="font-medium text-gray-900">{action.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
              <button className="text-green-600 font-medium hover:text-green-700">
                Xem tất cả
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {recentTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== recentTransactions.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FiActivity size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.type}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {transaction.amount} VND
                    </p>
                    <p className="text-sm text-green-500">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          {/* My Cards */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thẻ của tôi</h3>
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-gray-300 text-sm">MasterCredit</p>
                  <p className="text-gray-300 text-sm">PLATINUM</p>
                </div>
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-1">Số thẻ</p>
                <p className="text-lg font-mono">**** **** **** 8742</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-300">CHỦ THẺ</p>
                  <p className="text-sm font-semibold">{user?.name?.toUpperCase() || 'ALEX NGUYEN'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-300">HẾT HẠN</p>
                  <p className="text-sm font-semibold">12/27</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Spending */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiêu tháng này</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600">Đã chi tiêu</p>
                <p className="font-semibold">12.450.000 VND</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-sm text-gray-500">65% của hạn mức tháng</p>
            </div>
          </div>

          {/* Savings Goal */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mục tiêu tiết kiệm</h3>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FiTrendingUp size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mua xe hơi</p>
                  <p className="text-sm text-gray-500">Mục tiêu: 500.000.000 VND</p>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">200.000.000 VND</p>
                <p className="text-sm text-gray-600">40%</p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">CẦN HỖ TRỢ?</h4>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <FiPhone size={16} className="text-green-600" />
                  <span className="text-sm font-medium">Gọi ngay</span>
                </div>
                <FiChevronRight size={16} className="text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <FiMail size={16} className="text-green-600" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <FiChevronRight size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}