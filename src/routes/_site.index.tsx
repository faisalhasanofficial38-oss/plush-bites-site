import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useState } from "react";
import { snapshotQuery } from "./_site";
import { SectionHeader } from "@/components/site-ui";
import heroImg from "@/assets/hero.jpg";
import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";
import menuPeri from "@/assets/menu-peri.jpg";
import menuPizza from "@/assets/menu-pizza.jpg";
import menuNachos from "@/assets/menu-nachos.jpg";
import menuCashew from "@/assets/menu-cashew.jpg";

const FALLBACK = [menuPeri, menuPizza, menuNachos, menuCashew, dish1, dish2, dish3];
const Hero3D = lazy(() => import("@/components/hero-3d").then(m => ({ default: m.Hero3D })));

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "HashTag — Restaurant, Music Cafe & Lounge in Chattogram" },
      { name: "description", content: "Fine dining, signature cocktails and live music in Mehedibag, Chattogram. Reserve a table at HashTag Restaurant, Music Cafe & Lounge." },
      { property: "og:title", content: "HashTag — Restaurant, Music Cafe & Lounge" },
      { property: "og:description", content: "Fine dining, signature cocktails and live music in Mehedibag, Chattogram." },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: "HashTag - Restaurant, Music Cafe & Lounge",
        address: { "@type": "PostalAddress", streetAddress: "Plot No. 07, CDA Masjid Complex, Mehedibag", addressLocality: "Chattogram", postalCode: "4000", addressCountry: "BD" },
        telephone: "+880 1869-341634",
        servesCuisine: ["Continental", "Bangladeshi", "Fusion"],
        openingHours: "Mo-Su 11:30-23:00",
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.0", reviewCount: "889" },
        priceRange: "৳400–600",
      }),
    }],
  }),
  component: Home,
});

function Home() {
  const { data: { settings, items } } = useSuspenseQuery(snapshotQuery);
  const [mount3D, setMount3D] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setMount3D(true), 400);
    return () => clearTimeout(t);
  }, []);
  const featured = items.slice(0, 6);
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center pt-32 pb-20">
        <img src={heroImg} alt="Plated gourmet dish in candle-lit dining room" width={1920} height={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background"></div>
        <div className="absolute inset-0" style={{ background: "var(--gradient-radial-spot)" }}></div>
        {mount3D && (
          <div className="absolute inset-0 opacity-70 mix-blend-screen pointer-events-none">
            <Suspense fallback={null}><Hero3D /></Suspense>
          </div>
        )}

        <div className="relative mx-auto max-w-7xl w-full px-5 sm:px-8">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] animate-pulse"></span>
              {settings.hero_eyebrow}
            </div>
            <h1 className="mt-6 font-display text-5xl sm:text-7xl md:text-8xl font-semibold leading-[0.95]">
              {settings.hero_headline}
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              {settings.hero_description}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link to="/order" className="rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.03]">Order now →</Link>
              <Link to="/menu" className="rounded-full glass px-7 py-3.5 text-sm font-medium hover-lift">View menu</Link>
              <a href={`tel:${settings.phone}`} className="rounded-full glass-soft px-7 py-3.5 text-sm font-medium hover-lift">Call restaurant</a>
              <a href="https://maps.app.goo.gl/xKQkJ8mMpbg97x4C9" target="_blank" rel="noreferrer" className="rounded-full glass-soft px-7 py-3.5 text-sm font-medium hover-lift">Get directions</a>
            </div>
            <dl className="mt-14 grid grid-cols-3 gap-4 max-w-lg">
              {[["4.0★", "889 Google reviews"], ["৳400–600", "Per person"], ["11:30–23", "Open daily"]].map(([k, v]) => (
                <div key={k} className="glass rounded-2xl p-4">
                  <dt className="font-display text-2xl text-gradient-gold">{k}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground animate-float-slow">scroll</div>
      </section>

      {/* MARQUEE */}
      <div className="relative overflow-hidden border-y border-border/60 py-6">
        <div className="flex shrink-0 gap-12 whitespace-nowrap [animation:marquee_28s_linear_infinite]">
          {[..."Slow-cooked|Live Music|Craft Cocktails|Private Lounge|Late-night Bites|Reservations".split("|"), ..."Slow-cooked|Live Music|Craft Cocktails|Private Lounge|Late-night Bites|Reservations".split("|")].map((t, i) => (
            <span key={i} className="font-display text-2xl sm:text-3xl text-muted-foreground/70">
              {t} <span className="text-gradient-gold mx-6">✦</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      {/* QUICK EXPERIENCE */}
      <section className="relative py-24 sm:py-32">
        <SectionHeader eyebrow="The Experience" title={<>Four worlds, <span className="text-gradient-gold italic">one address.</span></>} sub="Designed as a single, layered evening — start with a plate, stay for a set, end with a slow drink." />
        <div className="mx-auto mt-14 max-w-7xl px-5 sm:px-8 grid gap-6 md:grid-cols-2">
          {[
            { t: "Fine Dining", d: "Continental & fusion plates from a chef's-table kitchen.", k: "01" },
            { t: "Music Cafe", d: "Acoustic sets Thursday through Saturday.", k: "02" },
            { t: "Lounge & Cocktails", d: "Velvet seating, smoked cocktails and a long pour.", k: "03" },
            { t: "Dine-in · Drive-through · Delivery", d: "Same kitchen, same standard, your choice of room.", k: "04" },
          ].map((s) => (
            <article key={s.k} className="glass hover-lift group relative overflow-hidden rounded-3xl p-8 sm:p-10">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[var(--gold)] opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-20"></div>
              <span className="font-display text-sm tracking-[0.3em] text-gradient-gold">{s.k}</span>
              <h3 className="mt-4 font-display text-3xl sm:text-4xl">{s.t}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">{s.d}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/about" className="inline-flex rounded-full glass-soft px-6 py-3 text-sm hover-lift">Learn our story →</Link>
        </div>
      </section>

      {/* FEATURED MENU */}
      <section className="relative py-24 sm:py-32">
        <SectionHeader eyebrow="Featured Menu" title={<>Plates regulars <span className="text-gradient-gold italic">order on repeat.</span></>} sub="A short list of bestsellers — explore the full menu for chef's specials." />
        <div className="mx-auto mt-14 max-w-7xl px-5 sm:px-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((it, i) => (
            <article key={it.id} className="glass hover-lift group rounded-3xl overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={it.image_url || FALLBACK[i % FALLBACK.length]} alt={it.name} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
                {(it.is_best_seller || it.is_featured) && (
                  <div className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.25em] glass-soft rounded-full px-3 py-1">
                    {it.is_best_seller ? "Best seller" : "Featured"}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-xl leading-tight">{it.name}</h3>
                  <span className="text-gradient-gold font-display text-lg shrink-0">{it.price_text}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{it.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-7xl px-5 sm:px-8 flex flex-wrap justify-center gap-3">
          <Link to="/menu" className="rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.03]">Explore full menu →</Link>
          <Link to="/order" className="rounded-full glass-soft px-7 py-3.5 text-sm font-medium hover-lift">Reserve a table</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] glass p-10 sm:p-16">
            <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[var(--gold)] opacity-10 blur-3xl animate-float-slow"></div>
            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[var(--ember)] opacity-10 blur-3xl"></div>
            <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-gradient-gold">Reserve tonight</div>
                <h2 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
                  The best seat in <span className="text-gradient-gold italic">Mehedibag</span> is the one you reserve.
                </h2>
                <p className="mt-6 text-muted-foreground max-w-xl leading-relaxed">
                  Walk-ins are welcome, but weekends — especially live music nights — fill up fast. Two taps to lock your table.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link to="/order" className="rounded-full bg-gold-gradient px-7 py-4 text-center text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]">Reserve a table</Link>
                <a href={settings.foodpanda_url} target="_blank" rel="noreferrer" className="rounded-full glass px-7 py-4 text-center text-sm font-medium hover-lift">Order on foodpanda</a>
                <a href={`tel:${settings.phone}`} className="rounded-full glass-soft px-7 py-4 text-center text-sm font-medium hover-lift">Call {settings.phone}</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}