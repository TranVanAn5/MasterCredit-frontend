import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiShield, FiFileText,
  FiCreditCard, FiLoader, FiStar, FiMail, FiSmartphone,
  FiActivity, FiCheckCircle, FiClock, FiRefreshCw, FiHome,
} from "react-icons/fi";
import OtpInput from "../components/OtpInput";
import DocUpload from "../components/DocUpload";
import {
  getCardTypeById,
  startCardApplication,
  uploadApplicationDocuments,
  getApplicationReview,
  sendApplicationOtp,
  submitApplication,
} from "../services/cardService";

// ── Helpers ──────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Tài chính" },
  { label: "Giấy tờ" },
  { label: "Kiểm tra" },
  { label: "Xem lại" },
  { label: "Hoàn tất" },
];

const INCOME_SOURCES = ["Lương", "Kinh doanh", "Đầu tư", "Cho thuê tài sản", "Khác"];

const EMPLOYMENT_OPTIONS = [
  { value: "full-time",       label: "Toàn thời gian" },
  { value: "part-time",       label: "Bán thời gian" },
  { value: "self-employed",   label: "Tự kinh doanh" },
];

const CHECKING_ITEMS = [
  { icon: FiShield,   label: "Xác minh danh tính" },
  { icon: FiActivity, label: "Phân tích lịch sử tín dụng" },
  { icon: FiStar,     label: "Tạo hồ sơ đề nghị" },
];

const pct = (step) => step * 20; // 1→20%, 2→40%, …, 5→100%

const fmt = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN") + " VND";

const fmtRate = (r) => (Number(r ?? 0) * 100).toFixed(1) + "%";

const cardGradient = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("platinum")) return "from-gray-700 via-gray-800 to-gray-900";
  if (n.includes("gold"))     return "from-yellow-500 via-amber-500 to-orange-500";
  return "from-slate-500 via-slate-600 to-slate-700";
};

// ── Step header (gradient banner) ────────────────────────────────────────────

function StepBanner({ step, title, subtitle, Icon }) {
  return (
    <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-blue-800 rounded-t-2xl px-8 py-7 text-white">
      {/* Progress bar */}
      <div className="w-full bg-white/20 rounded-full h-1.5 mb-5">
        <div
          className="h-1.5 rounded-full bg-white transition-all duration-700 ease-out"
          style={{ width: `${pct(step)}%` }}
        />
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Icon size={22} />
        </div>
        <div>
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">
            Bước {step}/5
          </p>
          <h2 className="text-xl font-bold leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-blue-200 mt-1 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step indicator dots ───────────────────────────────────────────────────────

function StepDots({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 py-5 border-b border-gray-100">
      {STEPS.map((s, i) => {
        const done   = i + 1 < current;
        const active = i + 1 === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${done   ? "bg-indigo-600 text-white" : ""}
                  ${active ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : ""}
                  ${!done && !active ? "bg-gray-100 text-gray-400" : ""}`}
              >
                {done ? <FiCheck size={13} /> : i + 1}
              </div>
              <span className={`mt-1 text-[10px] font-medium whitespace-nowrap
                ${active ? "text-indigo-600" : done ? "text-indigo-400" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-10 sm:w-14 h-0.5 mx-1 mb-4 transition-all duration-300 ${i + 1 < current ? "bg-indigo-600" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Reusable styled input ─────────────────────────────────────────────────────

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all bg-white placeholder-gray-400";

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function CardApplicationPage() {
  const { cardTypeId } = useParams();
  const navigate = useNavigate();

  // ── Meta ──────────────────────────────────────────────────────────────────
  const [cardType, setCardType]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [step, setStep]             = useState(1);
  const [applicationId, setAppId]   = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [submitResult, setResult]   = useState(null);

  // ── Step 1: Financial Info ────────────────────────────────────────────────
  const [income, setIncome]                     = useState("");
  const [incomeSource, setIncomeSource]         = useState("Lương");
  const [employmentStatus, setEmployment]      = useState("full-time");
  const [occupation, setOccupation]             = useState("");
  const [companyName, setCompanyName]           = useState("");

  // ── Step 2: Documents ─────────────────────────────────────────────────────
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack]   = useState(null);
  const [salarySlip, setSalarySlip]   = useState(null);

  // ── Step 3: Checking animation ───────────────────────────────────────────
  const [checkStates, setCheckStates] = useState(["pending", "pending", "pending"]);

  // ── Step 4: Review + OTP ─────────────────────────────────────────────────
  const [showOtp, setShowOtp]             = useState(false);
  const [otpType, setOtpType]             = useState("email");
  const [otp, setOtp]                     = useState("");
  const [resendCooldown, setResendCD]     = useState(0);
  const [otpSending, setOtpSending]       = useState(false);
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  // ── Load card type ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cardTypeId) { navigate("/browse-cards"); return; }
    getCardTypeById(cardTypeId)
      .then((res) => {
        if (res.success) setCardType(res.data);
        else { toast.error("Không tìm thấy loại thẻ."); navigate("/browse-cards"); }
      })
      .catch(() => { toast.error("Lỗi tải thông tin thẻ."); navigate("/browse-cards"); });
  }, [cardTypeId, navigate]);

  // ── Resend cooldown ticker ────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCD((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Step 3 animation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 3) return;
    setCheckStates(["pending", "pending", "pending"]);

    const set = (i, state) =>
      setCheckStates((prev) => prev.map((s, j) => (j === i ? state : s)));

    const timers = [
      setTimeout(() => set(0, "loading"), 400),
      setTimeout(() => set(0, "done"),    1300),
      setTimeout(() => set(1, "loading"), 1500),
      setTimeout(() => set(1, "done"),    2500),
      setTimeout(() => set(2, "loading"), 2700),
      setTimeout(() => set(2, "done"),    3600),
      setTimeout(() => setStep(4),        4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [step]);

  // ── Fetch review when entering Step 4 ────────────────────────────────────
  useEffect(() => {
    if (step !== 4 || !applicationId || reviewData) return;
    getApplicationReview(applicationId)
      .then((res) => { if (res.success) setReviewData(res.data); })
      .catch(() => toast.error("Lỗi tải thông tin đơn."));
  }, [step, applicationId, reviewData]);

  // ═══════════════════════════════════════════════════════════════════════════
  //  STEP HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  // B2 – Submit financial info
  const handleStep1Submit = async () => {
    if (!income || Number(income) <= 0)     return toast.error("Vui lòng nhập thu nhập hàng năm.");
    if (!occupation.trim())                  return toast.error("Vui lòng nhập nghề nghiệp.");
    if (!companyName.trim())                 return toast.error("Vui lòng nhập tên công ty.");

    setLoading(true);
    try {
      const res = await startCardApplication({
        cardTypeId:       Number(cardTypeId),
        grossAnnualIncome: Number(income),
        incomeSource,
        occupation:       occupation.trim(),
        companyName:      companyName.trim(),
      });
      if (res.success) {
        setAppId(res.data.applicationId);
        setStep(2);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // B3 – Upload documents
  const handleStep2Submit = async () => {
    if (!idCardFront) return toast.error("Vui lòng tải lên ảnh CCCD mặt trước.");
    if (!idCardBack)  return toast.error("Vui lòng tải lên ảnh CCCD mặt sau.");
    if (!salarySlip)  return toast.error("Vui lòng tải lên bảng lương.");

    setLoading(true);
    try {
      const res = await uploadApplicationDocuments(applicationId, idCardFront, salarySlip);
      if (res.success) {
        setReviewData(null); // force re-fetch on step 4
        setStep(3);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Lỗi tải tệp lên. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // B5 – Send OTP
  const handleSendOtp = async () => {
    setOtpSending(true);
    try {
      const res = await sendApplicationOtp(applicationId, otpType);
      if (res.success) {
        toast.success(res.message);
        setShowOtp(true);
        setResendCD(60);
        setOtp("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setOtpSending(false);
    }
  };

  // B6 – Verify OTP + finalize
  const handleSubmitApplication = async () => {
    if (otp.length !== 6) return toast.error("Vui lòng nhập đủ 6 chữ số OTP.");
    setOtpSubmitting(true);
    try {
      const res = await submitApplication(applicationId, otp);
      if (res.success) {
        setResult(res.data);
        setStep(5);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Lỗi xác minh OTP. Vui lòng thử lại.");
    } finally {
      setOtpSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER HELPERS – each step's body content
  // ═══════════════════════════════════════════════════════════════════════════

  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Gross Annual Income */}
      <Field label="Tổng thu nhập hàng năm (VND)" required>
        <div className="relative">
          <input
            type="text"
            value={income ? Number(income).toLocaleString("vi-VN") : ""}
            onChange={(e) => setIncome(e.target.value.replace(/\D/g, ""))}
            placeholder="Ví dụ: 240,000,000"
            className={inputCls + " pr-14"}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
            VND
          </span>
        </div>
      </Field>

      {/* Income Source */}
      <Field label="Nguồn thu nhập" required>
        <select
          value={incomeSource}
          onChange={(e) => setIncomeSource(e.target.value)}
          className={inputCls}
        >
          {INCOME_SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Field>

      {/* Employment Status */}
      <Field label="Hình thức làm việc" required>
        <div className="flex gap-2">
          {EMPLOYMENT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setEmployment(o.value)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all
                ${employmentStatus === o.value
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Occupation */}
      <Field label="Nghề nghiệp / Chức vụ" required>
        <input
          type="text"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder="Ví dụ: Kỹ sư phần mềm"
          className={inputCls}
        />
      </Field>

      {/* Company Name */}
      <Field label="Tên công ty / Nơi làm việc" required>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Ví dụ: Công ty TNHH ABC"
          className={inputCls}
        />
      </Field>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-7">
      {/* CCCD section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
            <FiShield size={13} className="text-indigo-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Căn cước công dân (CCCD)</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">Chấp nhận: JPG, PNG, WEBP – tối đa 5 MB mỗi ảnh</p>
        <div className="grid grid-cols-2 gap-4">
          <DocUpload
            label="Mặt trước"
            file={idCardFront}
            onFileChange={setIdCardFront}
            acceptImage
            hint="JPG, PNG, WEBP – 5 MB"
            disabled={loading}
          />
          <DocUpload
            label="Mặt sau"
            file={idCardBack}
            onFileChange={setIdCardBack}
            acceptImage
            hint="JPG, PNG, WEBP – 5 MB"
            disabled={loading}
          />
        </div>
      </div>

      {/* Salary section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
            <FiFileText size={13} className="text-green-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Bảng lương</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">Chấp nhận: JPG, PNG, WEBP, PDF – tối đa 5 MB</p>
        <DocUpload
          label="Tháng gần nhất"
          file={salarySlip}
          onFileChange={setSalarySlip}
          hint="JPG, PNG, PDF – 5 MB"
          disabled={loading}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col items-center py-8 gap-8">
      {/* Spinner */}
      <div className="relative w-24 h-24">
        <div className="w-24 h-24 rounded-full border-4 border-indigo-100" />
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FiShield size={28} className="text-indigo-600" />
        </div>
      </div>

      <div>
        <h3 className="text-center text-base font-bold text-gray-800 mb-1">
          Đang kiểm tra điều kiện…
        </h3>
        <p className="text-center text-sm text-gray-500">
          Vui lòng chờ trong giây lát
        </p>
      </div>

      {/* Check items */}
      <div className="w-full max-w-sm space-y-3">
        {CHECKING_ITEMS.map((item, i) => {
          const state = checkStates[i];
          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-500
                ${state === "done"    ? "bg-green-50  border-green-200" : ""}
                ${state === "loading" ? "bg-indigo-50 border-indigo-200" : ""}
                ${state === "pending" ? "bg-gray-50   border-gray-200 opacity-60" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${state === "done"    ? "bg-green-500  text-white" : ""}
                ${state === "loading" ? "bg-indigo-100 text-indigo-600" : ""}
                ${state === "pending" ? "bg-gray-200   text-gray-400" : ""}`}
              >
                {state === "done"    ? <FiCheck size={15} /> :
                 state === "loading" ? <FiLoader size={15} className="animate-spin" /> :
                                       <item.icon size={15} />}
              </div>
              <span className={`text-sm font-medium
                ${state === "done"    ? "text-green-800" : ""}
                ${state === "loading" ? "text-indigo-800" : ""}
                ${state === "pending" ? "text-gray-500" : ""}`}
              >
                {item.label}
              </span>
              {state === "done" && (
                <span className="ml-auto text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  Xong
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep4Review = () => {
    const r = reviewData;
    return (
      <div className="space-y-5">
        {/* Card info */}
        <div className={`rounded-xl bg-gradient-to-r ${cardGradient(cardType?.cardName)} p-5 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/70 font-medium uppercase tracking-wider mb-1">
                {cardType?.cardNetwork}
              </p>
              <p className="text-lg font-bold">{cardType?.cardName}</p>
              <p className="text-xs text-white/80 mt-1">Hạn mức tín dụng</p>
              <p className="text-xl font-bold">{fmt(cardType?.creditLimit)}</p>
            </div>
            <div className="w-12 h-8 bg-yellow-400 rounded-md" />
          </div>
          <div className="mt-4 flex gap-6 text-xs text-white/80">
            <div>
              <p>Phí thường niên</p>
              <p className="font-semibold text-white">{fmt(cardType?.annualFee)}</p>
            </div>
            <div>
              <p>Hoàn tiền</p>
              <p className="font-semibold text-white">{fmtRate(cardType?.cashbackRate)}</p>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">Thông tin tài chính</span>
            <button
              onClick={() => { setStep(1); setShowOtp(false); }}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              Chỉnh sửa
            </button>
          </div>
          <div className="p-5 space-y-3">
            {[
              ["Thu nhập hàng năm", fmt(r?.grossAnnualIncome)],
              ["Nguồn thu nhập",   r?.incomeSource],
              ["Nghề nghiệp",      r?.occupation],
              ["Công ty",          r?.companyName],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-800 text-right max-w-[55%] truncate">{v ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">Giấy tờ đã tải lên</span>
            <button
              onClick={() => { setStep(2); setShowOtp(false); }}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              Thay thế
            </button>
          </div>
          <div className="p-5 space-y-2">
            {[
              ["CCCD mặt trước", r?.idCardPath],
              ["Bảng lương",     r?.salarySlipPath],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 text-sm">
                <FiCheckCircle size={15} className="text-green-500 flex-shrink-0" />
                <span className="text-gray-600">{k}</span>
                {v && (
                  <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                    Đã tải lên
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* OTP destination choice */}
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5">
          <p className="text-sm font-bold text-gray-800 mb-3">
            Chọn kênh nhận mã xác nhận OTP
          </p>
          <div className="flex gap-3">
            {[
              { key: "email", Icon: FiMail,       label: "Email" },
              { key: "phone", Icon: FiSmartphone, label: "Điện thoại" },
            ].map(({ key, Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setOtpType(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                  ${otpType === key
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"}`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStep4Otp = () => (
    <div className="flex flex-col items-center py-4 gap-7">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
        {otpType === "email" ? <FiMail size={28} className="text-indigo-600" /> : <FiSmartphone size={28} className="text-indigo-600" />}
      </div>

      <div className="text-center">
        <h3 className="text-base font-bold text-gray-800 mb-1">Nhập mã xác nhận</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Mã OTP 6 chữ số đã được gửi đến{" "}
          <span className="font-semibold text-indigo-600">
            {otpType === "email" ? "email" : "số điện thoại"}
          </span>{" "}
          của bạn. Mã có hiệu lực trong <span className="font-semibold">5 phút</span>.
        </p>
      </div>

      {/* OTP boxes */}
      <OtpInput value={otp} onChange={setOtp} disabled={otpSubmitting} />

      {/* Resend */}
      <div className="flex items-center gap-2">
        {resendCooldown > 0 ? (
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            <FiClock size={14} />
            Gửi lại sau <span className="font-bold text-indigo-600 w-7 text-center">{resendCooldown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={otpSending}
            className="text-sm text-indigo-600 font-semibold flex items-center gap-1.5 hover:text-indigo-800 disabled:opacity-50"
          >
            <FiRefreshCw size={14} className={otpSending ? "animate-spin" : ""} />
            Gửi lại mã OTP
          </button>
        )}
      </div>

      {/* Verify button */}
      <button
        type="button"
        onClick={handleSubmitApplication}
        disabled={otp.length !== 6 || otpSubmitting}
        className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {otpSubmitting ? <FiLoader size={18} className="animate-spin" /> : <FiCheck size={18} />}
        {otpSubmitting ? "Đang xử lý…" : "Xác nhận & Nộp đơn"}
      </button>

      <button
        type="button"
        onClick={() => { setShowOtp(false); setOtp(""); }}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        <FiArrowLeft size={14} /> Quay lại xem lại
      </button>
    </div>
  );

  const renderStep5 = () => (
    <div className="flex flex-col items-center py-4 gap-7">
      {/* Success icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <FiCheckCircle size={40} className="text-green-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
          <FiStar size={11} className="text-white" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Chúc mừng!</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Đơn đăng ký thẻ của bạn đã được tiếp nhận thành công.
          <br />Ngân hàng sẽ phản hồi trong vòng <span className="font-bold text-gray-700">3–5 ngày làm việc</span>.
        </p>
      </div>

      {/* Card summary */}
      <div className={`w-full rounded-2xl bg-gradient-to-br ${cardGradient(cardType?.cardName)} p-6 text-white shadow-lg`}>
        <p className="text-xs text-white/70 uppercase tracking-wider mb-1">{cardType?.cardNetwork}</p>
        <p className="text-xl font-extrabold mb-4">{cardType?.cardName}</p>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-[10px] text-white/70 uppercase tracking-wide">Hạn mức</p>
            <p className="text-sm font-extrabold mt-0.5">{fmt(cardType?.creditLimit)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-[10px] text-white/70 uppercase tracking-wide">Hoàn tiền</p>
            <p className="text-sm font-extrabold mt-0.5">{fmtRate(cardType?.cashbackRate)}</p>
          </div>
        </div>
      </div>

      {/* Application info */}
      <div className="w-full rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2">
        {[
          ["Mã đơn đăng ký",   `#${submitResult?.applicationId ?? "—"}`],
          ["Trạng thái",       "Đang chờ xét duyệt"],
          ["Loại thẻ",         submitResult?.cardTypeName ?? cardType?.cardName ?? "—"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-gray-500">{k}</span>
            <span className="font-semibold text-gray-800">{v}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm
          transition-colors flex items-center justify-center gap-2"
      >
        <FiHome size={18} /> Về trang chủ
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  STEP META (banner config)
  // ═══════════════════════════════════════════════════════════════════════════

  const stepMeta = {
    1: { title: "Thông tin tài chính", subtitle: "Cung cấp thông tin thu nhập để đánh giá điều kiện của bạn.", Icon: FiCreditCard },
    2: { title: "Giấy tờ cần thiết",   subtitle: "Tải lên CCCD và bảng lương để xác minh danh tính.",           Icon: FiFileText },
    3: { title: "Đang kiểm tra",        subtitle: "Hệ thống đang phân tích hồ sơ của bạn…",                      Icon: FiActivity },
    4: { title: showOtp ? "Xác minh danh tính" : "Xem lại đơn đăng ký",
         subtitle: showOtp ? "Nhập mã OTP để hoàn tất đơn." : "Kiểm tra lại toàn bộ thông tin trước khi nộp.",
         Icon: showOtp ? FiShield : FiCheckCircle },
    5: { title: "Đơn đã được nộp!",    subtitle: "Cảm ơn bạn đã tin tưởng MasterCredit.",                        Icon: FiStar },
  };

  const meta = stepMeta[step];

  // ── Navigation buttons ────────────────────────────────────────────────────

  const renderNavButtons = () => {
    if (step === 3 || step === 5) return null; // auto-advance or final screen

    if (step === 4 && showOtp) return null; // OTP screen has its own buttons

    const onBack = () => {
      if      (step === 1) navigate(-1);
      else if (step === 2) setStep(1);
      else if (step === 4) { setStep(2); setReviewData(null); setShowOtp(false); }
    };

    const onNext = () => {
      if      (step === 1) handleStep1Submit();
      else if (step === 2) handleStep2Submit();
      else if (step === 4) handleSendOtp();   // send OTP then show OTP input
    };

    const nextLabel =
      step === 1 ? "Tiếp tục" :
      step === 2 ? "Tiếp tục" :
      step === 4 ? (otpSending ? "Đang gửi…" : `Gửi mã OTP qua ${otpType === "email" ? "Email" : "Điện thoại"}`) :
      "Tiếp tục";

    return (
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onBack}
          disabled={loading || otpSending}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm
            hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-40"
        >
          <FiArrowLeft size={16} /> Quay lại
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading || otpSending}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700
            text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {(loading || otpSending) ? (
            <><FiLoader size={16} className="animate-spin" /> Đang xử lý…</>
          ) : (
            <>{nextLabel} <FiArrowRight size={16} /></>
          )}
        </button>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => (step <= 2 ? navigate(-1) : null)}
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          <FiArrowLeft size={18} />
          {step <= 2 ? "Quay lại" : "Đăng ký thẻ"}
        </button>
        <p className="text-white font-bold tracking-wide text-sm">MasterCredit</p>
        <div className="w-20" />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-xl">
          {/* Banner */}
          <StepBanner
            step={step}
            title={meta.title}
            subtitle={meta.subtitle}
            Icon={meta.Icon}
          />

          {/* White body */}
          <div className="bg-white rounded-b-2xl shadow-2xl">
            {/* Step dots */}
            {step < 5 && <StepDots current={step} />}

            {/* Step content */}
            <div className="px-7 pt-6 pb-3">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && !showOtp && renderStep4Review()}
              {step === 4 && showOtp && renderStep4Otp()}
              {step === 5 && renderStep5()}
            </div>

            {/* Navigation */}
            <div className="px-7 pb-7 pt-2">
              {renderNavButtons()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
