import { useAuth } from "../contexts/AuthContext";

export default function LoginModal({ onClose }) {
  const { signInWithDiscord } = useAuth();

  const handleDiscordLogin = async () => {
    try {
      await signInWithDiscord();
    } catch (error) {
      console.error("Discord login error:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-term-gray border-2 border-term-amber rounded-lg p-8 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-term-amber transition-colors text-2xl"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/BackCardTCGCybeprunk.png"
              alt="Cyberpunk TCG"
              className="w-24 h-24 rounded-lg border-2 border-term-amber"
            />
          </div>

          <h2 className="text-term-amber font-bold text-2xl font-mono mb-2">
            NETRUNNER LOGIN
          </h2>
          <p className="text-term-green/80 text-sm font-mono">
            Connect to sync your decks across devices
          </p>
        </div>

        {/* Discord Login Button */}
        <div className="mb-6">
          <button
            onClick={handleDiscordLogin}
            className="w-full bg-[#5865F2] text-white py-3 px-4 rounded font-mono font-bold hover:bg-[#4752C4] transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            SIGN IN WITH DISCORD
          </button>
        </div>

        {/* TODO Section */}
        <div className="mb-4 p-3 bg-term-black/50 border border-term-amber/30 rounded">
          <p className="text-term-amber/80 text-xs font-mono mb-2">
            🚧 COMING SOON:
          </p>
          <ul className="text-term-green/60 text-xs font-mono space-y-1">
            <li>• Google Sign-In (pending approval)</li>
            <li>• User Profile Settings</li>
            <li>• Avatar Customization</li>
          </ul>
        </div>

        {/* Info */}
        <div className="text-center text-term-green/60 text-xs font-mono mb-4">
          <p>Your decks will be synced to the cloud</p>
          <p className="mt-1">No credit card required</p>
        </div>

        {/* Skip Button */}
        <button
          onClick={onClose}
          className="w-full bg-term-gray border border-term-amber/40 text-term-amber py-2 px-4 rounded font-mono hover:bg-term-amber/10 transition-colors"
        >
          [SKIP - USE OFFLINE MODE]
        </button>
      </div>
    </div>
  );
}
