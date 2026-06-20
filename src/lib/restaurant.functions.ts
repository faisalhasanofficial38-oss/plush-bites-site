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

export type PublicSnapshot = {
  settings: SiteSettings;
  categories: MenuCategory[];
  items: MenuItem[];
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

export const getPublicSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicSnapshot> => {
    try {
      const sb = publicClient();
      const [settingsRes, catRes, itemRes] = await Promise.all([
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
      ]);
      const s = settingsRes.data as SiteSettings | null;
      return {
        settings: { ...DEFAULTS, ...(s ?? {}) },
        categories: (catRes.data ?? []) as MenuCategory[],
        items: (itemRes.data ?? []) as MenuItem[],
      };
    } catch (e) {
      console.error("[getPublicSnapshot] failed", e);
      return { settings: DEFAULTS, categories: [], items: [] };
    }
  },
);