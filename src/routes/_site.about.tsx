import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site-ui";
import aboutImg from "@/assets/about.jpg";
import dish2 from "@/assets/dish-2.jpg";
import gallery2 from "@/assets/gallery-2.jpg";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About HashTag — Restaurant, Music Cafe & Lounge" },
      { name: "description", content: "Our story — continental kitchen, live music stage and lounge bar tucked inside CDA Masjid Complex, Mehedibag." },
      { property: "og:title", content: "About HashTag Restaurant" },
      { property: "og:description", content: "Our story, our kitchen and the room we built in Mehedibag, Chattogram." },
      { property: "og:image", content: aboutImg },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About HashTag" title={<>A restaurant, music cafe & lounge — <span className="text-gradient-gold italic">all at once.</span></>}
        sub="Tucked inside the CDA Masjid Complex in Mehedibag, HashTag has spent years turning ordinary evenings into something worth posting about." />

      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gold-gradient opacity-20 blur-3xl"></div>
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60">
              <img src={aboutImg} alt="HashTag Restaurant interior — velvet booths, brick wall and live music stage" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="hidden md:block absolute -bottom-8 -right-8 glass-strong rounded-2xl p-5 w-56 shadow-[var(--shadow-luxury)] animate-float-slow">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Since</div>
              <div className="mt-1 font-display text-4xl text-gradient-gold">2018</div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">A neighbourhood favourite, evening after evening.</p>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gradient-gold">
              <span className="h-px w-6 bg-gradient-to-r from-transparent to-[var(--gold)]"></span>
              <span>Our story</span>
            </div>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">A kitchen with a <span className="text-gradient-gold italic">point of view.</span></h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              HashTag began as a small kitchen with a stubborn idea: that an evening out should feel layered. A plate that earns the room, a song that earns the plate, and a drink that earns the song. Years on, the formula hasn't changed.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Families, couples, friends and visitors to Chattogram — there's a corner here for every occasion. Continental plates from a chef's-table kitchen, slow-poured cocktails behind a backlit bar, and live acoustic sets that close out the night.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-3 text-sm">
              {["Continental & fusion kitchen", "Live acoustic nights", "Smoked craft cocktails", "Private group bookings", "Dine-in & drive-through", "Delivery via foodpanda"].map((f) => (
                <li key={f} className="flex items-start gap-2 glass-soft rounded-xl px-4 py-3 transition-all duration-300 hover:bg-white/[0.04]">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]"></span>
                  <span className="text-foreground/85">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid gap-6 md:grid-cols-3">
          {[
            { eye: "Mission", t: "Hospitality, plated.", d: "Every guest leaves feeling looked after — by the kitchen, the bar and the room." },
            { eye: "Vision", t: "Chattogram's evening address.", d: "The place you choose for the night that matters — and the next ordinary Tuesday too." },
            { eye: "Values", t: "Craft over shortcuts.", d: "Slow-cooked, hand-poured, hand-played. No corner of the experience left to autopilot." },
          ].map((c, i) => (
            <article key={c.eye} className="glass rounded-3xl p-8 transition-all duration-500 hover:shadow-[var(--shadow-gold)]"
              style={{ animation: `fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + i * 0.1}s both` }}>
              <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-gradient-gold">
                <span className="h-px w-4 bg-gradient-to-r from-transparent to-[var(--gold)]"></span>
                <span>{c.eye}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl">{c.t}</h3>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{c.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-border/60 aspect-[4/3] group">
            <img src={gallery2} alt="Bartender pouring a craft cocktail" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
          </div>
          <div className="overflow-hidden rounded-3xl border border-border/60 aspect-[4/3] group">
            <img src={dish2} alt="Smoked signature cocktail" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
          </div>
        </div>
        <div className="mt-12 text-center">
          <Link to="/order" className="group inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-all duration-300 hover:shadow-[var(--shadow-glow-gold)]">
            Reserve your table
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
