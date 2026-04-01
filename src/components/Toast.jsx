import { useEffect, useState } from "react";

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 5000, // ← CAMBIAR DEFAULT A 5 SEGUNDOS
}) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // PARCHE: Limpiar el temporizador si el componente muere antes
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-term-green/20 border-term-green",
    error: "bg-term-red/20 border-term-red",
    warning: "bg-term-amber/20 border-term-amber",
    info: "bg-term-blue/20 border-term-blue",
  }[type];

  const textColor = {
    success: "text-term-green",
    error: "text-term-red",
    warning: "text-term-amber",
    info: "text-term-blue",
  }[type];

  const icon = {
    success: "✓",
    error: "✗",
    warning: "⚠",
    info: "ℹ",
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transition-all duration-500 ${
        isLeaving ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
      }`}
    >
      <div
        className={`${bgColor} ${textColor} border-2 rounded px-6 py-4 font-mono shadow-lg min-w-[300px] cursor-pointer hover:opacity-90`}
        onClick={onClose}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="text-sm">{message}</span>
        </div>
      </div>
    </div>
  );
}
