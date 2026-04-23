// EX MACHINA — AI Player v2 (Smarter State Machine)
// Follows C.O.R.E. protocol + calls legends + uses blocker

import { CardLogic } from "../CardLogic";
import { CombatResolver } from "../CombatResolver";

export class AIPlayer {
  constructor(gameState, playerId = 2, onUpdate, delay = 700) {
    this.game = gameState;
    this.playerId = playerId;
    this.rivalId = playerId === 1 ? 2 : 1;
    this.onUpdate = onUpdate;
    this.delay = delay;
  }

  // ── Main entry ─────────────────────────────────────────
  async takeTurn() {
    if (this.game.activePlayer !== this.playerId) return;

    await this._wait();
    await this._rollGig();

    await this._wait();
    await this._phasePlay();

    await this._wait();
    await this._phaseAttack();

    await this._wait();
    this.game.advancePhase(); // END
    this.onUpdate?.();
  }

  // ── [R] Roll a Gig ─────────────────────────────────────
  async _rollGig() {
    const player = this.game.players[this.playerId];
    // Pick largest die available (d20 must be last)
    const nonD20 = player.fixerDice.filter((d) => d !== 20);
    const dieToRoll =
      nonD20.length > 0
        ? Math.max(...nonD20)
        : player.fixerDice.includes(20)
          ? 20
          : null;

    if (dieToRoll) {
      const result = this.game.rollGig(this.playerId, dieToRoll);
      if (result.success) this.onUpdate?.();
    }
  }

  // ── PLAY Phase ─────────────────────────────────────────
  async _phasePlay() {
    const cardLogic = new CardLogic(this.game);
    let player = this.game.players[this.playerId];

    // 1. Sell cheapest sellable card (get 1 Eddie)
    if (!player.hasSoldThisTurn) {
      const sellIdx = this._findCheapestSellable(player);
      if (sellIdx !== -1) {
        cardLogic.sellCard(this.playerId, sellIdx);
        this.onUpdate?.();
        await this._wait();
      }
    }

    // 2. Call a legend if we have eddies and no face-up legends
    player = this.game.players[this.playerId];
    const faceUpLegends = player.legends.filter((l) => l.isFaceUp).length;
    if (faceUpLegends === 0) {
      const budget = this._getAvailableEddies(player);
      if (budget >= 2) {
        const hiddenIdx = player.legends.findIndex(
          (l) => !l.isFaceUp && !l.isTapped,
        );
        if (hiddenIdx !== -1) {
          const result = cardLogic.callLegend(this.playerId, hiddenIdx);
          if (result.success) {
            this.game.log(`AI calls ${player.legends[hiddenIdx]?.name}`);
            this.onUpdate?.();
            await this._wait();
          }
        }
      }
    }

    // 3. Play best affordable unit (repeat until broke)
    let played = true;
    while (played) {
      played = false;
      player = this.game.players[this.playerId];
      const budget = this._getAvailableEddies(player);
      const cardIdx = this._findBestPlayable(player, budget);
      if (cardIdx !== -1) {
        const result = cardLogic.playCard(this.playerId, cardIdx);
        if (result.success) {
          this.onUpdate?.();
          await this._wait();
          played = true;
        }
      }
    }

    // 4. Advance to ATTACK
    this.game.advancePhase();
    this.onUpdate?.();
  }

  // ── ATTACK Phase ───────────────────────────────────────
  async _phaseAttack() {
    const combatResolver = new CombatResolver(this.game);
    const player = this.game.players[this.playerId];
    const rival = this.game.players[this.rivalId];

    const attackers = player.field
      .map((unit, idx) => ({ unit, idx }))
      .filter(({ unit }) => !unit.isTapped);

    for (const { unit, idx } of attackers) {
      await this._wait(500);

      // Re-read field since previous attacks may have changed it
      const currentUnit = this.game.players[this.playerId].field[idx];
      if (!currentUnit || currentUnit.isTapped) continue;

      const result = combatResolver.declareAttacker(this.playerId, idx);
      if (!result.success) continue;

      this.onUpdate?.();
      await this._wait(300);

      // Decide target: direct or attack weakest spent rival unit
      const rivalSpentUnits = rival.field
        .map((u, i) => ({ u, i }))
        .filter(({ u }) => u.isTapped);

      const shouldAttackDirect =
        rival.gigs.length > 0 || rivalSpentUnits.length === 0;

      if (!shouldAttackDirect && rivalSpentUnits.length > 0) {
        // Attack weakest spent unit
        const weakest = rivalSpentUnits.reduce((min, cur) =>
          (cur.u.power || 0) < (min.u.power || 0) ? cur : min,
        );
        combatResolver.setAttackTarget?.(this.playerId, weakest.i);
      }

      combatResolver.resolveCombat(this.playerId);
      // Decide: attack direct (steal gigs) or attack spent rival unit
      const rivalSpentUnits = rival.field.filter((u) => u.isTapped);
      const shouldAttackDirect =
        rival.gigs.length > 0 || rivalSpentUnits.length === 0;

      if (!shouldAttackDirect && rivalSpentUnits.length > 0) {
        // Attack weakest spent rival unit
        const targetIdx = rival.field.indexOf(rivalSpentUnits[0]);
        combatResolver.setAttackTarget?.(this.playerId, targetIdx);
      }
      // else: direct attack (no target needed, CombatResolver handles it)

      combatResolver.resolveCombat(this.playerId);
      this.game.clearExpiredEffects?.();
      this.onUpdate?.();
    }
  }

  // ── Respond to attack (as defender) ────────────────────
  // Called from SimulatorBeta when rival attacks and AI is defender
  async respondToAttack() {
    const player = this.game.players[this.playerId];
    const blockers = player.field.filter((u, idx) => {
      return !u.isTapped && u.keywords?.includes("BLOCKER");
    });

    if (blockers.length > 0) {
      // Use first available BLOCKER
      const blockerIdx = player.field.indexOf(blockers[0]);
      const combatResolver = new CombatResolver(this.game);
      const rivalId = this.rivalId;
      const attackerIdx = this.game.players[rivalId].field.findIndex(
        (u) => u.isAttacking,
      );
      if (attackerIdx !== -1) {
        combatResolver.declareBlocker(this.playerId, blockerIdx, attackerIdx);
        combatResolver.resolveCombat(rivalId);
        this.game.clearExpiredEffects?.();
        this.onUpdate?.();
        return true; // blocked
      }
    }
    return false; // take the hit
  }

  // ── Helpers ────────────────────────────────────────────
  _getAvailableEddies(player) {
    return (
      player.eddies.filter((e) => !e.isTapped).length +
      player.legends.filter((l) => !l.isTapped).length
    );
  }

  _findCheapestSellable(player) {
    // Prefer to sell programs over units (keep combat cards)
    const programs = player.hand
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.cost > 0 && c.type === "PROGRAM");
    if (programs.length > 0) return programs[0].i;

    return player.hand.reduce((best, card, idx) => {
      if (card.cost > 0 && (best === -1 || card.cost < player.hand[best].cost))
        return idx;
      return best;
    }, -1);
  }

  _findBestPlayable(player, budget) {
    // Prefer high-power units within budget
    return player.hand.reduce((best, card, idx) => {
      if (card.type !== "UNIT" || card.cost > budget) return best;
      if (best === -1) return idx;
      const bestCard = player.hand[best];
      // Prefer higher power, then lower cost as tiebreaker
      if ((card.power || 0) > (bestCard.power || 0)) return idx;
      if (
        (card.power || 0) === (bestCard.power || 0) &&
        card.cost < bestCard.cost
      )
        return idx;
      return best;
    }, -1);
  }

  _wait(ms = this.delay) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
