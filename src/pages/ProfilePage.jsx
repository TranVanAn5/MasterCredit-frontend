import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../services/authService";
import toast from "react-hot-toast";
import {
  FiHome, FiUser, FiCreditCard, FiActivity, FiSave,
  FiDollarSign, FiSettings, FiLogOut, FiBell, FiMail,
  FiPhone, FiCalendar, FiShield, FiCheckCircle, FiXCircle,
  FiImage, FiMessageCircle
} from "react-icons/fi";
import Logo from "../components/Logo";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        if (response.success) {
          setProfile(response.data);
        } else {
          toast.error(response.message || "Không thể tải thông tin profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Đã có lỗi xảy ra khi tải thông tin profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const sidebarItems = [
    { icon: <FiHome size={18} />,       label: "Bảng điều khiển", path: "/dashboard" },
    { icon: <FiUser size={18} />,       label: "Tài khoản",       path: "/profile", active: true },
    { icon: <FiCreditCard size={18} />, label: "Thẻ",             path: "/cards" },
    { icon: <FiActivity size={18} />,   label: "Giao dịch",       path: null },
    { icon: <FiSave size={18} />,       label: "Tiết kiệm",       path: null },
    { icon: <FiDollarSign size={18} />, label: "Khoản vay",       path: null },
    { icon: <FiMessageCircle size={18} />, label: "Hỗ trợ",       path: "/chat" },
    { icon: <FiSettings size={18} />,   label: "Cài đặt",         path: null },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Logo className="w-32 h-32" showText={false} />
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => (
              <li key={index}>
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

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Thông tin tài khoản</h1>
            <p className="text-gray-500">Quản lý thông tin cá nhân của bạn</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <FiBell size={20} className="text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Đang tải thông tin...</p>
          </div>
        )}

        {/* Profile Content */}
        {!loading && profile && (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-500 font-bold text-4xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FiMail size={16} />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone size={16} />
                      <span>{profile.phoneNumber}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium">
                      {profile.role}
                    </span>
                    {profile.isActive && (
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                        <FiCheckCircle size={14} />
                        <span>Đã kích hoạt</span>
                      </div>
                    )}
                    {profile.isEmailVerified && (
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                        <FiShield size={14} />
                        <span>Email đã xác thực</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiUser className="text-green-600" />
                  Thông tin cá nhân
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Họ và tên</label>
                    <p className="text-gray-900 font-medium">{profile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Email</label>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-medium">{profile.email}</p>
                      {profile.isEmailVerified && (
                        <FiCheckCircle className="text-green-500" size={16} />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Số điện thoại</label>
                    <p className="text-gray-900 font-medium">{profile.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Vai trò</label>
                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {profile.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiShield className="text-green-600" />
                  Trạng thái tài khoản
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {profile.isActive ? (
                        <FiCheckCircle className="text-green-500" size={24} />
                      ) : (
                        <FiXCircle className="text-red-500" size={24} />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">Trạng thái kích hoạt</p>
                        <p className="text-sm text-gray-500">Tài khoản có thể sử dụng</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      profile.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {profile.isActive ? "Đã kích hoạt" : "Chưa kích hoạt"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {profile.isEmailVerified ? (
                        <FiCheckCircle className="text-green-500" size={24} />
                      ) : (
                        <FiXCircle className="text-red-500" size={24} />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">Xác thực email</p>
                        <p className="text-sm text-gray-500">Email đã được xác nhận</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      profile.isEmailVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {profile.isEmailVerified ? "Đã xác thực" : "Chưa xác thực"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FiCalendar className="text-blue-500" size={24} />
                      <div>
                        <p className="font-semibold text-gray-900">Ngày tạo tài khoản</p>
                        <p className="text-sm text-gray-500">Thời gian đăng ký</p>
                      </div>
                    </div>
                    <span className="text-gray-700 font-medium">
                      {formatDate(profile.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Citizen ID Images */}
            {(profile.citizenImgFront || profile.citizenImgBack) && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiImage className="text-green-600" />
                  Căn cước công dân
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {profile.citizenImgFront && (
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">Mặt trước</label>
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-green-500 transition-colors">
                        <img
                          src={import.meta.env.VITE_API_URL + profile.citizenImgFront}
                          alt="CCCD Mặt trước"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                  {profile.citizenImgBack && (
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">Mặt sau</label>
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-green-500 transition-colors">
                        <img
                          src={import.meta.env.VITE_API_URL + profile.citizenImgBack}
                          alt="CCCD Mặt sau"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Cần cập nhật thông tin?</h3>
                  <p className="text-gray-600">Liên hệ với bộ phận hỗ trợ để thay đổi thông tin cá nhân</p>
                </div>
                <button
                  onClick={() => navigate("/chat")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Liên hệ hỗ trợ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && !profile && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <FiXCircle className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không thể tải thông tin</h3>
            <p className="text-gray-500 mb-6">Đã có lỗi xảy ra khi tải thông tin profile</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
