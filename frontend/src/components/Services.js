'use client';

import { motion } from 'framer-motion';
import { Headphones, Sliders, MessageCircle, ArrowUpRight } from 'lucide-react';

const services = [
  {
    icon: Sliders,
    title: 'Beatmaking',
    description: "Whether you're here to tell your story, drop heat, or move hearts — this is where your voice finds its perfect beat.",
    number: '01',
  },
  {
    icon: Headphones,
    title: 'Mix & Mastering',
    description: 'Before the sound comes the person. Getting to know you is the first step to creating something real, loud and clean.',
    number: '02',
  },
  {
    icon: MessageCircle,
    title: 'Free Consultation',
    description: 'Decide what to do next with your work. One call to align vision and action, with zero pressure and zero cost.',
    number: '03',
  },
];

export default function Services() {
  return (
    <section id="services" className="relative section-pad border-t border-white/5">
      <div className="container-x">
        <div className="flex flex-col items-center text-center md:items-end md:text-left md:flex-row md:justify-between gap-6 mb-12 md:mb-16">
          <div className="w-full md:w-auto">
            <span className="label-tag">Services · 02</span>
            <h2
              className="mt-5 font-display uppercase font-extrabold text-white leading-[1] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 5rem)' }}
            >
              Trust a pro
              <br />
              to <span style={{ color: 'var(--neon)' }}>guide</span> you.
            </h2>
          </div>
          <p className="font-mono text-white/50 text-xs sm:text-sm max-w-xs sm:max-w-sm uppercase tracking-wider leading-relaxed">
            — three ways to work together. Pick yours, contact me, and let&apos;s start building.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative p-8 md:p-10 bg-[#121214] border border-white/5 hover:border-[var(--neon)]/60 transition-all duration-300 overflow-hidden"
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 flex items-center justify-center border border-white/10 group-hover:border-[var(--neon)]/70 group-hover:bg-[var(--neon)]/10 transition-all duration-300">
                    <Icon size={22} className="text-white group-hover:text-[var(--neon)] transition-colors" />
                  </div>
                  <span className="font-mono text-xs text-white/30 tracking-[0.2em]">{s.number}</span>
                </div>

                <h3 className="mt-10 font-display font-bold text-2xl md:text-3xl text-white uppercase tracking-tight">
                  {s.title}
                </h3>

                <p className="mt-4 font-mono text-sm text-white/55 leading-relaxed min-h-[120px]">
                  {s.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-[0.7rem] font-mono uppercase tracking-[0.2em] text-white/40 group-hover:text-[var(--neon)] transition-colors">
                  <span>Get started</span>
                  <ArrowUpRight size={14} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                <div className="absolute -right-10 -bottom-10 w-40 h-40 purple-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
