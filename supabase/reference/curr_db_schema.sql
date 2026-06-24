-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  calorie_goal integer DEFAULT 2000,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  protein_goal integer DEFAULT 150,
  carbs_goal integer DEFAULT 250,
  fat_goal integer DEFAULT 70,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.meal_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT meal_logs_pkey PRIMARY KEY (id),
  CONSTRAINT meal_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.food_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  log_id uuid NOT NULL,
  user_id uuid NOT NULL,
  meal_type character varying NOT NULL CHECK (meal_type::text = ANY (ARRAY['breakfast'::character varying, 'lunch'::character varying, 'dinner'::character varying, 'snack'::character varying]::text[])),
  food_name text NOT NULL,
  calories numeric NOT NULL,
  protein numeric,
  carbs numeric,
  fat numeric,
  serving_size numeric DEFAULT 100,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT food_entries_pkey PRIMARY KEY (id),
  CONSTRAINT food_entries_log_id_foreign FOREIGN KEY (log_id) REFERENCES public.meal_logs(id),
  CONSTRAINT food_entries_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);