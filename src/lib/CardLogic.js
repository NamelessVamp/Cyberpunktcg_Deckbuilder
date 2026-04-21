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

    legend.isFaceUp = true;
    this._fireTrigger("CALL", playerId, legend);
    return {
      success: true,
      message: `Called ${legend.name}`,
      legend,
    };

    // Costs 2 Eddies
    const spendResult = this.spendEddies(player, 2);
    if (!spendResult.success) {
      return { success: false, error: "Calling a Legend costs 2 Eddies" };
    }
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

    if (player.hasSoldThisTurn) {
      return { success: false, error: "Ya vendiste una carta este turno" };
    }
    player.hasSoldThisTurn = true;

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
    const availableEddies = player.eddies.filter((e) => !e.isTapped).length;
    const untappedLegends = player.legends.filter((l) => !l.isTapped).length;
    const totalEddies = availableEddies + untappedLegends;
    if (card.cost > totalEddies) {
      return {
        success: false,
        error: `Not enough Eddies (need ${card.cost}, have ${totalEddies})`,
      };
    }

    // RAM is a deckbuilding rule only — not validated during gameplay

    // Spend Eddies (tap Legends equal to cost)
    const spendResult = this.spendEddies(player, card.cost);
    if (!spendResult.success) {
      return spendResult;
    }

    // Remove from hand
    player.hand.splice(cardIndex, 1);

    // Play based on type
    if (card.type === "UNIT") {
      const unitInPlay = { ...card, isTapped: true, basePower: card.power };
      player.field.push(unitInPlay);
      this._fireTrigger("PLAY", playerId, unitInPlay);
      return {
        success: true,
        message: `Played ${card.name} (tapped)`,
        card: unitInPlay,
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
      const result = this._resolveProgram(playerId, card, targetIndex);
      player.trash.push(card);
      return result;
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
    let remaining = cost;
    const eddiesPool = player.eddies.filter((e) => !e.isTapped);
    for (let i = 0; i < eddiesPool.length && remaining > 0; i++) {
      eddiesPool[i].isTapped = true;
      remaining--;
    }
    if (remaining > 0) {
      const legendsPool = player.legends.filter((l) => !l.isTapped);
      for (let i = 0; i < legendsPool.length && remaining > 0; i++) {
        legendsPool[i].isTapped = true;
        remaining--;
      }
    }
    if (remaining > 0)
      return { success: false, error: `Not enough Eddies (need ${cost})` };
    return { success: true, message: `Spent ${cost} Eddies` };
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

  // ── TRIGGER SYSTEM ─────────────────────────────────────────────

  _fireTrigger(keyword, playerId, card) {
    const g = this.game;
    if (!g) return;
    const player = g.players[playerId];
    const rival = g.players[playerId === 1 ? 2 : 1];

    g.log(`${keyword} trigger: ${card.name}`);

    // ── PLAY triggers ──────────────────────────────────────────
    if (keyword === "PLAY") {
      // Armored Minotaur: defeat rival unit power ≤5 if streetCred ≥12
      if (card.name === "Armored Minotaur") {
        if (player.streetCred >= 12) {
          const target = rival.field.find((u) => (u.power || 0) <= 5);
          if (target) {
            rival.field.splice(rival.field.indexOf(target), 1);
            rival.trash.push(target);
            g.log(`Armored Minotaur defeated ${target.name}`);
          }
        }
      }
      // Hanako Arasaka: reveal top 4, add same-color cards to chosen gig
      if (card.name === "Hanako Arasaka") {
        // Simplified: draw 1 card
        if (player.deck.length > 0) {
          player.hand.push(player.deck.splice(0, 1)[0]);
          g.log("Hanako Arasaka: drew 1 card");
        }
      }
      // Placide: discard Program → bottom-deck rival unit
      // (requires UI interaction — skipped for now)
    }

    // ── CALL triggers ──────────────────────────────────────────
    if (keyword === "CALL") {
      // Dum Dum: defeat friendly Gear → draw 4, else draw 1
      if (card.name === "Dum Dum") {
        const draw = Math.min(1, player.deck.length);
        for (let i = 0; i < draw; i++)
          player.hand.push(player.deck.splice(0, 1)[0]);
        g.log(`Dum Dum CALL: drew ${draw}`);
      }
      // Evelyn Parker: decrease rival gig by 3
      if (card.name === "Evelyn Parker") {
        if (rival.gigs.length > 0) {
          rival.gigs[rival.gigs.length - 1].value = Math.max(
            1,
            (rival.gigs[rival.gigs.length - 1].value || 1) - 3,
          );
          g.log("Evelyn Parker CALL: rival gig -3");
        }
      }
      // Saburo Arasaka: register faction boost for Arasaka units
      if (card.name === "Saburo Arasaka" || card.name?.includes("Saburo")) {
        g.registerEffect({
          type: "FACTION_BOOST",
          sourceCard: card.name,
          sourceCardId: card.id,
          faction: "ARASAKA",
          value: 1,
          condition: "fighting",
          duration: "permanent",
        });
        g.log("Saburo Arasaka: Arasaka units +1 power registered");
      }
      // Royce: register self power boost per gear
      if (card.name === "Royce") {
        const gearCount = player.field
          .filter((u) => u.attachedGear?.length > 0)
          .reduce((sum, u) => sum + u.attachedGear.length, 0);
        if (gearCount > 0) {
          g.registerEffect({
            type: "POWER_BOOST",
            sourceCard: "Royce",
            sourceCardId: card.id,
            targetId: card.id,
            value: gearCount * 2,
            duration: "permanent",
          });
        }
      }
      // Yorinobu: draw card when friendly Arasaka unit attacks (register trigger)
      if (card.name?.includes("Yorinobu")) {
        g.registerEffect({
          type: "ON_ATTACK_DRAW",
          sourceCard: card.name,
          sourceCardId: card.id,
          faction: "ARASAKA",
          duration: "permanent",
        });
        g.log("Yorinobu: registered Arasaka attack draw trigger");
      }
    }
  }

  // ── PROGRAM RESOLVER ───────────────────────────────────────────

  _resolveProgram(playerId, card, targetIndex) {
    const g = this.game;
    const player = g?.players[playerId];
    const rival = g?.players[playerId === 1 ? 2 : 1];

    // Reboot Optics: friendly unit +4 power this turn, defeated at end
    if (card.name === "Reboot Optics") {
      const target = player?.field[targetIndex];
      if (!target)
        return { success: false, error: "No target for Reboot Optics" };
      g?.registerEffect({
        type: "POWER_BOOST",
        sourceCard: "Reboot Optics",
        targetId: target.id,
        value: 4,
        duration: "turn",
      });
      // Mark unit for end-of-turn destruction
      target._destroyAtEndOfTurn = true;
      g?.log(
        `Reboot Optics: ${target.name} +4 power, destroyed at end of turn`,
      );
      return {
        success: true,
        message: `Reboot Optics: ${target.name} +4 power`,
      };
    }

    // Corporate Surveillance: spend rival unit cost ≤3
    if (card.name === "Corporate Surveillance") {
      const target = rival?.field.find(
        (u) => (u.cost || 0) <= 3 && !u.isTapped,
      );
      if (target) {
        target.isTapped = true;
        g?.log(`Corporate Surveillance: tapped ${target.name}`);
        return { success: true, message: `Tapped ${target.name}` };
      }
      return {
        success: true,
        message: "No valid target for Corporate Surveillance",
      };
    }

    // Industrial Assembly: increase friendly gig by 4
    if (card.name === "Industrial Assembly") {
      if (player?.gigs.length > 0) {
        player.gigs[player.gigs.length - 1].value =
          (player.gigs[player.gigs.length - 1].value || 1) + 4;
        g?.log("Industrial Assembly: gig +4");
        if (player.streetCred >= 7 && player.deck.length > 0) {
          player.hand.push(player.deck.splice(0, 1)[0]);
          g?.log("Industrial Assembly: drew 1 (7+ street cred)");
        }
      }
      return { success: true, message: "Industrial Assembly resolved" };
    }

    // Floor It: return spent unit cost ≤4 to hand
    if (card.name === "Floor It") {
      const target = rival?.field.find((u) => u.isTapped && (u.cost || 0) <= 4);
      if (target) {
        rival.field.splice(rival.field.indexOf(target), 1);
        rival.hand.push(target);
        g?.log(`Floor It: returned ${target.name} to hand`);
        return { success: true, message: `Floor It: returned ${target.name}` };
      }
      return { success: true, message: "No valid target for Floor It" };
    }

    // Afterparty at Lizzie's: adjust rival gig ±2
    if (card.name?.includes("Afterparty")) {
      if (rival?.gigs.length > 0) {
        rival.gigs[rival.gigs.length - 1].value = Math.max(
          1,
          (rival.gigs[rival.gigs.length - 1].value || 1) - 2,
        );
        g?.log("Afterparty: rival gig -2");
      }
      return { success: true, message: "Afterparty resolved" };
    }

    // Cyberpsychosis: can be played on rival attack (flag only — UI handles timing)
    if (card.name === "Cyberpsychosis") {
      // Effect: when played on a legend, treat as unit (remove indestructible)
      const target = targetIndex !== null ? rival?.field[targetIndex] : null;
      if (target) {
        target._cyberpsychosis = true;
        g?.log(`Cyberpsychosis applied to ${target.name}`);
        return {
          success: true,
          message: `Cyberpsychosis: ${target.name} affected`,
        };
      }
      return { success: true, message: "Cyberpsychosis played (no target)" };
    }

    // Default
    g?.log(`Program ${card.name} played (no specific effect)`);
    return {
      success: true,
      message: `Played ${card.name}`,
      note: "Effect pending",
    };
  }
}
