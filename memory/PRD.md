# TebaHouse — Product Requirements Document

## Original Problem Statement
> Sito Next.js già online su https://tebahouse.vercel.app/ (repo: github.com/7tebug/tebahouse). Aggiungere card beats nella sezione esistente con immagine, audio play/stop, animazioni curate. Implementare admin login + creazione card. Push automatico su GitHub → auto-deploy Vercel.

## Tech stack
- Next.js 15 (App Router) + React 19
- Tailwind CSS + Framer Motion + lucide-react
- Supabase (auth + postgres `beats` table + public storage bucket `beats`)
- Hosted on Vercel (auto-deploy on push to `main`)

## Architecture
- `frontend/src/app/page.js` — marketing homepage with sections (Hero, About, Services, BrandsMarquee, BeatsShop, Contact)
- `frontend/src/app/admin/page.js` — admin panel (login + upload + delete beats)
- `frontend/src/components/BeatsShop.js` — public listing (fetch + filters + grid)
- `frontend/src/components/BeatCard.js` — single beat card (cover + always-visible mini-player)
- `frontend/src/lib/supabase.js` — browser supabase client + ADMIN_EMAIL constant

## What's implemented (Jan 2026)
- **BeatCard redesign** — cover with hover scale, big neon play overlay, gradient title overlay, persistent mini-player (waveform + progress + Buy), animated playing badge, fallback when cover URL fails, stable per-beat waveform shape.
- **BeatsShop redesign** — animated counter, genre filter chips with active neon state, skeleton loading (4 cards), polished empty state, layout-animated grid.
- **Admin login polish** — purple glow background, large `ADMIN ACCESS` heading with neon accent, animated error feedback with alert icon, "Authorised personnel only" footer.
- **Admin dashboard polish** — drag&drop dropzones for cover + audio, cover thumbnail preview before upload, file size shown, animated success/error states, sticky upload form on desktop, library row with embedded audio preview, animated row transitions, library skeleton.
- **CSS extras** — `beat-bar-pulse` keyframe for animated waveform during playback, `dropzone` styles with drag/has-file states.

## Supabase setup (already done by user)
- `beats` table: id, title, genre, bpm, price, cover_url, audio_url, created_at
- `contact_messages` table: id, name, email, message, created_at
- Public storage bucket `beats` (covers/ + audio/)
- RLS: public select on beats; insert/delete restricted to admin email
- New user registration disabled, single admin user via `NEXT_PUBLIC_ADMIN_EMAIL`

## Env vars (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_EMAIL`

## Deploy flow
1. Modifiche committate da Emergent
2. User uses "Save to GitHub" button → push to `7tebug/tebahouse:main`
3. Vercel auto-deploy → live on `tebahouse.vercel.app`

## Backlog / future ideas
- Edit existing beats (currently delete + re-upload)
- Generate audio waveform from real audio peaks (Web Audio API analyser) instead of pseudo-random
- Beat tags (mood, instruments)
- Stripe checkout instead of "contact me to buy"
- Beat preview limit (30s) with full track gated behind purchase
- Drag-to-reorder library / featured pinning
- SEO: per-beat OG images
