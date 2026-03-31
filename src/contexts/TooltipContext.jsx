import { createContext, useContext, useState, useEffect } from "react";

const TooltipContext = createContext();

export function TooltipProvider({ children }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipQueue, setTooltipQueue] = useState([]);

  // Process queue
  useEffect(() => {
    if (!activeTooltip && tooltipQueue.length > 0) {
      const nextTooltip = tooltipQueue[0];
      setActiveTooltip(nextTooltip);
    }
  }, [activeTooltip, tooltipQueue]);

  const registerTooltip = (id) => {
    const seen = localStorage.getItem(id);
    if (!seen && !tooltipQueue.includes(id) && activeTooltip !== id) {
      setTooltipQueue((prev) => [...prev, id]);
    }
  };

  const dismissTooltip = (id) => {
    localStorage.setItem(id, "true");
    setActiveTooltip(null);
    setTooltipQueue((prev) => prev.filter((t) => t !== id));
  };

  const canShowTooltip = (id) => {
    return activeTooltip === id;
  };

  return (
    <TooltipContext.Provider
      value={{
        registerTooltip,
        dismissTooltip,
        canShowTooltip,
        activeTooltip,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltipQueue() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltipQueue must be used within TooltipProvider");
  }
  return context;
}
