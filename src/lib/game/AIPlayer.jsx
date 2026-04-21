// EX MACHINA — AI Player (State Machine, Difficulty: Basic)
// Follows official C.O.R.E. protocol strictly

import { CardLogic } from "../CardLogic";
import { CombatResolver } from "../CombatResolver";

export class AIPlayer {
  constructor(gameState, playerId = 2, onUpdate, delay = 800) {
    this.game = gameState;
    this.playerId = playerId;
    this.onUpdate = onUpdate; // callback → React re-render
    this.delay = delay;
  }

  // ── Main entry ────────────────────────────────────────
  async takeTurn() {
    if (this.game.activePlayer !== this.playerId) return;

    // CORE already executed by endTurn/_checkMulliganComplete
    // Just need to Roll a Gig manually
    await this._wait();
    await this._phasePlay();

    await this._wait();
    await this._phaseAttack();

    await this._wait();
    // END phase
    this.game.advancePhase();
    this.onUpdate?.();
  }

  // ── R: Roll a Gig ────────────────────────────────────
  async _rollGig() {
    const player = this.game.players[this.playerId];
    const available = player.fixerDice.filter((d) => d !== 20);
    const dieToRoll =
      available.length > 0
        ? Math.max(...available)
        : player.fixerDice.includes(20)
          ? 20
          : null;

    if (dieToRoll) {
      const result = this.game.rollGig(this.playerId, dieToRoll);
      if (result.success) {
        this.onUpdate?.();
      }
    }
  }

  // ── PLAY Phase ────────────────────────────────────────
  async _phasePlay() {
    const cardLogic = new CardLogic(this.game);
    let player = this.game.players[this.playerId];

    // 1. Sell cheapest €$ card once
    if (!player.hasSoldThisTurn) {
      const sellIdx = this._findCheapestSellable(player);
      if (sellIdx !== -1) {
        const cardName = player.hand[sellIdx]?.name;
        cardLogic.sellCard(this.playerId, sellIdx);
        this.game.log(`AI sold ${cardName} for 1 Eddie`);
        this.onUpdate?.();
        await this._wait();
      }
    }

    // 2. Play best affordable unit, repeat until broke
    let played = true;
    while (played) {
      played = false;
      player = this.game.players[this.playerId];
      const budget = this._getAvailableEddies(player);
      const cardIdx = this._findBestPlayable(player, budget);
      if (cardIdx !== -1) {
        const cardName = player.hand[cardIdx]?.name;
        const result = cardLogic.playCard(this.playerId, cardIdx);
        if (result.success) {
          this.game.log(`AI played ${cardName}`);
          this.onUpdate?.();
          await this._wait();
          played = true;
        }
      }
    }

    // Advance to ATTACK
    this.game.advancePhase();
    this.onUpdate?.();
  }

  // ── ATTACK Phase ──────────────────────────────────────
  async _phaseAttack() {
    const combatResolver = new CombatResolver(this.game);
    const player = this.game.players[this.playerId];

    const attackers = player.field
      .map((unit, idx) => ({ unit, idx }))
      .filter(({ unit }) => !unit.isTapped);

    for (const { idx } of attackers) {
      await this._wait(600);
      const result = combatResolver.declareAttacker(this.playerId, idx);
      if (result.success) {
        this.game.log(`AI declares attacker: ${player.field[idx]?.name}`);
        this.onUpdate?.();
        await this._wait(400);
        combatResolver.resolveCombat(this.playerId);
        this.game.clearExpiredEffects?.();
        this.onUpdate?.();
      }
    }
  }

  // ── Helpers ───────────────────────────────────────────
  _getAvailableEddies(player) {
    return (
      player.eddies.filter((e) => !e.isTapped).length +
      player.legends.filter((l) => !l.isTapped).length
    );
  }

  _findCheapestSellable(player) {
    return player.hand.reduce((best, card, idx) => {
      if (card.cost > 0 && (best === -1 || card.cost < player.hand[best].cost))
        return idx;
      return best;
    }, -1);
  }

  _findBestPlayable(player, budget) {
    return player.hand.reduce((best, card, idx) => {
      if (
        card.type === "UNIT" &&
        card.cost <= budget &&
        (best === -1 || card.cost > player.hand[best].cost)
      )
        return idx;
      return best;
    }, -1);
  }

  _wait(ms = this.delay) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
