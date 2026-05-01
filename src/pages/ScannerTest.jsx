import { useState } from "react";
import LiveScannerModal from "../components/LiveScannerModal";
import allCardsData from "../data/cards.json";

export default function ScannerTest() {
  const [showScanner, setShowScanner] = useState(false);

  // Mock user para testing
  const mockUser = { id: "test-user-123" };

  return (
    <div className="min-h-screen bg-term-black p-8">
      <h1 className="text-term-amber text-2xl font-mono mb-4">
        [SCANNER_TEST.EXE]
      </h1>

      <button
        onClick={() => setShowScanner(true)}
        className="bg-term-amber text-term-black font-mono font-bold px-6 py-3 rounded hover:bg-amber-400 transition-colors min-h-[44px]"
      >
        [OPEN SCANNER]
      </button>

      {showScanner && (
        <LiveScannerModal
          user={mockUser}
          allCards={allCardsData}
          onClose={() => setShowScanner(false)}
          onCardAdded={(card) => {
            console.log("[CARD ADDED]:", card.name);
            alert(`Added: ${card.name}`);
          }}
        />
      )}
    </div>
  );
}
