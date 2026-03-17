import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiEye, FiEyeOff, FiLock, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import * as authSvc from "../services/authService";
import Logo from "../components/Logo";

const STEPS = [
  { label: "Đăng nhập" },
  { label: "Xác thực OTP" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 1 - after login, store the email returned from backend
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(119); // 1:59

  // OTP Timer
  useEffect(() => {
    if (step === 1 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const maskEmail = (email) => {
    if (!email) return "";
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    return `${local.slice(0, 3)}••••${local.slice(-2)}@${domain}`;
  };

  // ── Step 0: Login ────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authSvc.login(username, password);
      console.log('Login response:', res); // Debug log
      if (res.success) {
        toast.success(res.message);
        // Handle different response structures (old vs new backend)
        let email = '';
        if (res.data && res.data.email) {
          // New backend with email in data
          email = res.data.email;
        } else if (username.includes('@')) {
          // Fallback: if username is email, use it
          email = username;
        } else {
          // If username is phone, we need the actual email from backend
          toast.error('Vui lòng đăng nhập bằng email hoặc restart backend');
          return;
        }

        console.log('Email to use for OTP:', email); // Debug log
        setUserEmail(email);
        setTimeLeft(119); // Reset timer
        setStep(1);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  // ── Step 1: Verify OTP ───────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take last digit only
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) return toast.error("Vui lòng nhập đủ 6 số OTP!");
    setLoading(true);
    try {
      const res = await authSvc.verifyLoginOtp(userEmail, otpCode);
      if (res.success && res.data) {
        saveSession(
          { id: res.data.userId, name: res.data.name, email: res.data.email, role: res.data.role },
          res.data.token
        );
        toast.success("Đăng nhập thành công!");
        navigate("/dashboard");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await authSvc.resendOtp(userEmail, "Login");
      if (res.success) {
        toast.success(res.message);
        setTimeLeft(119); // Reset timer
        setOtp(["", "", "", "", "", ""]); // Clear OTP inputs
      } else {
        toast.error(res.message);
      }
    } catch { toast.error("Không thể gửi lại OTP."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      {/* Logo - Top and Center */}
      <div className="mb-8">
        <Logo className="w-32 h-32" showText={false} />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md">

        {/* Step 0: Login Form */}
        {step === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Login to manage your finances securely.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your details"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Signing In..." : "Login →"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">New to MasterCredit?</p>
              <Link
                to="/register"
                className="block w-full py-3 border border-green-500 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
              >
                Create an Account
              </Link>
            </div>
          </div>
        )}

        {/* Step 1: OTP Verification */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail size={24} className="text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Identity</h1>
              <p className="text-gray-600">
                A security code has been sent to your device ending in{" "}
                <span className="font-mono">•••{userEmail.slice(-4)}</span>. Please enter it below.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* OTP Inputs */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Code expires in</p>
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      {formatTime(timeLeft).split(':')[0]}
                    </span>
                    <p className="text-xs text-gray-500">MIN</p>
                  </div>
                  <span className="text-2xl font-bold text-green-600">:</span>
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      {formatTime(timeLeft).split(':')[1]}
                    </span>
                    <p className="text-xs text-gray-500">SEC</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || timeLeft > 0}
                className="w-full py-3 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend Code
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <FiLock size={12} />
                END-TO-END ENCRYPTED
              </p>
              <p className="text-xs text-gray-400 mt-2">
                If you're having trouble receiving the code, please contact our support team or try an alternative method.
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="p-6">
        {step === 0 && (
          <div className="flex justify-center items-center gap-8 mb-4">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <FiLock size={12} />
              256-BIT ENCRYPTION
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <FiShield size={12} />
              SIPC PROTECTED
            </div>
          </div>
        )}
        <p className="text-center text-xs text-gray-400">
          © 2024 MasterCredit Corporation. All rights reserved. Member FDIC.
        </p>
      </div>
    </div>
    
    
  );
}