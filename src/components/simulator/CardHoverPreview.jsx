// NON OMNIS MORIAR — CardHoverPreview
// EX MACHINA — Lightweight hover tooltip for simulator cards
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function CardHoverPreview({ card, mouseX, mouseY }) {
  const [position, setPosition] = useState({ x: mouseX, y: mouseY });

  // Update position when mouse moves
  useEffect(() => {
    // Smart positioning — avoid edges
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = 280; // Preview width
    const cardHeight = 400; // Preview height
    const padding = 20; // Distance from cursor

    let x = mouseX + padding;
    let y = mouseY - cardHeight / 2;

    // If too close to right edge, show on left
    if (x + cardWidth > viewportWidth - padding) {
      x = mouseX - cardWidth - padding;
    }

    // If too close to bottom, align to bottom
    if (y + cardHeight > viewportHeight - padding) {
      y = viewportHeight - cardHeight - padding;
    }

    // If too close to top, align to top
    if (y < padding) {
      y = padding;
    }

    setPosition({ x, y });
  }, [mouseX, mouseY]);

  if (!card) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: position.x,
        top: position.y,
      }}
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {/* Card container */}
      <div className="bg-term-gray border-2 border-term-amber rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,179,0,0.4)] w-[280px]">
        {/* Card image */}
        <div className="relative w-full h-[360px] bg-black">
          {card.image_url ? (
            <img
              src={card.image_url}
              alt={card.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-term-amber/40 font-mono">
              [NO IMAGE]
            </div>
          )}
        </div>

        {/* Card info */}
        <div className="p-3 bg-term-black/90 border-t border-term-amber/30">
          <div className="flex justify-between items-start mb-1">
            <div className="text-term-amber font-mono font-bold text-sm">
              {card.name}
            </div>
            {card.cost > 0 && (
              <div className="text-term-green font-mono font-bold text-sm">
                €${card.cost}
              </div>
            )}
          </div>

          <div className="flex gap-2 text-xs font-mono text-term-green/60 mb-2">
            <span>[{card.type}]</span>
            {card.power !== undefined && card.power !== null && (
              <span>PWR: {card.power}</span>
            )}
          </div>

          {/* Card text (if short enough) */}
          {card.text && card.text.length < 120 && (
            <div className="text-term-green/80 font-sans text-xs leading-relaxed mt-2 p-2 bg-black/40 rounded border border-term-amber/10">
              {card.text}
            </div>
          )}

          {/* Keywords */}
          {card.keywords && card.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {card.keywords.slice(0, 3).map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-term-amber/20 text-term-amber rounded font-mono text-[10px] border border-term-amber/40"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hint text */}
      <div className="mt-2 text-center text-term-amber/40 font-mono text-[10px]">
        Click for details • Right-click to flip
      </div>
    </motion.div>
  );
}
