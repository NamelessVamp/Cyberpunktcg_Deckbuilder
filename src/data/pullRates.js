// EX MACHINA — Pull rates oficiales WeirdCo Alpha/Beta Kit
export const PULL_RATES = {
  Common: { guaranteed: 7, perPack: 1.0, foil: false },
  Uncommon: { guaranteed: 3, perPack: 1.0, foil: false },
  Rare: { guaranteed: 0, perPack: 1.0, slots: 2, foil: false },
  "Epic Rare": { guaranteed: 0, perPack: 0.25, foil: false },
  "Iconic Rare": { guaranteed: 0, perPack: 0.0556, foil: true, altArt: true },
  "Secret Rare": { guaranteed: 0, perPack: 0.0417, foil: false },
  "Nova Rare": {
    guaranteed: 0,
    perPack: 0.0,
    exclusive: true,
    source: "Kickstarter/Box Topper",
  },
};

export const RARITY_COLORS = {
  Common: "#9ca3af",
  Uncommon: "#34d399",
  Rare: "#60a5fa",
  "Epic Rare": "#a78bfa",
  "Iconic Rare": "#fbbf24",
  "Secret Rare": "#f87171",
  "Nova Rare": "#ff1e50",
};
