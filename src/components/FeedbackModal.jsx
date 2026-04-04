import { useState, useEffect } from "react"; // IMPORTANTE: Se agregó useEffect
import { motion, AnimatePresence } from "framer-motion";

export default function FeedbackModal({ onClose, onSubmit, isSubmitting }) {
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Manejo del temporizador para cerrar tras el éxito
  useEffect(() => {
    let timer;
    if (submitSuccess) {
      timer = setTimeout(() => {
        onClose();
      }, 1500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [submitSuccess, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    const success = await onSubmit(category, message.trim());
    if (success) {
      setSubmitSuccess(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-term-gray border-2 border-term-amber rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-term-amber/10 border-b border-term-amber/40 p-4">
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

          {/* Form Content */}
          <div className="overflow-y-auto p-4 flex-grow">
            <form
              id="feedback-form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Category Selection */}
              <div>
                <label className="block text-term-green font-mono font-bold text-sm mb-2">
                  CATEGORY:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["bug", "feature", "general"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      disabled={submitSuccess}
                      className={`p-2 rounded font-mono font-bold text-xs sm:text-sm transition-all border-2 ${
                        category === cat
                          ? cat === "bug"
                            ? "bg-term-red/30 border-term-red text-term-red"
                            : cat === "feature"
                              ? "bg-term-blue/30 border-term-blue text-term-blue"
                              : "bg-term-green/30 border-term-green text-term-green"
                          : "bg-term-gray-light border-transparent text-gray-500 hover:border-gray-600"
                      } disabled:opacity-50`}
                    >
                      {cat === "bug"
                        ? "🐛 BUG"
                        : cat === "feature"
                          ? "💡 FEATURE"
                          : "💬 GENERAL"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-term-green font-mono font-bold text-sm mb-2">
                  MESSAGE:
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitSuccess}
                  placeholder="Details..."
                  rows={6}
                  className="w-full bg-term-black border border-term-green/40 rounded p-3 text-term-green font-mono text-sm focus:border-term-green outline-none resize-none disabled:opacity-50"
                  required
                />
                <p className="text-term-amber/60 text-[10px] font-mono mt-1">
                  {message.length} / 2000 CHARACTERS
                </p>
              </div>

              {/* Tips */}
              <details className="bg-term-amber/5 border border-term-amber/20 rounded group">
                <summary className="cursor-pointer p-2 text-term-amber/80 text-[10px] font-mono font-bold hover:bg-term-amber/10">
                  💡 TIPS FOR GOOD FEEDBACK [+]
                </summary>
                <ul className="text-term-green/70 text-[10px] font-mono space-y-1 p-2 ml-4">
                  <li>• Be specific and detailed</li>
                  <li>• Include steps to reproduce bugs</li>
                </ul>
              </details>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-term-amber/20 flex gap-2">
            <button
              form="feedback-form"
              type="submit"
              disabled={!message.trim() || isSubmitting || submitSuccess}
              className={`flex-1 px-4 py-2 rounded font-mono font-bold text-sm transition-all ${
                submitSuccess
                  ? "bg-term-green text-term-black animate-pulse"
                  : "bg-term-green text-term-black hover:bg-green-400"
              } disabled:opacity-30`}
            >
              {submitSuccess
                ? "✓ SENT!"
                : isSubmitting
                  ? "[SENDING...]"
                  : "[SEND]"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-term-red text-term-red rounded font-mono font-bold text-sm hover:bg-term-red/10"
            >
              [CANCEL]
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
