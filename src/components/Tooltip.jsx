import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTooltipQueue } from "../contexts/TooltipContext";

function Tooltip({ id, title, content, position = "top", children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const [triggerRect, setTriggerRect] = useState(null);
  const [triggerRef, setTriggerRef] = useState(null);

  const { registerTooltip, dismissTooltip, canShowTooltip } = useTooltipQueue();

  // Check if tooltip has been seen and register to queue
  useEffect(() => {
    const seen = localStorage.getItem(id);
    setHasBeenSeen(!!seen);

    if (!seen) {
      // Register to queue with delay to avoid all showing at once
      const registrationDelay = setTimeout(() => {
        registerTooltip(id);
      }, 500);

      return () => clearTimeout(registrationDelay);
    }
  }, [id, registerTooltip]);

  // Show tooltip when it becomes active in queue
  useEffect(() => {
    if (!hasBeenSeen && canShowTooltip(id)) {
      const showDelay = setTimeout(() => {
        setIsVisible(true);
      }, 800);

      return () => clearTimeout(showDelay);
    }
  }, [id, hasBeenSeen, canShowTooltip]);

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible && triggerRef) {
      const rect = triggerRef.getBoundingClientRect();
      setTriggerRect(rect);
    }
  }, [isVisible, triggerRef]);

  const handleClose = () => {
    if (!hasBeenSeen) {
      dismissTooltip(id);
      setHasBeenSeen(true);
    }
    setIsVisible(false);
  };

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!triggerRect) return {};

    const tooltipWidth = 320;
    const gap = 8;

    switch (position) {
      case "top":
        return {
          left: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
          top: triggerRect.top - gap,
          transform: "translateY(-100%)",
        };
      case "bottom":
        return {
          left: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
          top: triggerRect.bottom + gap,
        };
      case "left":
        return {
          right: window.innerWidth - triggerRect.left + gap,
          top: triggerRect.top + triggerRect.height / 2,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          left: triggerRect.right + gap,
          top: triggerRect.top + triggerRect.height / 2,
          transform: "translateY(-50%)",
        };
      default:
        return {};
    }
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-term-amber",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-term-amber",
    left: "left-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-term-amber",
    right:
      "right-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-term-amber",
  };

  const showPulseAnimation = !hasBeenSeen && canShowTooltip(id);

  return (
    <>
      {/* Trigger Element */}
      <div
        ref={setTriggerRef}
        onMouseEnter={() => hasBeenSeen && setIsVisible(true)}
        onMouseLeave={() => hasBeenSeen && setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-block cursor-help"
      >
        {children}
      </div>

      {/* Tooltip Content - Rendered in Portal */}
      {isVisible &&
        triggerRect &&
        createPortal(
          <div
            className="fixed z-[99999] w-80 animate-fadeIn pointer-events-none"
            style={{
              ...getTooltipStyle(),
              animation: showPulseAnimation
                ? "pulse 2s ease-in-out infinite"
                : "none",
            }}
          >
            {/* Arrow */}
            <div className={`absolute ${arrowClasses[position]} w-0 h-0`}></div>

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
                  onClick={handleClose}
                  className="text-term-black hover:text-red-600 font-bold text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="text-term-black text-xs font-mono leading-relaxed">
                {content}
              </div>

              {/* First Time Badge */}
              {showPulseAnimation && (
                <div className="mt-3 pt-3 border-t border-term-black/20">
                  <p className="text-term-black/60 text-xs font-mono italic">
                    💡 This tooltip won't auto-show again. Hover over (ⓘ) to see
                    it.
                  </p>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default Tooltip;
