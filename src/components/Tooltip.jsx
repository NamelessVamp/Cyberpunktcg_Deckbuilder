import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function Tooltip({ title, content, position = "top", children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [arrowStyle, setArrowStyle] = useState({});
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null); // NUEVO: Para medir el tamaño real

  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    const calculatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      const tooltipWidth = tooltipRect.width;
      const tooltipHeight = tooltipRect.height;
      const gap = 12;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let left, top;
      let arrowLeft = "50%";
      let arrowTop = "50%";

      // 1. Calcular posición base del cuadro
      switch (position) {
        case "top":
          left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
          top = triggerRect.top - tooltipHeight - gap;
          break;
        case "bottom":
          left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
          top = triggerRect.bottom + gap;
          break;
        case "left":
          left = triggerRect.left - tooltipWidth - gap;
          top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
          break;
        case "right":
          left = triggerRect.right + gap;
          top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
          break;
        default:
          left = triggerRect.left;
          top = triggerRect.top;
      }

      // 2. Prevenir desbordamiento y ajustar flecha
      if (left < 10) left = 10;
      if (left + tooltipWidth > windowWidth - 10)
        left = windowWidth - tooltipWidth - 10;
      if (top < 10) top = 10;
      if (top + tooltipHeight > windowHeight - 10)
        top = windowHeight - tooltipHeight - 10;

      // 3. Posicionar flecha exactamente sobre el trigger
      if (position === "top" || position === "bottom") {
        const triggerCenter = triggerRect.left + triggerRect.width / 2;
        arrowLeft = `${Math.max(15, Math.min(tooltipWidth - 15, triggerCenter - left))}px`;
        arrowTop = "";
      } else {
        const triggerCenterV = triggerRect.top + triggerRect.height / 2;
        arrowTop = `${Math.max(15, Math.min(tooltipHeight - 15, triggerCenterV - top))}px`;
        arrowLeft = "";
      }

      setTooltipStyle({ left: `${left}px`, top: `${top}px` });
      setArrowStyle({ left: arrowLeft, top: arrowTop });
    };

    // Pequeño timeout para dejar que el DOM renderice y podamos medir tooltipRef
    const timer = setTimeout(calculatePosition, 0);

    window.addEventListener("scroll", calculatePosition, true);
    window.addEventListener("resize", calculatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isVisible, position, content]); // Se recalcula si el contenido cambia

  const arrowClasses = {
    top: "top-full -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-term-amber",
    bottom:
      "bottom-full -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-term-amber",
    left: "left-full -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-term-amber",
    right:
      "right-full -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-term-amber",
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </span>

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[99999] w-80 pointer-events-none"
            style={tooltipStyle}
          >
            {/* Flecha mejorada */}
            <div
              className={`absolute ${arrowClasses[position]} w-0 h-0`}
              style={arrowStyle}
            />

            <div className="bg-term-amber border-2 border-term-amber/80 rounded-lg shadow-2xl p-4 pointer-events-auto">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">ℹ️</span>
                  <h4 className="text-term-black font-mono font-bold text-sm uppercase">
                    {title}
                  </h4>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-term-black hover:text-red-600 font-bold text-lg leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="text-term-black text-xs font-mono leading-relaxed">
                {content}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default Tooltip;
