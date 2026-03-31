import cardLegality from "../data/cardLegality.json";

/**
 * Get legality status of a card
 * @param {string} cardId - Card ID to check
 * @returns {'legal' | 'restricted' | 'banned'}
 */
export function getCardLegality(cardId) {
  if (cardLegality.banned.includes(cardId)) {
    return "banned";
  }
  if (cardLegality.restricted.includes(cardId)) {
    return "restricted";
  }
  return "legal";
}

/**
 * Check if a card is legal (not banned)
 * @param {string} cardId
 * @returns {boolean}
 */
export function isCardLegal(cardId) {
  return !cardLegality.banned.includes(cardId);
}

/**
 * Check if a card is restricted (max 1 copy)
 * @param {string} cardId
 * @returns {boolean}
 */
export function isCardRestricted(cardId) {
  return cardLegality.restricted.includes(cardId);
}

/**
 * Validate deck legality
 * @param {Object} deck - Deck object with legends and mainDeck arrays
 * @returns {Object} Validation result
 */
export function validateDeckLegality(deck) {
  const issues = [];

  // Check Legends
  deck.legends.forEach((card) => {
    const legality = getCardLegality(card.id);
    if (legality === "banned") {
      issues.push({
        cardId: card.id,
        cardName: card.name,
        issue: "banned",
        message: `${card.name} is BANNED and cannot be used`,
      });
    }
  });

  // Check Main Deck
  const cardCounts = {};
  deck.mainDeck.forEach((card) => {
    cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
  });

  Object.entries(cardCounts).forEach(([cardId, count]) => {
    const card = deck.mainDeck.find((c) => c.id === cardId);
    const legality = getCardLegality(cardId);

    if (legality === "banned") {
      issues.push({
        cardId,
        cardName: card.name,
        issue: "banned",
        message: `${card.name} is BANNED and cannot be used`,
      });
    } else if (legality === "restricted" && count > 1) {
      issues.push({
        cardId,
        cardName: card.name,
        issue: "restricted",
        message: `${card.name} is RESTRICTED to 1 copy (you have ${count})`,
      });
    }
  });

  return {
    isLegal: issues.length === 0,
    issues,
    bannedCount: issues.filter((i) => i.issue === "banned").length,
    restrictedViolations: issues.filter((i) => i.issue === "restricted").length,
  };
}

/**
 * Get all banned cards
 * @returns {Array<string>}
 */
export function getBannedCards() {
  return cardLegality.banned;
}

/**
 * Get all restricted cards
 * @returns {Array<string>}
 */
export function getRestrictedCards() {
  return cardLegality.restricted;
}

/**
 * Get legality metadata
 * @returns {Object}
 */
export function getLegalityInfo() {
  return cardLegality.notes;
}
