import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { snapshotQuery } from "./_site";
import { PageHero } from "@/components/site-ui";
import aboutImg from "@/assets/about.jpg";
import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import menuPeri from "@/assets/menu-peri.jpg";
import menuPizza from "@/assets/menu-pizza.jpg";

const FALLBACK_SHOTS = [
  { src: gallery1, alt: "Couple having a romantic candle-lit dinner at HashTag" },
  { src: dish2, alt: "Smoked signature cocktail at the bar" },
  { src: gallery2, alt: "Bartender pouring a craft cocktail behind the bar" },
  { src: dish3, alt: "Live acoustic guitarist on the cafe stage" },
  { src: gallery3, alt: "Chef plating a fine-dining dish" },
  { src: aboutImg, alt: "Velvet booths and warm pendant lights inside HashTag" },
  { src: menuPeri, alt: "Peri peri chicken plate" },
  { src: menuPizza, alt: "Four seasons pizza" },
  { src: dish1, alt: "Grilled signature dish" },
];

export const Route = createFileRoute("/_site/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — HashTag Restaurant" },
      { name: "description", content: "Photos from the dining room, bar, kitchen and stage at HashTag Restaurant in Mehedibag, Chattogram." },
      { property: "og:title", content: "Gallery — HashTag" },
      { property: "og:description", content: "A look inside the room, the bar and the kitchen." },
      { property: "og:image", content: gallery1 },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: { gallery } } = useSuspenseQuery(snapshotQuery);
  type Shot = { src: string; alt: string; kind: "image" | "video"; poster?: string | null; caption?: string };
  const SHOTS: Shot[] = gallery.length > 0
    ? gallery.map(g => ({ src: g.url, alt: g.alt || "HashTag", kind: g.kind, poster: g.poster_url, caption: g.caption }))
    : FALLBACK_SHOTS.map(s => ({ ...s, kind: "image" as const }));
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <PageHero eyebrow="Gallery" title={<>An evening, in <span className="text-gradient-gold italic">moments.</span></>} sub="A glimpse of the room, the bar and the kitchen behind the plates." />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
          {SHOTS.map((s, i) => (
            <button key={i} onClick={() => setOpen(i)}
              className="group mb-5 block w-full overflow-hidden rounded-2xl border border-border/60 transition-all duration-500 hover:shadow-[var(--shadow-gold)] hover:border-[var(--gold)]/40 break-inside-avoid text-left"
              style={{ animation: `fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${0.05 + i * 0.05}s both` }}>
              {s.kind === "video" ? (
                <video src={s.src} poster={s.poster ?? undefined} muted loop playsInline
                  onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
              ) : (
                <img src={s.src} alt={s.alt} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
              )}
              {s.caption && (
                <div className="p-3 text-left">
                  <p className="text-xs text-muted-foreground">{s.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {open !== null && (
        <div onClick={() => setOpen(null)} className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in">
          <button aria-label="Close" onClick={() => setOpen(null)} className="absolute top-6 right-6 grid h-12 w-12 place-items-center rounded-full glass-strong text-lg transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-glow-gold)] z-10">✕</button>
          <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + SHOTS.length) % SHOTS.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full glass-strong text-xl transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-glow-gold)] z-10">‹</button>
          <div className="relative max-h-[90vh] max-w-[90vw] animate-scale-in" onClick={e => e.stopPropagation()}>
            {SHOTS[open].kind === "video" ? (
              <video src={SHOTS[open].src} poster={SHOTS[open].poster ?? undefined} controls autoPlay className="max-h-[85vh] max-w-[85vw] rounded-2xl" />
            ) : (
              <>
                <img src={SHOTS[open].src} alt={SHOTS[open].alt} className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain" />
                {SHOTS[open].caption && (
                  <p className="mt-3 text-sm text-muted-foreground text-center">{SHOTS[open].caption}</p>
                )}
              </>
            )}
          </div>
          <button aria-label="Next" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % SHOTS.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full glass-strong text-xl transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-glow-gold)] z-10">›</button>
        </div>
      )}
    </>
  );
}
