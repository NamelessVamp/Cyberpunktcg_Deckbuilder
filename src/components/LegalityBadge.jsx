import { getCardLegality } from "../lib/legalityService";

function LegalityBadge({ cardId, size = "sm" }) {
  const legality = getCardLegality(cardId);

  if (legality === "legal") {
    return null; // No badge for legal cards
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const badgeConfig = {
    banned: {
      text: "BANNED",
      bgClass: "bg-term-red/90",
      borderClass: "border-term-red",
      textClass: "text-white",
      icon: "🛇",
    },
    restricted: {
      text: "RESTRICTED",
      bgClass: "bg-term-amber/90",
      borderClass: "border-term-amber",
      textClass: "text-term-black",
      icon: "⚠︎",
    },
  };

  const config = badgeConfig[legality];

  return (
    <div
      className={`inline-flex items-center gap-1 ${sizeClasses[size]} ${config.bgClass} border ${config.borderClass} ${config.textClass} font-mono font-bold rounded`}
      title={
        legality === "banned"
          ? "This card is banned and cannot be used"
          : "This card is restricted to 1 copy maximum"
      }
    >
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
}

export default LegalityBadge;
