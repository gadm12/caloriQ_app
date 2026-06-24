# Database

CaloriQ uses a PostgreSQL database hosted on Supabase with three core tables.

---

## Schema

### `profiles`

Extends Supabase Auth users with app-specific data. Created automatically via a database trigger on signup.

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calorie_goal INTEGER DEFAULT 2000,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### `meal_logs`

Represents a single day's log for a user. Each user gets one log per date.

```sql
CREATE TABLE meal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### `food_entries`

Individual food items logged within a meal log, organized by meal category.

```sql
CREATE TABLE food_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES meal_logs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_name TEXT NOT NULL,
    calories NUMERIC(7,2) NOT NULL,
    protein NUMERIC(5,2) DEFAULT 0,
    carbs NUMERIC(5,2) DEFAULT 0,
    fat NUMERIC(5,2) DEFAULT 0,
    serving_size NUMERIC(6,2) DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### `donations`

Records Stripe payment results written by the webhook Edge Function.

```sql
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users,
    amount INTEGER,
    stripe_payment_intent_id TEXT UNIQUE,
    status TEXT CHECK (status IN ('succeeded', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Table Relationships

```
auth.users (Supabase managed)
    │
    └── profiles (1-to-1)
            │
            └── meal_logs (1-to-many)
                    │
                    └── food_entries (1-to-many)
```

---

## Auth Trigger

When a new user registers, a PostgreSQL trigger automatically creates their `profiles` row:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
