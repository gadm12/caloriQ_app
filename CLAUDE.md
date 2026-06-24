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

No test runner is configured.

## Environment

`client/.env.local` (not committed) must define:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Both are used by `src/lib/supabase.js` (the Supabase JS client) and `src/services/apiClient.js` (the axios PostgREST client).

## Architecture

### State & Auth

Two React contexts wrap the entire app (`main.jsx` order: `BrowserRouter > AuthProvider > AppProvider > App`):

- **`AuthContext`** (`src/contexts/AuthContext.jsx`) — Supabase Auth. Subscribes to `onAuthStateChange`; on each session, fetches the `profiles` row and merges it into a `user` object exposing `id`, `email`, `firstName`, `lastName`, and the four macro goals (`calorieGoal`, `proteinGoal`, `carbsGoal`, `fatGoal`). Exposes `register`, `login`, `logout`, `updateUser`.
- **`AppContext`** (`src/contexts/AppContext.jsx`) — live food log backed by Supabase. Loads today's entries and 7-day week data on `user.id` change. Exposes `entries[]`, `goal`, `todayTotals`, `weekData`, `loading`, `error`, and the async mutators `addEntry`, `updateEntry`, `deleteEntry`, `updateGoal`. The `dbToEntry` helper maps DB column names to the frontend shape; `MEAL_TYPE_TO_DB`/`MEAL_TYPE_FROM_DB` maps the four meal categories.

### Service Layer (`src/services/`)

Two HTTP clients live in `apiClient.js`:
- **`dbClient`** — axios instance targeting `VITE_SUPABASE_URL/rest/v1` (PostgREST). Attaches `apikey` and a request interceptor that injects the live Supabase JWT as `Authorization`. Uses a custom `paramsSerializer` to produce repeated query-string keys that PostgREST requires for multi-value filters (e.g. `log_date=gte.X&log_date=lte.Y`).
- **`offClient`** — axios instance targeting Open Food Facts (`https://world.openfoodfacts.org`).

Three service modules use `dbClient`:
- `mealLogsService.js` — `getTodayLogId` (upsert pattern), `getTodayLogs`, `getWeekLogData` (aggregates entries per day into a 7-element array).
- `foodEntriesService.js` — CRUD for `food_entries` rows.
- `profilesService.js` — `updateGoals` patches macro goal columns on `profiles`.

`openFoodFacts.js` uses `offClient` and is called from `pages/SearchFood.jsx`.

### Database Schema

Three tables (defined in `supabase/reference/curr_db_schema.sql`):
- `profiles` — one row per auth user; stores `name`, `calorie_goal`, `protein_goal`, `carbs_goal`, `fat_goal`.
- `meal_logs` — one row per user per day (`user_id`, `log_date`).
- `food_entries` — individual food items linked to a `meal_log` via `log_id`; columns: `food_name`, `meal_type` (enum: breakfast/lunch/dinner/snack), `calories`, `protein`, `carbs`, `fat`, `serving_size`.

### Routing

React Router v7. All routes except `/` and `/logout` are wrapped in `<ProtectedRoute><Layout /></ProtectedRoute>`. `Layout` renders the sticky top bar, desktop nav, mobile bottom nav, and `<Outlet />`.

Route map:
- `/` → `SignInSignUp` (redirects to `/home` when logged in)
- `/home`, `/dashboard`, `/log`, `/log/search`, `/progress`, `/goals`, `/profile`, `/contact` → protected pages
- `*` → `ErrorPage`

### Styling

Material Design 3–inspired token system built on Tailwind:
- Three colors use CSS variables (`--c-primary`, `--c-outline-variant`, `--c-surface-dim`) to support Tailwind opacity modifiers (e.g. `bg-primary/30`) and dark-mode swaps. All other colors are fixed hex in `tailwind.config.js`.
- Dark mode toggled by adding `class="dark"` to `<html>` (set in `Layout.jsx`). Dark overrides are plain CSS class selectors in `src/index.css`.
- Spacing tokens: `xs` 4px / `sm` 8px / `md` 16px / `lg` 24px / `xl` 48px.
- Typography: `font-display` (Plus Jakarta Sans) for headlines; `font-sans` (Inter) for body/labels.
- Icons: Google Material Symbols loaded via CDN in `index.html`. Usage: `<span className="material-symbols-outlined">icon_name</span>`. Set fill with `style={{ fontVariationSettings: "'FILL' 1" }}`.
