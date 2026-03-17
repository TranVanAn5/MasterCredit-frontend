import { useRef } from "react";

/** 6-ô PIN input – ẩn giá trị, hiển thị dấu chấm */
export default function PinInput({ value = "", onChange, disabled = false }) {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (idx, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    onChange(next.join(""));
    if (char && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0)
      inputs.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft" && idx > 0) inputs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputs.current[idx + 1]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`
            w-12 h-14 text-center text-2xl border-2 rounded-xl
            focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100
            transition-all
            ${d ? "border-primary-600 bg-primary-50" : "border-gray-300 bg-white"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />
      ))}
    </div>
  );
}
