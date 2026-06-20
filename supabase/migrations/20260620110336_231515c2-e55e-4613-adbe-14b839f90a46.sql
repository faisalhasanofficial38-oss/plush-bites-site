
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Menu categories
CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_categories TO authenticated;
GRANT ALL ON public.menu_categories TO service_role;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.menu_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write categories" ON public.menu_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_menu_categories_touch BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Menu items
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_text text NOT NULL,
  image_url text,
  is_featured boolean NOT NULL DEFAULT false,
  is_best_seller boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read items" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write items" ON public.menu_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_menu_items_touch BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Site settings (singleton)
CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1,
  restaurant_name text NOT NULL DEFAULT 'HashTag',
  hero_eyebrow text NOT NULL DEFAULT 'Restaurant · Music Cafe · Lounge',
  hero_headline text NOT NULL DEFAULT 'A luxury evening, set to music.',
  hero_description text NOT NULL DEFAULT 'Fine dining, signature cocktails and live music in the heart of Chattogram.',
  phone text NOT NULL DEFAULT '+8801869341634',
  whatsapp text NOT NULL DEFAULT '8801869341634',
  foodpanda_url text NOT NULL DEFAULT 'https://www.foodpanda.com.bd/',
  address text NOT NULL DEFAULT 'Plot No. 07, CDA Masjid Complex, Mehedibag, Chattogram 4000, Bangladesh',
  opening_hours text NOT NULL DEFAULT 'Open daily · 11:30 AM – 11:00 PM',
  map_embed_url text NOT NULL DEFAULT 'https://www.google.com/maps?q=HashTag+Restaurant+Mehedibag+Chattogram&output=embed',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert settings" ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_site_settings_touch BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.site_settings (id) VALUES (1);

-- Seed categories
INSERT INTO public.menu_categories (name, slug, sort_order) VALUES
  ('Signature', 'signature', 1),
  ('Mains', 'mains', 2),
  ('Pizza & Pasta', 'pizza-pasta', 3),
  ('Starters', 'starters', 4),
  ('Drinks', 'drinks', 5);

-- Seed items
WITH c AS (SELECT id, slug FROM public.menu_categories)
INSERT INTO public.menu_items (category_id, name, description, price_text, is_featured, is_best_seller, sort_order)
SELECT (SELECT id FROM c WHERE slug='mains'), 'Peri Peri Chicken', 'Flame-grilled chicken brushed with house peri peri, served with garlic rice.', '৳520', true, true, 1
UNION ALL SELECT (SELECT id FROM c WHERE slug='pizza-pasta'), 'Four Seasons Pizza', 'Wood-fired pizza, four hand-built quarters celebrating each season.', '৳690', true, false, 2
UNION ALL SELECT (SELECT id FROM c WHERE slug='starters'), 'Turkish Nachos', 'Crisp lavash, slow-cooked beef, garlic yogurt and pomegranate.', '৳380', false, true, 3
UNION ALL SELECT (SELECT id FROM c WHERE slug='starters'), 'Chicken Cashew Nut Salad', 'Smoked chicken, toasted cashews, citrus and chili-lime dressing.', '৳420', false, false, 4
UNION ALL SELECT (SELECT id FROM c WHERE slug='signature'), 'Chef Special Steak', 'Aged tenderloin, smoked butter, charred greens and red wine jus.', '৳750', true, false, 5
UNION ALL SELECT (SELECT id FROM c WHERE slug='drinks'), 'Smoked Old Fashioned', 'Bourbon, demerara, aromatic bitters — finished with applewood smoke.', '৳650', true, false, 6;
