import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiLoader, FiZap, FiDroplet,
  FiWifi, FiBook, FiPhone, FiTv, FiCreditCard, FiShield,
  FiCheckCircle, FiStar, FiHome, FiDollarSign
} from "react-icons/fi";
import PinInput from "../components/PinInput";
import {
  getBillCategories,
  getProvidersByCategory,
  verifyCustomer,
  getUserCards,
  processBillPayment,
} from "../services/billPaymentService";

// ── Helpers ──────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Dịch vụ" },
  { label: "Nhà CC" },
  { label: "Xác minh" },
  { label: "Thanh toán" },
  { label: "PIN" },
  { label: "Hoàn tất" },
];

const pct = (step) => (step / 6) * 100;

const fmt = (n) => Number(n ?? 0).toLocaleString("vi-VN") + " VND";

// Category icon mapping
const getCategoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("điện")) return FiZap;
  if (n.includes("nước")) return FiDroplet;
  if (n.includes("internet") || n.includes("wifi")) return FiWifi;
  if (n.includes("học") || n.includes("giáo dục")) return FiBook;
  if (n.includes("điện thoại") || n.includes("di động")) return FiPhone;
  if (n.includes("truyền hình") || n.includes("tv")) return FiTv;
  return FiDollarSign;
};

// ── Step header (gradient banner) ────────────────────────────────────────────

function StepBanner({ step, title, subtitle, Icon }) {
  return (
    <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-800 rounded-t-2xl px-8 py-7 text-white">
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
          <p className="text-xs font-semibold text-green-200 uppercase tracking-wider mb-1">
            Bước {step}/6
          </p>
          <h2 className="text-xl font-bold leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-green-200 mt-1 leading-relaxed">{subtitle}</p>
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
        const done = i + 1 < current;
        const active = i + 1 === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${done ? "bg-emerald-600 text-white" : ""}
                  ${active ? "bg-emerald-600 text-white ring-4 ring-emerald-100" : ""}
                  ${!done && !active ? "bg-gray-100 text-gray-400" : ""}`}
              >
                {done ? <FiCheck size={13} /> : i + 1}
              </div>
              <span className={`mt-1 text-[10px] font-medium whitespace-nowrap
                ${active ? "text-emerald-600" : done ? "text-emerald-400" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-10 h-0.5 mx-1 mb-4 transition-all duration-300 ${i + 1 < current ? "bg-emerald-600" : "bg-gray-200"}`} />
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
  "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none transition-all bg-white placeholder-gray-400";

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function BillPaymentPage() {
  const navigate = useNavigate();

  // ── Meta ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // ── Step 1: Categories ────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ── Step 2: Providers ─────────────────────────────────────────────────────
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // ── Step 3: Customer Code ─────────────────────────────────────────────────
  const [customerCode, setCustomerCode] = useState("");
  const [billInfo, setBillInfo] = useState(null);

  // ── Step 4: Payment Info ──────────────────────────────────────────────────
  const [userCards, setUserCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // ── Step 5: PIN ───────────────────────────────────────────────────────────
  const [pin, setPin] = useState("");
  const [pinSubmitting, setPinSubmitting] = useState(false);

  // ── Step 6: Result ────────────────────────────────────────────────────────
  const [paymentResult, setPaymentResult] = useState(null);

  // ── Load categories on mount ──────────────────────────────────────────────
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getBillCategories();
      if (res.success) {
        setCategories(res.data);
      } else {
        toast.error(res.message || "Không thể tải danh sách dịch vụ.");
      }
    } catch {
      toast.error("Lỗi tải danh sách dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  STEP HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  // B1 → B2: Select category → load providers
  const handleStep1Submit = async () => {
    if (!selectedCategory) return toast.error("Vui lòng chọn loại dịch vụ.");

    setLoading(true);
    try {
      const res = await getProvidersByCategory(selectedCategory.billCategoryId);
      if (res.success) {
        setProviders(res.data);
        setStep(2);
      } else {
        toast.error(res.message || "Không thể tải nhà cung cấp.");
      }
    } catch {
      toast.error("Lỗi tải danh sách nhà cung cấp.");
    } finally {
      setLoading(false);
    }
  };

  // B2 → B3: Select provider
  const handleStep2Submit = () => {
    if (!selectedProvider) return toast.error("Vui lòng chọn nhà cung cấp.");
    setStep(3);
  };

  // B3 → B4: Verify customer code
  const handleStep3Submit = async () => {
    if (!customerCode.trim()) return toast.error("Vui lòng nhập mã khách hàng.");

    setLoading(true);
    try {
      const res = await verifyCustomer(selectedProvider.billProviderId, customerCode);
      if (res.success) {
        setBillInfo(res.data);
        // Load user cards
        const cardsRes = await getUserCards();
        if (cardsRes.success) {
          setUserCards(cardsRes.data);
        }
        setStep(4);
      } else {
        toast.error(res.message || "Mã khách hàng không hợp lệ.");
      }
    } catch {
      toast.error("Lỗi xác minh mã khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  // B4 → B5: Select card → show PIN input
  const handleStep4Submit = () => {
    if (!selectedCard) return toast.error("Vui lòng chọn thẻ thanh toán.");
    setStep(5);
  };

  // B5 → B6: Submit payment with PIN
  const handleStep5Submit = async () => {
    if (pin.length !== 6) return toast.error("Vui lòng nhập đủ 6 chữ số PIN.");

    setPinSubmitting(true);
    try {
      const res = await processBillPayment({
        providerId: selectedProvider.billProviderId,
        customerCode,
        amount: billInfo.amount,
        cardId: selectedCard.cardId,
        pin,
      });
      if (res.success) {
        setPaymentResult(res.data);
        setStep(6);
      } else {
        toast.error(res.message || "Thanh toán thất bại.");
      }
    } catch {
      toast.error("Lỗi xử lý thanh toán.");
    } finally {
      setPinSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER STEPS
  // ═══════════════════════════════════════════════════════════════════════════

  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Chọn loại dịch vụ bạn muốn thanh toán:</p>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.categoryName);
          const isSelected = selectedCategory?.billCategoryId === cat.billCategoryId;
          return (
            <button
              key={cat.billCategoryId}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`p-4 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? "bg-emerald-50 border-emerald-500 shadow-sm"
                  : "bg-white border-gray-200 hover:border-emerald-300"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                  ${isSelected ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isSelected ? "text-emerald-700" : "text-gray-800"}`}>
                    {cat.categoryName}
                  </p>
                  {cat.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">
          <FiDollarSign size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Không có dịch vụ nào.</p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Chọn nhà cung cấp <span className="font-semibold">{selectedCategory?.categoryName}</span>:
      </p>
      <div className="space-y-2">
        {providers.map((provider) => {
          const isSelected = selectedProvider?.billProviderId === provider.billProviderId;
          return (
            <button
              key={provider.billProviderId}
              type="button"
              onClick={() => setSelectedProvider(provider)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3
                ${isSelected
                  ? "bg-emerald-50 border-emerald-500 shadow-sm"
                  : "bg-white border-gray-200 hover:border-emerald-300"}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${isSelected ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                <FiZap size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${isSelected ? "text-emerald-700" : "text-gray-800"}`}>
                  {provider.providerName}
                </p>
                {provider.providerCode && (
                  <p className="text-xs text-gray-500">Mã: {provider.providerCode}</p>
                )}
              </div>
              {isSelected && (
                <FiCheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {providers.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">
          <FiZap size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Không có nhà cung cấp nào.</p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <FiShield size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900">
              {selectedProvider?.providerName}
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {selectedCategory?.categoryName}
            </p>
          </div>
        </div>
      </div>

      <Field label="Mã khách hàng / Số hợp đồng" required>
        <input
          type="text"
          value={customerCode}
          onChange={(e) => setCustomerCode(e.target.value)}
          placeholder="Nhập mã khách hàng hoặc số hợp đồng"
          className={inputCls}
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1.5">
          Mã này thường có trên hóa đơn hoặc thông báo thanh toán của bạn.
        </p>
      </Field>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      {/* Bill Info */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <FiCheckCircle size={20} />
          <p className="text-sm font-semibold">Thông tin hóa đơn</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/80">Khách hàng:</span>
            <span className="font-bold">{billInfo?.customerName || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/80">Mã KH:</span>
            <span className="font-bold">{customerCode}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/80">Kỳ thanh toán:</span>
            <span className="font-bold">{billInfo?.billingPeriod || "—"}</span>
          </div>
          <div className="h-px bg-white/30 my-2" />
          <div className="flex justify-between items-end">
            <span className="text-xs text-white/80">Số tiền phải trả:</span>
            <span className="text-2xl font-extrabold">{fmt(billInfo?.amount)}</span>
          </div>
        </div>
      </div>

      {/* Card Selection */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Chọn thẻ thanh toán:</p>
        <div className="space-y-2">
          {userCards.map((card) => {
            const isSelected = selectedCard?.cardId === card.cardId;
            return (
              <button
                key={card.cardId}
                type="button"
                onClick={() => setSelectedCard(card)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left
                  ${isSelected
                    ? "bg-emerald-50 border-emerald-500 shadow-sm"
                    : "bg-white border-gray-200 hover:border-emerald-300"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isSelected ? "bg-emerald-500 text-white" : "bg-gradient-to-br from-gray-700 to-gray-900 text-white"}`}>
                    <FiCreditCard size={18} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${isSelected ? "text-emerald-700" : "text-gray-800"}`}>
                      {card.cardType?.cardName || "Thẻ tín dụng"}
                    </p>
                    <p className="text-xs text-gray-500">
                      •••• •••• •••• {card.cardNumber?.slice(-4) || "****"}
                    </p>
                  </div>
                  {isSelected && (
                    <FiCheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {userCards.length === 0 && (
          <div className="text-center py-6 rounded-xl border-2 border-dashed border-gray-200">
            <FiCreditCard size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">Bạn chưa có thẻ nào.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="flex flex-col items-center py-4 gap-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
        <FiShield size={28} className="text-emerald-600" />
      </div>

      <div className="text-center">
        <h3 className="text-base font-bold text-gray-800 mb-1">Xác nhận thanh toán</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Nhập mã PIN 6 chữ số để hoàn tất giao dịch
        </p>
      </div>

      {/* Payment summary */}
      <div className="w-full rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Nhà cung cấp:</span>
          <span className="font-semibold text-gray-800">{selectedProvider?.providerName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Mã KH:</span>
          <span className="font-semibold text-gray-800">{customerCode}</span>
        </div>
        <div className="h-px bg-gray-200 my-2" />
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Số tiền:</span>
          <span className="text-lg font-bold text-emerald-600">{fmt(billInfo?.amount)}</span>
        </div>
      </div>

      {/* PIN Input */}
      <div className="w-full">
        <PinInput value={pin} onChange={setPin} disabled={pinSubmitting} />
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleStep5Submit}
        disabled={pin.length !== 6 || pinSubmitting}
        className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {pinSubmitting ? (
          <>
            <FiLoader size={18} className="animate-spin" />
            Đang xử lý…
          </>
        ) : (
          <>
            <FiCheck size={18} />
            Xác nhận thanh toán
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => { setStep(4); setPin(""); }}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        disabled={pinSubmitting}
      >
        <FiArrowLeft size={14} /> Quay lại
      </button>
    </div>
  );

  const renderStep6 = () => (
    <div className="flex flex-col items-center py-4 gap-6">
      {/* Success icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <FiCheckCircle size={40} className="text-emerald-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
          <FiStar size={11} className="text-white" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Thanh toán thành công!</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Giao dịch của bạn đã được xử lý thành công.
        </p>
      </div>

      {/* Transaction details */}
      <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
          <FiCheckCircle size={18} className="text-emerald-600" />
          <p className="text-sm font-bold text-emerald-900">Thông tin giao dịch</p>
        </div>
        {[
          ["Mã giao dịch", `#${paymentResult?.billPaymentId || "—"}`],
          ["Dịch vụ", selectedCategory?.categoryName],
          ["Nhà cung cấp", selectedProvider?.providerName],
          ["Mã khách hàng", customerCode],
          ["Số tiền", fmt(billInfo?.amount)],
          ["Thời gian", paymentResult?.paymentDate ? new Date(paymentResult.paymentDate).toLocaleString("vi-VN") : "—"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-gray-600">{k}</span>
            <span className="font-semibold text-gray-800 text-right max-w-[60%]">{v}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="w-full space-y-2">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm
            transition-colors flex items-center justify-center gap-2"
        >
          <FiHome size={18} /> Về trang chủ
        </button>
        <button
          type="button"
          onClick={() => {
            // Reset to step 1
            setStep(1);
            setSelectedCategory(null);
            setSelectedProvider(null);
            setCustomerCode("");
            setBillInfo(null);
            setSelectedCard(null);
            setPin("");
            setPaymentResult(null);
          }}
          className="w-full py-3.5 rounded-xl border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50
            font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <FiDollarSign size={18} /> Thanh toán hóa đơn khác
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  STEP META (banner config)
  // ═══════════════════════════════════════════════════════════════════════════

  const stepMeta = {
    1: { title: "Chọn loại dịch vụ", subtitle: "Chọn loại hóa đơn bạn muốn thanh toán.", Icon: FiDollarSign },
    2: { title: "Chọn nhà cung cấp", subtitle: "Chọn đơn vị cung cấp dịch vụ.", Icon: FiZap },
    3: { title: "Nhập mã khách hàng", subtitle: "Xác minh thông tin hóa đơn của bạn.", Icon: FiShield },
    4: { title: "Xác nhận thanh toán", subtitle: "Kiểm tra thông tin và chọn thẻ thanh toán.", Icon: FiCreditCard },
    5: { title: "Nhập mã PIN", subtitle: "Xác nhận giao dịch bằng mã PIN.", Icon: FiShield },
    6: { title: "Hoàn tất!", subtitle: "Giao dịch của bạn đã thành công.", Icon: FiStar },
  };

  const meta = stepMeta[step];

  // ── Navigation buttons ────────────────────────────────────────────────────

  const renderNavButtons = () => {
    if (step === 5 || step === 6) return null; // Step 5 & 6 have their own buttons

    const onBack = () => {
      if (step === 1) navigate("/dashboard");
      else if (step === 2) { setStep(1); setSelectedProvider(null); }
      else if (step === 3) { setStep(2); setCustomerCode(""); }
      else if (step === 4) { setStep(3); setBillInfo(null); setSelectedCard(null); }
    };

    const onNext = () => {
      if (step === 1) handleStep1Submit();
      else if (step === 2) handleStep2Submit();
      else if (step === 3) handleStep3Submit();
      else if (step === 4) handleStep4Submit();
    };

    const nextLabel =
      step === 1 ? "Tiếp tục" :
      step === 2 ? "Tiếp tục" :
      step === 3 ? "Xác minh" :
      step === 4 ? "Thanh toán" :
      "Tiếp tục";

    return (
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm
            hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-40"
        >
          <FiArrowLeft size={16} /> Quay lại
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700
            text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-950 to-teal-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => (step <= 2 ? navigate("/dashboard") : null)}
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          <FiArrowLeft size={18} />
          {step <= 2 ? "Quay lại" : "Thanh toán hóa đơn"}
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
            {step < 7 && <StepDots current={step} />}

            {/* Step content */}
            <div className="px-7 pt-6 pb-3">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
              {step === 6 && renderStep6()}
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
