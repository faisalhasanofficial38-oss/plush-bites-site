import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { snapshotQuery } from "./_site";
import { PageHero } from "@/components/site-ui";

const FALLBACK_FAQS = [
  { q: "Do I need to reserve a table?", a: "Walk-ins are welcome, but reservations are strongly recommended for evenings and weekends — especially live music nights." },
  { q: "What are your opening hours?", a: "We're open every day from 11:30 AM to 11:00 PM, with the lounge active until close." },
  { q: "How much should I expect to spend?", a: "Most guests spend around ৳400–600 per person for a full meal. Drinks, signature dishes and platters are priced separately." },
  { q: "Is there live music every night?", a: "Acoustic and live sets are scheduled Thursday through Saturday. Follow our socials for the weekly lineup." },
  { q: "Do you offer delivery and drive-through?", a: "Yes — drive-through is available during opening hours, and no-contact delivery is supported via foodpanda." },
  { q: "Do you host private events?", a: "Yes — birthdays, anniversaries, corporate dinners and brand events. Reach out via WhatsApp and a planner will respond within a day." },
  { q: "Is parking available?", a: "On-site and street parking are both available near the CDA Masjid Complex in Mehedibag." },
  { q: "Do you accept card payments?", a: "Yes — major credit and debit cards, plus mobile banking. Cash is welcome too." },
];

export const Route = createFileRoute("/_site/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — HashTag Restaurant" },
      { name: "description", content: "Answers to common questions about HashTag — reservations, hours, pricing, delivery, parking and more." },
      { property: "og:title", content: "FAQ — HashTag" },
      { property: "og:description", content: "Everything you need to know before your first visit." },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: { faqs } } = useSuspenseQuery(snapshotQuery);
  const FAQS = faqs.length > 0 ? faqs.map(f => ({ q: f.question, a: f.answer })) : FALLBACK_FAQS;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <PageHero eyebrow="FAQ" title={<>Good <span className="text-gradient-gold italic">to know.</span></>} sub="Answers to what most people ask before their first visit." />

      <section className="mx-auto max-w-3xl px-5 sm:px-8 space-y-4 pb-16">
        {FAQS.map((f, i) => {
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
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-8 pb-24 text-center">
        <p className="text-muted-foreground mb-5">Still have a question?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/contact" className="rounded-full bg-gold-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)]">Get in touch</Link>
          <Link to="/order" className="rounded-full glass-soft px-6 py-3 text-sm hover-lift">Reserve a table</Link>
        </div>
      </section>
    </>
  );
}