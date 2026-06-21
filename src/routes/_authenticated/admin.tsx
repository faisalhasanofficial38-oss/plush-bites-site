import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { listReservations, updateReservationStatus, deleteReservation, type Reservation, type ReservationStatus } from "@/lib/reservations.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Dashboard — HashTag" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Category = { id: string; name: string; slug: string; sort_order: number; is_visible: boolean };
type Item = {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price_text: string;
  image_url: string | null;
  is_featured: boolean;
  is_best_seller: boolean;
  is_visible: boolean;
  sort_order: number;
};
type Settings = {
  id: number;
  restaurant_name: string;
  hero_eyebrow: string;
  hero_headline: string;
  hero_description: string;
  phone: string;
  whatsapp: string;
  foodpanda_url: string;
  address: string;
  opening_hours: string;
  map_embed_url: string;
};

function AdminPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");
  const [tab, setTab] = useState<"menu" | "reservations" | "settings">("menu");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data, error } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      if (error) {
        console.error(error);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(Boolean(data));
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    await router.invalidate();
    navigate({ to: "/auth", replace: true });
  }

  if (isAdmin === null) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading dashboard…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-5">
        <div className="glass rounded-3xl p-10 max-w-md text-center">
          <h1 className="font-display text-3xl">Access denied</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You're signed in as <span className="text-foreground">{email}</span> but you're not the restaurant admin.
          </p>
          <button onClick={signOut} className="mt-6 rounded-full glass-soft px-5 py-2.5 text-sm hover-lift">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 sticky top-0 z-30 backdrop-blur-xl bg-background/70">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gradient-gold)] font-display font-bold text-primary-foreground">#</span>
            <div className="min-w-0">
              <div className="font-display text-lg leading-none">HashTag Dashboard</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground truncate">{email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden sm:inline rounded-full glass-soft px-4 py-2 text-xs hover-lift">View site</Link>
            <button onClick={signOut} className="rounded-full glass-soft px-4 py-2 text-xs hover-lift">Sign out</button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-5 -mt-px">
          <nav className="flex gap-1 text-sm">
            {[
              ["menu", "Menu items"],
              ["reservations", "Reservations"],
              ["settings", "Site settings"],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k as typeof tab)}
                className={`px-4 py-2 -mb-px border-b-2 transition-colors ${tab === k ? "border-[var(--gold)] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        {tab === "menu" ? <MenuManager /> : tab === "reservations" ? <ReservationsManager /> : <SettingsManager />}
      </main>
    </div>
  );
}

/* ------------------------------ Menu manager ----------------------------- */

function MenuManager() {
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Item> | null>(null);
  const [savingErr, setSavingErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [c, i] = await Promise.all([
      supabase.from("menu_categories").select("*").order("sort_order"),
      supabase.from("menu_items").select("*").order("sort_order"),
    ]);
    setCats((c.data as Category[]) ?? []);
    setItems((i.data as Item[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const map = new Map<string | "none", Item[]>();
    for (const it of items) {
      const k = it.category_id ?? "none";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(it);
    }
    return map;
  }, [items]);

  async function saveItem(it: Partial<Item>) {
    setSavingErr(null);
    const payload = {
      category_id: it.category_id || null,
      name: it.name?.trim() || "",
      description: it.description ?? "",
      price_text: it.price_text?.trim() || "",
      image_url: it.image_url?.trim() || null,
      is_featured: !!it.is_featured,
      is_best_seller: !!it.is_best_seller,
      is_visible: it.is_visible !== false,
      sort_order: Number(it.sort_order ?? 0),
    };
    if (!payload.name || !payload.price_text) {
      setSavingErr("Name and price are required.");
      return;
    }
    const res = it.id
      ? await supabase.from("menu_items").update(payload).eq("id", it.id)
      : await supabase.from("menu_items").insert(payload);
    if (res.error) { setSavingErr(res.error.message); return; }
    setEditing(null);
    await load();
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this menu item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await load();
  }

  async function addCategory() {
    const name = prompt("Category name (e.g. Desserts)")?.trim();
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const sort = (cats[cats.length - 1]?.sort_order ?? 0) + 1;
    const { error } = await supabase.from("menu_categories").insert({ name, slug, sort_order: sort });
    if (error) { alert(error.message); return; }
    await load();
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category? Items inside will be uncategorized.")) return;
    const { error } = await supabase.from("menu_categories").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await load();
  }

  if (loading) return <div className="text-muted-foreground">Loading menu…</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">Menu</h2>
          <p className="text-sm text-muted-foreground mt-1">{items.length} items across {cats.length} categories.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addCategory} className="rounded-full glass-soft px-4 py-2 text-sm hover-lift">+ Category</button>
          <button onClick={() => setEditing({})} className="rounded-full bg-[var(--gradient-gold)] px-5 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)]">+ Add item</button>
        </div>
      </div>

      {editing && (
        <ItemForm
          initial={editing}
          categories={cats}
          onCancel={() => { setEditing(null); setSavingErr(null); }}
          onSave={saveItem}
          error={savingErr}
        />
      )}

      {[...cats, null].map((cat) => {
        const key = cat?.id ?? "none";
        const list = grouped.get(key) ?? [];
        if (!cat && list.length === 0) return null;
        return (
          <section key={key} className="glass rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-display text-xl">{cat?.name ?? "Uncategorized"}</h3>
              {cat && (
                <button onClick={() => deleteCategory(cat.id)} className="text-xs text-muted-foreground hover:text-destructive">Delete category</button>
              )}
            </div>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items yet.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {list.map((it) => (
                  <li key={it.id} className="py-3 flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-input/40 border border-border/60 grid place-items-center text-muted-foreground text-[10px]">
                      {it.image_url ? (
                        <img src={it.image_url} alt="" className="h-full w-full object-cover" />
                      ) : "No image"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{it.name}</span>
                        {it.is_featured && <span className="text-[10px] uppercase tracking-wider rounded-full bg-[var(--gold)]/15 text-[var(--gold)] px-2 py-0.5">Featured</span>}
                        {it.is_best_seller && <span className="text-[10px] uppercase tracking-wider rounded-full bg-[var(--ember)]/15 text-[var(--ember)] px-2 py-0.5">Best seller</span>}
                        {!it.is_visible && <span className="text-[10px] uppercase tracking-wider rounded-full bg-muted px-2 py-0.5">Hidden</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{it.description}</p>
                    </div>
                    <div className="text-gradient-gold font-display shrink-0">{it.price_text}</div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditing(it)} className="text-xs rounded-full glass-soft px-3 py-1.5 hover-lift">Edit</button>
                      <button onClick={() => deleteItem(it.id)} className="text-xs rounded-full px-3 py-1.5 hover:text-destructive">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function ItemForm({
  initial, categories, onSave, onCancel, error,
}: {
  initial: Partial<Item>;
  categories: Category[];
  onSave: (it: Partial<Item>) => void;
  onCancel: () => void;
  error: string | null;
}) {
  const [v, setV] = useState<Partial<Item>>({
    is_visible: true, is_featured: false, is_best_seller: false, sort_order: 0,
    ...initial,
  });
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(v); }}
      className="glass rounded-3xl p-6 sm:p-8 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">{v.id ? "Edit item" : "New item"}</h3>
        <button type="button" onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" value={v.name ?? ""} onChange={(x) => setV({ ...v, name: x })} required />
        <Field label="Price text (e.g. ৳520)" value={v.price_text ?? ""} onChange={(x) => setV({ ...v, price_text: x })} required />
      </div>
      <Field label="Description" value={v.description ?? ""} onChange={(x) => setV({ ...v, description: x })} textarea />
      <Field label="Image URL (paste a hosted image link)" value={v.image_url ?? ""} onChange={(x) => setV({ ...v, image_url: x })} />
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Category</span>
          <select value={v.category_id ?? ""} onChange={(e) => setV({ ...v, category_id: e.target.value || null })}
            className="w-full rounded-xl bg-input/40 border border-border/60 px-4 py-3 text-sm">
            <option value="">Uncategorized</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <Field label="Sort order" type="number" value={String(v.sort_order ?? 0)} onChange={(x) => setV({ ...v, sort_order: Number(x) })} />
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <Check label="Featured" checked={!!v.is_featured} onChange={(x) => setV({ ...v, is_featured: x })} />
        <Check label="Best seller" checked={!!v.is_best_seller} onChange={(x) => setV({ ...v, is_best_seller: x })} />
        <Check label="Visible on site" checked={v.is_visible !== false} onChange={(x) => setV({ ...v, is_visible: x })} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="rounded-full bg-[var(--gradient-gold)] px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)]">Save</button>
        <button type="button" onClick={onCancel} className="rounded-full glass-soft px-6 py-2.5 text-sm hover-lift">Cancel</button>
      </div>
    </form>
  );
}

/* ---------------------------- Settings manager --------------------------- */

function SettingsManager() {
  const [v, setV] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      setV((data as Settings) ?? null);
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!v) return;
    setSaving(true); setMsg(null); setErr(null);
    const { id: _id, ...rest } = v;
    const { error } = await supabase.from("site_settings").update(rest).eq("id", 1);
    setSaving(false);
    if (error) setErr(error.message); else setMsg("Saved. Refresh the homepage to see updates.");
  }

  if (!v) return <div className="text-muted-foreground">Loading settings…</div>;

  return (
    <form onSubmit={save} className="space-y-8">
      <div>
        <h2 className="font-display text-3xl">Site settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Update everything customers see — hero copy, hours, and contact links.</p>
      </div>

      <section className="glass rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="font-display text-xl">Hero</h3>
        <Field label="Restaurant name" value={v.restaurant_name} onChange={(x) => setV({ ...v, restaurant_name: x })} />
        <Field label="Hero eyebrow (small label above headline)" value={v.hero_eyebrow} onChange={(x) => setV({ ...v, hero_eyebrow: x })} />
        <Field label="Hero headline" value={v.hero_headline} onChange={(x) => setV({ ...v, hero_headline: x })} />
        <Field label="Hero description" value={v.hero_description} onChange={(x) => setV({ ...v, hero_description: x })} textarea />
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="font-display text-xl">Contact & ordering</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone (with +country)" value={v.phone} onChange={(x) => setV({ ...v, phone: x })} />
          <Field label="WhatsApp number (digits only, with country code)" value={v.whatsapp} onChange={(x) => setV({ ...v, whatsapp: x })} />
        </div>
        <Field label="Foodpanda restaurant link" value={v.foodpanda_url} onChange={(x) => setV({ ...v, foodpanda_url: x })} />
        <Field label="Address" value={v.address} onChange={(x) => setV({ ...v, address: x })} textarea />
        <Field label="Opening hours (display text)" value={v.opening_hours} onChange={(x) => setV({ ...v, opening_hours: x })} />
        <Field label="Google Maps embed URL" value={v.map_embed_url} onChange={(x) => setV({ ...v, map_embed_url: x })} />
      </section>

      {msg && <p className="text-sm text-[var(--gold)]">{msg}</p>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="sticky bottom-4">
        <button disabled={saving} className="rounded-full bg-[var(--gradient-gold)] px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------- shared UI ------------------------------- */

function Field({
  label, value, onChange, type = "text", required, textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const cls = "w-full rounded-xl bg-input/40 border border-border/60 px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)]";
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} required={required} rows={3} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} required={required} type={type} className={cls} />
      )}
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--gold)]" />
      <span>{label}</span>
    </label>
  );
}

/* --------------------------- Reservations manager --------------------------- */

const STATUS_OPTIONS: { v: ReservationStatus; label: string; cls: string }[] = [
  { v: "pending", label: "Pending", cls: "bg-yellow-500/15 text-yellow-300" },
  { v: "confirmed", label: "Confirmed", cls: "bg-[var(--gold)]/15 text-[var(--gold)]" },
  { v: "completed", label: "Completed", cls: "bg-emerald-500/15 text-emerald-300" },
  { v: "cancelled", label: "Cancelled", cls: "bg-destructive/15 text-destructive" },
];

function ReservationsManager() {
  const fetchList = useServerFn(listReservations);
  const setStatus = useServerFn(updateReservationStatus);
  const removeReservation = useServerFn(deleteReservation);
  const [list, setList] = useState<Reservation[] | null>(null);
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const data = await fetchList();
      setList(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    }
  }
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => (list ?? []).filter(r => filter === "all" || r.status === filter), [list, filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: list?.length ?? 0 };
    for (const r of list ?? []) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [list]);

  async function changeStatus(id: string, status: ReservationStatus) {
    await setStatus({ data: { id, status } });
    setList(l => l?.map(r => r.id === id ? { ...r, status } : r) ?? null);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this reservation?")) return;
    await removeReservation({ data: { id } });
    setList(l => l?.filter(r => r.id !== id) ?? null);
  }

  if (list === null && !err) return <div className="text-muted-foreground">Loading reservations…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl">Reservations</h2>
        <p className="text-sm text-muted-foreground mt-1">{counts.all ?? 0} total · {counts.pending ?? 0} pending</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterPill label={`All (${counts.all ?? 0})`} active={filter === "all"} onClick={() => setFilter("all")} />
        {STATUS_OPTIONS.map(s => (
          <FilterPill key={s.v} label={`${s.label} (${counts[s.v] ?? 0})`} active={filter === s.v} onClick={() => setFilter(s.v)} />
        ))}
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      {visible.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-muted-foreground">No reservations.</div>
      ) : (
        <div className="space-y-3">
          {visible.map(r => (
            <article key={r.id} className="glass rounded-2xl p-5 grid gap-4 lg:grid-cols-[1fr_auto] items-start">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg">{r.name}</span>
                  <StatusBadge status={r.status} />
                  <span className="text-xs text-muted-foreground">· {r.guests} guest{r.guests !== 1 ? "s" : ""}</span>
                </div>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                  <span>📅 {r.visit_date} · {r.visit_time.slice(0, 5)}</span>
                  <a href={`tel:${r.phone}`} className="hover:text-foreground">📞 {r.phone}</a>
                  {r.email && <a href={`mailto:${r.email}`} className="hover:text-foreground truncate">✉ {r.email}</a>}
                </div>
                {r.selected_foods && (
                  <div className="text-xs"><span className="text-muted-foreground">Foods:</span> <span className="text-foreground/80">{r.selected_foods}</span></div>
                )}
                {r.special_request && (
                  <div className="text-xs"><span className="text-muted-foreground">Note:</span> <span className="text-foreground/80">{r.special_request}</span></div>
                )}
                <div className="text-[10px] text-muted-foreground">Submitted {new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value as ReservationStatus)}
                  className="rounded-full bg-input/40 border border-border/60 px-3 py-1.5 text-xs">
                  {STATUS_OPTIONS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
                <button onClick={() => onDelete(r.id)} className="text-xs rounded-full px-3 py-1.5 text-muted-foreground hover:text-destructive">Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`shrink-0 rounded-full px-4 py-1.5 text-xs transition-all ${active ? "bg-[var(--gradient-gold)] text-primary-foreground shadow-[var(--shadow-gold)]" : "glass-soft text-muted-foreground hover:text-foreground"}`}>{label}</button>
  );
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const o = STATUS_OPTIONS.find(s => s.v === status)!;
  return <span className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 ${o.cls}`}>{o.label}</span>;
}