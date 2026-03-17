import { useRef, useMemo, useEffect } from "react";
import { FiUploadCloud, FiCheckCircle, FiX } from "react-icons/fi";

export default function FileUpload({ label, file, onFileChange, disabled }) {
  const inputRef = useRef();

  // Create object URL only when file changes and cleanup on unmount/file change
  const preview = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  useEffect(() => {
    // Cleanup object URL when component unmounts or file changes
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-primary-400 bg-primary-50">
          <img src={preview} alt="preview" className="w-full h-40 object-cover" />
          <div className="absolute top-2 right-2 flex gap-2">
            <span className="bg-green-500 text-white rounded-full p-1">
              <FiCheckCircle size={14} />
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => onFileChange(null)}
                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
          <p className="text-xs text-primary-700 font-medium text-center py-1.5 bg-primary-100">
            {file.name}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="
            w-full h-40 border-2 border-dashed border-gray-300 rounded-xl
            flex flex-col items-center justify-center gap-2
            text-gray-400 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600
            transition-all disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <FiUploadCloud size={32} />
          <span className="text-sm font-medium">Nhấn để chọn ảnh</span>
          <span className="text-xs">JPG, PNG, WEBP – tối đa 5MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        disabled={disabled}
      />
    </div>
  );
}
