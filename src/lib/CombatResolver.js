// EX MACHINA — Combat resolution engine

export class CombatResolver {
  constructor(gameState) {
    this.game = gameState;
  }

  // =====================================================
  // DECLARE ATTACKER
  // =====================================================

  declareAttacker(playerId, unitIndex) {
    const player = this.game.players[playerId];
    const unit = player.field[unitIndex];

    if (!unit) {
      return { success: false, error: "Unit not found" };
    }

    if (unit.isTapped) {
      return { success: false, error: "Unit is tapped (cannot attack)" };
    }

    // Mark as attacking
    unit.isAttacking = true;

    return {
      success: true,
      message: `${unit.name} attacks!`,
      unit,
    };
  }

  // =====================================================
  // DECLARE BLOCKER
  // =====================================================

  declareBlocker(defenderId, blockerIndex, attackerIndex) {
    const defender = this.game.players[defenderId];
    const blocker = defender.field[blockerIndex];

    const attackerId = defenderId === 1 ? 2 : 1;
    const attacker = this.game.players[attackerId].field[attackerIndex];

    if (!blocker || !attacker) {
      return { success: false, error: "Unit not found" };
    }

    if (blocker.isTapped) {
      return { success: false, error: "Blocker is tapped (cannot block)" };
    }

    if (!attacker.isAttacking) {
      return { success: false, error: "Target is not attacking" };
    }

    // Mark blocker
    blocker.isBlocking = true;
    blocker.blockingTarget = attackerIndex;

    return {
      success: true,
      message: `${blocker.name} blocks ${attacker.name}!`,
      blocker,
      attacker,
    };
  }

  // =====================================================
  // RESOLVE COMBAT
  // =====================================================

  resolveCombat(attackerId) {
    const attacker = this.game.players[attackerId];
    const defenderId = attackerId === 1 ? 2 : 1;
    const defender = this.game.players[defenderId];

    const results = [];

    // Process all attacking units
    attacker.field.forEach((unit, idx) => {
      if (!unit.isAttacking) return;

      // Check if blocked
      const blocker = defender.field.find(
        (b) => b.isBlocking && b.blockingTarget === idx,
      );

      if (blocker) {
        // Blocked combat
        const result = this.resolveFight(
          unit,
          blocker,
          attacker,
          defender,
          attackerId,
        );
        results.push(result);
      } else {
        // Unblocked attack - steal Gigs
        const gigsStolen = this.calculateGigsStolen(unit.power);
        const stealResult = this.stealGigs(defenderId, attackerId, gigsStolen);

        results.push({
          type: "UNBLOCKED_ATTACK",
          attacker: unit.name,
          gigsStolen,
          ...stealResult,
        });
      }

      // Tap attacker
      unit.isTapped = true;
      unit.isAttacking = false;
    });

    // Clear blocking flags
    defender.field.forEach((unit) => {
      unit.isBlocking = false;
      unit.blockingTarget = null;
    });

    return {
      success: true,
      results,
    };
  }

  // =====================================================
  // RESOLVE FIGHT (Blocker vs Attacker)
  // =====================================================

  resolveFight(
    attacker,
    blocker,
    attackerPlayer,
    defenderPlayer,
    attackerPlayerId,
  ) {
    const defenderPlayerId = attackerPlayerId === 1 ? 2 : 1;
    const attackerPower = this.calculateTotalPower(attacker, {
      situation: "fighting",
      ownPlayer: attackerPlayer,
    });
    const blockerPower = this.calculateTotalPower(blocker, {
      situation: "fighting",
      ownPlayer: defenderPlayer,
    });

    const result = {
      type: "FIGHT",
      attacker: attacker.name,
      attackerPower,
      blocker: blocker.name,
      blockerPower,
      destroyed: [],
    };

    // Compare power
    if (attackerPower > blockerPower) {
      // Attacker wins - blocker destroyed
      this._destroyUnit(blocker, defenderPlayer);
      result.destroyed.push(blocker.name);
      result.winner = attacker.name;
      this._fireDefeated(blocker, defenderPlayer, attackerPlayer);
    } else if (blockerPower > attackerPower) {
      // Blocker wins - attacker destroyed
      this._destroyUnit(attacker, attackerPlayer);
      result.destroyed.push(attacker.name);
      result.winner = blocker.name;
      this._fireDefeated(attacker, attackerPlayer, defenderPlayer);
    } else {
      // Tie - both destroyed
      this._destroyUnit(blocker, defenderPlayer);
      this._destroyUnit(attacker, attackerPlayer);

      result.destroyed.push(blocker.name, attacker.name);
      result.winner = "TIE";
    }

    return result;
  }

  // =====================================================
  // CALCULATE TOTAL POWER (Unit + Gear)
  // =====================================================

  calculateTotalPower(unit, context = {}) {
    let power = unit.basePower ?? unit.power ?? 0;

    // Gear bonuses
    if (unit.attachedGear) {
      unit.attachedGear.forEach((gear) => {
        power += gear.power || 0;
      });
    }

    // activeEffects: POWER_BOOST for this unit
    if (this.game?.activeEffects) {
      this.game.activeEffects
        .filter((e) => e.targetId === unit.id && e.type === "POWER_BOOST")
        .forEach((e) => {
          power += e.value || 0;
        });

      // Global faction boosts (e.g. Saburo Arasaka: Arasaka units +1 attacking)
      this.game.activeEffects
        .filter(
          (e) =>
            e.type === "FACTION_BOOST" &&
            e.faction === unit.faction &&
            (!e.condition || e.condition === context.situation),
        )
        .forEach((e) => {
          power += e.value || 0;
        });
    }

    // El Sombrerón: double power when fighting a rival Unit
    if (
      unit.keywords?.includes("ATTACK") &&
      context.situation === "fighting" &&
      unit.name === "El Sombrerón"
    ) {
      power *= 2;
    }

    // Jackie Welles (unit): +2 per friendly gig
    if (unit.name === "Jackie Welles" && context.ownPlayer) {
      power += (context.ownPlayer.gigs?.length || 0) * 2;
    }

    return power;
  }

  // =====================================================
  // CALCULATE GIGS STOLEN (Power scaling formula)
  // =====================================================

  calculateGigsStolen(power) {
    // Formula: 1 + floor(power / 10)
    // 0-9 power = 1 Gig
    // 10-19 power = 2 Gigs
    // 20-29 power = 3 Gigs
    return 1 + Math.floor(power / 10);
  }

  // =====================================================
  // STEAL GIGS
  // =====================================================

  stealGigs(fromPlayerId, toPlayerId, count) {
    const fromPlayer = this.game.players[fromPlayerId];
    const toPlayer = this.game.players[toPlayerId];
    const stolen = [];

    for (let i = 0; i < count && fromPlayer.gigs.length > 0; i++) {
      const gig = fromPlayer.gigs.pop();
      toPlayer.gigs.push(gig);
      stolen.push(gig);
    }

    this.game._calculateStreetCred(fromPlayerId);
    this.game._calculateStreetCred(toPlayerId);
    toPlayer.lastTurnClaimedGig = this.game.turn;

    this.game.log(
      `Stole ${stolen.length} Gig(s) — P${toPlayerId} now has ${toPlayer.gigs.length}`,
    );

    if (this.game.isOvertime && toPlayer.gigs.length > fromPlayer.gigs.length) {
      return { success: true, stolen, overtimeWin: true, winner: toPlayerId };
    }

    return { success: true, stolen };

    // Instant overtime win check
    if (this.game.isOvertime) {
      const winner = this.game.checkWinCondition();
      if (winner) this.game.winner = winner;
    }
  }
  // ── KEYWORD / EFFECT HANDLERS ──────────────────────────────────

  // BLOCKER: check if defender has valid blocker keyword
  canBlock(unit) {
    return (
      unit.keywords?.includes("BLOCKER") ||
      !unit.keywords?.includes("CANT_ATTACK")
    );
  }

  // CANT_ATTACK: Secondhand Bombus, Corpo Security
  canAttack(unit) {
    if (unit.isTapped) return false;
    const text = unit.text || "";
    if (text.includes("can't attack") || text.includes("cannot attack"))
      return false;
    return true;
  }

  _destroyUnit(unit, ownerPlayer) {
    // Remove from field
    const idx = ownerPlayer.field.indexOf(unit);
    if (idx !== -1) ownerPlayer.field.splice(idx, 1);
    // Move unit + all attached gear to trash
    if (unit.attachedGear?.length > 0) {
      unit.attachedGear.forEach((gear) => ownerPlayer.trash.push(gear));
      unit.attachedGear = [];
    }
    ownerPlayer.trash.push(unit);
    this.game?.log(
      `${unit.name} → TRASH (+ ${unit.attachedGear?.length || 0} gear)`,
    );
  }

  // DEFEATED trigger handler
  _fireDefeated(unit, ownerPlayer, rivalPlayer) {
    if (!unit.keywords?.includes("DEFEATED")) return;
    this.game?.log(`DEFEATED trigger: ${unit.name}`);
    // Caliber: rival discards 1
    if (unit.name === "Caliber") {
      if (rivalPlayer.hand.length > 0) {
        const discarded = rivalPlayer.hand.splice(0, 1)[0];
        rivalPlayer.trash.push(discarded);
        this.game?.log(`Caliber DEFEATED: rival discarded ${discarded.name}`);
      }
    }
    // Evelyn Parker (unit): when rival steals gig + this unit is spent, draw
    // handled in stealGigs
  }

  // RIDING_NOMAD / SANDEVISTAN: can attack spent units
  canAttackSpent(unit) {
    if (unit.name === "Riding Nomad") return true;
    const gear = unit.attachedGear || [];
    return gear.some((g) => g.name === "Sandevistan");
  }
}
