import { useState } from "react";

function GuideModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("basics");

  const tabs = [
    { id: "basics", label: "BASICS", icon: "𒌐" },
    { id: "deckbuilding", label: "DECK BUILDING", icon: "🀢" },
    { id: "gameplay", label: "GAMEPLAY", icon: "≫" },
    { id: "keywords", label: "KEYWORDS", icon: "📖" },
  ];

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b-2 border-term-amber/20 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t font-mono font-bold text-sm transition-all ${
              activeTab === tab.id
                ? "bg-term-amber text-term-black"
                : "bg-term-gray border border-term-amber/30 text-term-green hover:bg-term-amber/20"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "basics" && <BasicsTab />}
        {activeTab === "deckbuilding" && <DeckBuildingTab />}
        {activeTab === "gameplay" && <GameplayTab />}
        {activeTab === "keywords" && <KeywordsTab />}
      </div>

      {/* Footer */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={onClose}
          className="flex-1 bg-term-green text-term-black px-8 py-3 rounded font-mono font-bold hover:bg-green-400 transition-colors"
        >
          [GOT IT - LET'S BUILD!]
        </button>

        <a
          href="https://cyberpunktcg.com/gameplay-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-term-amber text-term-black px-8 py-3 rounded font-mono font-bold hover:bg-yellow-400 transition-colors text-center"
        >
          [CHECK RULEBOOK]
        </a>
      </div>
    </>
  );
}

// TAB 1: BASICS
function BasicsTab() {
  return (
    <div className="space-y-6 text-term-green font-mono">
      <section>
        <h3 className="text-2xl font-bold text-term-amber mb-4">𖦏 OBJECTIVE</h3>
        <div className="bg-term-black/40 border border-term-green/30 p-4 rounded">
          <p className="text-lg mb-3">
            You are a <span className="text-term-amber font-bold">Fixer</span>{" "}
            building reputation in Night City.
          </p>
          <p className="text-term-green/80 text-sm">
            Hire mercenaries, equip them with gear, and complete Gigs to earn
            Street Cred. Your goal isn't to kill your opponent - it's to steal
            their jobs and become the most legendary Fixer.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-term-amber mb-4">
          ˗ˏˋ ★ ˎˊ˗ HOW TO WIN
        </h3>
        <div className="space-y-3">
          <div className="bg-term-green/10 border-l-4 border-term-green p-4 rounded">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⚀⚁⚂⚃⚄⚅</span>
              <h4 className="text-term-green font-bold text-lg">
                PRIMARY: 6 GIGS
              </h4>
            </div>
            <p className="text-sm text-term-green/80">
              Have{" "}
              <span className="text-term-amber font-bold">6 dice (Gigs)</span>{" "}
              on your side of the table at the{" "}
              <span className="text-term-amber">START</span> of your turn.
            </p>
          </div>

          <div className="bg-term-amber/10 border-l-4 border-term-amber p-4 rounded">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⏱</span>
              <h4 className="text-term-amber font-bold text-lg">OVERTIME</h4>
            </div>
            <p className="text-sm text-term-green/80">
              If no dice remain and both players pass, whoever has{" "}
              <span className="text-term-amber font-bold">MORE Gigs</span> wins.
            </p>
          </div>

          <div className="bg-term-red/10 border-l-4 border-term-red p-4 rounded">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">✖𐃷✖</span>
              <h4 className="text-term-red font-bold text-lg">DECK OUT</h4>
            </div>
            <p className="text-sm text-term-green/80">
              If you must draw a card and your deck is empty, you{" "}
              <span className="text-term-red font-bold">lose immediately</span>.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-term-amber mb-4">
          ▓▒░ STREET CRED vs GIGS
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-term-black/40 border border-term-blue/30 p-4 rounded">
            <h4 className="text-term-blue font-bold mb-2">
              ⚀⚁⚂⚃⚄⚅ GIGS (DICE)
            </h4>
            <ul className="text-xs space-y-1 text-term-green/80">
              <li>• 6 physical dice (d4, d6, d8, d10, d12, d20)</li>
              <li>• Stolen by attacking opponent directly</li>
              <li>
                •{" "}
                <span className="text-term-amber font-bold">6 Gigs = WIN</span>
              </li>
            </ul>
          </div>

          <div className="bg-term-black/40 border border-purple-300/30 p-4 rounded">
            <h4 className="text-purple-300 font-bold mb-2">⭐ STREET CRED</h4>
            <ul className="text-xs space-y-1 text-term-green/80">
              <li>• Sum of all your dice faces</li>
              <li>• Used as trigger for card effects</li>
              <li>
                •{" "}
                <span className="text-term-red font-bold">
                  NOT a win condition
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

// TAB 2: DECK BUILDING
function DeckBuildingTab() {
  return (
    <div className="space-y-6 text-term-green font-mono">
      <section>
        <h3 className="text-2xl font-bold text-term-amber mb-4">
          🀢 DECK CONSTRUCTION RULES
        </h3>
        <div className="space-y-3">
          <div className="bg-term-black/40 border border-term-red/30 p-4 rounded">
            <h4 className="text-term-red font-bold mb-2">
              𓆩✧𓆪 LEGENDS (3 Required)
            </h4>
            <ul className="text-sm space-y-1 text-term-green/80 list-disc list-inside ml-2">
              <li>
                Exactly{" "}
                <span className="text-term-amber font-bold">3 Legends</span>
              </li>
              <li>
                All 3 must be{" "}
                <span className="text-term-amber font-bold">UNIQUE</span> (no
                duplicates)
              </li>
              <li>
                Start face-down, flip for{" "}
                <span className="text-term-blue">2 Eddies</span>
              </li>
              <li>Provide RAM colors for your deck</li>
            </ul>
          </div>

          <div className="bg-term-black/40 border border-term-green/30 p-4 rounded">
            <h4 className="text-term-green font-bold mb-2">
              ☐ MAIN DECK (40-50 Cards)
            </h4>
            <ul className="text-sm space-y-1 text-term-green/80 list-disc list-inside ml-2">
              <li>
                Minimum:{" "}
                <span className="text-term-amber font-bold">40 cards</span>
              </li>
              <li>
                Maximum:{" "}
                <span className="text-term-amber font-bold">50 cards</span>
              </li>
              <li>
                Max <span className="text-term-amber font-bold">3 copies</span>{" "}
                of any card (by name)
              </li>
              <li>Cards must match Legend RAM colors</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-term-amber mb-4">
          ⌬ RAM COLOR SYSTEM
        </h3>
        <div className="bg-term-black/40 border border-term-amber/30 p-4 rounded">
          <p className="text-sm mb-4 text-term-green/80">
            Your Legends determine which cards you can play. Each Legend
            provides RAM of a specific color.
          </p>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-term-red mx-auto mb-2"></div>
              <span className="text-xs text-term-red font-bold">RED</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-term-amber mx-auto mb-2"></div>
              <span className="text-xs text-term-amber font-bold">YELLOW</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-term-green mx-auto mb-2"></div>
              <span className="text-xs text-term-green font-bold">GREEN</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-term-blue mx-auto mb-2"></div>
              <span className="text-xs text-term-blue font-bold">BLUE</span>
            </div>
          </div>

          <div className="bg-term-green/10 border border-term-green/30 p-3 rounded">
            <p className="text-xs font-bold text-term-amber mb-2">EXAMPLE:</p>
            <p className="text-xs text-term-green/80">
              If you pick 2 Red Legends + 1 Blue Legend, you can ONLY play Red
              and Blue cards in your Main Deck.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-term-amber mb-4">
          ⚙ USING THIS TOOL
        </h3>
        <div className="bg-term-blue/10 border-l-4 border-term-blue p-4 rounded mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl"> 𖡊 </span>
            <div>
              <h4 className="text-term-blue font-bold text-sm mb-1">
                TOOLTIPS AVAILABLE
              </h4>
              <p className="text-xs text-term-green/80">
                Throughout the app, you'll see{" "}
                <span className="text-term-amber font-bold">(ⓘ)</span> icons.
                Hover over them to get quick explanations of features and game
                rules.
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-term-black/40 border border-term-blue/30 p-3 rounded">
            <span className="text-term-blue font-bold">🔍︎ Search & Filter</span>
            <p className="text-xs text-term-green/60 mt-1">
              Find cards by name, type, faction, cost, or keywords
            </p>
          </div>
          <div className="bg-term-black/40 border border-term-blue/30 p-3 rounded">
            <span className="text-term-blue font-bold">✚ Click to Add</span>
            <p className="text-xs text-term-green/60 mt-1">
              Preview card details and add to your deck
            </p>
          </div>
          <div className="bg-term-black/40 border border-term-blue/30 p-3 rounded">
            <span className="text-term-blue font-bold">🗁 Save to Cloud</span>
            <p className="text-xs text-term-green/60 mt-1">
              Login to sync decks across devices
            </p>
          </div>
          <div className="bg-term-black/40 border border-term-blue/30 p-3 rounded">
            <span className="text-term-blue font-bold">⌯⌲ Export Text</span>
            <p className="text-xs text-term-green/60 mt-1">
              Share decks on Discord easily
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// TAB 3: GAMEPLAY
function GameplayTab() {
  return (
    <div className="space-y-6 text-term-green font-mono">
      <section>
        <h3 className="text-2xl font-bold text-term-amber mb-4">
          ⟳ TURN PHASES
        </h3>
        <div className="space-y-3">
          <div className="bg-cyan-900/20 border-l-4 border-cyan-400 p-4 rounded">
            <h4 className="text-cyan-400 font-bold mb-2">𝐈 READY PHASE</h4>
            <ul className="text-sm space-y-1 text-term-green/80 list-disc list-inside ml-2">
              <li>Draw 1 card</li>
              <li>Gain 1 Gig (roll die, place in Gig Area)</li>
              <li>Ready all Spent cards (rotate vertical)</li>
            </ul>
          </div>

          <div className="bg-purple-900/20 border-l-4 border-purple-400 p-4 rounded">
            <h4 className="text-purple-400 font-bold mb-2">𝐈𝐈 PLAY PHASE</h4>
            <ul className="text-sm space-y-1 text-term-green/80 list-disc list-inside ml-2">
              <li>
                <span className="text-term-amber font-bold">Sell</span> (1x per
                turn): Put card with €$ face-down as Eddy
              </li>
              <li>
                <span className="text-term-amber font-bold">Call Legend</span>:
                Pay 2 Eddies, flip Legend face-up
              </li>
              <li>
                <span className="text-term-amber font-bold">Play Cards</span>:
                Pay Eddies to play Units/Gear/Programs
              </li>
            </ul>
            <p className="text-xs text-term-red/80 mt-2">
              ⚠ Units enter with summoning sickness (can't attack same turn)
            </p>
          </div>

          <div className="bg-red-900/20 border-l-4 border-red-400 p-4 rounded">
            <h4 className="text-red-400 font-bold mb-2">𝐈𝐈𝐈 ATTACK PHASE</h4>
            <ul className="text-sm space-y-1 text-term-green/80 list-disc list-inside ml-2">
              <li>Ready Units can attack (one at a time)</li>
              <li>Attacking Unit becomes Spent (rotates sideways)</li>
              <li>Choose target: Enemy Spent Unit OR Player directly</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-term-amber mb-4">
          ⚔︎ COMBAT RULES
        </h3>
        <div className="space-y-3">
          <div className="bg-term-black/40 border border-term-red/30 p-4 rounded">
            <h4 className="text-term-red font-bold mb-2">
              VS UNITS (Spent Only)
            </h4>
            <ul className="text-sm space-y-1 text-term-green/80 list-disc list-inside ml-2">
              <li>
                Can ONLY attack <span className="text-term-amber">Spent</span>{" "}
                (sideways) enemy Units
              </li>
              <li>Ready (vertical) Units are "in cover" and untargetable</li>
              <li>Compare Power: Higher Power wins, loser is destroyed</li>
              <li>Tie: Both Units are destroyed</li>
            </ul>
          </div>

          <div className="bg-term-black/40 border border-term-blue/30 p-4 rounded">
            <h4 className="text-term-blue font-bold mb-2">
              VS PLAYER (Direct Attack)
            </h4>
            <ul className="text-sm space-y-1 text-term-green/80 list-disc list-inside ml-2">
              <li>
                If unblocked →{" "}
                <span className="text-term-amber font-bold">Steal 1 Gig</span>{" "}
                from opponent
              </li>
              <li>
                <span className="text-term-green">10+ Power</span> → Steal 2
                Gigs
              </li>
              <li>
                <span className="text-term-green">20+ Power</span> → Steal 3
                Gigs
              </li>
            </ul>
          </div>

          <div className="bg-term-black/40 border border-term-amber/30 p-4 rounded">
            <h4 className="text-term-amber font-bold mb-2">
              ⛨ BLOCKER KEYWORD
            </h4>
            <p className="text-sm text-term-green/80">
              If defender has a Ready Unit with{" "}
              <span className="text-term-amber font-bold">BLOCKER</span>, they
              can Spend it to intercept the attack (takes damage instead of
              original target).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// TAB 4: KEYWORDS
function KeywordsTab() {
  return (
    <div className="space-y-4 text-term-green font-mono">
      <section>
        <h3 className="text-2xl font-bold text-term-amber mb-4">
          📎 KEYWORD GLOSSARY
        </h3>
        <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2">
          {keywords.map((kw, idx) => (
            <div
              key={idx}
              className="bg-term-black/40 border border-term-green/30 p-3 rounded hover:border-term-amber/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{kw.icon}</span>
                <div>
                  <h4 className="text-term-amber font-bold text-sm mb-1">
                    {kw.name}
                  </h4>
                  <p className="text-xs text-term-green/80">{kw.description}</p>
                  {kw.example && (
                    <p className="text-xs text-term-blue/70 mt-2 italic">
                      Ex: {kw.example}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const keywords = [
  {
    icon: "⛨",
    name: "BLOCKER",
    description:
      "You can Spend this Ready Unit to intercept an attack targeting another Unit or the player.",
    example: "Corpo Security can block attacks aimed at your face",
  },
  {
    icon: "જ⁀➴",
    name: "GO SOLO",
    description:
      "Pay this Legend's cost to play it as a Unit. It enters Ready (can attack immediately, ignores summoning sickness).",
    example: "Johnny Silverhand can jump into combat",
  },
  {
    icon: "⚡︎",
    name: "PLAY",
    description:
      "Effect triggers the moment you pay the card's cost and play it.",
    example: "Draw 2 cards immediately when this enters play",
  },
  {
    icon: "⚔︎",
    name: "ATTACK",
    description:
      "Effect triggers when you declare this Unit as attacker (before damage).",
    example: "Get +2 Power until end of turn when attacking",
  },
  {
    icon: "↻",
    name: "FLIP",
    description:
      "Effect triggers when you flip this Legend face-up (pay 2 Eddies in Play Phase).",
    example: "Search your deck for a Gear card when revealed",
  },
  {
    icon: "(×_×)",
    name: "TRASH",
    description:
      "Your discard pile. Cards destroyed, discarded, or used go here.",
    example: "Retrieve a card from your Trash",
  },
  {
    icon: "⚙",
    name: "GEAR",
    description:
      "Equipment attached to a Unit or Legend. If carrier is destroyed, Gear is also destroyed.",
    example: "Mantis Blades give +3 Power to equipped Unit",
  },
  {
    icon: "</>",
    name: "PROGRAM",
    description:
      "One-time effect cards. Play from hand, resolve effect, then go to Trash.",
    example: "Reboot Optics: Ready target Unit",
  },
  {
    icon: "➼",
    name: "GIG",
    description:
      "Physical dice representing jobs. Steal by attacking player directly. Need 6 to win.",
    example: "Attack with 10 Power Unit → Steal 2 Gigs",
  },
  {
    icon: "✮",
    name: "STREET CRED",
    description:
      "Sum of all your Gig dice faces. Used as trigger condition for powerful effects.",
    example: "If you have 12+ Street Cred, destroy target Unit",
  },
  {
    icon: "˗ˋˏ€$ˎˊ˗",
    name: "EDDIES",
    description:
      "Currency. Cards with €$ can be Sold face-down (1x per turn) to generate permanent Eddies.",
    example: "Sell a card to pay for expensive Units",
  },
  {
    icon: "🔴",
    name: "READY / SPENT",
    description:
      "Ready = Vertical (can act). Spent = Sideways (exhausted, can't act until next Ready Phase).",
    example: "Attacking makes your Unit Spent",
  },
];

export default GuideModal;
