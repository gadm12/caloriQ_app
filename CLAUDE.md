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

## Repository Layout

```
caloriQ/
├── client/          # React 19 + Vite 8 SPA (all frontend code)
│   └── src/
│       ├── main.jsx         # Entry: BrowserRouter > AuthProvider > AppProvider > App
│       ├── App.jsx          # Route definitions
│       ├── contexts/        # Global state (see below)
│       ├── components/      # Shared UI: Layout, ProtectedRoute, ConfirmDialog, FoodDetailModal, DonateFooter
│       └── pages/           # One file per route
├── supabase/        # Planned Supabase backend (not yet wired to the frontend)
│   └── reference/
│       └── testing_schema.sql  # Target DB schema
└── app_outline/     # Product specs: app_outline.md, user_journey.md, style_guide.md
```

## Architecture

### State & Auth

Two React contexts wrap the entire app (`main.jsx`):

- **`AuthContext`** (`src/contexts/AuthContext.jsx`) — in-memory auth only. Stores user as plain object in `useState`; registration and login write to a `useRef` keyed by email. **No Supabase or token-based auth is connected yet.**
- **`AppContext`** (`src/contexts/AppContext.jsx`) — in-memory food log. Holds `entries[]` and `goal` in `useState`. Exposes `addEntry`, `updateEntry`, `deleteEntry`, `updateGoal`, and a derived `todayTotals` object. **Data resets on page refresh.**

### Routing

React Router v7. All routes except `/` (sign-in/up) and `/logout` are wrapped in `<ProtectedRoute><Layout /></ProtectedRoute>`. `Layout` renders the sticky top bar, desktop nav, mobile bottom nav, and `<Outlet />`.

Route map:
- `/` → `SignInSignUp` (redirects to `/home` when logged in)
- `/home`, `/dashboard`, `/log`, `/log/search`, `/progress`, `/goals`, `/profile`, `/contact` → protected pages
- `*` → `ErrorPage`

### Styling

Material Design 3–inspired token system built on Tailwind. Key conventions:
- Three colors use CSS variables (`--c-primary`, `--c-outline-variant`, `--c-surface-dim`) so they support Tailwind opacity modifiers (e.g. `bg-primary/30`) and swap values in dark mode. All other colors are fixed hex in `tailwind.config.js`.
- Dark mode toggled by adding `class="dark"` to `<html>` (set in `Layout.jsx`). Dark overrides are plain CSS class selectors in `src/index.css`.
- Spacing tokens: `xs` 4px / `sm` 8px / `md` 16px / `lg` 24px / `xl` 48px.
- Typography: `font-display` (Plus Jakarta Sans) for headlines; `font-sans` (Inter) for body/labels.
- Icons: Google Material Symbols loaded via CDN in `index.html`. Usage: `<span className="material-symbols-outlined">icon_name</span>`. Set fill with `style={{ fontVariationSettings: "'FILL' 1" }}`.

### External API

Open Food Facts (`https://world.openfoodfacts.org/cgi/search.pl`) is the food search backend, used in `pages/SearchFood.jsx`.

## Planned Supabase Integration

`supabase/reference/testing_schema.sql` defines the target schema: `profiles`, `meal_logs`, `food_entries`. Once wired up, `AuthContext` and `AppContext` should be replaced with Supabase Auth and database calls respectively.
