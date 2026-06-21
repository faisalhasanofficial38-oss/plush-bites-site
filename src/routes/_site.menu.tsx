import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { snapshotQuery } from "./_site";
import { PageHero } from "@/components/site-ui";
import menuPeri from "@/assets/menu-peri.jpg";
import menuPizza from "@/assets/menu-pizza.jpg";
import menuNachos from "@/assets/menu-nachos.jpg";
import menuCashew from "@/assets/menu-cashew.jpg";
import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";

const FALLBACK = [menuPeri, menuPizza, menuNachos, menuCashew, dish1, dish2, dish3];

export const Route = createFileRoute("/_site/menu")({
  head: () => ({
    meta: [
      { title: "Menu — HashTag Restaurant, Chattogram" },
      { name: "description", content: "Browse the full HashTag menu — continental plates, signature cocktails and chef's specials. Filter by category, search by dish." },
      { property: "og:title", content: "Menu — HashTag" },
      { property: "og:description", content: "The full HashTag menu — bestsellers, featured plates and chef's specials." },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { data: { settings, categories, items } } = useSuspenseQuery(snapshotQuery);
  const [activeCat, setActiveCat] = useState<string | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(it => {
      if (activeCat !== "all" && it.category_id !== activeCat) return false;
      if (!q) return true;
      return it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q);
    });
  }, [items, activeCat, query]);

  return (
    <>
      <PageHero eyebrow="Our Menu" title={<>From the kitchen, <span className="text-gradient-gold italic">bar & stage.</span></>}
        sub="A living menu — chef's specials rotate weekly. Tap any plate for details, or order direct on foodpanda." />

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="glass rounded-3xl p-5 sm:p-6 grid gap-4 sm:grid-cols-[1fr_auto] items-center sticky top-24 z-30">
          <div className="relative">
            <svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search dishes…"
              className="w-full rounded-full bg-input/40 border border-border/60 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)]" />
          </div>
          <a href={settings.foodpanda_url} target="_blank" rel="noreferrer"
            className="rounded-full bg-[var(--gradient-gold)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] text-center">Order on foodpanda</a>
        </div>

        {categories.length > 0 && (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
            <CatChip label="All" active={activeCat === "all"} onClick={() => setActiveCat("all")} />
            {categories.map(c => (
              <CatChip key={c.id} label={c.name} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-5 sm:px-8 pb-20">
        {filtered.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-muted-foreground">No dishes match your search.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((it, i) => (
              <article key={it.id} className="glass hover-lift group rounded-3xl overflow-hidden flex flex-col [perspective:1200px]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={it.image_url || FALLBACK[i % FALLBACK.length]} alt={it.name} loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110 group-hover:[transform:rotateX(2deg)_rotateY(-2deg)]" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {it.is_best_seller && <span className="text-[10px] uppercase tracking-[0.25em] rounded-full bg-[var(--ember)]/30 backdrop-blur px-3 py-1 text-[var(--gold)]">Best seller</span>}
                    {it.is_featured && !it.is_best_seller && <span className="text-[10px] uppercase tracking-[0.25em] glass-soft rounded-full px-3 py-1">Featured</span>}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl leading-tight">{it.name}</h3>
                    <span className="text-gradient-gold font-display text-lg shrink-0">{it.price_text}</span>
                  </div>
                  {it.description && <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{it.description}</p>}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Link to="/order" className="inline-flex rounded-full glass px-7 py-3.5 text-sm font-medium hover-lift">Reserve a table to dine in →</Link>
        </div>
      </section>
    </>
  );
}

function CatChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`shrink-0 rounded-full px-5 py-2 text-sm transition-all ${active ? "bg-[var(--gradient-gold)] text-primary-foreground shadow-[var(--shadow-gold)]" : "glass-soft text-muted-foreground hover:text-foreground"}`}>{label}</button>
  );
}