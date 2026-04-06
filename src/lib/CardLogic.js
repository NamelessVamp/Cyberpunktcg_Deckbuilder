// NON OMNIS MORIAR — Card actions live here

export class CardLogic {
  constructor(gameState) {
    this.game = gameState;
  }

  // =====================================================
  // CALL LEGEND (C.O.R.E. - Call step)
  // =====================================================

  callLegend(playerId, legendIndex) {
    const player = this.game.players[playerId];
    const legend = player.legends[legendIndex];

    if (!legend) {
      return { success: false, error: "Legend not found" };
    }

    if (legend.isFaceUp) {
      return { success: false, error: "Legend already called" };
    }

    // Flip face-up
    legend.isFaceUp = true;

    return {
      success: true,
      message: `Called ${legend.name}`,
      legend,
    };
  }

  // =====================================================
  // SELL CARD (Fixer zone - get Eddies)
  // =====================================================

  sellCard(playerId, cardIndex) {
    const player = this.game.players[playerId];
    const card = player.hand[cardIndex];

    if (!card) {
      return { success: false, error: "Card not found in hand" };
    }

    // Check if card has Sell Tag (€$)
    // NOTE: En cards.json actual NO hay campo "sellable"
    // Asumimos que si tiene cost > 0, es vendible
    // FUTURE: Agregar campo "sellable: true" en cards.json

    if (card.cost === 0) {
      return { success: false, error: "Card cannot be sold (cost 0)" };
    }

    // Remove from hand
    player.hand.splice(cardIndex, 1);

    // Add to Fixer (Eddies zone)
    player.eddies.push(card);

    return {
      success: true,
      message: `Sold ${card.name} for ${card.cost} Eddies`,
      card,
      currentEddies: player.eddies.length,
    };
  }

  // =====================================================
  // PLAY CARD (C.O.R.E. - Organize step)
  // =====================================================

  playCard(playerId, cardIndex, targetIndex = null) {
    const player = this.game.players[playerId];
    const card = player.hand[cardIndex];

    if (!card) {
      return { success: false, error: "Card not found in hand" };
    }

    // Check if player can afford the card
    const totalEddies = player.eddies.length;
    if (card.cost > totalEddies) {
      return {
        success: false,
        error: `Not enough Eddies (need ${card.cost}, have ${totalEddies})`,
      };
    }

    // Check RAM requirement
    const ramCheck = this.checkRAMRequirement(player, card);
    if (!ramCheck.valid) {
      return { success: false, error: ramCheck.error };
    }

    // Spend Eddies (tap Legends equal to cost)
    const spendResult = this.spendEddies(player, card.cost);
    if (!spendResult.success) {
      return spendResult;
    }

    // Remove from hand
    player.hand.splice(cardIndex, 1);

    // Play based on type
    if (card.type === "UNIT") {
      // Add to field (face-up, tapped - "summoning sickness")
      player.field.push({ ...card, isTapped: true });

      return {
        success: true,
        message: `Played ${card.name} (tapped)`,
        card,
      };
    }

    if (card.type === "GEAR") {
      // Gear must attach to a Unit
      if (targetIndex === null) {
        return { success: false, error: "Gear requires a target Unit" };
      }

      return this.attachGear(playerId, card, targetIndex);
    }

    if (card.type === "PROGRAM") {
      // Programs resolve immediately and go to trash
      // NOTE: Program effects need to be implemented per-card
      // For now, just put in trash
      player.trash.push(card);

      return {
        success: true,
        message: `Played ${card.name} (resolving...)`,
        card,
        note: "Program effects not yet implemented",
      };
    }

    return { success: false, error: "Unknown card type" };
  }

  // =====================================================
  // ATTACH GEAR
  // =====================================================

  attachGear(playerId, gearCard, unitIndex) {
    const player = this.game.players[playerId];
    const unit = player.field[unitIndex];

    if (!unit) {
      return { success: false, error: "Target Unit not found" };
    }

    if (unit.type !== "UNIT") {
      return { success: false, error: "Gear can only attach to Units" };
    }

    // Attach Gear to Unit
    if (!unit.attachedGear) {
      unit.attachedGear = [];
    }

    unit.attachedGear.push(gearCard);

    return {
      success: true,
      message: `Attached ${gearCard.name} to ${unit.name}`,
      unit,
    };
  }

  // =====================================================
  // GO SOLO (Move Legend to Field as Unit)
  // =====================================================

  goSolo(playerId, legendIndex) {
    const player = this.game.players[playerId];
    const legend = player.legends[legendIndex];

    if (!legend) {
      return { success: false, error: "Legend not found" };
    }

    if (!legend.isFaceUp) {
      return { success: false, error: "Legend must be called first" };
    }

    // Check if Legend has GO SOLO keyword
    if (!legend.keywords || !legend.keywords.includes("GO SOLO")) {
      return { success: false, error: "Legend does not have GO SOLO" };
    }

    // Move to field as ready Unit (NOT tapped)
    const legendAsUnit = {
      ...legend,
      type: "UNIT",
      isTapped: false,
      isLegendUnit: true, // Mark as special Legend-Unit
    };

    player.field.push(legendAsUnit);

    // Remove from Legends zone
    player.legends.splice(legendIndex, 1);

    return {
      success: true,
      message: `${legend.name} goes SOLO!`,
      unit: legendAsUnit,
    };
  }

  // =====================================================
  // RAM VALIDATION (Dynamic - reads Legends)
  // =====================================================

  checkRAMRequirement(player, card) {
    // Calculate available RAM from face-up Legends
    const ramLimits = {};

    player.legends.forEach((legend) => {
      if (legend.isFaceUp) {
        const color = legend.ram_color;
        ramLimits[color] = (ramLimits[color] || 0) + legend.ram;
      }
    });

    // Check if card requires RAM
    if (!card.ram_color) {
      // Card has no RAM requirement (e.g., Programs)
      return { valid: true };
    }

    const requiredRAM = card.ram || 0;
    const availableRAM = ramLimits[card.ram_color] || 0;

    if (requiredRAM > availableRAM) {
      return {
        valid: false,
        error: `Not enough ${card.ram_color} RAM (need ${requiredRAM}, have ${availableRAM})`,
      };
    }

    return { valid: true };
  }

  // =====================================================
  // SPEND EDDIES (Tap Legends)
  // =====================================================

  spendEddies(player, cost) {
    // Count untapped Legends (available Eddies)
    const untappedLegends = player.legends.filter(
      (l) => l.isFaceUp && !l.isTapped,
    );

    if (untappedLegends.length < cost) {
      return {
        success: false,
        error: `Not enough Eddies (need ${cost}, have ${untappedLegends.length} untapped Legends)`,
      };
    }

    // Tap Legends equal to cost
    for (let i = 0; i < cost; i++) {
      untappedLegends[i].isTapped = true;
    }

    return {
      success: true,
      message: `Spent ${cost} Eddies (tapped ${cost} Legends)`,
    };
  }

  // =====================================================
  // RECALCULATE RAM (for Deck Validator)
  // =====================================================

  static recalculateRAM(legends) {
    const ramLimits = {};

    legends.forEach((legend) => {
      const color = legend.ram_color;
      ramLimits[color] = (ramLimits[color] || 0) + legend.ram;
    });

    return ramLimits;
  }
}
