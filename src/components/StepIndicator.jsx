import { FiCheck } from "react-icons/fi";

/**
 * steps: Array<{ label: string }>
 * current: 0-based index
 */
export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center mb-8 px-2">
      {steps.map((step, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-9 h-9 rounded-full border-2 flex items-center justify-center
                  text-sm font-bold transition-all duration-300
                  ${done   ? "bg-primary-600 border-primary-600 text-white" : ""}
                  ${active ? "bg-primary-600 border-primary-600 text-white ring-4 ring-primary-100" : ""}
                  ${!done && !active ? "bg-white border-gray-300 text-gray-400" : ""}
                `}
              >
                {done ? <FiCheck size={16} /> : i + 1}
              </div>
              <span
                className={`
                  mt-1.5 text-xs font-medium whitespace-nowrap
                  ${active ? "text-primary-600" : done ? "text-primary-500" : "text-gray-400"}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`
                  h-0.5 w-10 sm:w-16 mx-1 mb-5 transition-all duration-300
                  ${i < current ? "bg-primary-600" : "bg-gray-200"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
