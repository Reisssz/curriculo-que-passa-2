-- ============================================================
-- Currículo que Passa — Supabase SQL Schema
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  credits     INTEGER NOT NULL DEFAULT 0,
  plan        TEXT    NOT NULL DEFAULT 'free',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Analyses table
CREATE TABLE IF NOT EXISTS public.analyses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_score         INTEGER NOT NULL,
  score_label         TEXT NOT NULL,
  job_title           TEXT,
  missing_keywords    TEXT[],
  present_keywords    TEXT[],
  top_recommendation  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  charge_id   TEXT NOT NULL UNIQUE,
  amount      INTEGER NOT NULL,  -- centavos
  credits     INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',  -- pending | paid | failed
  paid_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments   ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read and update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Analyses: users see only their own
CREATE POLICY "analyses_select_own" ON public.analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analyses_insert_own" ON public.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments: users see only their own
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Functions
-- ============================================================

-- Deduct 1 credit atomically (prevents negative credits)
CREATE OR REPLACE FUNCTION public.deduct_credit(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits - 1,
      updated_at = NOW()
  WHERE id = user_id AND credits > 0;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Créditos insuficientes';
  END IF;
END;
$$;

-- Add credits (called from webhook via service role)
CREATE OR REPLACE FUNCTION public.add_credits(user_id UUID, amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET credits    = credits + amount,
      updated_at = NOW()
  WHERE id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
END;
$$;

-- ============================================================
-- Trigger: auto-create profile + grant 1 free credit on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, credits)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    1  -- 1 free credit on signup
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_analyses_user_id   ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id    ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_charge_id  ON public.payments(charge_id);

-- ============================================================
-- Grant execute on functions to service role (webhook)
-- ============================================================

GRANT EXECUTE ON FUNCTION public.deduct_credit(UUID)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, INT) TO service_role;
