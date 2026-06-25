import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import type { SiteSettings, SocialLinks } from "@/lib/restaurant.functions";

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
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${scrolled ? "py-2" : "py-4 sm:py-5"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className={`relative flex items-center justify-between gap-4 rounded-2xl px-4 sm:px-6 py-2.5 transition-all duration-700 ${scrolled ? "glass-strong" : "bg-transparent"}`}>
          <Link to="/" className="flex min-w-0 items-center gap-2.5 group">
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-gradient font-display text-lg font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform duration-500 group-hover:scale-105">
              <span className="relative z-10">#</span>
              <span className="absolute inset-0 rounded-xl bg-[var(--gold)] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-40"></span>
            </span>
            <span className="font-display text-xl font-semibold tracking-tight truncate">{settings.restaurant_name}</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "text-foreground bg-white/[0.06]" }}
                inactiveProps={{ className: "hover:text-foreground hover:bg-white/[0.04]" }}
                className="relative rounded-lg px-3.5 py-2 transition-all duration-300">
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/order" className="rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[var(--shadow-glow-gold)] active:scale-[0.98]">Order now</Link>
          </div>
          <button onClick={() => setOpen(o => !o)} aria-label="Menu" className="lg:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass-soft">
            <span className="space-y-1.5">
              <span className={`block h-px w-5 bg-foreground transition-all duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`}></span>
              <span className={`block h-px w-5 bg-foreground transition-all duration-300 ${open ? "opacity-0 scale-0" : ""}`}></span>
              <span className={`block h-px w-5 bg-foreground transition-all duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}></span>
            </span>
          </button>
        </div>
        {open && (
          <div className="lg:hidden mt-2 glass-strong rounded-2xl p-3 animate-scale-in">
            <nav className="flex flex-col gap-0.5">
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
                  activeProps={{ className: "text-foreground bg-white/[0.06]" }}
                  inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]" }}
                  className="rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200">{label}</Link>
              ))}
              <Link to="/order" className="mt-2 rounded-full bg-gold-gradient px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground">Order now</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export function SiteFooter({ settings, socials }: { settings: SiteSettings; socials: SocialLinks }) {
  const items: { label: string; href: string; icon: ReactNode }[] = [
    socials.facebook && { label: "Facebook", href: socials.facebook, icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/></svg> },
    socials.instagram && { label: "Instagram", href: socials.instagram, icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg> },
    socials.youtube && { label: "YouTube", href: socials.youtube, icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z"/></svg> },
    socials.tiktok && { label: "TikTok", href: socials.tiktok, icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M19.6 6.6a5.4 5.4 0 0 1-3.3-1.2 5.4 5.4 0 0 1-2-3.3h-3.5v13.6a2.5 2.5 0 1 1-2.5-2.5c.3 0 .6 0 .8.1V9.7a6 6 0 1 0 5.3 6V9a8.5 8.5 0 0 0 5.2 1.8V6.6Z"/></svg> },
    socials.x_twitter && { label: "X", href: socials.x_twitter, icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.244 2H21.5l-7.5 8.57L23 22h-7.06l-5.52-7.21L4.1 22H.84l8.05-9.2L1 2h7.22l4.99 6.6L18.244 2Zm-1.24 18h1.84L7.06 4H5.1l11.9 16Z"/></svg> },
    (socials.whatsapp || settings.whatsapp) && { label: "WhatsApp", href: `https://api.whatsapp.com/send?phone=${socials.whatsapp || settings.whatsapp}`, icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.5 3.5A11.94 11.94 0 0 0 12 0C5.4 0 0 5.4 0 12c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64A11.93 11.93 0 0 0 12 24c6.6 0 12-5.4 12-12 0-3.2-1.24-6.2-3.5-8.5Z"/></svg> },
    socials.email && { label: "Email", href: `mailto:${socials.email}`, icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg> },
  ].filter(Boolean) as { label: string; href: string; icon: ReactNode }[];

  return (
    <footer className="relative border-t border-border/60 mt-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-noise opacity-30"></div>
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2 max-w-md">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-gradient font-display text-lg font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform duration-500 group-hover:scale-105">#</span>
            <span className="font-display text-2xl font-semibold">{settings.restaurant_name}</span>
          </Link>
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-sm">Restaurant, music cafe & lounge in the heart of Chattogram. Continental plates, signature cocktails and live acoustic nights — under one roof.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {items.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full glass-soft text-muted-foreground hover:text-[var(--gold)] transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-glow-gold)]">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        <div className="text-sm space-y-4">
          <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/80 line-after">Visit</div>
          <p className="text-muted-foreground leading-relaxed">{settings.address}</p>
          <p className="text-muted-foreground">{settings.opening_hours}</p>
          <a href="https://maps.app.goo.gl/xKQkJ8mMpbg97x4C9" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--gold)] hover:text-gradient-gold transition-all duration-300 text-sm">Get directions <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span></a>
        </div>
        <div className="text-sm space-y-4">
          <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/80 line-after">Contact</div>
          <a href={`tel:${settings.phone}`} className="block text-muted-foreground hover:text-foreground transition-colors duration-300">{settings.phone}</a>
          {socials.email && <a href={`mailto:${socials.email}`} className="block text-muted-foreground hover:text-foreground transition-colors duration-300 break-all">{socials.email}</a>}
          <a href={`https://api.whatsapp.com/send?phone=${socials.whatsapp || settings.whatsapp}`} target="_blank" rel="noreferrer" className="block text-muted-foreground hover:text-foreground transition-colors duration-300">WhatsApp inquiries</a>
          <a href={settings.foodpanda_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--gold)] hover:text-gradient-gold transition-all duration-300">Order on foodpanda <span className="inline-block transition-transform duration-300">→</span></a>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} {settings.restaurant_name} Restaurant, Music Cafe & Lounge.</span>
          <span><Link to="/auth" className="hover:text-foreground transition-colors duration-300">Admin</Link> <span className="text-border mx-1.5">·</span> Mehedibag <span className="text-border mx-1.5">·</span> Chattogram <span className="text-border mx-1.5">·</span> Bangladesh</span>
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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full pl-2 pr-5 py-2 glass shadow-[var(--shadow-gold)] transition-all duration-500 hover:scale-105 hover:shadow-[var(--shadow-glow-gold)] animate-fade-in">
      <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#25D366] text-white">
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
        <svg viewBox="0 0 24 24" className="h-5 w-5 relative" fill="currentColor"><path d="M20.52 3.48A11.94 11.94 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.93 11.93 0 0 0 5.77 1.47h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.47-8.41ZM12.05 21.3h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.97 1-3.62-.24-.37a9.93 9.93 0 1 1 18.42-5.25c0 5.48-4.46 9.86-10.04 9.86Z"/></svg>
      </span>
      <span className="hidden sm:block text-sm font-medium pr-1">WhatsApp inquiries</span>
    </a>
  );
}

export function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
      <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gradient-gold">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--gold)]"></span>
        <span>{eyebrow}</span>
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--gold)]"></span>
      </div>
      <h1 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">{title}</h1>
      {sub && <p className="mt-5 text-muted-foreground leading-relaxed max-w-2xl mx-auto text-sm sm:text-base">{sub}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: string }) {
  return (
    <section className="relative pt-36 pb-16 sm:pt-44 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-radial-spot)" }} />
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-radial-warm)" }} />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[var(--gold)] opacity-[0.03] blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[var(--ember)] opacity-[0.03] blur-[100px] -z-10"></div>
      <SectionHeader eyebrow={eyebrow} title={title} sub={sub} />
    </section>
  );
}
