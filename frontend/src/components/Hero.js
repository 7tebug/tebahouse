'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const HERO_IMG = '/brand/photos/teba-hero.png';

export default function Hero() {
  const scrollToBeats = () => document.getElementById('beats')?.scrollIntoView({ behavior: 'smooth' });
  const { scrollY } = useScroll();
  const indicatorOpacity = useTransform(scrollY, [0, 120, 240], [1, 0.5, 0]);
  const indicatorY = useTransform(scrollY, [0, 240], [0, 30]);

  return (
    <section id="hero" data-testid="hero-section" className="relative min-h-[100vh] flex items-center overflow-hidden pt-24 pb-16">
      <div className="purple-glow absolute -top-20 -left-32 w-[600px] h-[600px] pointer-events-none" />
      <div className="purple-glow absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-60" />

      <div className="absolute inset-0 opacity-70 hero-img-mask">
        <img src={HERO_IMG} alt="Studio" className="w-full h-full object-cover" data-testid="hero-image" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black" />
      </div>

      <div className="container-x relative z-10 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-6 md:mb-8 flex justify-center">
          <span className="label-tag">Music Producer · Verona, IT</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          data-testid="hero-title"
          className="font-display uppercase font-extrabold text-white leading-[0.95] tracking-[-0.03em] text-center max-w-full"
          style={{ fontSize: 'clamp(1.5rem, 7vw, 6rem)' }}
        >
          Welcome<br /> to the<br /> Teba<span style={{ color: 'var(--neon)' }}>House</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 md:mt-8 font-mono text-white/60 uppercase tracking-[0.25em] text-[0.7rem] md:text-sm text-center"
        >
          — more than just sound.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 md:mt-14 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center justify-center"
        >
          <button onClick={scrollToBeats} className="btn-neon w-full sm:w-auto">Listen to beats</button>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-neon w-full sm:w-auto"
            style={{ borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Get in touch →
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{ opacity: indicatorOpacity, y: indicatorY }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 font-mono text-[0.65rem] uppercase tracking-[0.3em] pointer-events-none"
      >
        <span>Scroll</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
          <ArrowDown size={14} />
        </motion.span>
      </motion.div>
    </section>
  );
}
