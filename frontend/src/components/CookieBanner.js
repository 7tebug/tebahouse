'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'th_cookie_consent_v1';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Slight delay so banner doesn't clash with hero entrance animation
        const t = setTimeout(() => setVisible(true), 900);
        return () => clearTimeout(t);
      }
    } catch (_e) {
      setVisible(true);
    }
  }, []);

  const saveChoice = (choice) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        choice,
        at: new Date().toISOString(),
      }));
    } catch (_e) { /* private mode, ignore */ }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-[460px] z-[60]"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
        >
          <div className="relative bg-[#0c0c0e]/95 backdrop-blur-xl border border-[var(--neon)]/30 p-5 md:p-6 shadow-[0_0_60px_rgba(157,76,221,0.12)]">
            {/* top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon)] to-transparent opacity-60" />

            <div className="flex items-start gap-3">
              <div className="shrink-0 h-9 w-9 flex items-center justify-center border border-[var(--neon)]/40 text-[var(--neon)]">
                <Cookie size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-display uppercase text-white font-bold text-sm md:text-base tracking-tight">
                  Cookies
                </h3>
                <p className="mt-2 font-mono text-[0.72rem] md:text-xs leading-relaxed text-white/60">
                  This site uses only essential cookies to make it work. I don&apos;t track you,
                  I don&apos;t sell data. You can read the full{' '}
                  <Link href="/cookie-policy" className="text-white/90 underline decoration-[var(--neon)]/60 underline-offset-2 hover:text-[var(--neon)] transition-colors">
                    cookie policy
                  </Link>.
                </p>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-4 space-y-3 font-mono text-[0.7rem] text-white/55">
                        <li className="flex items-start gap-2">
                          <span className="mt-[2px] inline-block h-1.5 w-1.5 bg-[var(--neon)] shrink-0" />
                          <span>
                            <strong className="text-white/80 uppercase tracking-wider">Essential</strong> — always on.
                            Used for the admin login session (Supabase) and to remember your cookie choice.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-[2px] inline-block h-1.5 w-1.5 bg-white/30 shrink-0" />
                          <span>
                            <strong className="text-white/80 uppercase tracking-wider">Analytics</strong> — not used.
                            No third-party tracking, no ads, no profiling.
                          </span>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => saveChoice('accepted')}
                    className="btn-solid"
                    style={{ padding: '0.65rem 1.1rem', fontSize: '0.72rem' }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => saveChoice('essentials_only')}
                    className="btn-neon"
                    style={{ padding: '0.65rem 1.1rem', fontSize: '0.72rem', borderColor: 'rgba(255,255,255,0.25)' }}
                  >
                    Essentials only
                  </button>
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40 hover:text-white/80 transition-colors"
                    aria-expanded={expanded}
                  >
                    {expanded ? 'Hide details' : 'Details'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => saveChoice('essentials_only')}
                className="shrink-0 text-white/30 hover:text-white/70 transition-colors"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
