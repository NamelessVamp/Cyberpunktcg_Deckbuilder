export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-term-black border-2 border-term-red p-6 rounded max-w-md w-full">
        <h2 className="text-term-red font-bold text-xl mb-4 font-mono">
          {title}
        </h2>
        
        <p className="text-term-green font-mono mb-6">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-term-red text-white px-4 py-2 rounded font-mono font-bold hover:bg-red-600 transition-colors"
          >
            [CONFIRM]
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-term-gray border border-term-amber/40 text-term-amber px-4 py-2 rounded font-mono font-bold hover:bg-term-amber/10 transition-colors"
          >
            [CANCEL]
          </button>
        </div>
      </div>
    </div>
  );
}
