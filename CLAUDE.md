# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `client/`:

```bash
npm run dev       # Start dev server (Vite HMR) at localhost:5173
npm run build     # Production build to client/dist/
npm run preview   # Serve the production build locally
npm run lint      # Run ESLint
```

No unit test runner is configured. Playwright is installed for E2E tests but no tests are written yet.

## Environment

`client/.env.local` (not committed) must define:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Both are used by `src/lib/supabase.js` (the Supabase JS client) and `src/services/apiClient.js` (the axios PostgREST client).

## Architecture

### Entry & Providers

`main.jsx` mounts: `BrowserRouter > AuthProvider > AppProvider > App`

`App.jsx` defines all routes. Every route except `/` and `/logout` is wrapped in `<ProtectedRoute><Layout /></ProtectedRoute>`.

### State Management (Contexts)

**`AuthContext`** (`src/contexts/AuthContext.jsx`) — wraps Supabase Auth JS client directly (not `dbClient`). On each session it fetches the `profiles` row via `supabase.from('profiles')` and maps it through `profileToUser()` into a plain `user` object: `{ id, email, firstName, lastName, calorieGoal, proteinGoal, carbsGoal, fatGoal }`. The `profiles` row is created automatically by a Supabase DB trigger (`on_auth_user_created`) — the client never inserts it. Exposes `register`, `login`, `logout`, `updateUser`.

**`AppContext`** (`src/contexts/AppContext.jsx`) — food log state, backed by `dbClient` (axios/PostgREST). On `user.id` change, loads today's entries and a 7-day `weekData` array in parallel. Exposes `entries[]`, `goal`, `todayTotals`, `weekData`, `loading`, `error`, and async mutators `addEntry`, `updateEntry`, `deleteEntry`, `updateGoal`. The `dbToEntry` helper maps DB column names to the frontend shape (`food_name` → `name`, `meal_type` → `category`, etc.). `MEAL_TYPE_TO_DB`/`MEAL_TYPE_FROM_DB` maps between the four UI labels (Breakfast/Lunch/Dinner/Snacks) and DB enum values (breakfast/lunch/dinner/snack).

### Service Layer (`src/services/`)

Two HTTP clients in `apiClient.js`:
- **`dbClient`** — axios targeting `VITE_SUPABASE_URL/rest/v1` (PostgREST). Has a request interceptor that injects the live Supabase JWT as `Authorization`. Sends `Prefer: return=representation`. Uses a custom `paramsSerializer` that produces repeated keys for PostgREST multi-value filters (e.g. `log_date=gte.X&log_date=lte.Y`).
- **`offClient`** — axios targeting Open Food Facts (`https://world.openfoodfacts.org`).

PostgREST filter syntax used throughout: `param: 'eq.value'`, `param: 'in.(id1,id2)'`, `param: ['gte.X', 'lte.Y']` (array → repeated keys via the custom serializer).

Three service modules use `dbClient`:
- `mealLogsService.js` — `getTodayLogId` (select-then-insert upsert), `getTodayLogs`, `getWeekLogData` (fetches 7-day log+entry data, returns `[{ date, calories, protein, carbs, fat }]`).
- `foodEntriesService.js` — CRUD for `food_entries` rows.
- `profilesService.js` — `updateGoals` patches macro goal columns on `profiles`.

`openFoodFacts.js` uses `offClient`, called from `SearchFood.jsx`. Results normalized to per-100g. `src/data/mockFoods.js` (20 items) is the fallback when the search query is empty.

### Database Schema

Three tables (canonical source: `supabase/reference/curr_db_schema.sql`). RLS and the auth trigger are defined in `supabase/migrations/20260623_auth_rls.sql`.

- `profiles` — `id` (FK → auth.users, cascade delete), `name`, `calorie_goal`, `protein_goal`, `carbs_goal`, `fat_goal`. Auto-created on sign-up by the `on_auth_user_created` trigger.
- `meal_logs` — `id`, `user_id`, `log_date`; one row per user per day.
- `food_entries` — `id`, `log_id`, `user_id`, `meal_type` (enum: breakfast/lunch/dinner/snack), `food_name`, `calories`, `protein`, `carbs`, `fat`, `serving_size`.

All three tables have RLS policies restricting each row to its owner (`auth.uid() = user_id` or `auth.uid() = id`).

### Routing

| Route | Page | Notes |
|---|---|---|
| `/` | `SignInSignUp` | Redirects to `/home` when logged in |
| `/home` | `Home` | Welcome + quick links |
| `/dashboard` | `Dashboard` | Bento grid: calorie progress + meal snapshot |
| `/log` | `DailyLog` | Entries by meal type; date nav UI present but prev-day navigation not yet implemented |
| `/log/search` | `SearchFood` | Open Food Facts search + custom food form; `?meal=` param pre-selects meal type |
| `/progress` | `Progress` | 7-day bar chart + consistency score backed by real `weekData` |
| `/goals` | `GoalSettings` | Edit daily calorie + macro targets |
| `/profile` | `Profile` | Name, email, password (re-auth required for password change) |
| `/contact` | `ContactUs` | Developer contact cards |
| `/logout` | `Logout` | Post-logout confirmation |
| `*` | `ErrorPage` | 404 fallback |

### Styling

Material Design 3–inspired token system on Tailwind CSS.

- Three colors use CSS variables (`--c-primary`, `--c-outline-variant`, `--c-surface-dim`) to support Tailwind opacity modifiers (`bg-primary/30`) and dark-mode swaps. All other colors are fixed hex in `tailwind.config.js`.
- Dark mode: toggled by `class="dark"` on `<html>` (set in `Layout.jsx`). Dark overrides are plain CSS class selectors in `src/index.css`.
- Spacing tokens: `xs` 4px / `sm` 8px / `md` 16px / `lg` 24px / `xl` 48px.
- Typography: `font-display` (Plus Jakarta Sans) for headlines; `font-sans` (Inter) for body/labels.
- Icons: Google Material Symbols via CDN in `index.html`. Use `<span className="material-symbols-outlined">icon_name</span>`; set filled variant with `style={{ fontVariationSettings: "'FILL' 1" }}`.

### Key Component Responsibilities

- **`Layout`** — sticky header (logo, desktop nav, dark-mode toggle, avatar), `<Outlet />`, mobile bottom nav (5 icons), `DonateFooter`.
- **`ProtectedRoute`** — shows spinner while auth loads; redirects unauthenticated users to `/`.
- **`FoodDetailModal`** — edit/delete overlay for an existing food entry; delete triggers `ConfirmDialog`.
- **`ConfirmDialog`** — generic destructive-action confirmation overlay.
- **`DonateFooter`** — rendered in `Layout` (all protected pages) and directly on auth/logout pages.
