import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy · TebaHouse',
  description: 'Cookie policy for tebahouse.com',
};

export default function CookiePolicyPage() {
  return (
    <div className="noise min-h-screen">
      <header className="border-b border-white/5 bg-black/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container-x flex items-center justify-between h-[72px]">
          <Link href="/" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <img src="/brand/th-logo.png" alt="TebaHouse" className="h-8 w-auto" />
          </Link>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/40">
            Legal · Cookies
          </span>
        </div>
      </header>

      <main className="container-x py-16 md:py-24 max-w-3xl">
        <span className="label-tag">Legal · 01</span>
        <h1
          className="mt-5 font-display uppercase font-extrabold text-white leading-[1] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
        >
          Cookie<br /><span style={{ color: 'var(--neon)' }}>Policy</span>.
        </h1>
        <p className="mt-6 font-mono text-white/40 text-xs uppercase tracking-[0.2em]">
          Last updated: January 2026
        </p>

        <div className="mt-12 space-y-10 font-mono text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="font-display uppercase text-white text-xl tracking-tight mb-3">1. What are cookies</h2>
            <p>
              Cookies are small text files saved by your browser when you visit a website. They allow the site to
              remember your actions and preferences (e.g. login session) over a period of time.
            </p>
          </section>

          <section>
            <h2 className="font-display uppercase text-white text-xl tracking-tight mb-3">2. Cookies used on tebahouse.com</h2>
            <p className="mb-4">
              I keep things minimal. This site uses only what is strictly necessary to function and to remember your
              own choices. I don&apos;t use third-party tracking, analytics, advertising or profiling cookies.
            </p>
            <div className="border border-white/10">
              <div className="grid grid-cols-[1fr_2fr] border-b border-white/10">
                <div className="p-3 bg-white/[0.02] font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Name</div>
                <div className="p-3 bg-white/[0.02] font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Purpose</div>
              </div>
              <div className="grid grid-cols-[1fr_2fr] border-b border-white/10">
                <div className="p-3 font-mono text-[0.75rem] text-white break-all">th_cookie_consent_v1</div>
                <div className="p-3 text-xs text-white/60">
                  Stored in localStorage. Remembers your choice on this banner so it doesn&apos;t reappear every visit.
                  Essential. Expires: never (until you clear it).
                </div>
              </div>
              <div className="grid grid-cols-[1fr_2fr] border-b border-white/10">
                <div className="p-3 font-mono text-[0.75rem] text-white break-all">sb-*-auth-token</div>
                <div className="p-3 text-xs text-white/60">
                  Set by Supabase only when logging into <code>/admin</code>. Keeps the admin session active.
                  Essential for the admin area. Expires: when the session ends.
                </div>
              </div>
              <div className="grid grid-cols-[1fr_2fr]">
                <div className="p-3 font-mono text-[0.75rem] text-white">None</div>
                <div className="p-3 text-xs text-white/60">
                  No Google Analytics, Meta Pixel, Hotjar, TikTok pixel or similar are installed.
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display uppercase text-white text-xl tracking-tight mb-3">3. Managing your choices</h2>
            <p>
              You can reset your choice any time by clearing your browser&apos;s site data for tebahouse.com. The banner
              will reappear and you&apos;ll be able to choose again. All modern browsers (Chrome, Firefox, Safari,
              Edge) let you block or delete cookies from their settings.
            </p>
          </section>

          <section>
            <h2 className="font-display uppercase text-white text-xl tracking-tight mb-3">4. Data controller & contact</h2>
            <p>
              The data controller for this site is Teba (TebaHouse), based in Verona / Pescantina 37026, Italy.
              For any question, reach out at{' '}
              <a href="mailto:7tebahouse@gmail.com" className="text-white hover:text-[var(--neon)] underline decoration-[var(--neon)]/60">
                7tebahouse@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display uppercase text-white text-xl tracking-tight mb-3">5. Updates</h2>
            <p>
              This policy may be updated to stay in line with applicable law (GDPR, ePrivacy). Any significant change
              will be reflected by the &quot;last updated&quot; date above and, if relevant, a re-prompt of the banner.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-white/50 hover:text-[var(--neon)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to TebaHouse
          </Link>
        </div>
      </main>
    </div>
  );
}
