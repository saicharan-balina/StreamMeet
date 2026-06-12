import { useState, useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

export default function Notification({ id, message, type, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const iconMap = {
    success: <FiCheckCircle className="text-lg" />,
    error: <FiAlertCircle className="text-lg" />,
    info: <FiInfo className="text-lg" />,
    warning: <FiAlertCircle className="text-lg" />,
  };

  const colorMap = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-sky-50 border-sky-200 text-sky-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
  };

  const iconColorMap = {
    success: "text-emerald-600",
    error: "text-red-600",
    info: "text-sky-600",
    warning: "text-amber-600",
  };

  return (
    <div
      className={`pointer-events-auto transform transition-all duration-300 ${
        isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div
        className={`flex items-start gap-3 border rounded-lg px-4 py-3 shadow-md backdrop-blur-sm ${colorMap[type]}`}
      >
        <div className={`mt-0.5 ${iconColorMap[type]}`}>
          {iconMap[type]}
        </div>
        <p className="text-sm font-medium flex-1 leading-relaxed">{message}</p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 mt-0.5 hover:opacity-70 transition"
          aria-label="Close notification"
        >
          <FiX className="text-lg" />
        </button>
      </div>
    </div>
  );
}
