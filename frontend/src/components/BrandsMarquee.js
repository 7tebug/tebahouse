'use client';

const brands = [
  { name: 'AKG', src: '/brand/tools/akg.webp' },
  { name: 'Akustik', src: '/brand/tools/akustik.webp' },
  { name: 'Antares', src: '/brand/tools/antares.webp' },
  { name: 'Arturia', src: '/brand/tools/arturia.webp' },
  { name: 'Beyerdynamic', src: '/brand/tools/bey.webp' },
  { name: 'FabFilter', src: '/brand/tools/fabfilter.webp' },
  { name: 'FL Studio', src: '/brand/tools/flstudio.webp' },
  { name: 'IK Multimedia', src: '/brand/tools/ikmultimedia.webp' },
  { name: 'iZotope', src: '/brand/tools/izotope.webp' },
  { name: 'JBL', src: '/brand/tools/jbl.webp' },
  { name: 'KRK', src: '/brand/tools/krk.webp' },
  { name: 'Native Instruments', src: '/brand/tools/nativeinstruments.webp' },
  { name: 'Omnisphere', src: '/brand/tools/omni.webp' },
  { name: 'Rode', src: '/brand/tools/rode.webp' },
  { name: 'SoundToys', src: '/brand/tools/soundtoys.webp' },
  { name: 'Solid State Logic', src: '/brand/tools/ssl.webp' },
  { name: 'Universal Audio', src: '/brand/tools/universalaudio.webp' },
  { name: 'Waves', src: '/brand/tools/waves.webp' },
];

export default function BrandsMarquee() {
  const items = [...brands, ...brands, ...brands];

  return (
    <section
      className="relative pt-20 md:pt-28 pb-28 md:pb-40 border-t border-b border-white/5 overflow-hidden marquee"
      aria-label="Tools and gear I use"
    >
      <div className="container-x mb-20 md:mb-20 text-center md:text-left">
        <span className="label-tag inline-block">Toolbox · 04</span>
        <p className="mt-5 font-mono text-white/50 uppercase tracking-[0.2em] text-xs md:text-sm">
          — Plugins, monitors, mics &amp; acoustic treatment behind every track.
        </p>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 md:w-40 z-10"
          style={{ background: 'linear-gradient(to right, #0a0a0b 0%, #0a0a0b 30%, rgba(10,10,11,0) 100%)' }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 md:w-40 z-10"
          style={{ background: 'linear-gradient(to left, #0a0a0b 0%, #0a0a0b 30%, rgba(10,10,11,0) 100%)' }}
        />

        <div className="marquee-track items-center">
          {items.map((b, i) => (
            <div
              key={i}
              className="marquee-item shrink-0 flex items-center justify-center h-20 md:h-28 w-32 md:w-48"
              title={b.name}
            >
              <img
                src={b.src}
                alt={b.name}
                className="max-h-full max-w-full object-contain opacity-50 hover:opacity-100 transition-opacity duration-300"
                style={{ filter: 'invert(1) brightness(1.1)' }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
