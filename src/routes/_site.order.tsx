import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery } from "@tanstack/react-query";
import { snapshotQuery } from "./_site";
import { PageHero } from "@/components/site-ui";
import { createReservation } from "@/lib/reservations.functions";

export const Route = createFileRoute("/_site/order")({
  head: () => ({
    meta: [
      { title: "Order or Reserve — HashTag Restaurant" },
      { name: "description", content: "Reserve a table at HashTag in Mehedibag, Chattogram, or order delivery via foodpanda. Two ways to enjoy the kitchen." },
      { property: "og:title", content: "Order — HashTag" },
      { property: "og:description", content: "Reserve a table or order delivery via foodpanda." },
    ],
    links: [{ rel: "canonical", href: "/order" }],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { data: { settings, items } } = useSuspenseQuery(snapshotQuery);
  const [mode, setMode] = useState<"reserve" | "delivery">("reserve");

  return (
    <>
      <PageHero eyebrow="Order" title={<>Two ways to <span className="text-gradient-gold italic">enjoy the kitchen.</span></>}
        sub="Reserve a table for the full HashTag evening, or get the same kitchen delivered to your door via foodpanda." />

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
          <ModeButton active={mode === "reserve"} onClick={() => setMode("reserve")}
            title="Reserve a table" sub="Dine-in · live music nights" icon="🪑" />
          <ModeButton active={mode === "delivery"} onClick={() => setMode("delivery")}
            title="Home delivery" sub="Order on foodpanda" icon="🛵" />
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-4xl px-5 sm:px-8 pb-24">
        {mode === "reserve" ? <ReservationForm items={items.map(i => i.name)} /> : <DeliveryPanel settings={settings} />}
      </section>
    </>
  );
}

function ModeButton({ active, onClick, title, sub, icon }: { active: boolean; onClick: () => void; title: string; sub: string; icon: string }) {
  return (
    <button onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl p-6 sm:p-8 text-left transition-all duration-500 [perspective:1000px] ${active ? "glass-strong shadow-[var(--shadow-gold)] border border-[var(--gold)]/40" : "glass-soft hover:shadow-[var(--shadow-soft)]"}`}>
      <div className="flex items-center gap-4 sm:gap-5">
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl transition-all duration-500 ${active ? "bg-gold-gradient shadow-[var(--shadow-gold)] scale-110" : "bg-input/40"}`}>{icon}</span>
        <div>
          <div className="font-display text-xl sm:text-2xl">{title}</div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-1">{sub}</div>
        </div>
      </div>
    </button>
  );
}

function DeliveryPanel({ settings }: { settings: { foodpanda_url: string; phone: string } }) {
  return (
    <div className="glass-strong rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[var(--ember)] opacity-10 blur-3xl"></div>
      <div className="absolute inset-0 bg-noise opacity-[0.06] pointer-events-none"></div>
      <div className="relative">
        <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gradient-gold">
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-[var(--gold)]"></span>
          <span>Delivery partner</span>
          <span className="h-px w-6 bg-gradient-to-l from-transparent to-[var(--gold)]"></span>
        </div>
        <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl">Order on <span className="text-[#d70f64]">foodpanda</span></h2>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto leading-relaxed">The full HashTag kitchen, delivered fresh. Same plates as dine-in — pay online or cash on delivery.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={settings.foodpanda_url} target="_blank" rel="noreferrer"
            className="group rounded-full bg-gold-gradient px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[var(--shadow-glow-gold)]">
            Open foodpanda
            <span className="inline-block ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <a href={`tel:${settings.phone}`} className="rounded-full glass-strong px-8 py-4 text-sm font-medium transition-all duration-300 hover:shadow-[var(--shadow-glow-gold)]">Call to order</a>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Foodpanda handles delivery, payment and tracking.</p>
      </div>
    </div>
  );
}

function ReservationForm({ items }: { items: string[] }) {
  const submit = useServerFn(createReservation);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  type ResInput = {
    name: string; phone: string; email?: string; guests: number;
    visit_date: string; visit_time: string; selected_foods: string; special_request: string;
  };
  const mutation = useMutation({
    mutationFn: (data: ResInput) => submit({ data }),
  });

  function toggleItem(name: string) {
    setSelected(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name].slice(0, 20));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await mutation.mutateAsync({
        name: String(fd.get("name") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        email: String(fd.get("email") || "").trim() || undefined,
        guests: Number(fd.get("guests") || 2),
        visit_date: String(fd.get("visit_date") || ""),
        visit_time: String(fd.get("visit_time") || ""),
        selected_foods: selected.join(", "),
        special_request: String(fd.get("special_request") || "").trim(),
      });
      e.currentTarget.reset();
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit. Please try again.");
    }
  }

  if (mutation.isSuccess) {
    return (
      <div className="glass-strong rounded-3xl p-10 sm:p-14 text-center animate-scale-in">
        <div className="text-6xl mb-6">✨</div>
        <h2 className="font-display text-3xl sm:text-4xl">Reservation received</h2>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto leading-relaxed">We'll confirm by phone shortly. For urgent changes, call 01869-341634.</p>
        <button onClick={() => mutation.reset()} className="mt-8 rounded-full glass-strong px-6 py-2.5 text-sm font-medium transition-all duration-300 hover:shadow-[var(--shadow-glow-gold)]">Make another reservation</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong rounded-3xl p-6 sm:p-10 grid gap-6">
      <h2 className="font-display text-2xl">Reserve a table</h2>
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField name="name" label="Full name" placeholder="Your name" required maxLength={120} />
        <FormField name="phone" label="Phone" placeholder="+880 …" required type="tel" maxLength={40} />
      </div>
      <FormField name="email" label="Email (optional)" placeholder="you@example.com" type="email" maxLength={200} />
      <div className="grid sm:grid-cols-3 gap-5">
        <FormField name="guests" label="Guests" type="number" required defaultValue="2" min={1} max={50} />
        <FormField name="visit_date" label="Visit date" type="date" required min={today} />
        <FormField name="visit_time" label="Visit time" type="time" required defaultValue="19:00" />
      </div>

      {items.length > 0 && (
        <div>
          <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">Select foods (optional)</span>
          <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-3 rounded-xl bg-input/20 border border-border/60">
            {items.map(name => {
              const active = selected.includes(name);
              return (
                <button type="button" key={name} onClick={() => toggleItem(name)}
                  className={`rounded-full px-3 py-1.5 text-xs transition-all duration-300 ${active ? "bg-gold-gradient text-primary-foreground shadow-[var(--shadow-gold)]" : "glass-soft text-muted-foreground hover:text-foreground"}`}>{name}</button>
              );
            })}
          </div>
          {selected.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{selected.length} selected</p>}
        </div>
      )}

      <FormField name="special_request" label="Special request (optional)" placeholder="Allergies, occasion, seating preference…" textarea maxLength={1000} />

      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>}
      <button type="submit" disabled={mutation.isPending}
        className="mt-2 rounded-full bg-gold-gradient px-7 py-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[var(--shadow-glow-gold)] disabled:opacity-60 disabled:hover:scale-100 active:scale-[0.98]">
        {mutation.isPending ? "Submitting…" : "Request reservation"}
      </button>
      <p className="text-xs text-muted-foreground text-center">We'll confirm by phone. Live music nights fill up fast.</p>
    </form>
  );
}

function FormField({ name, label, placeholder, type = "text", required, textarea, defaultValue, min, max, maxLength }: {
  name: string; label: string; placeholder?: string; type?: string; required?: boolean; textarea?: boolean;
  defaultValue?: string; min?: number | string; max?: number | string; maxLength?: number;
}) {
  const base = "w-full rounded-xl bg-input/40 border border-border/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-300";
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{label}</span>
      {textarea ? (
        <textarea name={name} placeholder={placeholder} required={required} rows={3} maxLength={maxLength} className={`${base} resize-none`} />
      ) : (
        <input name={name} placeholder={placeholder} required={required} type={type} defaultValue={defaultValue} min={min} max={max} maxLength={maxLength} className={base} />
      )}
    </label>
  );
}
