import { useState } from "react";

export default function CyberCard({ card, isFlipped: initialFlipped = false }) {
  const [isTapped, setIsTapped] = useState(card?.isTapped || false);
  const [isFlipped, setIsFlipped] = useState(initialFlipped);
  const [zIndex, setZIndex] = useState(100);

  // Determine card type color
  const getCardTypeClass = () => {
    if (card.type === "LEGEND") return "type-legend";
    if (card.type === "UNIT") return "type-unit";
    if (card.type === "GEAR") return "type-gear";
    if (card.type === "GIG") return "type-gig";
    return "";
  };

  // Handle click: Tap/Untap
  const handleClick = (e) => {
    e.stopPropagation();
    setZIndex((prev) => prev + 1);
    setIsTapped(!isTapped);
  };

  // Handle right-click: Flip
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setZIndex((prev) => prev + 1);
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`cyber-card ${getCardTypeClass()} ${isTapped ? "tapped" : ""} ${isFlipped ? "flipped" : ""} ${card?.isTapped && card?.type === "UNIT" ? "opacity-50 saturate-50" : ""}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      draggable={true}
      style={{ zIndex }}
    >
      <div className="card-inner">
        {/* Card Front */}
        <div
          className="card-front"
          style={{
            backgroundImage: card.image_url ? `url(${card.image_url})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="card-header bg-black/60 px-1 rounded flex justify-between items-center">
            <span>[{card.type}]</span>
            {card.cost > 0 && card.type !== "PROGRAM" && (
              <span className="text-term-amber text-[8px] font-bold">€$</span>
            )}
          </div>
          <div className="card-name">{card.name}</div>
          <div className="card-stats">
            {card.type === "LEGEND" && <span>RAM: {card.ram || 0}</span>}
            {card.type === "UNIT" &&
              (() => {
                const basePower = card.basePower ?? card.power ?? 0;
                const currentPower = card.power ?? 0;
                const buff = currentPower - basePower;
                return (
                  <>
                    <span>
                      ATK: {basePower}
                      {buff > 0 && (
                        <span style={{ color: "#4ade80", fontSize: "0.75em" }}>
                          {" "}
                          +{buff}
                        </span>
                      )}
                      {buff < 0 && (
                        <span style={{ color: "#f87171", fontSize: "0.75em" }}>
                          {" "}
                          {buff}
                        </span>
                      )}
                    </span>
                    <span>HP: {card.hp || 0}</span>
                  </>
                );
              })()}
            {card.type === "GEAR" && <span>+{card.power || 0} PWR</span>}
            {card.type === "GIG" && <span>★ {card.streetCred || 0}</span>}
          </div>
        </div>

        {/* Card Back */}
        <div className="card-back">
          <span>TCG</span>
        </div>
      </div>

      {/* Inline Styles */}
      <style>{`
        .cyber-card {
          width: 70px;
          height: 90px;
          background-color: transparent;
          cursor: grab;
          perspective: 1000px;
          position: relative;
          transition: transform 0.3s ease;
          z-index: 100;
        }
        .cyber-card:active {
          cursor: grabbing;
        }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.8);
        }
        .cyber-card.flipped .card-inner {
          transform: rotateY(180deg);
        }
        .cyber-card.tapped {
          transform: rotate(90deg);
        }
        .cyber-card.tapped.flipped {
          transform: rotate(90deg) rotateY(180deg);
        }
        .card-front,
        .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          border-radius: 5px;
          border: 2px solid;
          padding: 5px;
          box-sizing: border-box;
          background-color: #1a1a1a;
        }
        .type-legend .card-front {
          border-color: #f7e018;
          color: #f7e018;
        }
        .type-unit .card-front {
          border-color: #ff2a2a;
          color: #ff2a2a;
        }
        .type-gear .card-front {
          border-color: #00d2ff;
          color: #00d2ff;
        }
        .type-gig .card-front {
          border-color: #39ff14;
          color: #39ff14;
        }
        .card-header {
          font-size: 8px;
          width: 100%;
          text-align: left;
          opacity: 0.8;
        }
        .card-name {
          font-weight: bold;
          font-size: 11px;
          line-height: 1;
        }
        .card-stats {
          font-size: 10px;
          width: 100%;
          border-top: 1px dashed currentColor;
          padding-top: 3px;
          display: flex;
          justify-content: space-between;
        }
        .card-back {
          background-color: #333;
          color: #111;
          transform: rotateY(180deg);
          background-image: repeating-linear-gradient(
              45deg,
              #222 25%,
              transparent 25%,
              transparent 75%,
              #222 75%,
              #222
            ),
            repeating-linear-gradient(
              45deg,
              #222 25%,
              #333 25%,
              #333 75%,
              #222 75%,
              #222
            );
          background-position: 0 0, 10px 10px;
          background-size: 20px 20px;
          border-color: #555;
          justify-content: center;
        }
        .card-back span {
          background-color: #f7e018;
          padding: 2px 5px;
          font-weight: bold;
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}
