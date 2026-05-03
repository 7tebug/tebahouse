'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Mail, X } from 'lucide-react';

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function BeatCard({ beat, isActive, onActivate, onDeactivate }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!isActive && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [isActive]);

  const togglePlay = (e) => {
    e?.stopPropagation();
    const a = audioRef.current;
    if (!a) return;
    if (!isActive) onActivate(beat.id);
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (!a) return;
    setCurrent(a.currentTime);
    if (a.duration) setDuration(a.duration);
  };

  const onEnded = () => {
    setPlaying(false);
    setCurrent(0);
  };

  const seek = (e) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    a.currentTime = Math.max(0, Math.min(duration, ratio * duration));
  };

  const progressPct = duration ? (current / duration) * 100 : 0;
  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <motion.div
      layout
      className={`relative bg-[#121214] border transition-colors duration-300 ${
        isActive ? 'border-[var(--neon)]/70' : 'border-white/5 hover:border-white/20'
      }`}
      style={{ borderRadius: 2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={togglePlay}
        className="relative block w-full aspect-square overflow-hidden group"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        <img
          src={beat.cover_url}
          alt={beat.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className={`absolute inset-0 transition-all duration-300 ${
          hovered || playing ? 'bg-black/60' : 'bg-black/20'
        }`} />

        <AnimatePresence>
          {hovered && !playing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="wave-bars" style={{ height: 50 }}>
                {Array.from({ length: 12 }).map((_, i) => <span key={i} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          playing || hovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="h-16 w-16 rounded-full bg-[var(--neon)] flex items-center justify-center shadow-[0_0_30px_rgba(157,76,221,0.6)]">
            {playing ? <Pause size={22} className="text-black" /> : <Play size={22} className="text-black ml-1" />}
          </div>
        </div>

        {!hovered && !playing && (
          <div className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Play size={14} className="text-white ml-0.5" />
          </div>
        )}

        {playing && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 backdrop-blur px-2.5 py-1 border border-[var(--neon)]/60">
            <div className="wave-bars" style={{ height: 14 }}>
              {Array.from({ length: 4 }).map((_, i) => <span key={i} />)}
            </div>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--neon)]">Playing</span>
          </div>
        )}

        <div className="absolute top-3 right-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/80 bg-black/60 px-2 py-1 border border-white/10">
          {beat.genre}
        </div>
      </button>

      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-display font-bold text-white text-base truncate">{beat.title}</h4>
          <div className="mt-1 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
            <span>{beat.bpm} BPM</span>
            <span className="text-white/20">·</span>
            <span className="text-[var(--neon)]">€{Number(beat.price).toFixed(0)}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-4 bg-black/40">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Now playing</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeactivate(); }}
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label="Close player"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="beat-progress" onClick={seek} role="progressbar" aria-valuenow={Math.round(progressPct)}>
                <div className="beat-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>

              <div className="mt-2 flex justify-between font-mono text-[0.65rem] tracking-wider text-white/40">
                <span>{formatTime(current)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <button onClick={scrollToContact} className="btn-solid mt-5 w-full">
                <Mail size={14} style={{ marginRight: 8 }} />
                Contattami per acquistare
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio
        ref={audioRef}
        src={beat.audio_url}
        preload="metadata"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onTimeUpdate}
        onEnded={onEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => console.warn('Audio load error for', beat.title)}
      />
    </motion.div>
  );
}
