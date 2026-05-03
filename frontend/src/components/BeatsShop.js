'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2 } from 'lucide-react';
import BeatCard from './BeatCard';
import { getSupabaseClient } from '@/lib/supabase';

function SkeletonCard() {
  return (
    <div className="bg-[#121214] border border-white/5" style={{ borderRadius: 2 }}>
      <div className="aspect-square bg-gradient-to-br from-white/[0.05] to-white/[0.01] animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-9 bg-white/5 animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/5 animate-pulse" />
          <div className="flex-1 h-3 bg-white/5 animate-pulse" />
          <div className="h-3 w-12 bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function BeatsShop() {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [activeGenre, setActiveGenre] = useState('ALL');

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();
    supabase
      .from('beats')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) console.error('Failed to load beats', error);
        else setBeats(data || []);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const genres = useMemo(() => {
    const set = new Set(
      beats.map((b) => (b.genre || '').trim()).filter(Boolean)
    );
    return ['ALL', ...Array.from(set)];
  }, [beats]);

  const filtered = useMemo(() => {
    if (activeGenre === 'ALL') return beats;
    return beats.filter(
      (b) => (b.genre || '').trim().toLowerCase() === activeGenre.toLowerCase()
    );
  }, [beats, activeGenre]);

  return (
    <section
      id="beats"
      data-testid="beats-section"
      className="relative section-pad border-t border-white/5"
    >
      <div className="purple-glow absolute top-1/3 right-0 w-[500px] h-[500px] pointer-events-none opacity-50" />

      <div className="container-x relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div>
            <span className="label-tag">Shop · 05</span>
            <h2
              className="mt-5 font-display uppercase font-extrabold text-white leading-[1] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
              data-testid="beats-heading"
            >
              Listen to my
              <br />
              <span style={{ color: 'var(--neon)' }}>beats</span>.
            </h2>
            {!loading && beats.length > 0 && (
              <div
                className="mt-5 inline-flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/45"
                data-testid="beats-counter"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon)] animate-pulse" />
                {beats.length} beat{beats.length === 1 ? '' : 's'} available · updated regularly
              </div>
            )}
          </div>
          <p className="font-mono text-white/50 text-sm max-w-sm uppercase tracking-wider leading-relaxed">
            — hover to feel, click to play. Then hit me up to make it yours.
          </p>
        </div>

        {/* Genre filters */}
        {!loading && genres.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-8" data-testid="genre-filters">
            {genres.map((g) => {
              const active = g === activeGenre;
              return (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  data-testid={`filter-${g.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`font-mono text-[0.7rem] uppercase tracking-[0.2em] px-4 py-2 border transition-all duration-200 ${
                    active
                      ? 'bg-[var(--neon)] text-black border-[var(--neon)] shadow-[0_0_20px_rgba(157,76,221,0.5)]'
                      : 'bg-transparent text-white/55 border-white/10 hover:border-[var(--neon)]/50 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
            data-testid="beats-loading"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state (no beats at all) */}
        {!loading && beats.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-dashed border-white/10 p-10 md:p-16 text-center"
            data-testid="beats-empty-state"
          >
            <Music2 size={32} className="mx-auto text-white/30" />
            <p className="mt-6 font-display text-white text-xl md:text-2xl uppercase tracking-tight">
              New heat dropping soon.
            </p>
            <p className="mt-3 font-mono text-white/40 text-sm max-w-md mx-auto">
              The shop is being loaded. Come back in a bit — or reach out directly for custom work.
            </p>
          </motion.div>
        )}

        {/* No results for current filter */}
        {!loading && beats.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12" data-testid="no-results">
            <p className="font-mono text-white/40 text-sm uppercase tracking-[0.2em]">
              No beats in <span className="text-[var(--neon)]">{activeGenre}</span> yet.
            </p>
          </div>
        )}

        {/* Beats grid */}
        {!loading && filtered.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
            data-testid="beats-grid"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((b, i) => (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                >
                  <BeatCard
                    beat={b}
                    isActive={activeId === b.id}
                    onActivate={setActiveId}
                    onDeactivate={() => setActiveId(null)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
