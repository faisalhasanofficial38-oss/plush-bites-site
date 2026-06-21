import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import type { SiteSettings } from "@/lib/restaurant.functions";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/menu", label: "Menu" },
  { to: "/gallery", label: "Gallery" },
  { to: "/reviews", label: "Reviews" },
  { to: "/faq", label: "FAQ" },
  { to: "/order", label: "Order" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav({ settings }: { settings: SiteSettings }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className={`grid grid-cols-[minmax(0,1fr)_auto] lg:flex lg:items-center lg:justify-between gap-4 rounded-2xl px-5 py-3 transition-all ${scrolled ? "glass" : ""}`}>
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--gradient-gold)] font-display text-lg font-bold text-primary-foreground shadow-[var(--shadow-gold)]">#</span>
            <span className="font-display text-xl font-semibold tracking-tight truncate">{settings.restaurant_name}</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{ className: "hover:text-foreground" }}
                className="relative transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[var(--gold)] hover:after:w-full after:transition-all [&[data-status=active]]:after:w-full">
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/order" className="rounded-full bg-[var(--gradient-gold)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.03]">Order now</Link>
          </div>
          <button onClick={() => setOpen(o => !o)} aria-label="Menu" className="lg:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass-soft">
            <span className="space-y-1.5">
              <span className={`block h-px w-5 bg-foreground transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`}></span>
              <span className={`block h-px w-5 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`}></span>
              <span className={`block h-px w-5 bg-foreground transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`}></span>
            </span>
          </button>
        </div>
        {open && (
          <div className="lg:hidden mt-2 glass rounded-2xl p-4 animate-fade-up">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
                  activeProps={{ className: "text-foreground bg-white/5" }}
                  inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                  className="rounded-lg px-3 py-2 text-sm transition-colors">{label}</Link>
              ))}
              <Link to="/order" className="mt-2 rounded-full bg-[var(--gradient-gold)] px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground">Order now</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const socials: { label: string; href: string; icon: ReactNode }[] = [
    { label: "Facebook", href: "https://www.facebook.com/hashtagmusiccafe/", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/></svg> },
    { label: "Instagram", href: "https://www.instagram.com/hashtagmusiccafe", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg> },
    { label: "YouTube", href: "https://youtube.com/@hashtagmusiccafe", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z"/></svg> },
    { label: "TikTok", href: "https://tiktok.com/@hashtag.music.cafe", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M19.6 6.6a5.4 5.4 0 0 1-3.3-1.2 5.4 5.4 0 0 1-2-3.3h-3.5v13.6a2.5 2.5 0 1 1-2.5-2.5c.3 0 .6 0 .8.1V9.7a6 6 0 1 0 5.3 6V9a8.5 8.5 0 0 0 5.2 1.8V6.6Z"/></svg> },
    { label: "X", href: "https://x.com/HashTagMCafe", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.244 2H21.5l-7.5 8.57L23 22h-7.06l-5.52-7.21L4.1 22H.84l8.05-9.2L1 2h7.22l4.99 6.6L18.244 2Zm-1.24 18h1.84L7.06 4H5.1l11.9 16Z"/></svg> },
    { label: "WhatsApp", href: `https://api.whatsapp.com/send?phone=${settings.whatsapp}`, icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.5 3.5A11.94 11.94 0 0 0 12 0C5.4 0 0 5.4 0 12c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64A11.93 11.93 0 0 0 12 24c6.6 0 12-5.4 12-12 0-3.2-1.24-6.2-3.5-8.5Z"/></svg> },
  ];
  return (
    <footer className="relative border-t border-border/60 mt-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2 max-w-md">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--gradient-gold)] font-display text-lg font-bold text-primary-foreground">#</span>
            <span className="font-display text-2xl font-semibold">{settings.restaurant_name}</span>
          </Link>
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">Restaurant, music cafe & lounge in the heart of Chattogram. Continental plates, signature cocktails and live acoustic nights — under one roof.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {socials.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full glass-soft text-muted-foreground hover:text-[var(--gold)] hover-lift transition-colors">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        <div className="text-sm space-y-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/80">Visit</div>
          <p className="text-muted-foreground">{settings.address}</p>
          <p className="text-muted-foreground">{settings.opening_hours}</p>
          <a href="https://maps.app.goo.gl/xKQkJ8mMpbg97x4C9" target="_blank" rel="noreferrer" className="inline-block text-[var(--gold)] hover:underline">Get directions →</a>
        </div>
        <div className="text-sm space-y-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/80">Contact</div>
          <a href={`tel:${settings.phone}`} className="block text-muted-foreground hover:text-foreground">01869-341634</a>
          <a href="mailto:hashtagcafe.ctg@gmail.com" className="block text-muted-foreground hover:text-foreground break-all">hashtagcafe.ctg@gmail.com</a>
          <a href={`https://api.whatsapp.com/send?phone=${settings.whatsapp}`} target="_blank" rel="noreferrer" className="block text-muted-foreground hover:text-foreground">WhatsApp inquiries</a>
          <a href={settings.foodpanda_url} target="_blank" rel="noreferrer" className="block text-[var(--gold)] hover:underline">Order on foodpanda →</a>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} {settings.restaurant_name} Restaurant, Music Cafe & Lounge.</span>
          <span><Link to="/auth" className="hover:text-foreground">Admin</Link> · Mehedibag · Chattogram · Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFab({ settings }: { settings: SiteSettings }) {
  return (
    <a
      href={`https://api.whatsapp.com/send?phone=${settings.whatsapp}&text=${encodeURIComponent("Hi HashTag, I have a question.")}`}
      target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full pl-2 pr-5 py-2 glass shadow-[var(--shadow-gold)] hover-lift">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#25D366] text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20.52 3.48A11.94 11.94 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.93 11.93 0 0 0 5.77 1.47h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.47-8.41ZM12.05 21.3h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.97 1-3.62-.24-.37a9.93 9.93 0 1 1 18.42-5.25c0 5.48-4.46 9.86-10.04 9.86Z"/></svg>
      </span>
      <span className="hidden sm:block text-sm font-medium pr-1">WhatsApp inquiries</span>
    </a>
  );
}

export function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
      <div className="text-[10px] uppercase tracking-[0.4em] text-gradient-gold">{eyebrow}</div>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05]">{title}</h1>
      {sub && <p className="mt-5 text-muted-foreground leading-relaxed">{sub}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: string }) {
  return (
    <section className="relative pt-40 pb-16 sm:pt-48 sm:pb-20">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-radial-spot)" }} />
      <SectionHeader eyebrow={eyebrow} title={title} sub={sub} />
    </section>
  );
}