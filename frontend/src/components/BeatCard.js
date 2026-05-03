'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Mail, Music2 } from 'lucide-react';

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Stable pseudo-random heights per beat (so each card has its own waveform shape)
function generateWaveform(seed, count = 48) {
  const out = [];
  let h = 2166136261;
  const s = String(seed || 'beat');
  for (let i = 0; i < s.length; i++) h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0;
  for (let i = 0; i < count; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    out.push((h % 1000) / 1000 * 0.75 + 0.2);
  }
  return out;
}

export default function BeatCard({ beat, isActive, onActivate, onDeactivate }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const waveform = useMemo(
    () => generateWaveform(beat.id || beat.title),
    [beat.id, beat.title]
  );

  // Pause this card when another one becomes active
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
      a.play().catch(() => {});
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
    onDeactivate?.();
  };

  const seekFromWaveform = (e) => {
    e.stopPropagation();
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    a.currentTime = Math.max(0, Math.min(duration, ratio * duration));
  };

  const progressPct = duration ? (current / duration) * 100 : 0;
  const scrollToContact = (e) => {
    e?.stopPropagation();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      data-testid={`beat-card-${beat.id}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`group relative bg-[#121214] border transition-all duration-300 ${
        isActive
          ? 'border-[var(--neon)]/60 shadow-[0_0_40px_-8px_rgba(157,76,221,0.55)]'
          : 'border-white/5 hover:border-[var(--neon)]/40 hover:shadow-[0_0_30px_-12px_rgba(157,76,221,0.45)]'
      }`}
      style={{ borderRadius: 2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover area (clickable to play/pause) */}
      <button
        type="button"
        onClick={togglePlay}
        className="relative block w-full aspect-square overflow-hidden focus:outline-none"
        aria-label={playing ? `Pause ${beat.title}` : `Play ${beat.title}`}
        data-testid={`beat-cover-${beat.id}`}
      >
        {!coverError && beat.cover_url ? (
          <img
            src={beat.cover_url}
            alt={beat.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              hovered || playing ? 'scale-110' : 'scale-100'
            }`}
            onError={() => setCoverError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a0e2e] via-[#0a0a0b] to-[#0a0a0b]">
            <Music2 size={48} className="text-[var(--neon)]/40" />
          </div>
        )}

        {/* Bottom vignette for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

        {/* Hover/playing darken */}
        <div
          className={`absolute inset-0 transition-all duration-300 pointer-events-none ${
            hovered || playing ? 'bg-black/40' : 'bg-black/0'
          }`}
        />

        {/* Genre tag */}
        <div className="absolute top-3 right-3">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/85 bg-black/60 backdrop-blur-sm px-2.5 py-1 border border-white/15">
            {beat.genre}
          </span>
        </div>

        {/* Playing badge */}
        <AnimatePresence>
          {playing && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="absolute top-3 left-3 flex items-center gap-2 bg-[var(--neon)] px-2.5 py-1 border border-[var(--neon)] shadow-[0_0_18px_rgba(157,76,221,0.6)]"
            >
              <div className="wave-bars" style={{ height: 12 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} style={{ background: '#0a0a0b' }} />
                ))}
              </div>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-black font-bold">
                Playing
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big center play button */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${
            hovered || playing ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-[var(--neon)] blur-2xl opacity-70 animate-pulse" />
            <span className="relative h-20 w-20 rounded-full bg-[var(--neon)] flex items-center justify-center shadow-[0_0_40px_rgba(157,76,221,0.7)]">
              {playing ? (
                <Pause size={26} className="text-black" fill="black" />
              ) : (
                <Play size={28} className="text-black ml-1" fill="black" />
              )}
            </span>
          </div>
        </div>

        {/* Idle small play badge */}
        {!hovered && !playing && (
          <div className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Play size={12} className="text-white ml-0.5" fill="white" />
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          <h4 className="font-display font-bold text-white text-lg md:text-xl leading-tight tracking-tight uppercase truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
            {beat.title}
          </h4>
          <div className="mt-1.5 flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/75">
            <span>{beat.bpm} BPM</span>
            <span className="text-white/30">·</span>
            <span className="text-[var(--neon)] font-bold tracking-wider">€{Number(beat.price).toFixed(0)}</span>
          </div>
        </div>
      </button>

      {/* Always-visible mini player */}
      <div className="px-4 pt-3 pb-4 border-t border-white/5">
        {/* Waveform with progress fill */}
        <div
          role="progressbar"
          aria-valuenow={Math.round(progressPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Audio progress"
          onClick={seekFromWaveform}
          className="relative w-full h-9 flex items-end gap-[2px] cursor-pointer select-none"
          data-testid={`beat-waveform-${beat.id}`}
        >
          {waveform.map((h, i) => {
            const pct = ((i + 0.5) / waveform.length) * 100;
            const filled = pct < progressPct;
            return (
              <span
                key={i}
                className={`flex-1 rounded-[1px] transition-[background,height] duration-150 ${
                  playing ? 'beat-bar-pulse' : ''
                }`}
                style={{
                  height: `${Math.max(12, h * 100)}%`,
                  background: filled
                    ? 'linear-gradient(180deg, var(--neon-2), var(--neon))'
                    : 'rgba(255,255,255,0.13)',
                  boxShadow: filled ? '0 0 6px rgba(157,76,221,0.55)' : 'none',
                  animationDelay: `${(i % 12) * 0.06}s`,
                }}
              />
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="h-9 w-9 flex-shrink-0 rounded-full bg-[var(--neon)] hover:bg-[var(--neon-2)] flex items-center justify-center transition-all duration-200 shadow-[0_0_18px_rgba(157,76,221,0.5)] hover:shadow-[0_0_26px_rgba(157,76,221,0.85)]"
            aria-label={playing ? 'Pause' : 'Play'}
            data-testid={`beat-play-${beat.id}`}
          >
            {playing ? (
              <Pause size={14} className="text-black" fill="black" />
            ) : (
              <Play size={14} className="text-black ml-0.5" fill="black" />
            )}
          </button>

          <div className="flex-1 flex justify-between font-mono text-[0.65rem] tracking-wider text-white/45">
            <span>{formatTime(current)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <button
            type="button"
            onClick={scrollToContact}
            className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/70 hover:text-[var(--neon)] transition-colors flex items-center gap-1.5 group/buy"
            data-testid={`beat-buy-${beat.id}`}
          >
            <Mail size={12} className="transition-transform duration-200 group-hover/buy:-translate-y-[1px]" />
            Buy
          </button>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={beat.audio_url}
        preload="metadata"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onTimeUpdate}
        onEnded={onEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </motion.div>
  );
}
