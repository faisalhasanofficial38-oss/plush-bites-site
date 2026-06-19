import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";
import aboutImg from "@/assets/about.jpg";
import menuPeri from "@/assets/menu-peri.jpg";
import menuPizza from "@/assets/menu-pizza.jpg";
import menuNachos from "@/assets/menu-nachos.jpg";
import menuCashew from "@/assets/menu-cashew.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HashTag — Restaurant, Music Cafe & Lounge in Chattogram" },
      { name: "description", content: "Fine dining, signature cocktails and live music in Mehedibag, Chattogram. Reserve a table at HashTag Restaurant, Music Cafe & Lounge." },
      { property: "og:title", content: "HashTag — Restaurant, Music Cafe & Lounge" },
      { property: "og:description", content: "Fine dining, signature cocktails and live music in Mehedibag, Chattogram." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: "HashTag - Restaurant, Music Cafe & Lounge",
          image: "/og.jpg",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Plot No. 07, CDA Masjid Complex, Mehedibag",
            addressLocality: "Chattogram",
            postalCode: "4000",
            addressCountry: "BD",
          },
          telephone: "+880 1869-341634",
          servesCuisine: ["Continental", "Bangladeshi", "Fusion"],
          openingHours: "Mo-Su 11:30-23:00",
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.0", reviewCount: "889" },
          priceRange: "৳400–600",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <FeaturedMenu />
      <Services />
      <Signature />
      <Gallery />
      <ReservationCTA />
      <Testimonials />
      <FAQ />
      <MapSection />
      <Contact />
      <Footer />
      <WhatsAppFab />
    </div>
  );
}

const PHONE = "+8801869341634";
const WHATSAPP = "8801869341634";
const ADDRESS = "Plot No. 07, CDA Masjid Complex, Mehedibag, Chattogram 4000, Bangladesh";

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    ["About", "#about"],
    ["Menu", "#menu"],
    ["Experience", "#services"],
    ["Gallery", "#gallery"],
    ["Reviews", "#reviews"],
    ["FAQ", "#faq"],
    ["Visit", "#visit"],
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-6"}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className={`grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:items-center sm:justify-between gap-4 rounded-2xl px-5 py-3 transition-all ${scrolled ? "glass" : ""}`}>
          <a href="#top" className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--gradient-gold)] font-display text-lg font-bold text-primary-foreground shadow-[var(--shadow-gold)]">#</span>
            <span className="font-display text-xl font-semibold tracking-tight">HashTag</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {links.map(([l, h]) => (
              <a key={l} href={h} className="relative transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[var(--gold)] hover:after:w-full after:transition-all">{l}</a>
            ))}
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <a href="#contact" className="rounded-full bg-[var(--gradient-gold)] px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.03]">Reserve</a>
          </div>
          <button onClick={() => setOpen(o => !o)} aria-label="Menu" className="md:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass-soft sm:ml-0">
            <span className="space-y-1.5">
              <span className={`block h-px w-5 bg-foreground transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`}></span>
              <span className={`block h-px w-5 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`}></span>
              <span className={`block h-px w-5 bg-foreground transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`}></span>
            </span>
          </button>
        </div>
        {open && (
          <div className="md:hidden mt-2 glass rounded-2xl p-4 animate-fade-up">
            <nav className="flex flex-col gap-3">
              {links.map(([l, h]) => (
                <a key={l} href={h} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">{l}</a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-[var(--gradient-gold)] px-5 py-2.5 text-center text-sm font-medium text-primary-foreground">Reserve a Table</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] flex items-center pt-32 pb-20">
      <img src={heroImg} alt="Plated gourmet dish in candle-lit dining room" width={1920} height={1080}
        className="absolute inset-0 h-full w-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background"></div>
      <div className="absolute inset-0" style={{ background: "var(--gradient-radial-spot)" }}></div>

      <div className="relative mx-auto max-w-7xl w-full px-5 sm:px-8">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] animate-pulse"></span>
            Mehedibag · Chattogram
          </div>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl md:text-8xl font-semibold leading-[0.95]">
            A taste worth <br />
            <span className="text-gradient-gold italic">#hashtagging.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            Restaurant, music cafe & lounge — where slow-cooked plates meet live acoustic nights and golden-hour cocktails. An evening you'll want to remember.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#contact" className="rounded-full bg-[var(--gradient-gold)] px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.03]">Reserve a Table</a>
            <a href="#signature" className="rounded-full glass px-7 py-3.5 text-sm font-medium hover-lift">Explore the menu →</a>
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
  );
}

function Marquee() {
  const items = ["Slow-cooked", "Live Music", "Craft Cocktails", "Private Lounge", "Late-night Bites", "Reservations"];
  return (
    <div className="relative overflow-hidden border-y border-border/60 py-6">
      <div className="flex gap-12 whitespace-nowrap animate-[shimmer_30s_linear_infinite]" style={{ animation: "none" }}>
        <div className="flex shrink-0 animate-[float-slow_0s] gap-12 [animation:marquee_28s_linear_infinite]">
          {[...items, ...items].map((t, i) => (
            <span key={i} className="font-display text-2xl sm:text-3xl text-muted-foreground/70">
              {t} <span className="text-gradient-gold mx-6">✦</span>
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

function About() {
  return (
    <section id="about" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
        <div className="relative animate-float-slow">
          <div className="absolute -inset-6 rounded-[2rem] bg-[var(--gradient-gold)] opacity-20 blur-3xl"></div>
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60">
            <img src={aboutImg} alt="HashTag Restaurant interior — velvet booths, brick wall and live music stage" loading="lazy" width={1600} height={1280}
              className="h-full w-full object-cover" />
          </div>
          <div className="hidden md:block absolute -bottom-8 -right-8 glass rounded-2xl p-5 w-56 shadow-[var(--shadow-luxury)]">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Since</div>
            <div className="mt-1 font-display text-4xl text-gradient-gold">2018</div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">A neighbourhood favourite, evening after evening.</p>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-gradient-gold">About HashTag</div>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
            A restaurant, music cafe & lounge — <span className="text-gradient-gold italic">all at once.</span>
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Tucked inside the CDA Masjid Complex in Mehedibag, HashTag has spent years turning ordinary evenings into something worth posting about. Continental plates from a chef's-table kitchen, slow-poured cocktails behind a backlit bar, and live acoustic sets that close out the night.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Families, couples, friends and visitors to Chattogram — there's a corner here for every occasion.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-3 text-sm">
            {["Continental & fusion kitchen", "Live acoustic nights", "Smoked craft cocktails", "Private group bookings", "Dine-in & drive-through", "Delivery via foodpanda"].map((f) => (
              <li key={f} className="flex items-start gap-2 glass-soft rounded-xl px-4 py-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]"></span>
                <span className="text-foreground/85">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FeaturedMenu() {
  const items = [
    { img: menuPeri, name: "Peri Peri Chicken Meal", desc: "Fire-grilled chicken, peri spice, crispy rice and dipping aioli.", price: "৳ 520", tag: "Popular" },
    { img: menuPizza, name: "Four Seasons Pizza", desc: "Hand-stretched, wood-fired, four toppings in one slice-fight.", price: "৳ 690", tag: "Popular" },
    { img: menuNachos, name: "Turkish Nachos", desc: "Spiced ground meat, yogurt, herbs and warm pita crisps.", price: "৳ 380", tag: "Popular" },
    { img: menuCashew, name: "Chicken Cashew Nut Salad", desc: "Tender chicken, toasted cashews, fresh greens, citrus dressing.", price: "৳ 420", tag: "Guest favourite" },
    { img: dish1, name: "Chef Special Steak", desc: "Hand-cut, char-grilled steak with seasonal vegetables.", price: "৳ 750", tag: "Signature" },
    { img: dish2, name: "Smoked Old Fashioned", desc: "Aged spirits, bitters, orange peel — finished tableside in smoke.", price: "৳ 650", tag: "Bar" },
  ];
  return (
    <section id="menu" className="relative py-28 sm:py-36">
      <SectionHeader eyebrow="Featured Menu" title={<>The plates regulars <span className="text-gradient-gold italic">order on repeat.</span></>} sub="A short list of bestsellers — ask your server for the full menu and chef's specials of the night." />
      <div className="mx-auto mt-16 max-w-7xl px-5 sm:px-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <article key={it.name} className="glass hover-lift group rounded-3xl overflow-hidden flex flex-col">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={it.img} alt={it.name} loading="lazy" width={1024} height={768}
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
              <div className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.25em] glass-soft rounded-full px-3 py-1">{it.tag}</div>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl leading-tight">{it.name}</h3>
                <span className="text-gradient-gold font-display text-lg shrink-0">{it.price}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{it.desc}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-7xl px-5 sm:px-8 flex flex-wrap justify-center gap-3">
        <a href="#contact" className="rounded-full bg-[var(--gradient-gold)] px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.03]">Reserve to taste them all</a>
        <a href="https://www.foodpanda.com.bd/" target="_blank" rel="noreferrer" className="rounded-full glass-soft px-7 py-3.5 text-sm font-medium hover-lift">Order on foodpanda →</a>
      </div>
    </section>
  );
}

function Gallery() {
  const shots = [
    { src: gallery1, alt: "Couple having a romantic candle-lit dinner at HashTag", span: "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" },
    { src: dish2, alt: "Smoked signature cocktail at the bar", span: "aspect-[4/5]" },
    { src: gallery2, alt: "Bartender pouring a craft cocktail behind the bar", span: "aspect-[4/5]" },
    { src: dish3, alt: "Live acoustic guitarist on the cafe stage", span: "md:col-span-2 aspect-[16/9] md:aspect-[16/8]" },
    { src: gallery3, alt: "Chef plating a fine-dining dish in the kitchen", span: "aspect-[4/5]" },
    { src: aboutImg, alt: "Velvet booths and warm pendant lights inside HashTag", span: "aspect-[4/5]" },
  ];
  return (
    <section id="gallery" className="relative py-28 sm:py-36">
      <SectionHeader eyebrow="Gallery" title={<>An evening, in <span className="text-gradient-gold italic">moments.</span></>} sub="A glimpse of the room, the bar and the kitchen behind the plates." />
      <div className="mx-auto mt-16 max-w-7xl px-5 sm:px-8">
        <div className="grid gap-4 md:grid-cols-4 md:auto-rows-[200px]">
          {shots.map((s, i) => (
            <figure key={i} className={`group relative overflow-hidden rounded-3xl border border-border/60 hover-lift ${s.span}`}>
              <img src={s.src} alt={s.alt} loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReservationCTA() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] glass p-10 sm:p-16 md:p-20">
          <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "var(--gradient-radial-spot)" }}></div>
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[var(--gold)] opacity-10 blur-3xl animate-float-slow"></div>
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[var(--ember)] opacity-10 blur-3xl"></div>

          <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <div className="text-[10px] uppercase tracking-[0.4em] text-gradient-gold">Reserve tonight</div>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
                The best seat in <span className="text-gradient-gold italic">Mehedibag,</span><br className="hidden sm:block" /> is the one you reserve.
              </h2>
              <p className="mt-6 text-muted-foreground max-w-xl leading-relaxed">
                Walk-ins are welcome, but weekends — especially live music nights — fill up fast. Two taps to lock your table.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a href="#contact" className="rounded-full bg-[var(--gradient-gold)] px-7 py-4 text-center text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]">Book a table</a>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="rounded-full glass-soft px-7 py-4 text-center text-sm font-medium hover-lift">Chat on WhatsApp</a>
              <a href={`tel:${PHONE}`} className="rounded-full glass-soft px-7 py-4 text-center text-sm font-medium hover-lift">Call {PHONE}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    { t: "Fine Dining", d: "A seasonal menu of slow-cooked classics and chef's signatures, plated to feel like an occasion every visit.", k: "01" },
    { t: "Music Cafe", d: "Acoustic sets, soulful covers and original artists — a stage built for intimate, unforgettable evenings.", k: "02" },
    { t: "Lounge & Cocktails", d: "Velvet seating, smoked cocktails and a long pour. The kind of late hour you don't want to end.", k: "03" },
    { t: "Dine-in · Drive-through · Delivery", d: "Take the seat, the wheel, or order in via foodpanda. Same kitchen, same standard, your choice of room.", k: "04" },
  ];
  return (
    <section id="services" className="relative py-28 sm:py-36">
      <SectionHeader eyebrow="The Experience" title={<>Four worlds, <span className="text-gradient-gold italic">one address.</span></>} sub="Designed as a single, layered evening — start with a plate, stay for a set, end with a slow drink." />
      <div className="mx-auto mt-16 max-w-7xl px-5 sm:px-8 grid gap-6 md:grid-cols-2">
        {services.map((s) => (
          <article key={s.k} className="glass hover-lift group relative overflow-hidden rounded-3xl p-8 sm:p-10">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[var(--gold)] opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-20"></div>
            <span className="font-display text-sm tracking-[0.3em] text-gradient-gold">{s.k}</span>
            <h3 className="mt-4 font-display text-3xl sm:text-4xl">{s.t}</h3>
            <p className="mt-4 text-muted-foreground leading-relaxed">{s.d}</p>
            <div className="mt-8 inline-flex items-center gap-2 text-sm text-foreground/80">
              Learn more
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Signature() {
  const cards = [
    { img: dish1, tag: "Kitchen", title: "Grilled Signature", price: "৳ 1,250" },
    { img: dish2, tag: "Bar", title: "Smoked Old Fashioned", price: "৳ 650" },
    { img: dish3, tag: "Stage", title: "Live Acoustic Nights", price: "Thu – Sat" },
  ];
  return (
    <section id="signature" className="relative py-28 sm:py-36">
      <SectionHeader eyebrow="Signature" title={<>From the kitchen, <span className="text-gradient-gold italic">bar & stage.</span></>} sub="A short list of what regulars come back for." />
      <div className="mx-auto mt-16 max-w-7xl px-5 sm:px-8 grid gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <article key={c.title} className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 hover-lift">
            <div className="aspect-[4/5] overflow-hidden">
              <img src={c.img} alt={c.title} loading="lazy" width={1024} height={1280}
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-background via-background/70 to-transparent">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{c.tag}</div>
                  <h3 className="mt-2 font-display text-2xl">{c.title}</h3>
                </div>
                <span className="text-gradient-gold font-display text-lg">{c.price}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { q: "The plating, the playlist, the lighting — every detail felt thought through. Easily my favourite spot in Chattogram.", n: "Nuzhat A.", r: "Anniversary dinner" },
    { q: "Smoked old fashioned was elite. Stayed for the acoustic set and lost track of time.", n: "Ridwan H.", r: "Friday night" },
    { q: "We hosted a private birthday upstairs — staff handled everything. Guests are still talking about it.", n: "Tasnia K.", r: "Private event" },
  ];
  return (
    <section id="reviews" className="relative py-28 sm:py-36">
      <SectionHeader eyebrow="Guests" title={<>Loved by the <span className="text-gradient-gold italic">regulars.</span></>} sub="A few words from the people who keep coming back." />
      <div className="mx-auto mt-16 max-w-7xl px-5 sm:px-8 grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <figure key={t.n} className="glass hover-lift rounded-3xl p-8 flex flex-col">
            <div className="text-gradient-gold font-display text-5xl leading-none">"</div>
            <blockquote className="mt-2 text-foreground/90 leading-relaxed">{t.q}</blockquote>
            <figcaption className="mt-8 flex items-center gap-3 pt-6 border-t border-border/60">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--gradient-gold)] font-display text-primary-foreground">{t.n[0]}</div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{t.n}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </div>
              <div className="ml-auto text-[var(--gold)] text-sm">★★★★★</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Do I need to reserve a table?", a: "Walk-ins are welcome, but reservations are strongly recommended for evenings and weekends — especially live music nights." },
    { q: "What are your opening hours?", a: "We're open every day from 11:30 AM to 11:00 PM, with the lounge active until close." },
    { q: "Is there live music every night?", a: "Acoustic and live sets are scheduled Thursday through Saturday. Follow our socials for the weekly lineup." },
    { q: "Do you host private events?", a: "Yes — birthdays, anniversaries, corporate dinners and brand events. A dedicated planner will reach out within a day." },
    { q: "Is parking available?", a: "On-site and street parking are both available near the CDA Masjid Complex in Mehedibag." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-28 sm:py-36">
      <SectionHeader eyebrow="FAQ" title={<>Good <span className="text-gradient-gold italic">to know.</span></>} sub="Answers to what most people ask before their first visit." />
      <div className="mx-auto mt-16 max-w-3xl px-5 sm:px-8 space-y-4">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className={`glass rounded-2xl overflow-hidden transition-all ${isOpen ? "shadow-[var(--shadow-gold)]" : ""}`}>
              <button onClick={() => setOpen(isOpen ? null : i)} className="w-full text-left flex items-center justify-between gap-6 px-6 py-5">
                <span className="font-display text-lg sm:text-xl">{f.q}</span>
                <span className={`text-gradient-gold text-2xl transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`grid transition-all duration-500 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MapSection() {
  return (
    <section id="visit" className="relative py-28 sm:py-36">
      <SectionHeader eyebrow="Visit" title={<>Find us in <span className="text-gradient-gold italic">Mehedibag.</span></>} sub="A short walk from the CDA Masjid Complex." />
      <div className="mx-auto mt-16 max-w-7xl px-5 sm:px-8">
        <div className="glass rounded-3xl overflow-hidden grid lg:grid-cols-[1fr_1.4fr] gap-0">
          <div className="p-8 sm:p-10 space-y-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Address</div>
              <p className="mt-2 font-display text-2xl leading-snug">{ADDRESS}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoBlock label="Hours" value="11:30 AM – 11 PM" />
              <InfoBlock label="Phone" value={PHONE} href={`tel:${PHONE}`} />
              <InfoBlock label="Plus Code" value="9R4F+WX Chattogram" />
              <InfoBlock label="Rating" value="4.0 ★ on Google" />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="https://maps.app.goo.gl/xKQkJ8mMpbg97x4C9" target="_blank" rel="noreferrer"
                className="rounded-full bg-[var(--gradient-gold)] px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.03]">Get directions</a>
              <a href={`tel:${PHONE}`} className="rounded-full glass-soft px-6 py-3 text-sm font-medium hover-lift">Call us</a>
            </div>
          </div>
          <div className="min-h-[360px] lg:min-h-[460px] relative">
            <iframe
              title="HashTag Restaurant location"
              src="https://www.google.com/maps?q=HashTag+Restaurant+Mehedibag+Chattogram&output=embed"
              className="absolute inset-0 h-full w-full grayscale-[40%] contrast-110"
              style={{ border: 0, filter: "invert(0.92) hue-rotate(180deg) saturate(0.6) brightness(0.9)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <>
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-sm font-medium">{value}</div>
    </>
  );
  return (
    <div className="rounded-2xl glass-soft p-4">
      {href ? <a href={href} className="hover:text-gradient-gold">{inner}</a> : inner}
    </div>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="relative py-28 sm:py-36">
      <SectionHeader eyebrow="Reserve" title={<>Save your <span className="text-gradient-gold italic">seat.</span></>} sub="Drop us a note and we'll confirm by phone within the hour." />
      <div className="mx-auto mt-16 max-w-3xl px-5 sm:px-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const text = `Reservation request%0AName: ${fd.get("name")}%0APhone: ${fd.get("phone")}%0ADate: ${fd.get("date")}%0AGuests: ${fd.get("guests")}%0ANote: ${fd.get("note")}`;
            window.open(`https://wa.me/${WHATSAPP}?text=${text}`, "_blank");
            setSent(true);
          }}
          className="glass rounded-3xl p-6 sm:p-10 grid gap-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <Field name="name" label="Full name" placeholder="Your name" required />
            <Field name="phone" label="Phone" placeholder="+880 …" required type="tel" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field name="date" label="Date & time" type="datetime-local" required />
            <Field name="guests" label="Guests" type="number" placeholder="2" required />
          </div>
          <Field name="note" label="Note (optional)" placeholder="Window table, anniversary, dietary requests…" textarea />
          <button type="submit" className="mt-2 rounded-full bg-[var(--gradient-gold)] px-7 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]">
            Request reservation
          </button>
          {sent && (
            <p className="text-sm text-[var(--gold)] text-center">Opened in WhatsApp — send the message to confirm.</p>
          )}
        </form>
      </div>
    </section>
  );
}

function Field({ name, label, placeholder, type = "text", required, textarea }: { name: string; label: string; placeholder?: string; type?: string; required?: boolean; textarea?: boolean }) {
  const base = "w-full rounded-xl bg-input/40 border border-border/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-colors";
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{label}</span>
      {textarea ? (
        <textarea name={name} placeholder={placeholder} required={required} rows={4} className={base} />
      ) : (
        <input name={name} placeholder={placeholder} required={required} type={type} className={base} />
      )}
    </label>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-border/60 mt-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gradient-gold)] font-display text-lg font-bold text-primary-foreground">#</span>
            <span className="font-display text-xl font-semibold">HashTag</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">Restaurant, music cafe & lounge in the heart of Chattogram.</p>
        </div>
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/80">Visit</div>
          <p>{ADDRESS}</p>
          <p>Open daily · 11:30 AM – 11 PM</p>
        </div>
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/80">Contact</div>
          <a href={`tel:${PHONE}`} className="block hover:text-foreground">{PHONE}</a>
          <a href={`https://wa.me/${WHATSAPP}`} className="block hover:text-foreground">WhatsApp us</a>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} HashTag Restaurant, Music Cafe & Lounge.</span>
          <span>Mehedibag · Chattogram · Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi HashTag, I'd like to reserve a table.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 rounded-full pl-2 pr-5 py-2 glass shadow-[var(--shadow-gold)] hover-lift"
    >
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#25D366] text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20.52 3.48A11.94 11.94 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.93 11.93 0 0 0 5.77 1.47h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.47-8.41ZM12.05 21.3h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.97 1-3.62-.24-.37a9.93 9.93 0 1 1 18.42-5.25c0 5.48-4.46 9.86-10.04 9.86Zm5.45-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01a1.1 1.1 0 0 0-.8.37c-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.48.71.3 1.26.48 1.69.62.71.22 1.35.19 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>
      </span>
      <span className="hidden sm:block text-sm font-medium pr-1">Chat on WhatsApp</span>
    </a>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub: string }) {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
      <div className="text-[10px] uppercase tracking-[0.4em] text-gradient-gold">{eyebrow}</div>
      <h2 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05]">{title}</h2>
      <p className="mt-5 text-muted-foreground leading-relaxed">{sub}</p>
    </div>
  );
}
