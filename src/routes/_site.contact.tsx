import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { snapshotQuery } from "./_site";
import { PageHero } from "@/components/site-ui";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "Contact HashTag — Restaurant, Music Cafe & Lounge" },
      { name: "description", content: "Get in touch with HashTag Restaurant in Mehedibag, Chattogram. Phone, WhatsApp, email and map." },
      { property: "og:title", content: "Contact HashTag" },
      { property: "og:description", content: "Phone, WhatsApp, email, address and map for HashTag Restaurant." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: { settings } } = useSuspenseQuery(snapshotQuery);
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero eyebrow="Contact" title={<>Get in <span className="text-gradient-gold italic">touch.</span></>}
        sub="For private events, group bookings or general questions. For everyday orders, foodpanda is fastest — to reserve a table, head to the Order page." />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-20 grid gap-6 lg:grid-cols-3">
        <ContactCard icon="📞" label="Phone" value="01869-341634" href={`tel:${settings.phone}`} />
        <ContactCard icon="✉️" label="Email" value="hashtagcafe.ctg@gmail.com" href="mailto:hashtagcafe.ctg@gmail.com" />
        <ContactCard icon="💬" label="WhatsApp" value="Chat with us" href={`https://api.whatsapp.com/send?phone=${settings.whatsapp}`} />
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-20 grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const text = encodeURIComponent(
              `Inquiry\nName: ${fd.get("name")}\nPhone: ${fd.get("phone")}\nType: ${fd.get("type")}\nMessage: ${fd.get("note")}`,
            );
            window.open(`https://api.whatsapp.com/send?phone=${settings.whatsapp}&text=${text}`, "_blank");
            setSent(true);
          }}
          className="glass rounded-3xl p-6 sm:p-10 grid gap-5"
        >
          <h2 className="font-display text-2xl">Send a message</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field name="name" label="Full name" placeholder="Your name" required />
            <Field name="phone" label="Phone" placeholder="+880 …" required type="tel" />
          </div>
          <Field name="type" label="Inquiry type" placeholder="Private event, group booking, question…" required />
          <Field name="note" label="Message" placeholder="Tell us what you have in mind." textarea required />
          <button type="submit" className="mt-2 rounded-full bg-gold-gradient px-7 py-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]">
            Send via WhatsApp
          </button>
          {sent && <p className="text-sm text-[var(--gold)] text-center">Opened in WhatsApp — send the message to confirm.</p>}
        </form>

        <div className="glass rounded-3xl overflow-hidden flex flex-col">
          <div className="p-8 space-y-4">
            <h2 className="font-display text-2xl">Visit us</h2>
            <p className="text-muted-foreground leading-relaxed">{settings.address}</p>
            <p className="text-sm text-muted-foreground">{settings.opening_hours}</p>
            <a href="https://maps.app.goo.gl/xKQkJ8mMpbg97x4C9" target="_blank" rel="noreferrer"
              className="inline-flex rounded-full bg-gold-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)]">Get directions →</a>
          </div>
          <div className="min-h-[280px] relative flex-1">
            <iframe
              title="HashTag Restaurant location" src={settings.map_embed_url}
              sandbox="allow-scripts allow-popups"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full" style={{ border: 0, filter: "invert(0.92) hue-rotate(180deg) saturate(0.6) brightness(0.9)" }}
              loading="lazy" />
          </div>
        </div>
      </section>
    </>
  );
}

function ContactCard({ icon, label, value, href }: { icon: string; label: string; value: string; href: string }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
      className="glass hover-lift rounded-3xl p-8 flex items-center gap-5 group">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-gradient text-2xl shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-lg truncate group-hover:text-gradient-gold">{value}</div>
      </div>
    </a>
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