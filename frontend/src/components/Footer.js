'use client';

import { Instagram, Youtube, Linkedin, MapPin, Phone, Mail, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer id="footer" className="relative pt-24 pb-10 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none">
        <img
          src="/brand/tebahouse-wordmark.png"
          alt=""
          aria-hidden="true"
          className="w-[90%] max-w-[1400px] object-contain"
        />
      </div>

      <div className="container-x relative">
        <div className="grid md:grid-cols-12 gap-10 md:gap-6">
          <div className="md:col-span-5">
            <img src="/brand/th-logo.png" alt="TebaHouse" className="h-10 w-auto" />
            <p className="mt-5 font-mono text-white/50 text-sm leading-relaxed max-w-sm">
              TebaHouse — independent music production, mixing and mastering.
              Crafted from Verona, Italy, with a lot of late nights.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"
                className="h-10 w-10 flex items-center justify-center border border-white/10 text-white/60 hover:text-[var(--neon)] hover:border-[var(--neon)]/60 transition-all">
                <Instagram size={16} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"
                className="h-10 w-10 flex items-center justify-center border border-white/10 text-white/60 hover:text-[var(--neon)] hover:border-[var(--neon)]/60 transition-all">
                <Youtube size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"
                className="h-10 w-10 flex items-center justify-center border border-white/10 text-white/60 hover:text-[var(--neon)] hover:border-[var(--neon)]/60 transition-all">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/30 mb-5">Navigate</h4>
            <ul className="space-y-3 font-mono text-sm">
              <li><a href="#hero" className="text-white/80 hover:text-[var(--neon)] transition-colors">Home</a></li>
              <li><a href="#beats" className="text-white/80 hover:text-[var(--neon)] transition-colors">Beats</a></li>
              <li><a href="#services" className="text-white/80 hover:text-[var(--neon)] transition-colors">Services</a></li>
              <li><a href="#contact" className="text-white/80 hover:text-[var(--neon)] transition-colors">Contact me</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/30 mb-5">Get in touch</h4>
            <ul className="space-y-4 font-mono text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-[var(--neon)] mt-0.5 shrink-0" />
                <span className="text-white/70">Verona, Veneto<br />Pescantina 37026, Italy</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-[var(--neon)] shrink-0" />
                <a href="tel:+393755264359" className="text-white/80 hover:text-white transition-colors">+39 375 526 4359</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-[var(--neon)] shrink-0" />
                <a href="mailto:7tebahouse@gmail.com" className="text-white/80 hover:text-white transition-colors">7tebahouse@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white/35">
            TebaHouse © 2026. All rights reserved.
          </p>
          <div className="flex items-center gap-5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white/35">
            <a href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</a>
            <a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <button
              onClick={scrollTop}
              className="h-9 w-9 flex items-center justify-center border border-white/10 text-white/60 hover:text-[var(--neon)] hover:border-[var(--neon)]/50 transition-all"
              aria-label="Back to top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
