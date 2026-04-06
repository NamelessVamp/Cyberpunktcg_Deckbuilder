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
        const result = this.resolveFight(unit, blocker, attacker, defender);
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

  resolveFight(attacker, blocker, attackerPlayer, defenderPlayer) {
    const attackerPower = this.calculateTotalPower(attacker);
    const blockerPower = this.calculateTotalPower(blocker);

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
      const blockerIdx = defenderPlayer.field.indexOf(blocker);
      defenderPlayer.field.splice(blockerIdx, 1);
      defenderPlayer.trash.push(blocker);
      result.destroyed.push(blocker.name);
      result.winner = attacker.name;
    } else if (blockerPower > attackerPower) {
      // Blocker wins - attacker destroyed
      const attackerIdx = attackerPlayer.field.indexOf(attacker);
      attackerPlayer.field.splice(attackerIdx, 1);
      attackerPlayer.trash.push(attacker);
      result.destroyed.push(attacker.name);
      result.winner = blocker.name;
    } else {
      // Tie - both destroyed
      const blockerIdx = defenderPlayer.field.indexOf(blocker);
      const attackerIdx = attackerPlayer.field.indexOf(attacker);

      defenderPlayer.field.splice(blockerIdx, 1);
      attackerPlayer.field.splice(attackerIdx, 1);

      defenderPlayer.trash.push(blocker);
      attackerPlayer.trash.push(attacker);

      result.destroyed.push(blocker.name, attacker.name);
      result.winner = "TIE";
    }

    return result;
  }

  // =====================================================
  // CALCULATE TOTAL POWER (Unit + Gear)
  // =====================================================

  calculateTotalPower(unit) {
    let power = unit.power || 0;

    // Add power from attached Gear
    if (unit.attachedGear) {
      unit.attachedGear.forEach((gear) => {
        power += gear.power || 0;
      });
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

      // Update Street Cred
      fromPlayer.streetCred -= gig.value;
      toPlayer.streetCred += gig.value;
    }

    // Mark that attacker claimed a Gig this turn
    toPlayer.lastTurnClaimedGig = this.game.turn;

    // Check Overtime win condition immediately
    if (this.game.isOvertime && toPlayer.gigs.length >= 7) {
      return {
        success: true,
        stolen,
        overtimeWin: true,
        winner: toPlayerId,
      };
    }

    return {
      success: true,
      stolen,
    };
  }
}
