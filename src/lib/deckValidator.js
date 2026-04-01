/**
 * Validate sideboard composition
 * Rules:
 * - 0-15 cards total
 * - Max 3 copies of any card by name
 */
export function validateSideboard(sideboard) {
  const violations = [];

  // Check total count
  if (sideboard.length > 15) {
    violations.push({
      type: "SIDEBOARD_SIZE",
      message: `Sideboard has ${sideboard.length} cards (max 15)`,
      severity: "error",
    });
  }

  // Check max 3 copies by name
  const cardCounts = {};
  sideboard.forEach((card) => {
    const name = card.name;
    cardCounts[name] = (cardCounts[name] || 0) + 1;
  });

  Object.entries(cardCounts).forEach(([name, count]) => {
    if (count > 3) {
      violations.push({
        type: "SIDEBOARD_COPIES",
        message: `"${name}" has ${count} copies in sideboard (max 3)`,
        severity: "error",
      });
    }
  });

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Validate full deck (optional integration)
 */
export function validateDeck(deck) {
  const violations = [];

  // Validate sideboard if present
  if (deck.sideboard && deck.sideboard.length > 0) {
    const sideboardValidation = validateSideboard(deck.sideboard);
    violations.push(...sideboardValidation.violations);
  }

  // Add other deck validations here if needed
  // (legends count, main deck size, etc.)

  return {
    isValid: violations.length === 0,
    violations,
  };
}
