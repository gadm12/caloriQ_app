-- Migration: donations table for Stripe one-time payments

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  stripe_payment_intent_id text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('succeeded', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Users can only read their own donation records
CREATE POLICY "donations: owner can read"
  ON public.donations FOR SELECT
  USING (auth.uid() = user_id);

-- No direct INSERT policy for users; inserts come only from the
-- service-role webhook handler which bypasses RLS automatically.
