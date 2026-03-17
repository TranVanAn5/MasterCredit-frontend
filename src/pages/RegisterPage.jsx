import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiUpload, FiCamera, FiCheck } from "react-icons/fi";
import * as authSvc from "../services/authService";
import Logo from "../components/Logo";

const STEPS = [
  { label: "Đăng ký tài khoản", progress: 25 },
  { label: "Nhập mã xác thực", progress: 50 },
  { label: "Xác thực danh tính", progress: 75 },
  { label: "Thiết lập mã PIN", progress: 100 },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0 – user info
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Step 1 – OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(59);

  // Step 2 – Citizen ID
  const [frontImg, setFrontImg] = useState(null);
  const [backImg, setBackImg] = useState(null);
  const [faceVerified, setFaceVerified] = useState(false);

  // Step 3 – PIN
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP Timer
  useEffect(() => {
    if (step === 1 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  // ── Step 0: Register ─────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name.trim())
      return toast.error("Vui lòng nhập họ và tên!");
    if (form.password.length < 8)
      return toast.error("Mật khẩu phải có ít nhất 8 ký tự!");
    setLoading(true);
    try {
      const res = await authSvc.register({
        name: form.name,
        phoneNumber: form.phoneNumber,
        email: form.email,
        password: form.password,
      });
      if (res.success) {
        toast.success(res.message);
        setTimeLeft(59); // Reset timer
        setStep(1);
      } else toast.error(res.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  // ── Step 1: Verify OTP ───────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`register-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`register-otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) return toast.error("Vui lòng nhập đủ 6 số OTP!");
    setLoading(true);
    try {
      const res = await authSvc.verifyRegisterOtp(form.email, otpCode);
      if (res.success) {
        toast.success(res.message);
        setStep(2);
      } else toast.error(res.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await authSvc.resendOtp(form.email, "Register");
      if (res.success) {
        toast.success(res.message);
        setTimeLeft(59);
        setOtp(["", "", "", "", "", ""]);
      } else toast.error(res.message);
    } catch { toast.error("Không thể gửi lại OTP."); }
    finally { setLoading(false); }
  };

  // ── Step 2: Upload citizen ID ────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!frontImg || !backImg) return toast.error("Vui lòng chọn cả 2 ảnh CCCD!");
    if (!faceVerified) return toast.error("Vui lòng hoàn thành quét khuôn mặt!");
    setLoading(true);
    try {
      const res = await authSvc.uploadCitizenId(form.email, frontImg, backImg);
      if (res.success) {
        toast.success(res.message);
        setStep(3);
      } else toast.error(res.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Tải lên thất bại.");
    } finally { setLoading(false); }
  };

  // ── Step 3: Set PIN ──────────────────────────────────
  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    const pinCode = pin.join('');
    if (pinCode.length < 6) return toast.error("Vui lòng nhập đủ 6 số PIN!");
    if (!agreeTerms) return toast.error("Vui lòng đồng ý với điều khoản sử dụng!");
    setLoading(true);
    try {
      const res = await authSvc.setPin(form.email, pinCode, pinCode);
      if (res.success) {
        toast.success("Đăng ký thành công! Chào mừng bạn đến với MasterCredit.");
        setTimeout(() => navigate("/login"), 2000);
      } else toast.error(res.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-4">
      {/* Logo - Smaller */}
      <div className="mb-4">
        <Logo className="w-20 h-20" showText={false} />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl">
        {/* Progress Header - Compact */}
        <div className="text-center mb-6">
          <p className="text-sm text-green-500 font-medium mb-2">BƯỚC {step + 1} TRÊN 4</p>
          <h1 className="text-xl font-bold text-gray-900 mb-3">{STEPS[step].label}</h1>
          <div className="flex items-center justify-between mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${STEPS[step].progress}%` }}
              ></div>
            </div>
            <span className="ml-4 text-xs font-medium text-gray-600">{STEPS[step].progress}% hoàn tất</span>
          </div>
        </div>

        {/* Step Content - Compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

          {/* Step 0: Registration Form */}
          {step === 0 && (
            <>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Bắt đầu hành trình tài chính thông minh cùng MasterCredit bằng cách cung cấp thông tin cơ bản.
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4 space-y-4">
                  {/* Two-column layout for form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">👤</span>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Nguyễn Văn A"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">📞</span>
                        <input
                          type="tel"
                          value={form.phoneNumber}
                          onChange={(e) => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                          placeholder="09x xxx xxx"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">📧</span>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="example@gmail.com"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">🔒</span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                          placeholder="Ít nhất 8 ký tự"
                          className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terms Notice */}
                  <div className="flex items-start gap-3 p-3 bg-green-100 rounded-lg mt-4">
                    <FiCheck className="text-green-600 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Thông tin này sẽ được sử dụng để xác thực tài khoản và liên lạc với bạn.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? "Đang xử lý..." : "Tiếp tục →"}
                </button>
              </form>
            </>
          )}

          {/* Step 1: OTP Verification */}
          {step === 1 && (
            <>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Bắt đầu hành trình tài chính thông minh cùng MasterCredit bằng cách
                cung cấp thông tin cơ bản.
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <div className="bg-green-50 rounded-lg p-8">
                  {/* OTP Inputs */}
                  <div className="flex justify-center gap-4 mb-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`register-otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        disabled={loading}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length < 6}
                    className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                  >
                    {loading ? "Đang xác thực..." : "Xác nhận →"}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Bạn không nhận được mã?</p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading || timeLeft > 0}
                      className="text-green-600 font-semibold hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🔄 Gửi lại mã {timeLeft > 0 && `(${timeLeft}s)`}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}

          {/* Step 2: Identity Verification */}
          {step === 2 && (
            <>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Vui lòng cung cấp hình ảnh giấy tờ và xác thực khuôn mặt để tiếp
                tục bảo mật tài khoản của bạn.
              </p>

              <form onSubmit={handleUpload} className="space-y-8">
                <div className="bg-green-50 rounded-lg p-6 space-y-6">
                  {/* Document Upload Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <h3 className="font-semibold text-gray-800">Tải lên CCCD/CMND</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Front ID */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFrontImg(e.target.files?.[0] || null)}
                          className="hidden"
                          id="front-upload"
                        />
                        <label htmlFor="front-upload" className="cursor-pointer">
                          {frontImg ? (
                            <div className="text-green-600">
                              <FiCheck size={32} className="mx-auto mb-2" />
                              <p className="font-medium">Mặt trước CCCD</p>
                              <p className="text-sm text-gray-500">Đã tải lên</p>
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              <FiUpload size={32} className="mx-auto mb-2" />
                              <p className="font-medium">Mặt trước CCCD</p>
                              <p className="text-sm">Chọn file, không lấy ảnh</p>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* Back ID */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setBackImg(e.target.files?.[0] || null)}
                          className="hidden"
                          id="back-upload"
                        />
                        <label htmlFor="back-upload" className="cursor-pointer">
                          {backImg ? (
                            <div className="text-green-600">
                              <FiCheck size={32} className="mx-auto mb-2" />
                              <p className="font-medium">Mặt sau CCCD</p>
                              <p className="text-sm text-gray-500">Đã tải lên</p>
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              <FiUpload size={32} className="mx-auto mb-2" />
                              <p className="font-medium">Mặt sau CCCD</p>
                              <p className="text-sm">Chọn file, không lấy ảnh</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Face Verification Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${faceVerified ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
                      <h3 className="font-semibold text-gray-800">Quét khuôn mặt</h3>
                    </div>

                    <div className="text-center py-8">
                      <div className={`w-20 h-20 rounded-full border-4 ${faceVerified ? 'border-green-500 bg-green-50' : 'border-green-400 bg-green-50'} flex items-center justify-center mx-auto mb-4`}>
                        {faceVerified ? (
                          <FiCheck className="text-green-600" size={32} />
                        ) : (
                          <FiCamera className="text-green-600" size={32} />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setFaceVerified(true)}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          faceVerified
                            ? 'bg-green-600 text-white'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                        disabled={faceVerified}
                      >
                        {faceVerified ? 'Đã hoàn thành' : 'Bắt đầu quét'}
                      </button>

                      <p className="text-xs text-gray-500 mt-2">
                        Đảm bảo môi trường đủ ánh sáng, không đeo kính râm hoặc khẩu trang
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !frontImg || !backImg || !faceVerified}
                  className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang xử lý..." : "Tiếp tục"}
                </button>
              </form>
            </>
          )}

          {/* Step 3: PIN Setup */}
          {step === 3 && (
            <>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Vui lòng tạo mã PIN gồm 6 chữ số. Mã PIN này sẽ được dùng để
                đăng nhập và xác thực các giao dịch quan trọng.
              </p>

              <form onSubmit={handleSetPin} className="space-y-8">
                <div className="bg-green-50 rounded-lg p-8">
                  {/* PIN Inputs */}
                  <div className="flex justify-center gap-4 mb-8">
                    {pin.map((digit, index) => (
                      <input
                        key={index}
                        id={`pin-${index}`}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        disabled={loading}
                      />
                    ))}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="border border-green-200 rounded-lg p-4 mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Tôi đã đọc và đồng ý với các{" "}
                          <Link to="#" className="text-green-600 hover:underline">Điều khoản & Điều kiện</Link>{" "}
                          sử dụng dịch vụ ngân hàng số của MasterCredit.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Success Message */}
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <FiCheck className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                      <p className="text-sm text-green-800 leading-relaxed">
                        Tài khoản của bạn đã được kích hoạt thành công. Bạn có thể sử
                        dụng tất cả tính năng ngay bây giờ.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || pin.join('').length < 6 || !agreeTerms}
                    className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang xử lý..." : "Bắt đầu trải nghiệm ngay →"}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Bằng cách nhận hoàn tất, bạn xác nhận mọi thông tin cung cấp là chính xác.
                  MasterCredit bảo mật thông tin của bạn theo tiêu chuẩn quốc tế PCI DSS.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}