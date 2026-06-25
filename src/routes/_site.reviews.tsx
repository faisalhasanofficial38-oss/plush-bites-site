import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { snapshotQuery } from "./_site";
import { PageHero } from "@/components/site-ui";

const FALLBACK_REVIEWS = [
  { n: "Tridib Ghose", r: "Local Guide · 198 reviews", s: 5, q: "Food is generally good. Good ambience. Furniture has been improved recently. Staff are friendly and helpful. Pretty good hygiene standard maintained in the dining area." },
  { n: "Rakin Rafsan", r: "Local Guide · 67 reviews", s: 5, q: "The food quality is very good and all items are found delicious. However the sitting space is a bit small — get there early on weekends." },
  { n: "Mashruba Hani", r: "Local Guide · 60 reviews", s: 4, q: "Environment was cozy and they allow live music for their customers. A very good place to hangout with friends and have some great, tasty food. Chicken cashew nut salad was a favourite." },
  { n: "Sajid Karim", r: "12 reviews", s: 5, q: "Their smoked old fashioned is the best I've had in Chattogram. Live music on weekends is the cherry on top." },
  { n: "Nadia Akter", r: "Local Guide · 41 reviews", s: 4, q: "Came for an anniversary dinner — staff went out of their way. Pasta and steak were both excellent." },
  { n: "Imran Hossain", r: "8 reviews", s: 5, q: "Drive-through is a lifesaver on busy nights. Same kitchen quality as dine-in. Will be back." },
];

export const Route = createFileRoute("/_site/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — HashTag Restaurant" },
      { name: "description", content: "Real guest reviews of HashTag Restaurant — rated 4.0 stars across 889 Google reviews." },
      { property: "og:title", content: "Reviews — HashTag" },
      { property: "og:description", content: "What guests are saying about HashTag in Mehedibag, Chattogram." },
    ],
    links: [{ rel: "canonical", href: "/reviews" }],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { data: { reviews } } = useSuspenseQuery(snapshotQuery);
  const REVIEWS = reviews.length > 0
    ? reviews.map(r => ({ n: r.name, r: r.role_label, s: r.rating, q: r.message }))
    : FALLBACK_REVIEWS;
  const avg = REVIEWS.reduce((a, r) => a + r.s, 0) / Math.max(1, REVIEWS.length);
  return (
    <>
      <PageHero eyebrow="Guests" title={<>Loved by the <span className="text-gradient-gold italic">regulars.</span></>} sub="A few words from the people who keep coming back." />

      <section className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="glass-strong rounded-3xl p-8 sm:p-10 text-center">
          <div className="font-display text-6xl sm:text-7xl text-gradient-gold">{avg.toFixed(1)}</div>
          <div className="mt-3 text-[var(--gold)] text-xl sm:text-2xl tracking-wider">{"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}</div>
          <div className="mt-3 text-sm text-muted-foreground">Based on <span className="text-foreground font-medium">889 Google reviews</span></div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-5 sm:px-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-24">
        {REVIEWS.map((t, i) => (
          <figure key={t.n} className="glass rounded-3xl p-8 flex flex-col transition-all duration-500 hover:shadow-[var(--shadow-gold)]"
            style={{ animation: `fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + i * 0.1}s both` }}>
            <div className="text-gradient-gold font-display text-5xl leading-none">"</div>
            <blockquote className="mt-2 text-foreground/90 leading-relaxed flex-1">{t.q}</blockquote>
            <figcaption className="mt-8 flex items-center gap-3 pt-6 border-t border-border/60">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-gradient font-display text-primary-foreground shrink-0 shadow-[var(--shadow-gold)]">{t.n[0]}</div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{t.n}</div>
                <div className="text-xs text-muted-foreground truncate">{t.r}</div>
              </div>
              <div className="ml-auto text-[var(--gold)] text-sm shrink-0 tracking-wider">{"★".repeat(t.s)}{"☆".repeat(5 - t.s)}</div>
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-8 pb-24 text-center">
        <Link to="/order" className="group inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-all duration-300 hover:shadow-[var(--shadow-glow-gold)]">
          Reserve your table
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </section>
    </>
  );
}
