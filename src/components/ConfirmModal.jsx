export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-term-gray border-2 border-term-amber rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-term-amber text-xl font-mono font-bold mb-4">
          {title}
        </h2>
        <p className="text-term-green/80 font-mono mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-term-red text-white px-4 py-2 rounded font-mono font-bold hover:bg-red-600 transition-colors"
          >
            [CONFIRM]
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-term-gray border border-term-amber/30 text-term-amber px-4 py-2 rounded font-mono font-bold hover:border-term-amber transition-colors"
          >
            [CANCEL]
          </button>
        </div>
      </div>
    </div>
  );
}
