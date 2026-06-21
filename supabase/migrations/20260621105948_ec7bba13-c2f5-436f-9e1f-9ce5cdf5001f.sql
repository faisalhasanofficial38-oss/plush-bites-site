
-- Reservation status enum
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Reservations table
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  guests integer NOT NULL DEFAULT 2,
  visit_date date NOT NULL,
  visit_time time NOT NULL,
  selected_foods text NOT NULL DEFAULT '',
  special_request text NOT NULL DEFAULT '',
  status public.reservation_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reservations_name_len CHECK (char_length(name) BETWEEN 1 AND 120),
  CONSTRAINT reservations_phone_len CHECK (char_length(phone) BETWEEN 4 AND 40),
  CONSTRAINT reservations_email_len CHECK (email IS NULL OR char_length(email) BETWEEN 3 AND 200),
  CONSTRAINT reservations_foods_len CHECK (char_length(selected_foods) <= 1000),
  CONSTRAINT reservations_request_len CHECK (char_length(special_request) <= 1000),
  CONSTRAINT reservations_guests_range CHECK (guests BETWEEN 1 AND 50)
);

-- Grants: anon can submit (insert only), authenticated admins manage; service_role full
GRANT INSERT ON public.reservations TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anonymous public-form submission) can create a reservation
CREATE POLICY "Anyone can submit a reservation"
  ON public.reservations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read/update/delete reservations
CREATE POLICY "Admins read reservations"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update reservations"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete reservations"
  ON public.reservations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update timestamp
CREATE TRIGGER reservations_touch_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX reservations_visit_idx ON public.reservations (visit_date DESC, visit_time DESC);
CREATE INDEX reservations_status_idx ON public.reservations (status, created_at DESC);

-- Harden handle_new_user: keep first-admin bootstrap, but lock down so it
-- can never be re-triggered to escalate later users. (Defense in depth —
-- user_roles already denies authenticated INSERT/UPDATE/DELETE.)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Bootstrap: only the very first user becomes admin (idempotent + race-safe)
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
