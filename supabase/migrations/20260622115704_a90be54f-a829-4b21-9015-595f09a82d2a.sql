
-- Gallery media (photos + videos)
CREATE TABLE public.gallery_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('image','video')),
  url text NOT NULL,
  poster_url text,
  alt text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_media TO anon, authenticated;
GRANT ALL ON public.gallery_media TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.gallery_media TO authenticated;
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery_media FOR SELECT USING (is_visible = true);
CREATE POLICY "gallery admin read" ON public.gallery_media FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "gallery admin write" ON public.gallery_media FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER gallery_media_touch BEFORE UPDATE ON public.gallery_media FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message text NOT NULL,
  role_label text NOT NULL DEFAULT '',
  is_featured boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "reviews admin read" ON public.reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "reviews admin write" ON public.reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER reviews_touch BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- FAQs
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs public read" ON public.faqs FOR SELECT USING (is_visible = true);
CREATE POLICY "faqs admin read" ON public.faqs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "faqs admin write" ON public.faqs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER faqs_touch BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Social links (singleton row id=1)
CREATE TABLE public.social_links (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  facebook text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  tiktok text NOT NULL DEFAULT '',
  youtube text NOT NULL DEFAULT '',
  x_twitter text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_links TO anon, authenticated;
GRANT ALL ON public.social_links TO service_role;
GRANT UPDATE ON public.social_links TO authenticated;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "socials public read" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "socials admin update" ON public.social_links FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.social_links (id, facebook, instagram, tiktok, youtube, x_twitter, whatsapp, email) VALUES
  (1, 'https://www.facebook.com/hashtagmusiccafe/', 'https://www.instagram.com/hashtagmusiccafe', 'https://tiktok.com/@hashtag.music.cafe', 'https://youtube.com/@hashtagmusiccafe', 'https://x.com/HashTagMCafe', '8801869341634', 'hashtagcafe.ctg@gmail.com');
CREATE TRIGGER social_links_touch BEFORE UPDATE ON public.social_links FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Harden user_roles: prevent self-escalation. Only service_role can write.
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;

-- Seed defaults
INSERT INTO public.faqs (question, answer, sort_order) VALUES
  ('Do I need to reserve a table?', 'Walk-ins are welcome, but reservations are strongly recommended for evenings and weekends — especially live music nights.', 1),
  ('What are your opening hours?', 'We''re open every day from 11:30 AM to 11:00 PM, with the lounge active until close.', 2),
  ('How much should I expect to spend?', 'Most guests spend around ৳400–600 per person for a full meal.', 3),
  ('Is there live music every night?', 'Acoustic and live sets are scheduled Thursday through Saturday.', 4),
  ('Do you offer delivery and drive-through?', 'Yes — drive-through is available during opening hours, and delivery is supported via foodpanda.', 5),
  ('Do you host private events?', 'Yes — birthdays, anniversaries and corporate dinners. Reach out via WhatsApp.', 6),
  ('Is parking available?', 'On-site and street parking are both available near CDA Masjid Complex in Mehedibag.', 7),
  ('Do you accept card payments?', 'Yes — major credit/debit cards, mobile banking and cash.', 8);

INSERT INTO public.reviews (name, role_label, rating, message, is_featured, sort_order) VALUES
  ('Tridib Ghose', 'Local Guide · 198 reviews', 5, 'Food is generally good. Good ambience. Furniture has been improved recently. Staff are friendly and helpful.', true, 1),
  ('Rakin Rafsan', 'Local Guide · 67 reviews', 5, 'The food quality is very good and all items are delicious. Get there early on weekends.', true, 2),
  ('Mashruba Hani', 'Local Guide · 60 reviews', 4, 'Environment was cozy and they allow live music. A very good place to hangout with friends. Chicken cashew nut salad was a favourite.', false, 3),
  ('Sajid Karim', '12 reviews', 5, 'Their smoked old fashioned is the best I''ve had in Chattogram. Live music on weekends is the cherry on top.', true, 4),
  ('Nadia Akter', 'Local Guide · 41 reviews', 4, 'Came for an anniversary dinner — staff went out of their way. Pasta and steak were both excellent.', false, 5),
  ('Imran Hossain', '8 reviews', 5, 'Drive-through is a lifesaver on busy nights. Same kitchen quality as dine-in.', false, 6);
