export default function LegalDisclaimer() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="mb-8 border-b-2 border-term-amber pb-4">
        <h1 className="text-4xl font-bold text-term-amber font-mono mb-2">
          LEGAL DISCLAIMER & FAN CONTENT POLICY
        </h1>
        <p className="text-term-green/60 font-mono text-sm">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6 text-term-green font-mono">
        {/* Section 1: Unofficial Fan Project */}
        <section className="bg-term-red/10 border-2 border-term-red rounded-lg p-6">
          <h2 className="text-term-red font-bold text-xl mb-3 flex items-center gap-2">
            <span>⚠️</span>
            <span>UNOFFICIAL FAN PROJECT</span>
          </h2>
          <p className="text-term-green/90 leading-relaxed mb-3">
            <strong className="text-term-amber">Afterlife Decks</strong> is an{" "}
            <strong>unofficial, non-commercial fan-made tool</strong> created by
            and for the Cyberpunk 2077 Trading Card Game community.
          </p>
          <p className="text-term-green/90 leading-relaxed">
            This project is{" "}
            <strong>not affiliated with, endorsed by, or sponsored by</strong>{" "}
            CD Projekt Red, WeirdCo, or any official Cyberpunk 2077 licensors.
          </p>
        </section>

        {/* Section 2: Copyright & Trademarks */}
        <section>
          <h2 className="text-term-amber font-bold text-xl mb-3">
            📋 COPYRIGHT & TRADEMARKS
          </h2>
          <div className="bg-term-gray/50 rounded p-4 space-y-2 text-sm">
            <p>
              <strong className="text-term-amber">Cyberpunk 2077™</strong>,{" "}
              <strong className="text-term-amber">Night City™</strong>, and all
              related characters, names, locations, and imagery are trademarks
              and copyrights of{" "}
              <strong className="text-term-green">CD Projekt S.A.</strong>
            </p>
            <p>
              All card images, artwork, and game mechanics belong to{" "}
              <strong className="text-term-green">WeirdCo</strong> and{" "}
              <strong className="text-term-green">CD Projekt Red</strong>.
            </p>
            <p>
              This website uses these materials under{" "}
              <strong className="text-term-blue">Fair Use</strong> for
              educational, non-commercial, and transformative purposes.
            </p>
          </div>
        </section>

        {/* Section 3: Fan Content Policy Compliance */}
        <section>
          <h2 className="text-term-amber font-bold text-xl mb-3">
            ✅ FAN CONTENT POLICY COMPLIANCE
          </h2>
          <p className="text-term-green/90 leading-relaxed mb-3">
            This project complies with{" "}
            <a
              href="https://www.cdprojektred.com/en/fan-content"
              target="_blank"
              rel="noopener noreferrer"
              className="text-term-blue underline hover:text-blue-400"
            >
              CD Projekt Red's Fan Content Guidelines
            </a>
            , which allow fans to create non-commercial fan works.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm bg-term-gray/50 rounded p-4">
            <li>
              This tool is <strong>100% free</strong> with no monetization
            </li>
            <li>No paywalls, ads, or donations accepted</li>
            <li>
              All credit for original content goes to CD Projekt Red & WeirdCo
            </li>
            <li>Users are encouraged to purchase official products</li>
          </ul>
        </section>

        {/* Section 4: No Warranty */}
        <section>
          <h2 className="text-term-amber font-bold text-xl mb-3">
            🛡️ NO WARRANTY & DISCLAIMER
          </h2>
          <div className="bg-term-gray/50 rounded p-4 text-sm space-y-2">
            <p>
              This software is provided <strong>"AS IS"</strong> without any
              warranties. The creator is not responsible for:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Loss of deck data or saved content</li>
              <li>Inaccuracies in card information or rulings</li>
              <li>Tournament legality of exported decks</li>
              <li>Any damages resulting from use of this tool</li>
            </ul>
            <p className="text-term-amber mt-3">
              Always verify official rules with official Cyberpunk TCG
              resources.
            </p>
          </div>
        </section>

        {/* Section 5: Data & Privacy */}
        <section>
          <h2 className="text-term-amber font-bold text-xl mb-3">
            🔒 DATA & PRIVACY
          </h2>
          <div className="bg-term-gray/50 rounded p-4 text-sm space-y-2">
            <p>
              <strong>Authentication:</strong> This site uses Discord OAuth via
              Supabase. We only store your Discord User ID and username.
            </p>
            <p>
              <strong>Deck Data:</strong> Your saved decks are stored securely
              in a PostgreSQL database. Only you can access your data.
            </p>
            <p>
              <strong>Analytics:</strong> No third-party tracking. Feedback
              reports are stored anonymously.
            </p>
            <p className="text-term-green">
              We do <strong>NOT</strong> sell, share, or monetize user data.
            </p>
          </div>
        </section>

        {/* Section 6: DMCA Contact */}
        <section>
          <h2 className="text-term-amber font-bold text-xl mb-3">
            📧 DMCA & TAKEDOWN REQUESTS
          </h2>
          <div className="bg-term-gray/50 rounded p-4 text-sm">
            <p className="mb-2">
              If you are a copyright holder and believe content on this site
              infringes your rights, please contact:
            </p>
            <p className="text-term-blue">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:dmca@afterlifedecks.com"
                className="underline hover:text-blue-400"
              >
                dmca@afterlifedecks.com
              </a>
            </p>
            <p className="text-term-green/70 mt-2">
              We will respond promptly and remove infringing content if
              necessary.
            </p>
          </div>
        </section>

        {/* Section 7: Support Official Releases */}
        <section className="bg-term-green/10 border-2 border-term-green rounded-lg p-6">
          <h2 className="text-term-green font-bold text-xl mb-3 flex items-center gap-2">
            <span>💚</span>
            <span>SUPPORT THE OFFICIAL GAME</span>
          </h2>
          <p className="text-term-green/90 leading-relaxed mb-4">
            Please support the creators by backing the project and purchasing
            official card packs, playmats, and accessories through their
            official channels:
          </p>

          <div className="flex flex-col gap-3 ml-2">
            <a
              href="https://cyberpunktcg.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-term-blue underline font-bold hover:text-blue-400 flex items-center gap-2 transition-colors"
            >
              <span className="text-term-green text-xs">►</span>
              Official Cyberpunk TCG Website
            </a>
            <a
              href="https://www.kickstarter.com/projects/cyberpunktcg/the-official-cyberpunk-trading-card-game"
              target="_blank"
              rel="noopener noreferrer"
              className="text-term-amber underline font-bold hover:text-amber-400 flex items-center gap-2 transition-colors"
            >
              <span className="text-term-green text-xs">►</span>
              Kickstarter Campaign
            </a>
            <a
              href="https://www.cyberpunk.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-term-green underline font-bold hover:text-green-400 flex items-center gap-2 transition-colors"
            >
              <span className="text-term-green text-xs">►</span>
              Cyberpunk 2077 Official Website
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-term-amber/20 text-center">
        <p className="text-term-green/60 font-mono text-sm">
          Built with passion and coffee by a enthusiastic fan
        </p>
      </div>
    </div>
  );
}
