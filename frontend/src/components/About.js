'use client';

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

const ABOUT_IMG = '/brand/photos/studio-about.webp';

function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, to, { duration: 1.8, ease: 'easeOut' });
      return () => controls.stop();
    }
  }, [inView, mv, to]);

  return (
    <span ref={ref} className="font-display text-white font-extrabold" style={{ fontSize: 'clamp(3.5rem, 7vw, 6rem)' }}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export default function About() {
  return (
    <section id="about" className="relative section-pad">
      <div className="container-x grid md:grid-cols-12 gap-10 md:gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="md:col-span-5 relative"
        >
          <div className="relative aspect-square md:aspect-[4/5] overflow-hidden border border-white/10">
            <img src={ABOUT_IMG} alt="Inside the TebaHouse studio" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute top-4 left-4 label-tag">03 / Studio</div>
          </div>
          <div className="purple-glow absolute -bottom-20 -left-10 w-[400px] h-[400px] pointer-events-none" />
        </motion.div>

        <div className="md:col-span-7 md:pt-6 text-center md:text-left">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="label-tag inline-block"
          >
            About · 01
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-5 font-display font-extrabold uppercase text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 4rem)' }}
          >
            <span className="md:hidden">
              I&apos;ll turn<br /> your ideas<br /> into<br /> <span style={{ color: 'var(--neon)' }}>breathtaking</span><br /> tracks.
            </span>
            <span className="hidden md:inline">
              I&apos;ll turn your ideas<br /> into <span style={{ color: 'var(--neon)' }}>breathtaking</span> tracks.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 md:mt-8 text-white/60 font-mono text-sm md:text-base leading-relaxed max-w-2xl mx-auto md:mx-0"
          >
            Hey, I&apos;m Teba — a 360° music producer. I work on beat production, songwriting,
            and mix &amp; mastering. I discovered music at the age of 12, and it&apos;s been 9 years
            now that I&apos;ve been pouring my time and energy into it.
          </motion.p>

          <div className="mt-10 md:mt-14 grid grid-cols-2 gap-6 md:gap-8 max-w-xl mx-auto md:mx-0">
            <div>
              <Counter to={9} />
              <p className="mt-3 font-mono uppercase tracking-[0.2em] text-xs text-white/50">
                Years of<br />work experience
              </p>
            </div>
            <div>
              <Counter to={50} suffix="+" />
              <p className="mt-3 font-mono uppercase tracking-[0.2em] text-xs text-white/50">
                Positive reviews<br />from my clients
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
