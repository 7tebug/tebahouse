'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import BeatCard from './BeatCard';
import { getSupabaseClient } from '@/lib/supabase';

export default function BeatsShop() {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();
    supabase
      .from('beats')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error('Failed to load beats', error);
        } else {
          setBeats(data || []);
        }
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <section id="beats" className="relative section-pad border-t border-white/5">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <span className="label-tag">Shop · 05</span>
            <h2
              className="mt-5 font-display uppercase font-extrabold text-white leading-[1] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
            >
              Listen to my
              <br />
              <span style={{ color: 'var(--neon)' }}>beats</span>.
            </h2>
          </div>
          <p className="font-mono text-white/50 text-sm max-w-sm uppercase tracking-wider leading-relaxed">
            — hover to feel, click to play. Then hit me up to make it yours.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-white/40 font-mono text-sm uppercase tracking-wider">
            <div className="wave-bars" style={{ height: 18 }}>
              {Array.from({ length: 6 }).map((_, i) => <span key={i} />)}
            </div>
            Loading beats…
          </div>
        )}

        {!loading && beats.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-dashed border-white/10 p-10 md:p-16 text-center"
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

        {!loading && beats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {beats.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              >
                <BeatCard
                  beat={b}
                  isActive={activeId === b.id}
                  onActivate={setActiveId}
                  onDeactivate={() => setActiveId(null)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
