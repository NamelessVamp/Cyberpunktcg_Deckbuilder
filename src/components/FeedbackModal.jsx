import { useState, useEffect } from "react";

export default function FeedbackModal({ onClose, onSubmit, isSubmitting }) {
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // PARCHE: El temporizador ahora está vigilado por useEffect para evitar Memory Leaks
  useEffect(() => {
    let timer;
    if (submitSuccess) {
      timer = setTimeout(() => {
        onClose();
      }, 1500);
    }
    // Si el usuario cierra el modal con la "X" antes de 1.5s, esto destruye el temporizador
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [submitSuccess, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    const success = await onSubmit(category, message.trim());

    if (success) {
      setSubmitSuccess(true);
      // El temporizador ahora lo maneja el useEffect de arriba
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9000] p-4">
      <div className="bg-term-gray border-2 border-term-amber rounded-lg max-w-xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-term-amber/10 border-b border-term-amber/40 p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-term-amber font-bold text-lg font-mono">
              📡 FEEDBACK_TERMINAL
            </h2>
            <button
              onClick={onClose}
              className="text-term-red hover:text-red-400 font-mono font-bold text-sm"
            >
              [X]
            </button>
          </div>
          <p className="text-term-green/80 text-xs font-mono mt-1">
            Report bugs, request features, or send feedback
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-term-green font-mono font-bold text-sm mb-2">
              CATEGORY:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory("bug")}
                disabled={submitSuccess}
                className={`p-2 rounded font-mono font-bold text-sm transition-all ${
                  category === "bug"
                    ? "bg-term-red/30 border-2 border-term-red text-term-red"
                    : "bg-term-gray-light border border-term-red/40 text-term-red/60 hover:border-term-red"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                🐛 BUG
              </button>

              <button
                type="button"
                onClick={() => setCategory("feature")}
                disabled={submitSuccess}
                className={`p-2 rounded font-mono font-bold text-sm transition-all ${
                  category === "feature"
                    ? "bg-term-blue/30 border-2 border-term-blue text-term-blue"
                    : "bg-term-gray-light border border-term-blue/40 text-term-blue/60 hover:border-term-blue"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                💡 FEATURE
              </button>

              <button
                type="button"
                onClick={() => setCategory("general")}
                disabled={submitSuccess}
                className={`p-2 rounded font-mono font-bold text-sm transition-all ${
                  category === "general"
                    ? "bg-term-green/30 border-2 border-term-green text-term-green"
                    : "bg-term-gray-light border border-term-green/40 text-term-green/60 hover:border-term-green"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                💬 GENERAL
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-term-green font-mono font-bold text-sm mb-2">
              MESSAGE:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={submitSuccess}
              placeholder={
                category === "bug"
                  ? "Describe the bug: What happened? Expected vs actual behavior..."
                  : category === "feature"
                    ? "Describe your feature idea: What would it do? Why is it useful?..."
                    : "Your message here..."
              }
              rows={6}
              maxLength={2000}
              className="w-full bg-term-black border border-term-green/40 rounded p-2 text-term-green font-mono text-sm focus:outline-none focus:border-term-green resize-none disabled:opacity-50"
              required
            />
            <p className="text-term-amber/60 text-xs font-mono mt-1">
              {message.length} / 2000 characters
            </p>
          </div>

          {/* Tips - Collapsed */}
          <details className="bg-term-amber/5 border border-term-amber/20 rounded">
            <summary className="cursor-pointer p-2 text-term-amber/80 text-xs font-mono font-bold hover:bg-term-amber/10 transition-colors">
              💡 TIPS FOR GOOD FEEDBACK [+]
            </summary>
            <ul className="text-term-green/70 text-xs font-mono space-y-1 p-2 ml-4">
              <li>• Be specific and detailed</li>
              <li>• Include steps to reproduce (for bugs)</li>
              <li>• Mention browser/device if relevant</li>
              <li>• One issue per report</li>
            </ul>
          </details>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!message.trim() || isSubmitting || submitSuccess}
              className={`flex-1 px-4 py-2 rounded font-mono font-bold text-sm transition-all ${
                submitSuccess
                  ? "bg-term-green text-term-black animate-pulse"
                  : "bg-term-green text-term-black hover:bg-green-400"
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {submitSuccess
                ? "✓ SENT SUCCESSFULLY!"
                : isSubmitting
                  ? "[SENDING...]"
                  : "[SEND FEEDBACK]"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-term-red/20 border border-term-red text-term-red px-4 py-2 rounded font-mono font-bold text-sm hover:bg-term-red/30 transition-colors disabled:opacity-30"
            >
              {submitSuccess ? "[CLOSE]" : "[CANCEL]"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
