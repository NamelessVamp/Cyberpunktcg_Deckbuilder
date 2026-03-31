export default function MigrationModal({
  localDeckCount,
  onMigrate,
  onSkip,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-term-gray border-2 border-term-amber rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-term-amber font-bold text-xl font-mono mb-2">
            [MIGRATION AVAILABLE]
          </h2>
          <p className="text-term-green/80 text-sm font-mono">
            Found {localDeckCount} deck{localDeckCount !== 1 ? "s" : ""} saved
            locally
          </p>
        </div>

        {/* Message */}
        <div className="mb-6 p-3 bg-black/30 border border-term-green/20 rounded">
          <p className="text-term-green text-sm font-mono mb-2">
            ⚡ These decks are currently saved on this device only.
          </p>
          <p className="text-term-green text-sm font-mono">
            ☁️ Migrate them to the cloud to access from anywhere!
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onMigrate}
            className="w-full bg-term-green text-term-black px-4 py-3 rounded font-mono font-bold hover:bg-green-400 transition-colors"
          >
            [MIGRATE TO CLOUD ☁️]
          </button>

          <button
            onClick={onSkip}
            className="w-full bg-term-amber/20 border border-term-amber text-term-amber px-4 py-3 rounded font-mono hover:bg-term-amber/30 transition-colors"
          >
            [SKIP - KEEP LOCAL]
          </button>

          <p className="text-term-green/60 text-xs font-mono text-center">
            You can migrate later from Settings
          </p>
        </div>
      </div>
    </div>
  );
}
