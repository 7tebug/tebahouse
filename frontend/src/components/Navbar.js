'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Home', target: 'hero' },
  { label: 'Beats', target: 'beats' },
  { label: 'Contact me', target: 'contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.header
      data-testid="navbar"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-md bg-black/70 border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="container-x flex items-center justify-between h-[72px]">
        <button
          onClick={() => scrollTo('hero')}
          className="flex items-center group"
          data-testid="nav-logo"
          aria-label="TebaHouse home"
        >
          <img
            src="/brand/th-logo.png"
            alt="TebaHouse"
            className="h-8 md:h-9 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(157,76,221,0.7)]"
          />
        </button>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <button
              key={l.target}
              onClick={() => scrollTo(l.target)}
              data-testid={`nav-link-${l.target}`}
              className="font-mono text-[0.78rem] uppercase tracking-[0.22em] text-white/70 hover:text-white transition-colors duration-300 relative group"
            >
              {l.label}
              <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-[var(--neon)] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-black/95 border-b border-white/5"
          >
            <div className="container-x py-6 flex flex-col gap-5">
              {links.map((l) => (
                <button
                  key={l.target}
                  onClick={() => scrollTo(l.target)}
                  className="text-left font-mono text-sm uppercase tracking-[0.22em] text-white/80 hover:text-[var(--neon)] transition-colors"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
