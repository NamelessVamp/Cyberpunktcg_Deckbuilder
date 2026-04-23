// EX MACHINA — AI Player v2 (Smarter State Machine)
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

  async _rollGig() {
    const player = this.game.players[this.playerId];
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

  async _phasePlay() {
    const cardLogic = new CardLogic(this.game);
    let player = this.game.players[this.playerId];

    // 1. Sell cheapest card (prefer programs)
    if (!player.hasSoldThisTurn) {
      const sellIdx = this._findCheapestSellable(player);
      if (sellIdx !== -1) {
        cardLogic.sellCard(this.playerId, sellIdx);
        this.onUpdate?.();
        await this._wait();
      }
    }

    // 2. Play best affordable unit repeatedly
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

    // 3. Advance to ATTACK
    this.game.advancePhase();
    this.onUpdate?.();
  }

  async _phaseAttack() {
    const combatResolver = new CombatResolver(this.game);
    const player = this.game.players[this.playerId];
    const rival = this.game.players[this.rivalId];

    const attackers = player.field
      .map((unit, idx) => ({ unit, idx }))
      .filter(({ unit }) => !unit.isTapped && !unit.summonedThisTurn);

    for (const { idx } of attackers) {
      await this._wait(500);

      const currentUnit = this.game.players[this.playerId].field[idx];
      if (!currentUnit || currentUnit.isTapped || currentUnit.summonedThisTurn)
        continue;

      const result = combatResolver.declareAttacker(this.playerId, idx);
      if (!result.success) continue;

      this.onUpdate?.();
      await this._wait(300);

      // Decide target
      const rivalSpentUnits = rival.field
        .map((u, i) => ({ u, i }))
        .filter(({ u }) => u.isTapped);

      const shouldAttackDirect =
        rival.gigs.length > 0 || rivalSpentUnits.length === 0;

      if (!shouldAttackDirect && rivalSpentUnits.length > 0) {
        // Attack weakest spent rival unit
        const weakest = rivalSpentUnits.reduce((min, cur) =>
          (cur.u.power || 0) < (min.u.power || 0) ? cur : min,
        );
        combatResolver.setAttackTarget?.(this.playerId, weakest.i);
      }

      combatResolver.resolveCombat(this.playerId);
      this.game.clearExpiredEffects?.();
      this.onUpdate?.();
    }
  }

  // Called from SimulatorBeta when human attacks and AI is defender
  async respondToAttack() {
    const player = this.game.players[this.playerId];
    const blockers = player.field.filter(
      (u) => !u.isTapped && u.keywords?.includes("BLOCKER"),
    );

    if (blockers.length > 0) {
      const blockerIdx = player.field.indexOf(blockers[0]);
      const combatResolver = new CombatResolver(this.game);
      const attackerIdx = this.game.players[this.rivalId].field.findIndex(
        (u) => u.isAttacking,
      );
      if (attackerIdx !== -1) {
        combatResolver.declareBlocker(this.playerId, blockerIdx, attackerIdx);
        combatResolver.resolveCombat(this.rivalId);
        this.game.clearExpiredEffects?.();
        this.onUpdate?.();
        return true;
      }
    }
    return false;
  }

  _getAvailableEddies(player) {
    return (
      player.eddies.filter((e) => !e.isTapped).length +
      player.legends.filter((l) => !l.isTapped).length
    );
  }

  _findCheapestSellable(player) {
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
    return player.hand.reduce((best, card, idx) => {
      if (card.type !== "UNIT" || card.cost > budget) return best;
      if (best === -1) return idx;
      const bestCard = player.hand[best];
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
