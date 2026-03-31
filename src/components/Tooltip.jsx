import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function Tooltip({ id, title, content, position = "top", children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState(null);
  const triggerRef = useRef(null);

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const updatePosition = () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setTriggerRect(rect);
        }
      };

      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isVisible]);

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!triggerRect) return { opacity: 0 };

    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const gap = 12;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left,
      top,
      transform = "";

    switch (position) {
      case "top":
        left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        top = triggerRect.top - gap;
        transform = "translateY(-100%)";

        if (left < 10) left = 10;
        if (left + tooltipWidth > windowWidth - 10) {
          left = windowWidth - tooltipWidth - 10;
        }
        break;

      case "bottom":
        left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        top = triggerRect.bottom + gap;

        if (left < 10) left = 10;
        if (left + tooltipWidth > windowWidth - 10) {
          left = windowWidth - tooltipWidth - 10;
        }
        break;

      case "left":
        left = triggerRect.left - tooltipWidth - gap;
        top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;

        if (left < 10) {
          left = triggerRect.right + gap;
        }
        break;

      case "right":
        left = triggerRect.right + gap;
        top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;

        if (left + tooltipWidth > windowWidth - 10) {
          left = triggerRect.left - tooltipWidth - gap;
        }
        break;

      default:
        left = triggerRect.left;
        top = triggerRect.top;
    }

    if (top < 10) top = 10;
    if (top + tooltipHeight > windowHeight - 10) {
      top = windowHeight - tooltipHeight - 10;
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
      transform,
      opacity: 1,
    };
  };

  const getArrowPosition = () => {
    if (!triggerRect) return {};

    const tooltipStyle = getTooltipStyle();
    if (tooltipStyle.opacity === 0) return {};

    const tooltipLeft = parseFloat(tooltipStyle.left);
    const triggerCenter = triggerRect.left + triggerRect.width / 2;

    let arrowLeft = triggerCenter - tooltipLeft;

    const minArrowPos = 30;
    const maxArrowPos = 290;
    arrowLeft = Math.max(minArrowPos, Math.min(maxArrowPos, arrowLeft));

    return {
      left: `${arrowLeft}px`,
    };
  };

  const arrowBaseClasses = {
    top: "top-full border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-term-amber",
    bottom:
      "bottom-full border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-term-amber",
    left: "left-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-term-amber",
    right:
      "right-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-term-amber",
  };

  return (
    <>
      {/* Trigger Element */}
      <span
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block cursor-help"
      >
        {children}
      </span>

      {/* Tooltip Content - Rendered in Portal */}
      {isVisible &&
        triggerRect &&
        createPortal(
          <div
            className="fixed z-[99999] w-80 animate-fadeIn pointer-events-none transition-opacity duration-200"
            style={getTooltipStyle()}
          >
            {/* Arrow - Dynamic position */}
            {(position === "top" || position === "bottom") && (
              <div
                className={`absolute ${arrowBaseClasses[position]} w-0 h-0 -translate-x-1/2`}
                style={getArrowPosition()}
              />
            )}
            {(position === "left" || position === "right") && (
              <div
                className={`absolute ${arrowBaseClasses[position]} w-0 h-0`}
              />
            )}

            {/* Tooltip Box */}
            <div className="bg-term-amber border-2 border-term-amber/80 rounded-lg shadow-2xl p-4 pointer-events-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">ℹ️</span>
                  <h4 className="text-term-black font-mono font-bold text-sm">
                    {title}
                  </h4>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-term-black hover:text-red-600 font-bold text-lg leading-none transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
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
