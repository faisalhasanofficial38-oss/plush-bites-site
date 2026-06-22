import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type SiteSettings = {
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

export type MenuCategory = { id: string; name: string; slug: string; sort_order: number };
export type MenuItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price_text: string;
  image_url: string | null;
  is_featured: boolean;
  is_best_seller: boolean;
  sort_order: number;
};

export type GalleryMedia = {
  id: string; kind: "image" | "video"; url: string; poster_url: string | null;
  alt: string; caption: string; sort_order: number;
};
export type Review = {
  id: string; name: string; rating: number; message: string; role_label: string;
  is_featured: boolean; sort_order: number;
};
export type Faq = { id: string; question: string; answer: string; sort_order: number };
export type SocialLinks = {
  facebook: string; instagram: string; tiktok: string; youtube: string;
  x_twitter: string; whatsapp: string; email: string;
};

export type PublicSnapshot = {
  settings: SiteSettings;
  categories: MenuCategory[];
  items: MenuItem[];
  gallery: GalleryMedia[];
  reviews: Review[];
  faqs: Faq[];
  socials: SocialLinks;
};

const DEFAULTS: SiteSettings = {
  restaurant_name: "HashTag",
  hero_eyebrow: "Restaurant · Music Cafe · Lounge",
  hero_headline: "A luxury evening, set to music.",
  hero_description:
    "Fine dining, signature cocktails and live music in the heart of Chattogram.",
  phone: "+8801869341634",
  whatsapp: "8801869341634",
  foodpanda_url: "https://www.foodpanda.com.bd/",
  address:
    "Plot No. 07, CDA Masjid Complex, Mehedibag, Chattogram 4000, Bangladesh",
  opening_hours: "Open daily · 11:30 AM – 11:00 PM",
  map_embed_url:
    "https://www.google.com/maps?q=HashTag+Restaurant+Mehedibag+Chattogram&output=embed",
};

const SOCIAL_DEFAULTS: SocialLinks = {
  facebook: "", instagram: "", tiktok: "", youtube: "", x_twitter: "",
  whatsapp: "", email: "",
};

export const getPublicSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicSnapshot> => {
    try {
      const sb = publicClient();
      const [settingsRes, catRes, itemRes, galRes, revRes, faqRes, socRes] = await Promise.all([
        sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        sb
          .from("menu_categories")
          .select("id, name, slug, sort_order")
          .eq("is_visible", true)
          .order("sort_order", { ascending: true }),
        sb
          .from("menu_items")
          .select(
            "id, category_id, name, description, price_text, image_url, is_featured, is_best_seller, sort_order",
          )
          .eq("is_visible", true)
          .order("sort_order", { ascending: true }),
        sb.from("gallery_media").select("id, kind, url, poster_url, alt, caption, sort_order")
          .eq("is_visible", true).order("sort_order", { ascending: true }),
        sb.from("reviews").select("id, name, rating, message, role_label, is_featured, sort_order")
          .eq("is_visible", true).order("sort_order", { ascending: true }),
        sb.from("faqs").select("id, question, answer, sort_order")
          .eq("is_visible", true).order("sort_order", { ascending: true }),
        sb.from("social_links").select("facebook, instagram, tiktok, youtube, x_twitter, whatsapp, email")
          .eq("id", 1).maybeSingle(),
      ]);
      const s = settingsRes.data as SiteSettings | null;
      return {
        settings: { ...DEFAULTS, ...(s ?? {}) },
        categories: (catRes.data ?? []) as MenuCategory[],
        items: (itemRes.data ?? []) as MenuItem[],
        gallery: (galRes.data ?? []) as GalleryMedia[],
        reviews: (revRes.data ?? []) as Review[],
        faqs: (faqRes.data ?? []) as Faq[],
        socials: { ...SOCIAL_DEFAULTS, ...((socRes.data as SocialLinks | null) ?? {}) },
      };
    } catch (e) {
      console.error("[getPublicSnapshot] failed", e);
      return { settings: DEFAULTS, categories: [], items: [], gallery: [], reviews: [], faqs: [], socials: SOCIAL_DEFAULTS };
    }
  },
);