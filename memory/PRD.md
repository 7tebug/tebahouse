# TebaHouse · Product Requirements Document

## Original Problem Statement (2026-04-24)
> Voglio modificare il mio sito web, sono un producer, il nome è tebahouse.com, ed è in html e css, lo voglio moderno in react. [...] in fondo un footer.

Follow-up user choices (raw):
- Dark mode, colori nero e viola, stile moderno con animazioni fighe ma leggero.
- Navbar: logo TH, Home, Beats, Contact me (Beats = sezione beat in vendita, Contact me = footer/contact).
- Tenere Services, togliere pacchetti/prezzi (contatto diretto).
- Beat in ascolto: pannello admin per carico autonomo (titolo, cover, mp3, BPM, genere, prezzo).
- Player figo: card quadrata, hover waveform, inline player con progress, BPM, genre, "Contattami per acquistare".
- Contact: form + mailto. Nessuna newsletter. No Stripe.
- Admin: `teba` / `TebaHouse2026!`.

## Persona
- **Teba** – music producer 22 anni (9 anni di esperienza), Verona/Pescantina, opera in beatmaking + mix & mastering + consulenze. Vuole un portfolio dark moderno + piccolo "shop" di beat gestito in autonomia.
- **Visitor / potential client** – artista emergente o major che cerca un producer: vuole ascoltare beat prima di contattare, poi mandare messaggio.

## Architecture
- **Frontend**: React 19 + CRA + Tailwind + Framer Motion + lucide-react (no heavy 3D libs).
- **Backend**: FastAPI + Motor (MongoDB) + PyJWT + bcrypt; file storage su filesystem in `/app/backend/uploads/{covers,audio}`, serviti da StaticFiles mount a `/api/uploads/*` per compatibilità con Kubernetes ingress.
- **DB**: collezioni `admin_users`, `beats`, `contact_messages`. UUID come `id` (no ObjectId in response).
- **Auth**: JWT HS256, admin seedato idempotentemente su startup dalle env `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
- **Routing frontend**: `/` home one-page, `/admin` pannello gestione beat.

## Design System
- Font: **Syne** (display) + **JetBrains Mono** (UI/body) + Permanent Marker (TH logo fallback).
- Palette: background #0a0a0b, surface #121214, neon #9D4CDD, secondary deep #2a1542.
- Dark con sottile noise texture overlay, radial purple glows, micro-animazioni CSS + Framer Motion staggered reveals.
- Dettagli in `/app/design_guidelines.json`.

## Core Requirements (static)
- One-page landing: Hero, About, Services, Brands marquee, Beats shop, Contact, Footer.
- Admin panel protetto JWT per CRUD beat (upload multipart).
- Smooth-scroll navbar; mobile menu.
- Inline beat player con waveform animato, progress bar, BPM, genere, CTA contatto.
- Contact form salva in Mongo (email delivery deferred).

## Implemented (2026-04-24)
- ✅ Navbar sticky + mobile drawer + smooth scroll
- ✅ Hero full-bleed con foto studio stock + CTA + scroll indicator
- ✅ About con counter animati (Framer Motion `useMotionValue`)
- ✅ Services (3 cards con lucide icons + hover lift + purple glow)
- ✅ Brands marquee infinito (CSS keyframes, pause on hover, gradient masks)
- ✅ BeatsShop + BeatCard con player HTML5 `<audio>` inline, waveform on hover, progress bar clickabile, time formatting, pause/resume, single-active enforcement
- ✅ Contact form (POST /api/contact) con stati idle/sending/success/error
- ✅ Footer multi-colonna con socials, legal links, back-to-top, huge "TH" bg watermark
- ✅ Admin page `/admin`: login form, upload beat (multipart), lista con delete
- ✅ Backend: /api/auth/login, /api/auth/me, /api/beats GET/POST/DELETE, /api/contact POST/GET, static /api/uploads mount
- ✅ 3 beat di esempio seedati (Violet Dusk, Neon Pulse, Midnight Drift) per demo
- ✅ Backend testing: 16/16 test passati (100%)

## Prioritized Backlog
- **P1** — Caricamento dal vivo del logo TH reale (PNG/SVG) e della foto hero del producer in studio (attualmente stock Pexels).
- **P1** — Collegare Resend per invio email reali dal contact form a `7tebahouse@gmail.com` (non richiesto in questa sessione).
- **P2** — Mobile polish specifico per player inline (testato solo su desktop).
- **P2** — Lazy loading delle copertine (Intersection Observer) + WebP.
- **P2** — Pagine legali: Terms & Conditions, Privacy Policy (link presenti nel footer, vanno a `#`).
- **P3** — SEO meta tags OpenGraph + Twitter, favicon TH, sitemap.
- **P3** — Analytics (Plausible/Umami) per tracking ascolti beat.
- **P3** — Filtri/ricerca nello shop (per genere/BPM) quando i beat aumenteranno.
- **P3** — Pagamenti in-app (Stripe) se l'utente cambierà idea in futuro.
