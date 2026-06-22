import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { listReservations, updateReservationStatus, deleteReservation, type Reservation, type ReservationStatus } from "@/lib/reservations.functions";
import { signGalleryUrl } from "@/lib/gallery.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Dashboard — HashTag" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Tab = "menu" | "gallery" | "reviews" | "faq" | "socials" | "reservations" | "settings";

function AdminPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");
  const [tab, setTab] = useState<Tab>("menu");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      setIsAdmin(Boolean(data));
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    await router.invalidate();
    navigate({ to: "/auth", replace: true });
  }

  if (isAdmin === null) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading dashboard…</div>;
  if (!isAdmin) return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="glass rounded-3xl p-10 max-w-md text-center">
        <h1 className="font-display text-3xl">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Signed in as <span className="text-foreground">{email}</span> — not the restaurant admin.</p>
        <button onClick={signOut} className="mt-6 rounded-full glass-soft px-5 py-2.5 text-sm hover-lift">Sign out</button>
      </div>
    </div>
  );

  const TABS: [Tab, string][] = [
    ["menu", "Menu"], ["gallery", "Gallery"], ["reviews", "Reviews"], ["faq", "FAQ"],
    ["socials", "Social"], ["reservations", "Reservations"], ["settings", "Settings"],
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 sticky top-0 z-30 backdrop-blur-xl bg-background/70">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-gradient font-display font-bold text-primary-foreground">#</span>
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
        <div className="mx-auto max-w-6xl px-5 -mt-px overflow-x-auto">
          <nav className="flex gap-1 text-sm min-w-max">
            {TABS.map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`px-4 py-2 -mb-px border-b-2 transition-colors whitespace-nowrap ${tab === k ? "border-[var(--gold)] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        {tab === "menu" && <MenuManager />}
        {tab === "gallery" && <GalleryManager />}
        {tab === "reviews" && <ReviewsManager />}
        {tab === "faq" && <FaqManager />}
        {tab === "socials" && <SocialsManager />}
        {tab === "reservations" && <ReservationsManager />}
        {tab === "settings" && <SettingsManager />}
      </main>
    </div>
  );
}

/* ============================== shared inputs ============================== */
function Field({ label, value, onChange, type = "text", required, textarea, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; textarea?: boolean; rows?: number }) {
  const cls = "w-full rounded-xl bg-input/40 border border-border/60 px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)]";
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{label}</span>
      {textarea ? <textarea value={value} onChange={(e) => onChange(e.target.value)} required={required} rows={rows} className={cls} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} required={required} type={type} className={cls} />}
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
function PrimaryBtn(p: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={`rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-60 ${p.className ?? ""}`} />;
}
function GhostBtn(p: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={`rounded-full glass-soft px-4 py-2 text-sm hover-lift ${p.className ?? ""}`} />;
}

/* ================================== menu ================================== */
type Category = { id: string; name: string; slug: string; sort_order: number; is_visible: boolean };
type Item = { id: string; category_id: string | null; name: string; description: string; price_text: string; image_url: string | null; is_featured: boolean; is_best_seller: boolean; is_visible: boolean; sort_order: number };

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
    for (const it of items) { const k = it.category_id ?? "none"; if (!map.has(k)) map.set(k, []); map.get(k)!.push(it); }
    return map;
  }, [items]);

  async function saveItem(it: Partial<Item>) {
    setSavingErr(null);
    const payload = {
      category_id: it.category_id || null, name: it.name?.trim() || "",
      description: it.description ?? "", price_text: it.price_text?.trim() || "",
      image_url: it.image_url?.trim() || null, is_featured: !!it.is_featured,
      is_best_seller: !!it.is_best_seller, is_visible: it.is_visible !== false,
      sort_order: Number(it.sort_order ?? 0),
    };
    if (!payload.name || !payload.price_text) { setSavingErr("Name and price are required."); return; }
    const res = it.id ? await supabase.from("menu_items").update(payload).eq("id", it.id)
      : await supabase.from("menu_items").insert(payload);
    if (res.error) { setSavingErr(res.error.message); return; }
    setEditing(null); await load();
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this menu item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return alert(error.message);
    await load();
  }

  async function addCategory() {
    const name = prompt("Category name (e.g. Desserts)")?.trim();
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const sort = (cats[cats.length - 1]?.sort_order ?? 0) + 1;
    const { error } = await supabase.from("menu_categories").insert({ name, slug, sort_order: sort });
    if (error) return alert(error.message);
    await load();
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category? Items inside will be uncategorized.")) return;
    const { error } = await supabase.from("menu_categories").delete().eq("id", id);
    if (error) return alert(error.message);
    await load();
  }

  if (loading) return <div className="text-muted-foreground">Loading menu…</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">Menu</h2>
          <p className="text-sm text-muted-foreground mt-1">{items.length} items · {cats.length} categories</p>
        </div>
        <div className="flex gap-2">
          <GhostBtn onClick={addCategory}>+ Category</GhostBtn>
          <PrimaryBtn onClick={() => setEditing({})}>+ Add item</PrimaryBtn>
        </div>
      </div>

      {editing && <ItemForm initial={editing} categories={cats} onCancel={() => { setEditing(null); setSavingErr(null); }} onSave={saveItem} error={savingErr} />}

      {[...cats, null].map((cat) => {
        const key = cat?.id ?? "none";
        const list = grouped.get(key) ?? [];
        if (!cat && list.length === 0) return null;
        return (
          <section key={key} className="glass rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-display text-xl">{cat?.name ?? "Uncategorized"}</h3>
              {cat && <button onClick={() => deleteCategory(cat.id)} className="text-xs text-muted-foreground hover:text-destructive">Delete category</button>}
            </div>
            {list.length === 0 ? <p className="text-sm text-muted-foreground">No items yet.</p> : (
              <ul className="divide-y divide-border/60">
                {list.map((it) => (
                  <li key={it.id} className="py-3 flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-input/40 border border-border/60 grid place-items-center text-muted-foreground text-[10px]">
                      {it.image_url ? <img src={it.image_url} alt="" className="h-full w-full object-cover" /> : "No image"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{it.name}</span>
                        {it.is_featured && <span className="text-[10px] uppercase tracking-wider rounded-full bg-[var(--gold)]/15 text-[var(--gold)] px-2 py-0.5">Featured</span>}
                        {it.is_best_seller && <span className="text-[10px] uppercase tracking-wider rounded-full bg-[var(--ember)]/15 text-[var(--ember)] px-2 py-0.5">Best</span>}
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

function ItemForm({ initial, categories, onSave, onCancel, error }: { initial: Partial<Item>; categories: Category[]; onSave: (it: Partial<Item>) => void; onCancel: () => void; error: string | null }) {
  const [v, setV] = useState<Partial<Item>>({ is_visible: true, is_featured: false, is_best_seller: false, sort_order: 0, ...initial });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(v); }} className="glass rounded-3xl p-6 sm:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">{v.id ? "Edit item" : "New item"}</h3>
        <button type="button" onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" value={v.name ?? ""} onChange={(x) => setV({ ...v, name: x })} required />
        <Field label="Price text (e.g. ৳520)" value={v.price_text ?? ""} onChange={(x) => setV({ ...v, price_text: x })} required />
      </div>
      <Field label="Description" value={v.description ?? ""} onChange={(x) => setV({ ...v, description: x })} textarea />
      <Field label="Image URL" value={v.image_url ?? ""} onChange={(x) => setV({ ...v, image_url: x })} />
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
        <Check label="Visible" checked={v.is_visible !== false} onChange={(x) => setV({ ...v, is_visible: x })} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <PrimaryBtn type="submit">Save</PrimaryBtn>
        <GhostBtn type="button" onClick={onCancel}>Cancel</GhostBtn>
      </div>
    </form>
  );
}

/* ================================ gallery ================================= */
type Media = { id: string; kind: "image" | "video"; url: string; poster_url: string | null; alt: string; caption: string; sort_order: number; is_visible: boolean };

function GalleryManager() {
  const sign = useServerFn(signGalleryUrl);
  const [list, setList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("gallery_media").select("*").order("sort_order");
    setList((data as Media[]) ?? []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function uploadFiles(files: FileList | File[]) {
    setError(null); setUploading(true);
    const arr = Array.from(files);
    let i = 0;
    try {
      for (const file of arr) {
        i++; setProgress(`Uploading ${i}/${arr.length}: ${file.name}`);
        if (file.size > 50 * 1024 * 1024) throw new Error(`${file.name} exceeds 50MB.`);
        const ext = (file.name.split(".").pop() || "bin").toLowerCase();
        const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("gallery-media").upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw new Error(upErr.message);
        const { url } = await sign({ data: { path } });
        const kind: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
        const sort = (list[list.length - 1]?.sort_order ?? 0) + i;
        const { error: insErr } = await supabase.from("gallery_media").insert({
          kind, url, alt: file.name.replace(/\.[^.]+$/, ""), sort_order: sort,
        });
        if (insErr) throw new Error(insErr.message);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false); setProgress("");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function patch(id: string, change: Partial<Media>) {
    setList(l => l.map(m => m.id === id ? { ...m, ...change } : m));
    const { error } = await supabase.from("gallery_media").update(change).eq("id", id);
    if (error) { alert(error.message); load(); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this media item?")) return;
    await supabase.from("gallery_media").delete().eq("id", id);
    await load();
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = list.findIndex(m => m.id === id);
    const swap = list[idx + dir]; if (!swap) return;
    const a = list[idx];
    await Promise.all([
      supabase.from("gallery_media").update({ sort_order: swap.sort_order }).eq("id", a.id),
      supabase.from("gallery_media").update({ sort_order: a.sort_order }).eq("id", swap.id),
    ]);
    await load();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">Gallery</h2>
          <p className="text-sm text-muted-foreground mt-1">{list.length} items · photos and videos appear instantly on the site.</p>
        </div>
      </div>

      <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files); }}
        className={`glass rounded-3xl p-10 text-center border-2 border-dashed transition-colors ${dragOver ? "border-[var(--gold)] bg-[var(--gold)]/5" : "border-border/60"}`}>
        <div className="font-display text-2xl">Drop photos or videos here</div>
        <p className="text-sm text-muted-foreground mt-2">or click to choose files (JPG, PNG, WebP, MP4 · max 50MB each)</p>
        <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
        <div className="mt-5"><PrimaryBtn type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? "Uploading…" : "Choose files"}</PrimaryBtn></div>
        {progress && <p className="mt-4 text-xs text-[var(--gold)]">{progress}</p>}
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>

      {loading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">No media yet. Drop your first photo above.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m, i) => (
            <article key={m.id} className="glass rounded-2xl overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] bg-input/40">
                {m.kind === "image" ? <img src={m.url} alt={m.alt} className="h-full w-full object-cover" />
                  : <video src={m.url} poster={m.poster_url ?? undefined} controls className="h-full w-full object-cover" />}
                <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider glass-soft rounded-full px-2 py-0.5">{m.kind}</span>
                {!m.is_visible && <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wider rounded-full bg-muted/80 px-2 py-0.5">Hidden</span>}
              </div>
              <div className="p-4 space-y-3">
                <input value={m.alt} onChange={(e) => setList(l => l.map(x => x.id === m.id ? { ...x, alt: e.target.value } : x))} onBlur={(e) => patch(m.id, { alt: e.target.value })}
                  placeholder="Alt text" className="w-full rounded-lg bg-input/40 border border-border/60 px-3 py-2 text-xs" />
                <input value={m.caption} onChange={(e) => setList(l => l.map(x => x.id === m.id ? { ...x, caption: e.target.value } : x))} onBlur={(e) => patch(m.id, { caption: e.target.value })}
                  placeholder="Caption (optional)" className="w-full rounded-lg bg-input/40 border border-border/60 px-3 py-2 text-xs" />
                <div className="flex items-center justify-between gap-2 text-xs">
                  <Check label="Visible" checked={m.is_visible} onChange={(v) => patch(m.id, { is_visible: v })} />
                  <div className="flex gap-1">
                    <button onClick={() => move(m.id, -1)} disabled={i === 0} className="rounded-full glass-soft px-2 py-1 disabled:opacity-40">↑</button>
                    <button onClick={() => move(m.id, 1)} disabled={i === list.length - 1} className="rounded-full glass-soft px-2 py-1 disabled:opacity-40">↓</button>
                    <button onClick={() => remove(m.id)} className="rounded-full px-2 py-1 hover:text-destructive">✕</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================= reviews ================================ */
type ReviewRow = { id: string; name: string; rating: number; message: string; role_label: string; is_featured: boolean; is_visible: boolean; sort_order: number };

function ReviewsManager() {
  const [list, setList] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ReviewRow> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("reviews").select("*").order("sort_order");
    setList((data as ReviewRow[]) ?? []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(r: Partial<ReviewRow>) {
    setErr(null);
    const payload = {
      name: r.name?.trim() ?? "", rating: Math.max(1, Math.min(5, Number(r.rating ?? 5))),
      message: r.message?.trim() ?? "", role_label: r.role_label ?? "",
      is_featured: !!r.is_featured, is_visible: r.is_visible !== false,
      sort_order: Number(r.sort_order ?? (list.at(-1)?.sort_order ?? 0) + 1),
    };
    if (!payload.name || !payload.message) { setErr("Name and message are required."); return; }
    const res = r.id ? await supabase.from("reviews").update(payload).eq("id", r.id)
      : await supabase.from("reviews").insert(payload);
    if (res.error) { setErr(res.error.message); return; }
    setEditing(null); await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete review?")) return;
    await supabase.from("reviews").delete().eq("id", id); await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="font-display text-3xl">Reviews</h2><p className="text-sm text-muted-foreground mt-1">{list.length} reviews</p></div>
        <PrimaryBtn onClick={() => setEditing({ rating: 5, is_visible: true })}>+ Add review</PrimaryBtn>
      </div>

      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="glass rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="font-display text-xl">{editing.id ? "Edit review" : "New review"}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Customer name" value={editing.name ?? ""} onChange={(x) => setEditing({ ...editing, name: x })} required />
            <Field label="Role / source (e.g. Local Guide · 67 reviews)" value={editing.role_label ?? ""} onChange={(x) => setEditing({ ...editing, role_label: x })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Rating (1–5)" type="number" value={String(editing.rating ?? 5)} onChange={(x) => setEditing({ ...editing, rating: Number(x) })} />
            <Field label="Sort order" type="number" value={String(editing.sort_order ?? 0)} onChange={(x) => setEditing({ ...editing, sort_order: Number(x) })} />
          </div>
          <Field label="Review message" value={editing.message ?? ""} onChange={(x) => setEditing({ ...editing, message: x })} textarea rows={4} required />
          <div className="flex gap-4 text-sm">
            <Check label="Featured" checked={!!editing.is_featured} onChange={(v) => setEditing({ ...editing, is_featured: v })} />
            <Check label="Visible" checked={editing.is_visible !== false} onChange={(v) => setEditing({ ...editing, is_visible: v })} />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <div className="flex gap-3"><PrimaryBtn type="submit">Save</PrimaryBtn><GhostBtn type="button" onClick={() => setEditing(null)}>Cancel</GhostBtn></div>
        </form>
      )}

      {loading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map(r => (
            <article key={r.id} className="glass rounded-2xl p-5 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{r.name} <span className="text-[var(--gold)] text-sm">{"★".repeat(r.rating)}</span></div>
                  <div className="text-[11px] text-muted-foreground">{r.role_label}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {r.is_featured && <span className="text-[10px] uppercase tracking-wider rounded-full bg-[var(--gold)]/15 text-[var(--gold)] px-2 py-0.5 self-center">Featured</span>}
                  <button onClick={() => setEditing(r)} className="text-xs rounded-full glass-soft px-3 py-1 hover-lift">Edit</button>
                  <button onClick={() => remove(r.id)} className="text-xs px-2 py-1 hover:text-destructive">✕</button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* =================================== faq ================================== */
type FaqRow = { id: string; question: string; answer: string; sort_order: number; is_visible: boolean };

function FaqManager() {
  const [list, setList] = useState<FaqRow[]>([]);
  const [editing, setEditing] = useState<Partial<FaqRow> | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("faqs").select("*").order("sort_order");
    setList((data as FaqRow[]) ?? []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(f: Partial<FaqRow>) {
    const payload = {
      question: f.question?.trim() ?? "", answer: f.answer?.trim() ?? "",
      sort_order: Number(f.sort_order ?? (list.at(-1)?.sort_order ?? 0) + 1),
      is_visible: f.is_visible !== false,
    };
    if (!payload.question || !payload.answer) return alert("Question and answer required.");
    const res = f.id ? await supabase.from("faqs").update(payload).eq("id", f.id)
      : await supabase.from("faqs").insert(payload);
    if (res.error) return alert(res.error.message);
    setEditing(null); await load();
  }

  async function remove(id: string) { if (!confirm("Delete?")) return; await supabase.from("faqs").delete().eq("id", id); await load(); }
  async function move(id: string, dir: -1 | 1) {
    const i = list.findIndex(x => x.id === id); const s = list[i + dir]; if (!s) return;
    const a = list[i];
    await Promise.all([
      supabase.from("faqs").update({ sort_order: s.sort_order }).eq("id", a.id),
      supabase.from("faqs").update({ sort_order: a.sort_order }).eq("id", s.id),
    ]);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="font-display text-3xl">FAQ</h2><p className="text-sm text-muted-foreground mt-1">{list.length} questions</p></div>
        <PrimaryBtn onClick={() => setEditing({ is_visible: true })}>+ Add question</PrimaryBtn>
      </div>

      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="glass rounded-3xl p-6 sm:p-8 space-y-4">
          <Field label="Question" value={editing.question ?? ""} onChange={(x) => setEditing({ ...editing, question: x })} required />
          <Field label="Answer" value={editing.answer ?? ""} onChange={(x) => setEditing({ ...editing, answer: x })} textarea rows={4} required />
          <Check label="Visible" checked={editing.is_visible !== false} onChange={(v) => setEditing({ ...editing, is_visible: v })} />
          <div className="flex gap-3"><PrimaryBtn type="submit">Save</PrimaryBtn><GhostBtn type="button" onClick={() => setEditing(null)}>Cancel</GhostBtn></div>
        </form>
      )}

      {loading ? <p className="text-muted-foreground">Loading…</p> : (
        <ul className="space-y-3">
          {list.map((f, i) => (
            <li key={f.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-display text-lg">{f.question}</div>
                  <p className="text-sm text-muted-foreground mt-1">{f.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => move(f.id, -1)} disabled={i === 0} className="rounded-full glass-soft px-2 py-1 text-xs disabled:opacity-40">↑</button>
                  <button onClick={() => move(f.id, 1)} disabled={i === list.length - 1} className="rounded-full glass-soft px-2 py-1 text-xs disabled:opacity-40">↓</button>
                  <button onClick={() => setEditing(f)} className="rounded-full glass-soft px-3 py-1 text-xs hover-lift">Edit</button>
                  <button onClick={() => remove(f.id)} className="text-xs px-2 py-1 hover:text-destructive">✕</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ================================= socials ================================ */
type Socials = { facebook: string; instagram: string; tiktok: string; youtube: string; x_twitter: string; whatsapp: string; email: string };

function SocialsManager() {
  const [v, setV] = useState<Socials | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("social_links").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      setV(data as Socials | null);
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!v) return; setSaving(true); setMsg(null);
    const { error } = await supabase.from("social_links").update(v).eq("id", 1);
    setSaving(false); setMsg(error ? error.message : "Saved.");
  }

  if (!v) return <div className="text-muted-foreground">Loading…</div>;
  return (
    <form onSubmit={save} className="space-y-6">
      <div><h2 className="font-display text-3xl">Social links</h2><p className="text-sm text-muted-foreground mt-1">Used in the site footer and contact section.</p></div>
      <section className="glass rounded-3xl p-6 sm:p-8 grid sm:grid-cols-2 gap-4">
        <Field label="Facebook URL" value={v.facebook} onChange={(x) => setV({ ...v, facebook: x })} />
        <Field label="Instagram URL" value={v.instagram} onChange={(x) => setV({ ...v, instagram: x })} />
        <Field label="TikTok URL" value={v.tiktok} onChange={(x) => setV({ ...v, tiktok: x })} />
        <Field label="YouTube URL" value={v.youtube} onChange={(x) => setV({ ...v, youtube: x })} />
        <Field label="X (Twitter) URL" value={v.x_twitter} onChange={(x) => setV({ ...v, x_twitter: x })} />
        <Field label="WhatsApp digits (with country code)" value={v.whatsapp} onChange={(x) => setV({ ...v, whatsapp: x })} />
        <Field label="Contact email" value={v.email} onChange={(x) => setV({ ...v, email: x })} />
      </section>
      <div className="flex items-center gap-4">
        <PrimaryBtn disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryBtn>
        {msg && <span className="text-sm text-[var(--gold)]">{msg}</span>}
      </div>
    </form>
  );
}

/* ================================ settings ================================ */
type Settings = { id: number; restaurant_name: string; hero_eyebrow: string; hero_headline: string; hero_description: string; phone: string; whatsapp: string; foodpanda_url: string; address: string; opening_hours: string; map_embed_url: string };

function SettingsManager() {
  const [v, setV] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => setV((data as Settings) ?? null));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!v) return; setSaving(true); setMsg(null); setErr(null);
    const { id: _id, ...rest } = v;
    const { error } = await supabase.from("site_settings").update(rest).eq("id", 1);
    setSaving(false);
    if (error) setErr(error.message); else setMsg("Saved. The site will update on next refresh.");
  }

  if (!v) return <div className="text-muted-foreground">Loading settings…</div>;
  return (
    <form onSubmit={save} className="space-y-8">
      <div><h2 className="font-display text-3xl">Site settings</h2><p className="text-sm text-muted-foreground mt-1">Update hero copy, contact info, and the map embed.</p></div>
      <section className="glass rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="font-display text-xl">Hero</h3>
        <Field label="Restaurant name" value={v.restaurant_name} onChange={(x) => setV({ ...v, restaurant_name: x })} />
        <Field label="Hero eyebrow" value={v.hero_eyebrow} onChange={(x) => setV({ ...v, hero_eyebrow: x })} />
        <Field label="Hero headline" value={v.hero_headline} onChange={(x) => setV({ ...v, hero_headline: x })} />
        <Field label="Hero description" value={v.hero_description} onChange={(x) => setV({ ...v, hero_description: x })} textarea />
      </section>
      <section className="glass rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="font-display text-xl">Contact & ordering</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone" value={v.phone} onChange={(x) => setV({ ...v, phone: x })} />
          <Field label="WhatsApp (digits, with country code)" value={v.whatsapp} onChange={(x) => setV({ ...v, whatsapp: x })} />
        </div>
        <Field label="foodpanda link" value={v.foodpanda_url} onChange={(x) => setV({ ...v, foodpanda_url: x })} />
        <Field label="Address" value={v.address} onChange={(x) => setV({ ...v, address: x })} textarea />
        <Field label="Opening hours" value={v.opening_hours} onChange={(x) => setV({ ...v, opening_hours: x })} />
        <Field label="Google Maps embed URL" value={v.map_embed_url} onChange={(x) => setV({ ...v, map_embed_url: x })} />
      </section>
      {msg && <p className="text-sm text-[var(--gold)]">{msg}</p>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div><PrimaryBtn disabled={saving}>{saving ? "Saving…" : "Save changes"}</PrimaryBtn></div>
    </form>
  );
}

/* ============================== reservations ============================== */
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
    try { setList(await fetchList()); }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed to load"); }
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
      <div><h2 className="font-display text-3xl">Reservations</h2><p className="text-sm text-muted-foreground mt-1">{counts.all ?? 0} total · {counts.pending ?? 0} pending</p></div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Pill label={`All (${counts.all ?? 0})`} active={filter === "all"} onClick={() => setFilter("all")} />
        {STATUS_OPTIONS.map(s => <Pill key={s.v} label={`${s.label} (${counts[s.v] ?? 0})`} active={filter === s.v} onClick={() => setFilter(s.v)} />)}
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      {visible.length === 0 ? <div className="glass rounded-3xl p-12 text-center text-muted-foreground">No reservations.</div> : (
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
                {r.selected_foods && <div className="text-xs"><span className="text-muted-foreground">Foods:</span> <span className="text-foreground/80">{r.selected_foods}</span></div>}
                {r.special_request && <div className="text-xs"><span className="text-muted-foreground">Note:</span> <span className="text-foreground/80">{r.special_request}</span></div>}
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

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`shrink-0 rounded-full px-4 py-1.5 text-xs transition-all ${active ? "bg-gold-gradient text-primary-foreground shadow-[var(--shadow-gold)]" : "glass-soft text-muted-foreground hover:text-foreground"}`}>{label}</button>;
}
function StatusBadge({ status }: { status: ReservationStatus }) {
  const o = STATUS_OPTIONS.find(s => s.v === status)!;
  return <span className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 ${o.cls}`}>{o.label}</span>;
}