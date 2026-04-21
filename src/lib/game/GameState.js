// NON OMNIS MORIAR — Core game state engine

export class GameState {
  constructor(deck1, deck2) {
    this.turn = 0;
    this.phase = "SETUP";
    this.activePlayer = 1;
    this.isOvertime = false;
    this.winner = null;
    this.activeEffects = [];
    this.combatLog = [];

    // Initialize both players
    this.players = {
      1: this.initializePlayer(deck1),
      2: this.initializePlayer(deck2),
    };
  }

  initializePlayer(deckCards) {
    // Separate Legends from main deck
    const legends = [];
    const mainDeck = [];

    deckCards.forEach((card) => {
      if (card.type === "LEGEND") {
        legends.push({ ...card, isFaceUp: false, isTapped: false });
      } else {
        mainDeck.push({ ...card });
      }
    });

    // Shuffle main deck
    const shuffled = this.shuffle([...mainDeck]);

    // Draw opening hand (6 cards)
    const hand = shuffled.splice(0, 6);

    return {
      legends,
      deck: shuffled,
      hand,
      field: [],
      eddies: [],
      gigs: [],
      fixerDice: [4, 6, 8, 10, 12, 20],
      trash: [],
      streetCred: 0,
      lastTurnClaimedGig: null,
      hasSoldThisTurn: false,
    };
  }

  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // =====================================================
  // GAME START
  // =====================================================
  startGame() {
    this.turn = 1;
    this.phase = "MULLIGAN";
    this.mulliganDone = { 1: false, 2: false };
    this.combatLog.push({
      text: "Game started",
      turn: 1,
      phase: "MULLIGAN",
      timestamp: Date.now(),
    });
  }

  doMulligan(playerId) {
    const player = this.players[playerId];
    player.deck.push(...player.hand);
    player.hand = [];
    player.deck = this.shuffle(player.deck);
    player.hand = player.deck.splice(0, 6);
    this.mulliganDone[playerId] = true;
    this.log(`Player ${playerId} took a mulligan`);
    this._checkMulliganComplete();
  }

  keepHand(playerId) {
    this.mulliganDone[playerId] = true;
    this.log(`Player ${playerId} kept their hand`);
    this._checkMulliganComplete();
  }

  _checkMulliganComplete() {
    if (this.mulliganDone[1] && this.mulliganDone[2]) {
      this.phase = "CORE";
      if (this.players[1].legends.length >= 2) {
        this.players[1].legends[0].isTapped = true;
        this.players[1].legends[1].isTapped = true;
      }
      this.log("Mulligan complete — Turn 1 begins");
      this._executeCore();
    }
  }

  // =====================================================
  // PHASE ADVANCEMENT
  // =====================================================

  advancePhase() {
    const phaseOrder = ["CORE", "PLAY", "ATTACK", "END"];
    const currentIndex = phaseOrder.indexOf(this.phase);

    if (currentIndex === phaseOrder.length - 1) {
      // End of turn - switch players
      this.endTurn();
    } else {
      this.phase = phaseOrder[currentIndex + 1];

      // Auto-execute phase actions
      if (this.phase === "CORE") {
        this._executeCore();
      }
    }

    // Check win condition
    const winner = this.checkWinCondition();
    if (winner) {
      this.winner = winner;
    }
  }

  _executeCore() {
    const player = this.players[this.activePlayer];
    player.hasSoldThisTurn = false;

    // C - Check Victory (ya se hace en checkWinCondition)

    // O - Obtain Card
    if (player.deck.length === 0) {
      const rivalId = this.activePlayer === 1 ? 2 : 1;
      this.winner = { player: rivalId, condition: "Deck Out" };
      return;
    }

    player.hand.push(player.deck.shift());
    this.log(`Player ${this.activePlayer} draws a card`);

    // R - Roll a Gig (manual — player clicks a die in Fixer area)
    this.log(`Roll a Gig: click a die in the FIXER area`);

    // E - Energize
    player.legends.forEach((l) => {
      l.isTapped = false;
    });
    player.field.forEach((u) => {
      u.isTapped = false;
    });
    player.eddies.forEach((e) => {
      e.isTapped = false;
    });
    this.clearExpiredEffects();

    this.log(`C.O.R.E. complete — Player ${this.activePlayer} may now play`);
  }

  rollGig(playerId, dieType) {
    const player = this.players[playerId];
    const dieIdx = player.fixerDice.indexOf(dieType);
    if (dieIdx === -1)
      return { success: false, error: "Die not available in Fixer" };

    // d20 must be last
    if (dieType === 20 && player.fixerDice.filter((d) => d !== 20).length > 0) {
      return { success: false, error: "El d20 debe tomarse último" };
    }

    player.fixerDice.splice(dieIdx, 1);
    const value = Math.floor(Math.random() * dieType) + 1;
    player.gigs.push({ type: dieType, value });
    this._calculateStreetCred(playerId);

    this.log(
      `Player ${playerId} rolled d${dieType} → ${value} ☆${player.streetCred}`,
    );
    return { success: true, value };
  }

  _calculateStreetCred(playerId) {
    const player = this.players[playerId];
    player.streetCred = player.gigs.reduce(
      (total, gig) => total + gig.value,
      0,
    );
  }

  endTurn() {
    const endingPlayer = this.players[this.activePlayer];

    // Destroy units marked by Reboot Optics
    endingPlayer.field = endingPlayer.field.filter((u) => {
      if (u._destroyAtEndOfTurn) {
        endingPlayer.trash.push(u);
        this.log(`${u.name} destroyed at end of turn`);
        return false;
      }
      return true;
    });

    // Switch active player
    this.activePlayer = this.activePlayer === 1 ? 2 : 1;
    this.turn++;
    this.phase = "CORE";

    this.log(`Turn ${this.turn} — Player ${this.activePlayer}'s turn`);
    this._executeCore();

    // Overtime: both players have empty fixerDice
    const p1Empty = this.players[1].fixerDice.length === 0;
    const p2Empty = this.players[2].fixerDice.length === 0;

    if (p1Empty && p2Empty && !this.isOvertime) {
      this.isOvertime = true;
      this.log("OVERTIME — Both players out of Fixer dice!");
    }
  }

  // =====================================================
  // WIN CONDITIONS
  // =====================================================

  checkWinCondition() {
    const p1 = this.players[1];
    const p2 = this.players[2];

    // Normal win: Start turn with 6+ Gigs
    if (this.phase === "CORE") {
      if (p1.gigs.length >= 6) {
        return { player: 1, condition: "Normal Win (6+ Gigs)" };
      }
      if (p2.gigs.length >= 6) {
        return { player: 2, condition: "Normal Win (6+ Gigs)" };
      }
    }

    // Overtime win: 7+ Gigs or Street Cred
    if (this.isOvertime) {
      // First: check if anyone reached 7 gigs
      if (p1.gigs.length >= 7)
        return { player: 1, condition: "Overtime Win (7 Gigs)" };
      if (p2.gigs.length >= 7)
        return { player: 2, condition: "Overtime Win (7 Gigs)" };

      // End of overtime turn: majority Street Cred wins
      if (this.phase === "END") {
        if (p1.streetCred !== p2.streetCred) {
          const winner = p1.streetCred > p2.streetCred ? 1 : 2;
          const loser = winner === 1 ? 2 : 1;
          return {
            player: winner,
            condition: `Overtime — Street Cred (${this.players[winner].streetCred} vs ${this.players[loser].streetCred})`,
          };
        }
      }
    }

    // Deck out: solo chequear en fase END
    if (this.phase === "END") {
      // Deck out: solo en fase END
      if (p1.deck.length === 0) {
        return { player: 2, condition: "Deck Out (Opponent ran out of cards)" };
      }
      if (p2.deck.length === 0) {
        return { player: 1, condition: "Deck Out (Opponent ran out of cards)" };
      }
    }

    return null;
  }

  // ── ACTIVE EFFECTS SYSTEM ──────────────────────────────────────
  // Effects registered by cards, read by CombatResolver/CardLogic

  registerEffect(effect) {
    // effect: { type, sourceCard, targetId, value, duration, condition }
    this.activeEffects.push({ ...effect, id: Date.now() + Math.random() });
    this.log(`Effect registered: ${effect.type} from ${effect.sourceCard}`);
  }

  getEffectsForUnit(unitId, type) {
    return this.activeEffects.filter(
      (e) => e.targetId === unitId && e.type === type,
    );
  }

  getGlobalEffects(type) {
    return this.activeEffects.filter((e) => !e.targetId && e.type === type);
  }

  clearExpiredEffects() {
    // Remove effects with duration = 'turn' at end of turn
    const before = this.activeEffects.length;
    this.activeEffects = this.activeEffects.filter(
      (e) => e.duration !== "turn",
    );
    if (this.activeEffects.length < before)
      this.log(`Cleared ${before - this.activeEffects.length} expired effects`);
  }

  clearEffectsBySource(sourceCardId) {
    this.activeEffects = this.activeEffects.filter(
      (e) => e.sourceCardId !== sourceCardId,
    );
  }

  log(message) {
    this.combatLog.push({
      text: message,
      turn: this.turn,
      phase: this.phase,
      timestamp: Date.now(),
    });
  }
}
