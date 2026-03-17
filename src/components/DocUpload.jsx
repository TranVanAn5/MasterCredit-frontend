import { useRef, useMemo, useEffect } from "react";
import { FiUploadCloud, FiCheckCircle, FiX, FiFileText } from "react-icons/fi";

/**
 * Upload component cho tài liệu: ảnh (jpg, png, webp) hoặc PDF.
 * Props:
 *   label       – tiêu đề hiển thị
 *   hint        – mô tả định dạng chấp nhận (optional)
 *   file        – File | null (controlled)
 *   onFileChange(File|null) – callback
 *   acceptImage – chỉ chấp nhận ảnh (default false → chấp nhận cả PDF)
 *   disabled    – bool
 */
export default function DocUpload({
  label,
  hint,
  file,
  onFileChange,
  acceptImage = false,
  disabled = false,
}) {
  const inputRef = useRef();
  const isPdf = file?.type === "application/pdf";

  const imgPreview = useMemo(
    () => (file && !isPdf ? URL.createObjectURL(file) : null),
    [file, isPdf]
  );

  useEffect(() => {
    return () => {
      if (imgPreview) URL.revokeObjectURL(imgPreview);
    };
  }, [imgPreview]);

  const accept = acceptImage
    ? ".jpg,.jpeg,.png,.webp"
    : ".jpg,.jpeg,.png,.webp,.pdf";

  const defaultHint = acceptImage
    ? "JPG, PNG, WEBP – tối đa 5 MB"
    : "JPG, PNG, WEBP, PDF – tối đa 5 MB";

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      )}

      {/* ── File selected ── */}
      {file ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-primary-400 bg-primary-50">
          {isPdf ? (
            /* PDF preview */
            <div className="h-40 flex flex-col items-center justify-center gap-2 bg-red-50">
              <FiFileText size={40} className="text-red-500" />
              <span className="text-sm font-medium text-red-700">PDF Document</span>
            </div>
          ) : (
            /* Image preview */
            <img
              src={imgPreview}
              alt="preview"
              className="w-full h-40 object-cover"
            />
          )}

          {/* Status badges */}
          <div className="absolute top-2 right-2 flex gap-2">
            <span className="bg-green-500 text-white rounded-full p-1">
              <FiCheckCircle size={14} />
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => onFileChange(null)}
                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Filename bar */}
          <p className="text-xs text-primary-700 font-medium text-center py-1.5 bg-primary-100 truncate px-3">
            {file.name}
          </p>
        </div>
      ) : (
        /* ── Dropzone ── */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl
            flex flex-col items-center justify-center gap-2
            text-gray-400 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600
            transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiUploadCloud size={32} />
          <span className="text-sm font-medium">Nhấn để chọn tệp</span>
          <span className="text-xs">{hint ?? defaultHint}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        disabled={disabled}
      />
    </div>
  );
}
