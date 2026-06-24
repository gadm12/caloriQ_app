-- Migration: wire profiles to auth.users and enable RLS on all tables
-- Run this in the Supabase dashboard SQL editor (Database → SQL Editor).

-- ── 1. Alter profiles to reference auth.users ─────────────────────────────

-- ID must come from auth, not be generated independently
ALTER TABLE public.profiles
  ALTER COLUMN id DROP DEFAULT;

-- Enforce the relationship; cascades so deleting an auth user cleans up data
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 2. Trigger: auto-create profile row on sign-up ────────────────────────
-- Handles both instant-session and email-confirmation flows, so the frontend
-- never needs to insert the profile manually.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 3. Enable RLS and policies ────────────────────────────────────────────

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: owner can read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner can update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- meal_logs
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meal_logs: owner can read"
  ON public.meal_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "meal_logs: owner can insert"
  ON public.meal_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_logs: owner can update"
  ON public.meal_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "meal_logs: owner can delete"
  ON public.meal_logs FOR DELETE
  USING (auth.uid() = user_id);

-- food_entries
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "food_entries: owner can read"
  ON public.food_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "food_entries: owner can insert"
  ON public.food_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "food_entries: owner can update"
  ON public.food_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "food_entries: owner can delete"
  ON public.food_entries FOR DELETE
  USING (auth.uid() = user_id);
