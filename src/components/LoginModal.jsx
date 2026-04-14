// NON OMNIS MORIAR — LoginModal.jsx
// EX MACHINA — Email/Password + Discord OAuth
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const VIEWS = {
  LOGIN: "login",
  REGISTER: "register",
  FORGOT: "forgot",
  CONFIRM: "confirm",
};

export default function LoginModal({ onClose }) {
  const { signInWithDiscord, signInWithEmail, signUpWithEmail, resetPassword } =
    useAuth();
  const [view, setView] = useState(VIEWS.LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMsg("");
  };

  const handleDiscordLogin = async () => {
    try {
      await signInWithDiscord();
    } catch (err) {
      console.error("Discord login error:", err);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      setView(VIEWS.CONFIRM);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccessMsg("Check your email for the password reset link.");
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-term-black border border-term-amber/40 text-term-amber rounded px-3 py-2 font-mono text-sm focus:border-term-amber focus:outline-none placeholder-term-amber/30";
  const btnPrimary =
    "w-full bg-term-amber text-term-black py-2 px-4 rounded font-mono font-bold hover:bg-term-amber/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const btnGhost =
    "w-full border border-term-amber/40 text-term-amber/70 py-2 px-4 rounded font-mono text-sm hover:border-term-amber hover:text-term-amber transition-colors";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-term-gray border-2 border-term-amber rounded-lg p-8 max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-term-amber transition-colors text-2xl"
          >
            ✕
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/BackCardTCGCybeprunk.png"
                alt="Cyberpunk TCG"
                className="w-16 h-16 rounded-lg border-2 border-term-amber"
              />
            </div>
            <h2 className="text-term-amber font-bold text-2xl font-mono mb-1">
              {view === VIEWS.LOGIN && "NETRUNNER LOGIN"}
              {view === VIEWS.REGISTER && "CREATE ACCOUNT"}
              {view === VIEWS.FORGOT && "RESET ACCESS"}
              {view === VIEWS.CONFIRM && "CHECK YOUR MAIL"}
            </h2>
            <p className="text-term-green/70 text-xs font-mono">
              {view === VIEWS.LOGIN && "Sync your decks across all devices"}
              {view === VIEWS.REGISTER && "Join the Night City underground"}
              {view === VIEWS.FORGOT && "We'll send you a reset link"}
              {view === VIEWS.CONFIRM &&
                "Verify your email to activate your account"}
            </p>
          </div>

          {/* CONFIRM VIEW */}
          {view === VIEWS.CONFIRM && (
            <div className="text-center space-y-4">
              <div className="text-4xl">📬</div>
              <p className="text-term-green font-mono text-sm">
                Confirmation email sent to{" "}
                <span className="text-term-amber">{email}</span>
              </p>
              <p className="text-term-green/60 text-xs font-mono">
                Click the link in your email to activate your account, then come
                back and log in.
              </p>
              <button
                onClick={() => {
                  clearForm();
                  setView(VIEWS.LOGIN);
                }}
                className={btnPrimary}
              >
                [BACK TO LOGIN]
              </button>
            </div>
          )}

          {/* FORGOT VIEW */}
          {view === VIEWS.FORGOT && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {successMsg && (
                <p className="text-term-green text-xs font-mono bg-term-green/10 border border-term-green/30 rounded p-2">
                  {successMsg}
                </p>
              )}
              {error && (
                <p className="text-red-400 text-xs font-mono">{error}</p>
              )}
              <div>
                <label className="text-term-amber/70 text-xs font-mono mb-1 block">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="runner@night.city"
                  className={inputClass}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? "[SENDING...]" : "[SEND RESET LINK]"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearForm();
                  setView(VIEWS.LOGIN);
                }}
                className={btnGhost}
              >
                [BACK TO LOGIN]
              </button>
            </form>
          )}

          {/* LOGIN VIEW */}
          {view === VIEWS.LOGIN && (
            <>
              <form onSubmit={handleEmailLogin} className="space-y-3 mb-4">
                {error && (
                  <p className="text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/30 rounded p-2">
                    {error}
                  </p>
                )}
                <div>
                  <label className="text-term-amber/70 text-xs font-mono mb-1 block">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="runner@night.city"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="text-term-amber/70 text-xs font-mono mb-1 block">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      clearForm();
                      setView(VIEWS.FORGOT);
                    }}
                    className="text-term-amber/50 hover:text-term-amber text-xs font-mono transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <button type="submit" disabled={loading} className={btnPrimary}>
                  {loading ? "[CONNECTING...]" : "[Insert Data Shard]"}
                </button>
              </form>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-term-amber/20"></div>
                <span className="text-term-amber/40 text-xs font-mono">OR</span>
                <div className="flex-1 h-px bg-term-amber/20"></div>
              </div>

              <button
                onClick={handleDiscordLogin}
                className="w-full bg-[#5865F2] text-white py-2 px-4 rounded font-mono font-bold hover:bg-[#4752C4] transition-colors flex items-center justify-center gap-3 mb-4"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                SIGN IN WITH DISCORD
              </button>

              <button
                onClick={() => {
                  clearForm();
                  setView(VIEWS.REGISTER);
                }}
                className={btnGhost}
              >
                [CREATE NEW ACCOUNT]
              </button>
              <button
                onClick={onClose}
                className="w-full text-term-amber/40 hover:text-term-amber/70 py-2 font-mono text-xs transition-colors mt-2"
              >
                [SKIP — USE OFFLINE MODE]
              </button>
            </>
          )}

          {/* REGISTER VIEW */}
          {view === VIEWS.REGISTER && (
            <form onSubmit={handleEmailRegister} className="space-y-3">
              {error && (
                <p className="text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/30 rounded p-2">
                  {error}
                </p>
              )}
              <div>
                <label className="text-term-amber/70 text-xs font-mono mb-1 block">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="runner@night.city"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="text-term-amber/70 text-xs font-mono mb-1 block">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min. 6 characters"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="text-term-amber/70 text-xs font-mono mb-1 block">
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? "[CREATING ACCOUNT...]" : "[CREATE ACCOUNT]"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearForm();
                  setView(VIEWS.LOGIN);
                }}
                className={btnGhost}
              >
                [ALREADY HAVE ACCOUNT]
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
